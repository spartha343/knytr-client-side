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
import PathaoLocationSelector from "@/components/pathao/PathaoLocationSelector";
import FormTextArea from "@/components/Forms/FormTextArea";

const { Title, Text } = Typography;

const checkoutSchema = z.object({
  customerPhone: z.string().min(11, "Phone number must be at least 11 digits"),
  customerName: z.string().optional(),
  customerEmail: z.email("Invalid email").optional().or(z.literal("")),
  secondaryPhone: z.string().optional(),
  deliveryAddress: z.string().optional(),
  specialInstructions: z.string().optional(),
  recipientCityId: z.number().optional(),
  recipientZoneId: z.number().optional(),
  recipientAreaId: z.number().optional(),
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
  const [cityId, setCityId] = useState<number | null>(null);
  const [zoneId, setZoneId] = useState<number | null>(null);
  const [areaId, setAreaId] = useState<number | null>(null);
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
      let originalTotal = 0;

      group.items.forEach((item) => {
        if (isAuthenticated) {
          const dbItem = item as ICartItem;

          // Current selling price
          const currentPrice = dbItem.variant?.price
            ? Number(dbItem.variant.price)
            : Number(dbItem.product.basePrice);

          // Original price (for discount calculation)
          const basePrice =
            dbItem.product.comparePrice &&
            Number(dbItem.product.comparePrice) > currentPrice
              ? Number(dbItem.product.comparePrice)
              : currentPrice;

          subtotal += currentPrice * dbItem.quantity;
          originalTotal += basePrice * dbItem.quantity;
        } else {
          const guestItem = item as GuestCartItem;

          // Current selling price
          const currentPrice = guestItem.priceSnapshot;

          // Original price
          const basePrice =
            guestItem.comparePrice && guestItem.comparePrice > currentPrice
              ? guestItem.comparePrice
              : currentPrice;

          subtotal += currentPrice * guestItem.quantity;
          originalTotal += basePrice * guestItem.quantity;
        }
      });

      const totalDiscount = originalTotal - subtotal;
      const deliveryCharge =
        deliveryLocation === DeliveryLocation.INSIDE_DHAKA ? 70 : 120;
      const totalAmount = subtotal + deliveryCharge; // ✅ No discount subtraction!

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
    secondaryPhone?: string;
    deliveryAddress?: string;
    specialInstructions?: string;
    recipientCityId?: number;
    recipientZoneId?: number;
    recipientAreaId?: number;
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
          secondaryPhone: formData.secondaryPhone || undefined,
          deliveryAddress: formData.deliveryAddress || undefined,
          specialInstructions: formData.specialInstructions || undefined,
          recipientCityId: cityId || undefined,
          recipientZoneId: zoneId || undefined,
          recipientAreaId: areaId || undefined,
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
      // Each store returns Order[] (one per branch)
      const allOrdersArrays = await Promise.all(orderPromises);

      // Flatten the arrays to get total order count
      const totalOrders = allOrdersArrays.reduce(
        (sum, orders) => sum + orders.length,
        0,
      );

      // Show success message
      if (totalOrders > 1) {
        message.success(
          `${totalOrders} orders placed successfully! Your items have been split by branch for faster delivery.`,
        );
      } else {
        message.success("Order placed successfully!");
      }

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
          stores. Your order will be automatically split by store and branch for
          faster delivery.
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

                <Divider>Delivery Information (Optional)</Divider>

                <Col xs={24}>
                  <PathaoLocationSelector
                    cityId={cityId}
                    zoneId={zoneId}
                    areaId={areaId}
                    onCityChange={setCityId}
                    onZoneChange={setZoneId}
                    onAreaChange={setAreaId}
                    required={false}
                  />
                </Col>

                <Col xs={24} md={12}>
                  <FormInput
                    name="secondaryPhone"
                    label="Secondary Phone"
                    placeholder="Alternate contact number (optional)"
                  />
                </Col>

                <Col xs={24} md={12}>
                  <FormInput
                    name="deliveryAddress"
                    label="Delivery Address"
                    placeholder="House, Road, Landmark (optional)"
                  />
                </Col>

                <Col xs={24}>
                  <FormTextArea
                    name="specialInstructions"
                    label="Special Instructions"
                    placeholder="Any special delivery instructions (optional)"
                  />
                </Col>

                <Divider>Delivery Location</Divider>

                <Col xs={24}>
                  <Radio.Group
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                  >
                    <Space orientation="vertical">
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
