"use client";

import { Form, Select, Spin } from "antd";
import { ShopOutlined } from "@ant-design/icons";
import { useGetMyStoresQuery } from "@/redux/api/storeApi";
import { IStore } from "@/types/store";

interface StoreSelectionStepProps {
  selectedStoreId: string | null;
  onStoreChange: (storeId: string) => void;
}

const StoreSelectionStep = ({
  selectedStoreId,
  onStoreChange,
}: StoreSelectionStepProps) => {
  const { data: storesResponse, isLoading } = useGetMyStoresQuery({});
  const stores = (storesResponse?.stores as IStore[]) || [];

  if (isLoading) {
    return <Spin size="large" />;
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <Form layout="vertical">
        <Form.Item
          label={
            <span>
              <ShopOutlined /> Select Store
            </span>
          }
          required
          help="Choose which store this order belongs to"
        >
          <Select
            placeholder="Select a store"
            value={selectedStoreId}
            onChange={onStoreChange}
            size="large"
            showSearch
          >
            {stores.map((store: IStore) => (
              <Select.Option key={store.id} value={store.id}>
                <div>
                  <div style={{ fontWeight: 500 }}>{store.name}</div>
                  {store.logo && (
                    <div style={{ fontSize: 12, color: "#888" }}>
                      Logo: {store.logo}
                    </div>
                  )}
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </div>
  );
};

export default StoreSelectionStep;
