"use client";

import { Button, Card, Col, Row, message, Switch, Spin } from "antd";
import Form from "@/components/Forms/Form";
import FormInput from "@/components/Forms/FormInput";
import {
  useGetBranchByIdQuery,
  useUpdateBranchMutation,
} from "@/redux/api/branchApi";
import { useRouter, useParams } from "next/navigation";
import { IBranch, IUpdateBranchInput } from "@/types/branch";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useState } from "react";

const EditBranchPage = () => {
  const router = useRouter();
  const params = useParams();
  const storeId = params?.storeId as string;
  const id = params?.id as string;

  const { data: branchData, isLoading: isFetching } = useGetBranchByIdQuery(
    id,
    {
      skip: !id,
    },
  );
  const [updateBranch, { isLoading: isUpdating }] = useUpdateBranchMutation();

  const branch = branchData as IBranch;

  const [isActive, setIsActive] = useState<boolean>(branch?.isActive ?? true);

  const onSubmit = async (data: Record<string, string | number>) => {
    try {
      const payload: IUpdateBranchInput = {
        name: data.name as string | undefined,
        contactPhone: data.contactPhone as string | undefined,
        contactEmail: data.contactEmail as string | undefined,
        isActive,
        address: {
          addressLine1: data.addressLine1 as string | undefined,
          addressLine2: data.addressLine2 as string | undefined,
          city: data.city as string | undefined,
          state: data.state as string | undefined,
          postalCode: data.postalCode as string | undefined,
          country: data.country as string | undefined,
          latitude: data.latitude ? Number(data.latitude) : undefined,
          longitude: data.longitude ? Number(data.longitude) : undefined,
        },
      };

      const res = await updateBranch({ id, data: payload }).unwrap();
      message.success(res.message || "Branch updated successfully!");
      router.push(`/dashboard/stores/${storeId}/branches`);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to update branch");
    }
  };

  if (isFetching) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!branch) {
    return <div>Branch not found</div>;
  }

  // Prepare default values with address
  const defaultValues = {
    name: branch.name,
    contactPhone: branch.contactPhone || "",
    contactEmail: branch.contactEmail || "",
    addressLine1: branch.address?.addressLine1 || "",
    addressLine2: branch.address?.addressLine2 || "",
    city: branch.address?.city || "",
    state: branch.address?.state || "",
    postalCode: branch.address?.postalCode || "",
    country: branch.address?.country || "Bangladesh",
    latitude: branch.address?.latitude || "",
    longitude: branch.address?.longitude || "",
  };

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => router.back()}
        style={{ marginBottom: "16px" }}
      >
        Back
      </Button>

      <h1>Edit Branch</h1>

      <Card>
        <Form submitHandler={onSubmit} defaultValues={defaultValues}>
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <h3>Branch Details</h3>
            </Col>

            <Col xs={24} md={12}>
              <FormInput
                name="name"
                label="Branch Name"
                placeholder="Enter branch name"
                required
              />
            </Col>

            <Col xs={24} md={12}>
              <FormInput
                name="contactPhone"
                label="Contact Phone"
                placeholder="Enter contact phone"
              />
            </Col>

            <Col xs={24} md={12}>
              <FormInput
                name="contactEmail"
                label="Contact Email"
                type="email"
                placeholder="Enter contact email"
              />
            </Col>

            <Col xs={24} md={12}>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>
                  Branch Status
                </label>
                <Switch
                  checked={isActive}
                  onChange={setIsActive}
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                />
              </div>
            </Col>

            <Col xs={24}>
              <h3>Address</h3>
            </Col>

            <Col xs={24}>
              <FormInput
                name="addressLine1"
                label="Address Line 1"
                placeholder="Street address, building name"
                required
              />
            </Col>

            <Col xs={24}>
              <FormInput
                name="addressLine2"
                label="Address Line 2"
                placeholder="Apartment, suite, unit, etc."
              />
            </Col>

            <Col xs={24} md={8}>
              <FormInput
                name="city"
                label="City"
                placeholder="Enter city"
                required
              />
            </Col>

            <Col xs={24} md={8}>
              <FormInput
                name="state"
                label="State/Division"
                placeholder="Enter state or division"
              />
            </Col>

            <Col xs={24} md={8}>
              <FormInput
                name="postalCode"
                label="Postal Code"
                placeholder="Enter postal code"
                required
              />
            </Col>

            <Col xs={24} md={12}>
              <FormInput
                name="country"
                label="Country"
                placeholder="Bangladesh"
              />
            </Col>

            <Col xs={24}>
              <h3>Location Coordinates (Optional)</h3>
            </Col>

            <Col xs={24} md={12}>
              <FormInput
                name="latitude"
                label="Latitude"
                type="number"
                placeholder="23.8103"
              />
            </Col>

            <Col xs={24} md={12}>
              <FormInput
                name="longitude"
                label="Longitude"
                type="number"
                placeholder="90.4125"
              />
            </Col>

            <Col xs={24}>
              <Button type="primary" htmlType="submit" loading={isUpdating}>
                Update Branch
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default EditBranchPage;
