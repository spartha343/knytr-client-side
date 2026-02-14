"use client";

import { useState } from "react";
import { Modal, Select, Form, Button, Space, message } from "antd";
import { useAssignBranchToItemMutation } from "@/redux/api/orderApi";
import { useGetBranchesByStoreQuery } from "@/redux/api/branchApi";
import { IBranch } from "@/types/branch";

interface AssignBranchModalProps {
  isOpen: boolean;
  orderId: string;
  itemId: string;
  itemName: string;
  currentBranchId?: string | null;
  storeId: string;
  onClose: () => void;
}

const AssignBranchModal = ({
  isOpen,
  orderId,
  itemId,
  itemName,
  currentBranchId,
  storeId,
  onClose,
}: AssignBranchModalProps) => {
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(
    currentBranchId || null,
  );

  // Fetch branches for the specific store
  const { data: branchesResponse, isLoading: isLoadingBranches } =
    useGetBranchesByStoreQuery({ storeId }, { skip: !storeId });

  // RTK Mutation
  const [assignBranch, { isLoading: isAssigning }] =
    useAssignBranchToItemMutation();

  // Extract branches from response
  const branches = (branchesResponse?.branches as IBranch[]) || [];

  // Handle branch assignment
  const handleAssignBranch = async () => {
    if (!selectedBranchId) {
      message.error("Please select a branch");
      return;
    }

    try {
      await assignBranch({
        orderId,
        itemId,
        data: {
          branchId: selectedBranchId,
        },
      }).unwrap();

      message.success("Branch assigned successfully!");
      handleClose();
    } catch (error) {
      console.error("Failed to assign branch:", error);
      message.error("Failed to assign branch. Please try again.");
    }
  };

  // Handle modal close
  const handleClose = () => {
    setSelectedBranchId(currentBranchId || null);
    onClose();
  };

  return (
    <Modal
      title={`Assign Branch - ${itemName}`}
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={500}
    >
      <Form layout="vertical">
        <Form.Item
          label="Select Branch"
          required
          help={
            !selectedBranchId ? "Please select a branch for fulfillment" : ""
          }
          validateStatus={!selectedBranchId ? "error" : ""}
        >
          <Select
            placeholder="Select a branch"
            value={selectedBranchId}
            onChange={(value) => setSelectedBranchId(value)}
            loading={isLoadingBranches}
            size="large"
            showSearch
          >
            {branches.map((branch: IBranch) => (
              <Select.Option key={branch.id} value={branch.id}>
                <div>
                  <div style={{ fontWeight: 500 }}>{branch.name}</div>
                  {branch.address?.city && (
                    <div style={{ fontSize: 12, color: "#888" }}>
                      {branch.address.city}
                    </div>
                  )}
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {branches.length === 0 && !isLoadingBranches && (
          <Form.Item>
            <div
              style={{
                padding: 8,
                background: "#fff2e8",
                border: "1px solid #ffbb96",
                borderRadius: 4,
              }}
            >
              <span style={{ fontSize: 12, color: "#d4380d" }}>
                No branches found for this store. Please create branches first.
              </span>
            </div>
          </Form.Item>
        )}

        {currentBranchId && (
          <Form.Item>
            <div style={{ padding: 8, background: "#f0f0f0", borderRadius: 4 }}>
              <span style={{ fontSize: 12, color: "#666" }}>
                Currently assigned branch will be updated
              </span>
            </div>
          </Form.Item>
        )}

        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleAssignBranch}
              loading={isAssigning}
              disabled={!selectedBranchId || branches.length === 0}
            >
              Assign Branch
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AssignBranchModal;
