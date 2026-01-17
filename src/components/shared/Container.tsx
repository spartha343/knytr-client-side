import { Col, Row } from "antd";
import { ReactNode } from "react";

const Container = ({ children }: { children: ReactNode }) => {
  return (
    <Row justify="center">
      <Col
        xs={24}
        md={24}
        xl={23}
        style={{ maxWidth: 2520, padding: "0 16px" }}
      >
        {children}
      </Col>
    </Row>
  );
};

export default Container;
