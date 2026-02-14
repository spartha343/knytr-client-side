/**
 * ProductBreadcrumb Component
 * Displays breadcrumb navigation for product page
 */

import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";

interface ProductBreadcrumbProps {
  categoryName?: string;
  productName: string;
}

export const ProductBreadcrumb = ({
  categoryName,
  productName,
}: ProductBreadcrumbProps) => {
  return (
    <Breadcrumb
      style={{ margin: "20px 0" }}
      items={[
        {
          href: "/",
          title: (
            <>
              <HomeOutlined />
              <span>Home</span>
            </>
          ),
        },
        {
          href: "/products",
          title: "Products",
        },
        {
          href: "#",
          title: categoryName || "Category",
        },
        {
          title: productName,
        },
      ]}
    />
  );
};
