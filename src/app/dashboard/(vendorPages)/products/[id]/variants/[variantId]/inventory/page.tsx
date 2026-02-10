"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Space,
  Table,
  message,
  Spin,
  Modal,
  Form,
  InputNumber,
  Select,
  Tag,
} from "antd";
import {
  PlusOutlined,
  ArrowLeftOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { useGetVariantByIdQuery } from "@/redux/api/productVariantApi";
import {
  useGetInventoryByVariantQuery,
  useCreateInventoryMutation,
  useAdjustStockMutation,
} from "@/redux/api/inventoryApi";
import { IProductVariant, IInventory } from "@/types/product";

const VariantInventoryPage = () => {
  const params = useParams();
  const router = useRouter();
  const variantId = params?.variantId as string;

  const { data: variantData, isLoading: loadingVariant } =
    useGetVariantByIdQuery(variantId, { skip: !variantId });

  const { data: inventoryData, isLoading: loadingInventory } =
    useGetInventoryByVariantQuery(variantId, { skip: !variantId });

  const [createInventory, { isLoading: isCreating }] =
    useCreateInventoryMutation();

  const [adjustStock, { isLoading: isAdjusting }] = useAdjustStockMutation();

  const variant = variantData as IProductVariant;
  const inventories = inventoryData as IInventory[];

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<IInventory | null>(
    null,
  );
  const [createForm] = Form.useForm();
  const [adjustForm] = Form.useForm();

  const handleCreateInventory = async (values: {
    branchId: string;
    quantity: number;
    lowStockAlert: number;
  }) => {
    try {
      const res = await createInventory({
        variantId,
        ...values,
      }).unwrap();
      message.success(res.message || "Inventory created successfully!");
      setIsCreateModalOpen(false);
      createForm.resetFields();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to create inventory");
    }
  };

  const handleAdjustStock = async (values: {
    quantity: number;
    reason?: string;
  }) => {
    if (!selectedInventory) return;

    try {
      const res = await adjustStock({
        id: selectedInventory.id,
        quantity: values.quantity,
        reason: values.reason,
      }).unwrap();
      message.success(res.message || "Stock adjusted successfully!");
      setIsAdjustModalOpen(false);
      setSelectedInventory(null);
      adjustForm.resetFields();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to adjust stock");
    }
  };

  if (loadingVariant || loadingInventory) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!variant) {
    return <div>Variant not found</div>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storeBranches = (variant.product?.store as any)?.branches || [];

  const availableBranches =
    storeBranches.filter(
      (branch: { id: string; name: string }) =>
        !inventories?.some((inv) => inv.branchId === branch.id),
    ) || [];

  const columns = [
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
      render: (branch: IInventory["branch"]) => branch?.name || "—",
    },
    {
      title: "Available Stock",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number, record: IInventory) => (
        <div>
          <strong>{quantity}</strong>
          {record.reservedQty > 0 && (
            <div style={{ fontSize: "12px", color: "#888" }}>
              ({record.reservedQty} reserved)
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Low Stock Alert",
      dataIndex: "lowStockAlert",
      key: "lowStockAlert",
    },
    {
      title: "Status",
      key: "status",
      render: (record: IInventory) => {
        if (record.quantity === 0) {
          return <Tag color="red">Out of Stock</Tag>;
        } else if (record.quantity <= record.lowStockAlert) {
          return <Tag color="orange">Low Stock</Tag>;
        } else {
          return <Tag color="green">In Stock</Tag>;
        }
      },
    },
    {
      title: "Action",
      key: "action",
      render: (record: IInventory) => (
        <Button
          icon={<EditOutlined />}
          size="small"
          onClick={() => {
            setSelectedInventory(record);
            setIsAdjustModalOpen(true);
          }}
        >
          Adjust Stock
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          Back to Variants
        </Button>
      </Space>

      <Card title="Variant Information" style={{ marginBottom: 16 }}>
        <div>
          <strong>Product:</strong> {variant.product?.name}
        </div>
        <div>
          <strong>SKU:</strong> {variant.sku}
        </div>
        <div>
          <strong>Price:</strong> ${variant.price}
        </div>
        <div>
          <strong>Attributes:</strong>{" "}
          <Space>
            {variant.variantAttributes?.map((va) => (
              <Tag key={va.attributeValueId} color="blue">
                {va.attributeValue?.attribute?.name}: {va.attributeValue?.value}
              </Tag>
            ))}
          </Space>
        </div>
      </Card>

      <Card
        title="Inventory by Branch"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
            disabled={availableBranches.length === 0}
          >
            Add Branch Inventory
          </Button>
        }
      >
        {availableBranches.length === 0 && inventories?.length > 0 && (
          <div style={{ marginBottom: 16, color: "#888" }}>
            All branches have inventory configured.
          </div>
        )}

        <Table
          columns={columns}
          dataSource={inventories || []}
          rowKey="id"
          pagination={false}
        />

        {(!inventories || inventories.length === 0) && (
          <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
            No inventory configured yet. Add inventory for your branches.
          </div>
        )}
      </Card>

      {/* Create Inventory Modal */}
      <Modal
        title="Add Branch Inventory"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateInventory}
        >
          <Form.Item
            name="branchId"
            label="Branch"
            rules={[{ required: true, message: "Please select a branch" }]}
          >
            <Select placeholder="Select branch">
              {availableBranches.map((branch: { id: string; name: string }) => (
                <Select.Option key={branch.id} value={branch.id}>
                  {branch.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Initial Stock Quantity"
            rules={[{ required: true, message: "Please enter quantity" }]}
          >
            <InputNumber placeholder="0" style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item
            name="lowStockAlert"
            label="Low Stock Alert Threshold"
            initialValue={10}
            rules={[{ required: true, message: "Please enter threshold" }]}
          >
            <InputNumber placeholder="10" style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isCreating}>
                Add Inventory
              </Button>
              <Button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  createForm.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal
        title="Adjust Stock"
        open={isAdjustModalOpen}
        onCancel={() => {
          setIsAdjustModalOpen(false);
          setSelectedInventory(null);
          adjustForm.resetFields();
        }}
        footer={null}
      >
        {selectedInventory && (
          <>
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                backgroundColor: "#f0f0f0",
                borderRadius: 8,
              }}
            >
              <div>
                <strong>Branch:</strong> {selectedInventory.branch?.name}
              </div>
              <div>
                <strong>Current Stock:</strong> {selectedInventory.quantity}
              </div>
            </div>

            <Form
              form={adjustForm}
              layout="vertical"
              onFinish={handleAdjustStock}
            >
              <Form.Item
                name="quantity"
                label="Adjustment Quantity"
                rules={[{ required: true, message: "Please enter quantity" }]}
                extra="Positive to add stock, negative to remove"
              >
                <InputNumber
                  placeholder="e.g., 50 or -10"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item name="reason" label="Reason (Optional)">
                <Select placeholder="Select reason">
                  <Select.Option value="restock">Restock</Select.Option>
                  <Select.Option value="return">Customer Return</Select.Option>
                  <Select.Option value="damaged">Damaged/Lost</Select.Option>
                  <Select.Option value="correction">Correction</Select.Option>
                  <Select.Option value="other">Other</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isAdjusting}
                  >
                    Adjust Stock
                  </Button>
                  <Button
                    onClick={() => {
                      setIsAdjustModalOpen(false);
                      setSelectedInventory(null);
                      adjustForm.resetFields();
                    }}
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default VariantInventoryPage;
