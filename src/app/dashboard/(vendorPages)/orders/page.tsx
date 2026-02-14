"use client";

import { useState } from "react";
import { Button, Space, Tag, Input, Select } from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import KTable from "@/components/ui/KTable";
import ActionBar from "@/components/ui/ActionBar";
import { useGetVendorOrdersQuery } from "@/redux/api/orderApi";
import { useGetMyStoresQuery } from "@/redux/api/storeApi";
import { IOrder, OrderStatus } from "@/types/order";
import { IStore } from "@/types/store";
import useDebounce from "@/hooks/useDebounce";

// Status color mapping (same as customer orders)
const getStatusColor = (status: OrderStatus) => {
  const colors: Record<OrderStatus, string> = {
    PLACED: "blue",
    VOICE_CONFIRMED: "cyan",
    VENDOR_CONFIRMED: "purple",
    PROCESSING: "orange",
    READY_TO_SHIP: "gold",
    SHIPPED: "geekblue",
    DELIVERED: "green",
    CANCELLED: "red",
    RETURNED: "volcano",
  };
  return colors[status] || "default";
};

// Format status for display
const formatStatus = (status: OrderStatus) => {
  return status.replace(/_/g, " ");
};

const VendorOrdersPage = () => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [storeFilter, setStoreFilter] = useState<string>("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Get vendor's stores for filter
  const { data: storesData } = useGetMyStoresQuery({
    page: 1,
    limit: 100, // Get all stores for filter
  });

  // Get vendor's orders
  const { data, isLoading } = useGetVendorOrdersQuery({
    page,
    limit: size,
    searchTerm: debouncedSearchTerm,
    ...(statusFilter && { status: statusFilter }),
    ...(storeFilter && { storeId: storeFilter }),
  });

  const orders = data?.orders as IOrder[];
  const meta = data?.meta;
  const stores = storesData?.stores as IStore[];

  const columns = [
    {
      title: "Order Number",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (orderNumber: string, record: IOrder) => (
        <div>
          <div style={{ fontWeight: 500 }}>#{orderNumber}</div>
          <div style={{ fontSize: "11px", color: "#888" }}>
            {new Date(record.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      render: (record: IOrder) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.customerName || "Guest Customer"}
          </div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            📞 {record.customerPhone}
          </div>
          {record.customerEmail && (
            <div style={{ fontSize: "11px", color: "#888" }}>
              ✉ {record.customerEmail}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Store",
      dataIndex: "store",
      key: "store",
      render: (store: IOrder["store"]) => (
        <div style={{ fontSize: "12px" }}>{store?.name}</div>
      ),
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: (items: IOrder["items"]) => (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 500, fontSize: "16px" }}>
            {items?.length || 0}
          </div>
          <div style={{ fontSize: "11px", color: "#888" }}>items</div>
        </div>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (totalAmount: number, record: IOrder) => (
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 600, fontSize: "15px", color: "#1890ff" }}>
            ৳{Number(totalAmount).toLocaleString()}
          </div>
          {Number(record.totalDiscount) > 0 && (
            <div style={{ fontSize: "11px", color: "#52c41a" }}>
              Saved ৳{Number(record.totalDiscount).toLocaleString()}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: OrderStatus, record: IOrder) => (
        <Space orientation="vertical" size="small">
          <Tag
            color={getStatusColor(status)}
            style={{ fontSize: "11px", padding: "2px 8px" }}
          >
            {formatStatus(status)}
          </Tag>
          {record.isVoiceConfirmed && (
            <div style={{ fontSize: "10px", color: "#52c41a" }}>
              ✓ Voice Confirmed
            </div>
          )}
        </Space>
      ),
    },
    {
      title: "Delivery",
      key: "delivery",
      render: (record: IOrder) => (
        <div style={{ fontSize: "11px" }}>
          <div>{record.deliveryLocation.replace(/_/g, " ")}</div>
          <div style={{ color: "#888" }}>
            Charge: ৳{Number(record.deliveryCharge)}
          </div>
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (record: IOrder) => (
        <Link href={`/dashboard/orders/${record.id}`}>
          <Button type="primary" icon={<EyeOutlined />} size="small" block>
            View Details
          </Button>
        </Link>
      ),
    },
  ];

  const onPaginationChange = (page: number, pageSize: number) => {
    setPage(page);
    setSize(pageSize);
  };

  return (
    <div>
      <ActionBar title="My Orders">
        <Space>
          <Input
            placeholder="Search orders..."
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />

          <Select
            placeholder="Filter by status"
            style={{ width: 180 }}
            onChange={(value) => setStatusFilter(value as OrderStatus | "")}
            allowClear
            value={statusFilter || undefined}
          >
            <Select.Option value="">All Statuses</Select.Option>
            <Select.Option value="PLACED">Placed</Select.Option>
            <Select.Option value="VOICE_CONFIRMED">
              Voice Confirmed
            </Select.Option>
            <Select.Option value="VENDOR_CONFIRMED">
              Vendor Confirmed
            </Select.Option>
            <Select.Option value="PROCESSING">Processing</Select.Option>
            <Select.Option value="READY_TO_SHIP">Ready to Ship</Select.Option>
            <Select.Option value="SHIPPED">Shipped</Select.Option>
            <Select.Option value="DELIVERED">Delivered</Select.Option>
            <Select.Option value="CANCELLED">Cancelled</Select.Option>
            <Select.Option value="RETURNED">Returned</Select.Option>
          </Select>

          {stores && stores.length > 1 && (
            <Select
              placeholder="Filter by store"
              style={{ width: 180 }}
              onChange={(value) => setStoreFilter(value as string)}
              allowClear
              value={storeFilter || undefined}
            >
              <Select.Option value="">All Stores</Select.Option>
              {stores.map((store) => (
                <Select.Option key={store.id} value={store.id}>
                  {store.name}
                </Select.Option>
              ))}
            </Select>
          )}

          <Link href="/dashboard/orders/create-manual">
            <Button type="primary" icon={<ShoppingOutlined />}>
              Create Manual Order
            </Button>
          </Link>
        </Space>
      </ActionBar>

      {/* Responsive wrapper for table */}
      <div style={{ overflowX: "auto" }}>
        <KTable
          loading={isLoading}
          columns={columns}
          dataSource={orders}
          pageSize={size}
          totalPages={meta?.total ? Math.ceil(meta.total / size) : 1}
          showSizeChanger={true}
          onPaginationChange={onPaginationChange}
          showPagination={true}
        />
      </div>
    </div>
  );
};

export default VendorOrdersPage;
