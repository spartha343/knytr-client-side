"use client";

import { useState, useMemo } from "react";
import {
  Button,
  Col,
  Row,
  Card,
  Divider,
  message,
  Radio,
  Space,
  Typography,
} from "antd";
import { ShoppingCartOutlined, ShopOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Form from "@/components/Forms/Form";
import FormInput from "@/components/Forms/FormInput";
import {
  useCreateOrderMutation,
  useCreateGuestOrderMutation,
} from "@/redux/api/orderApi";
import { useGetCartQuery } from "@/redux/api/cartApi";
import { useAuth } from "@/hooks/useAuth";
import { useGuestCart } from "@/hooks/useGuestCart";
import {
  DeliveryLocation,
  ICreateOrderInput,
  PaymentMethod,
} from "@/types/order";
import type { ICart, ICartItem } from "@/types/cart";
import { GuestCartManager, type GuestCartItem } from "@/utils/guestCart";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const { Title, Text } = Typography;

const checkoutSchema = z.object({
  customerPhone: z.string().min(11, "Phone number must be at least 11 digits"),
  customerName: z.string().optional(),
  customerEmail: z.email("Invalid email").optional().or(z.literal("")),
  policeStation: z.string().optional(),
  deliveryDistrict: z.string().optional(),
  deliveryArea: z.string().optional(),
  deliveryAddress: z.string().optional(),
});

interface StoreGroup {
  storeId: string;
  storeName: string;
  items: (ICartItem | GuestCartItem)[];
}

const CheckoutPage = () => {
  const router = useRouter();
  const { firebaseUser, dbUser } = useAuth();
  const isAuthenticated = !!firebaseUser && !!dbUser;

  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation>(
    DeliveryLocation.INSIDE_DHAKA,
  );

  // Get cart items for authenticated users
  const { data: dbCartData } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Get guest cart
  const { items: guestCartItems } = useGuestCart();

  const dbCart = dbCartData as ICart | undefined;
  const dbCartItems = useMemo(() => dbCart?.items || [], [dbCart]);

  const cartItems = isAuthenticated ? dbCartItems : guestCartItems;

  // Use appropriate mutation based on auth state
  const [createOrder, { isLoading: isCreatingAuthOrder }] =
    useCreateOrderMutation();
  const [createGuestOrder, { isLoading: isCreatingGuestOrder }] =
    useCreateGuestOrderMutation();
  const isLoading = isCreatingAuthOrder || isCreatingGuestOrder;

  // Group items by store
  const storeGroups = useMemo((): StoreGroup[] => {
    if (cartItems.length === 0) return [];

    const groups: Record<string, StoreGroup> = {};

    if (isAuthenticated && dbCartItems.length > 0) {
      // Authenticated cart
      dbCartItems.forEach((item: ICartItem) => {
        const storeId = item.product.storeId;
        if (!groups[storeId]) {
          groups[storeId] = {
            storeId,
            storeName: `Store ${storeId.substring(0, 8)}`, // We'll improve this later
            items: [],
          };
        }
        groups[storeId].items.push(item);
      });
    } else if (!isAuthenticated && guestCartItems.length > 0) {
      // Guest cart
      guestCartItems.forEach((item: GuestCartItem) => {
        const storeId = item.storeId || "unknown";
        if (!groups[storeId]) {
          groups[storeId] = {
            storeId,
            storeName: item.storeName || `Store ${storeId.substring(0, 8)}`,
            items: [],
          };
        }
        groups[storeId].items.push(item);
      });
    }

    return Object.values(groups);
  }, [isAuthenticated, dbCartItems, guestCartItems, cartItems.length]);

  // Calculate totals per store
  const storeTotals = useMemo(() => {
    const totals: Record<
      string,
      {
        subtotal: number;
        totalDiscount: number;
        deliveryCharge: number;
        totalAmount: number;
      }
    > = {};

    storeGroups.forEach((group) => {
      let subtotal = 0;
      let totalDiscount = 0;

      group.items.forEach((item) => {
        if (isAuthenticated) {
          const dbItem = item as ICartItem;
          const price = dbItem.variant?.price
            ? Number(dbItem.variant.price)
            : Number(dbItem.product.basePrice);

          const comparePrice = dbItem.product.comparePrice
            ? Number(dbItem.product.comparePrice)
            : 0;

          const discount = comparePrice > price ? comparePrice - price : 0;

          subtotal += comparePrice * dbItem.quantity;
          totalDiscount += discount * dbItem.quantity;
        } else {
          const guestItem = item as GuestCartItem;
          subtotal += guestItem.priceSnapshot * guestItem.quantity;

          if (
            guestItem.comparePrice &&
            guestItem.comparePrice > guestItem.priceSnapshot
          ) {
            totalDiscount +=
              (guestItem.comparePrice - guestItem.priceSnapshot) *
              guestItem.quantity;
          }
        }
      });

      const deliveryCharge =
        deliveryLocation === DeliveryLocation.INSIDE_DHAKA ? 70 : 120;
      const totalAmount = subtotal - totalDiscount + deliveryCharge;

      totals[group.storeId] = {
        subtotal,
        totalDiscount,
        deliveryCharge,
        totalAmount,
      };
    });

    return totals;
  }, [storeGroups, deliveryLocation, isAuthenticated]);

  // Calculate grand total
  const grandTotal = useMemo(() => {
    return Object.values(storeTotals).reduce(
      (sum, total) => sum + total.totalAmount,
      0,
    );
  }, [storeTotals]);

  const handleSubmit = async (formData: {
    customerPhone: string;
    customerName?: string;
    customerEmail?: string;
    policeStation?: string;
    deliveryDistrict?: string;
    deliveryArea?: string;
    deliveryAddress?: string;
  }) => {
    if (storeGroups.length === 0) {
      message.error("Your cart is empty!");
      return;
    }

    try {
      // Create order promises for each store
      const orderPromises = storeGroups.map((group) => {
        const orderItems = group.items.map((item) => {
          if (isAuthenticated) {
            const dbItem = item as ICartItem;
            return {
              productId: dbItem.productId,
              variantId: dbItem.variantId || undefined,
              quantity: dbItem.quantity,
            };
          } else {
            const guestItem = item as GuestCartItem;
            return {
              productId: guestItem.productId,
              variantId: guestItem.variantId || undefined,
              quantity: guestItem.quantity,
            };
          }
        });

        const orderData: ICreateOrderInput = {
          customerPhone: formData.customerPhone,
          customerName: formData.customerName || undefined,
          customerEmail: formData.customerEmail || undefined,
          policeStation: formData.policeStation || undefined,
          deliveryDistrict: formData.deliveryDistrict || undefined,
          deliveryArea: formData.deliveryArea || undefined,
          deliveryAddress: formData.deliveryAddress || undefined,
          deliveryLocation,
          storeId: group.storeId,
          paymentMethod: PaymentMethod.COD,
          items: orderItems,
        };

        return isAuthenticated
          ? createOrder(orderData).unwrap()
          : createGuestOrder(orderData).unwrap();
      });

      // Wait for all orders to complete
      await Promise.all(orderPromises);

      const orderCount = storeGroups.length;
      message.success(
        `${orderCount} order${orderCount > 1 ? "s" : ""} placed successfully!`,
      );

      // Clear guest cart if not authenticated
      if (!isAuthenticated) {
        GuestCartManager.clear();
      }

      // Redirect appropriately
      if (isAuthenticated) {
        router.push("/orders");
      } else {
        router.push("/");
        message.info("Thank you! We will call you to confirm your order.");
      }
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to place order");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <ShoppingCartOutlined style={{ fontSize: 64, color: "#ccc" }} />
        <h2>Your cart is empty</h2>
        <Button type="primary" onClick={() => router.push("/products")}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
      <Title level={2}>Checkout</Title>

      {storeGroups.length > 1 && (
        <div
          style={{
            background: "#e6f7ff",
            border: "1px solid #91d5ff",
            borderRadius: 4,
            padding: 12,
            marginBottom: 24,
          }}
        >
          <ShopOutlined /> You have items from {storeGroups.length} different
          stores. Separate orders will be created for each store.
        </div>
      )}

      <Row gutter={[24, 24]}>
        {/* Checkout Form */}
        <Col xs={24} lg={14}>
          <Card title="Customer Information">
            <Form
              submitHandler={handleSubmit}
              resolver={zodResolver(checkoutSchema)}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24}>
                  <FormInput
                    name="customerPhone"
                    label="Phone Number"
                    placeholder="01XXXXXXXXX"
                    required
                  />
                  <p style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                    Required - We&apos;ll call you to confirm your order
                  </p>
                </Col>

                <Col xs={24} md={12}>
                  <FormInput
                    name="customerName"
                    label="Full Name"
                    placeholder="Your name (optional)"
                  />
                </Col>

                <Col xs={24} md={12}>
                  <FormInput
                    name="customerEmail"
                    label="Email"
                    placeholder="your@email.com (optional)"
                  />
                </Col>

                <Divider>Delivery Address (Optional)</Divider>

                <Col xs={24} md={8}>
                  <FormInput
                    name="deliveryDistrict"
                    label="District"
                    placeholder="e.g., Dhaka"
                  />
                </Col>

                <Col xs={24} md={8}>
                  <FormInput
                    name="policeStation"
                    label="Thana"
                    placeholder="e.g., Bandar"
                  />
                </Col>

                <Col xs={24} md={8}>
                  <FormInput
                    name="deliveryArea"
                    label="Area"
                    placeholder="e.g., Dhanmondi"
                  />
                </Col>

                <Col xs={24}>
                  <FormInput
                    name="deliveryAddress"
                    label="Full Address"
                    placeholder="House, Road, etc. (optional)"
                  />
                </Col>

                <Divider>Delivery Location</Divider>

                <Col xs={24}>
                  <Radio.Group
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                  >
                    <Space direction="vertical">
                      <Radio value={DeliveryLocation.INSIDE_DHAKA}>
                        Inside Dhaka (70 BDT per order)
                      </Radio>
                      <Radio value={DeliveryLocation.OUTSIDE_DHAKA}>
                        Outside Dhaka (120 BDT per order)
                      </Radio>
                    </Space>
                  </Radio.Group>
                </Col>

                <Col xs={24}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    size="large"
                    block
                    style={{ marginTop: 16 }}
                  >
                    Place{" "}
                    {storeGroups.length > 1 ? `${storeGroups.length} ` : ""}
                    Order{storeGroups.length > 1 ? "s" : ""} (Cash on Delivery)
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

        {/* Order Summary */}
        <Col xs={24} lg={10}>
          <Space orientation="vertical" style={{ width: "100%" }} size="large">
            {/* Summary for each store */}
            {storeGroups.map((group) => (
              <Card
                key={group.storeId}
                title={
                  <Space>
                    <ShopOutlined />
                    <span>{group.storeName}</span>
                  </Space>
                }
                size="small"
              >
                <div style={{ marginBottom: 16 }}>
                  {group.items.map((item, index) => {
                    if (isAuthenticated) {
                      const dbItem = item as ICartItem;
                      const price = dbItem.variant?.price
                        ? Number(dbItem.variant.price)
                        : Number(dbItem.product.basePrice);
                      const comparePrice = dbItem.product.comparePrice
                        ? Number(dbItem.product.comparePrice)
                        : 0;
                      const discount =
                        comparePrice > price ? comparePrice - price : 0;
                      const variantName = dbItem.variant?.variantAttributes
                        .map((va) => va.attributeValue.value)
                        .join(" / ");

                      return (
                        <div
                          key={dbItem.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 8,
                            paddingBottom: 8,
                            borderBottom: "1px solid #f0f0f0",
                          }}
                        >
                          <div>
                            <div>{dbItem.product.name}</div>
                            {variantName && (
                              <small style={{ color: "#888" }}>
                                {variantName}
                              </small>
                            )}
                            <div style={{ fontSize: 12, color: "#888" }}>
                              Qty: {dbItem.quantity}
                            </div>
                          </div>
                          <div>
                            {discount > 0 && (
                              <div
                                style={{
                                  textDecoration: "line-through",
                                  fontSize: 12,
                                }}
                              >
                                {comparePrice * dbItem.quantity} BDT
                              </div>
                            )}
                            <div>{price * dbItem.quantity} BDT</div>
                          </div>
                        </div>
                      );
                    } else {
                      const guestItem = item as GuestCartItem;
                      return (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 8,
                            paddingBottom: 8,
                            borderBottom: "1px solid #f0f0f0",
                          }}
                        >
                          <div>
                            <div>{guestItem.productName}</div>
                            {guestItem.variantName && (
                              <small style={{ color: "#888" }}>
                                {guestItem.variantName}
                              </small>
                            )}
                            <div style={{ fontSize: 12, color: "#888" }}>
                              Qty: {guestItem.quantity}
                            </div>
                          </div>
                          <div>
                            {guestItem.comparePrice &&
                              guestItem.comparePrice >
                                guestItem.priceSnapshot && (
                                <div
                                  style={{
                                    textDecoration: "line-through",
                                    fontSize: 12,
                                  }}
                                >
                                  {guestItem.comparePrice * guestItem.quantity}{" "}
                                  BDT
                                </div>
                              )}
                            <div>
                              {guestItem.priceSnapshot * guestItem.quantity} BDT
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>

                <Divider style={{ margin: "12px 0" }} />

                <div style={{ fontSize: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span>Subtotal:</span>
                    <span>{storeTotals[group.storeId].subtotal} BDT</span>
                  </div>

                  {storeTotals[group.storeId].totalDiscount > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                        color: "#52c41a",
                      }}
                    >
                      <span>Discount:</span>
                      <span>
                        -{storeTotals[group.storeId].totalDiscount} BDT
                      </span>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span>Delivery:</span>
                    <span>{storeTotals[group.storeId].deliveryCharge} BDT</span>
                  </div>

                  <Divider style={{ margin: "8px 0" }} />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontWeight: "bold",
                      fontSize: 14,
                    }}
                  >
                    <span>Total:</span>
                    <span>{storeTotals[group.storeId].totalAmount} BDT</span>
                  </div>
                </div>
              </Card>
            ))}

            {/* Grand Total */}
            {storeGroups.length > 1 && (
              <Card style={{ background: "#fafafa", borderColor: "#d9d9d9" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 18,
                    fontWeight: "bold",
                  }}
                >
                  <span>Grand Total:</span>
                  <span style={{ color: "#1890ff" }}>{grandTotal} BDT</span>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Total for all {storeGroups.length} orders
                </Text>
              </Card>
            )}

            {/* Payment Info */}
            <div
              style={{ padding: 12, background: "#f0f0f0", borderRadius: 4 }}
            >
              <p style={{ margin: 0, fontSize: 12 }}>
                <strong>Payment Method:</strong> Cash on Delivery (COD)
              </p>
              <p style={{ margin: "8px 0 0", fontSize: 12 }}>
                We&apos;ll call you to confirm your order before processing.
              </p>
            </div>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default CheckoutPage;
