"use client";

import { Button, Row, Col, Typography } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;

const NotFoundPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [secondsLeft, setSecondsLeft] = useState(5); // 5-second countdown

  let redirectPath = "/";

  if (pathname.startsWith("/dashboard")) {
    redirectPath = "/dashboard";
  }

  useEffect(() => {
    if (secondsLeft <= 0) {
      router.replace(redirectPath); // redirect when countdown ends
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, router, redirectPath]);

  const calculatedPathName =
    redirectPath === "/" ? "Home" : redirectPath.slice(1);
  return (
    <Row
      justify="center"
      align="middle"
      style={{
        height: "100vh",
        textAlign: "center",
        padding: "0 20px",
      }}
    >
      <Col>
        <Title level={1} style={{ fontSize: "5rem", marginBottom: 0 }}>
          404
        </Title>
        <Text style={{ fontSize: "1.5rem" }}>Oops! Page Not Found.</Text>
        <br />
        <Text type="secondary">
          The page you are looking for might have been removed or does not
          exist.
        </Text>
        <br />
        <Button
          type="primary"
          style={{ marginTop: 20 }}
          onClick={() => router.push("/")}
        >
          Go Back to {calculatedPathName}
        </Button>
        <Text type="secondary" style={{ display: "block", marginTop: 10 }}>
          Redirecting to {calculatedPathName} in {secondsLeft} second
          {secondsLeft !== 1 ? "s" : ""}...
        </Text>
      </Col>
    </Row>
  );
};

export default NotFoundPage;
