import {
  Avatar,
  Button,
  Dropdown,
  Layout,
  MenuProps,
  notification,
  Row,
  Space,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/firebase.config";
import { useAuthState, useSignOut } from "react-firebase-hooks/auth";
import { useAppDispatch } from "@/redux/hooks";
import { clearDbUser } from "@/redux/features/auth/authSlice";
// import { getUserInfo } from "@/services/auth.service";
const { Header: AntHeader } = Layout;

const Header = () => {
  const router = useRouter();
  const [signOut, loading, error] = useSignOut(auth);
  const dispatch = useAppDispatch();
  const [user] = useAuthState(auth);

  const logOut = async () => {
    const success = await signOut();
    if (success) {
      dispatch(clearDbUser());
      notification.success({
        title: "Logged Out",
        description: "You have successfully logged out.",
        placement: "topRight",
        duration: 3,
        showProgress: true,
      });
      router.replace("/"); // redirect to home/login page
    } else if (error) {
      notification.error({
        title: "Logout Failed",
        description: error.message,
        placement: "topRight",
        duration: 5,
        showProgress: true,
      });
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "0",
      label: (
        <Button onClick={logOut} type="text" danger disabled={loading || !user}>
          Logout
        </Button>
      ),
    },
  ];
  //   const { role } = getUserInfo() as any;
  return (
    <AntHeader
      style={{
        background: "#fff",
      }}
    >
      <Row
        justify="end"
        align="middle"
        style={{
          height: "100%",
        }}
      >
        <p
          style={{
            margin: "0px 5px",
          }}
        >
          {/* {role} */}
        </p>
        <Dropdown menu={{ items }}>
          <a>
            <Space wrap size={16}>
              <Avatar size="large" icon={<UserOutlined />} />
            </Space>
          </a>
        </Dropdown>
      </Row>
    </AntHeader>
  );
};

export default Header;
