"use client";

import { Button, Card, Col, Row, message } from "antd";
import Form from "@/components/Forms/Form";
import FormInput from "@/components/Forms/FormInput";
import { useCreateBranchMutation } from "@/redux/api/branchApi";
import { useRouter, useParams } from "next/navigation";
import { ICreateBranchInput } from "@/types/branch";
import { ArrowLeftOutlined } from "@ant-design/icons";

const CreateBranchPage = () => {
  const router = useRouter();
  const params = useParams();
  const storeId = params?.storeId as string;

  const [createBranch, { isLoading }] = useCreateBranchMutation();

  const onSubmit = async (data: Record<string, string | number>) => {
    try {
      const payload: ICreateBranchInput = {
        name: data.name as string,
        storeId: storeId,
        contactPhone: data.contactPhone as string | undefined,
        contactEmail: data.contactEmail as string | undefined,
        address: {
          addressLine1: data.addressLine1 as string,
          addressLine2: data.addressLine2 as string | undefined,
          city: data.city as string,
          state: data.state as string | undefined,
          postalCode: data.postalCode as string,
          country: data.country as string | undefined,
          latitude: data.latitude ? Number(data.latitude) : undefined,
          longitude: data.longitude ? Number(data.longitude) : undefined,
        },
      };

      const res = await createBranch(payload).unwrap();
      message.success(res.message || "Branch created successfully!");
      router.push(`/dashboard/stores/${storeId}/branches`);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to create branch");
    }
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

      <h1>Add Branch</h1>

      <Card>
        <Form submitHandler={onSubmit}>
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
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Create Branch
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default CreateBranchPage;
