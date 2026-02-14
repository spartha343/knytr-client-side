"use client";

import { useState } from "react";
import { Card, Table, Typography, Tag, Button } from "antd";
import { ShopOutlined } from "@ant-design/icons";
import { IOrderItem } from "@/types/order";
import AssignBranchModal from "./AssignBranchModal";

const { Text } = Typography;

interface OrderItemsTableProps {
  items: IOrderItem[];
  orderId: string;
  storeId: string;
}

const OrderItemsTable = ({ items, orderId, storeId }: OrderItemsTableProps) => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IOrderItem | null>(null);

  // Handle open assign modal
  const handleOpenAssignModal = (item: IOrderItem) => {
    setSelectedItem(item);
    setIsAssignModalOpen(true);
  };

  // Handle close assign modal
  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedItem(null);
  };

  const columns = [
    {
      title: "Product",
      key: "product",
      render: (_: unknown, record: IOrderItem) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.productName}</div>
          {record.variantName && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Variant: {record.variantName}
            </Text>
          )}
          {record.variant?.sku && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                SKU: {record.variant.sku}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
    },
    {
      title: "Unit Price",
      key: "unit_price",
      width: 120,
      render: (_: unknown, record: IOrderItem) => (
        <span>৳{Number(record.price).toFixed(2)}</span>
      ),
    },
    {
      title: "Unit Discount",
      key: "unit_discount",
      width: 120,
      render: (_: unknown, record: IOrderItem) => (
        <Text type="success">-৳{Number(record.discount).toFixed(2)}</Text>
      ),
    },
    {
      title: "Subtotal",
      key: "total",
      width: 120,
      render: (_: unknown, record: IOrderItem) => (
        <Text strong>৳{Number(record.total).toFixed(2)}</Text>
      ),
    },
    {
      title: "Assigned Branch",
      key: "branch",
      width: 200,
      render: (_: unknown, record: IOrderItem) => (
        <div>
          {record.branch ? (
            <div>
              <div>{record.branch.name}</div>
              {record.branch.address && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {record.branch.address.city || ""}
                </Text>
              )}
            </div>
          ) : (
            <Tag>Not Assigned</Tag>
          )}
          <Button
            type="link"
            size="small"
            icon={<ShopOutlined />}
            onClick={() => handleOpenAssignModal(record)}
            style={{ padding: 0, marginTop: 4 }}
          >
            {record.branch ? "Change" : "Assign"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card title="Order Items" style={{ marginBottom: 16 }}>
        <Table
          columns={columns}
          dataSource={items}
          rowKey="id"
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Assign Branch Modal */}
      {selectedItem && (
        <AssignBranchModal
          isOpen={isAssignModalOpen}
          orderId={orderId}
          itemId={selectedItem.id}
          itemName={selectedItem.productName}
          currentBranchId={selectedItem.branchId}
          storeId={storeId}
          onClose={handleCloseAssignModal}
        />
      )}
    </>
  );
};

export default OrderItemsTable;
