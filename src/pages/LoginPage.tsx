import { useLogin } from "@refinedev/core";
import { Button, Divider, Form, Input, Typography } from "antd";
import { FacebookOutlined, GoogleOutlined, UserOutlined } from "@ant-design/icons";
import { redirectToOkta } from "../utils/okta";

const { Title } = Typography;

export const LoginPage = () => {
    const { mutate: login } = useLogin();

    const onFinish = (values: any) => {
        login(values);
    };

    // TODO: Implement Google and Facebook login
    const handleSocialLogin = (provider: string) => {
        login({ provider });
    };

    return (
        <div style={{
            maxWidth: 400,
            margin: "auto",
            padding: 24,
            marginTop: 100,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            borderRadius: 8,
            backgroundColor: "#fff"
        }}>
            <Title level={3}>Login</Title>

            <Form layout="vertical" onFinish={onFinish}>
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true }]}
                >
                    <Input prefix={<UserOutlined />} />
                </Form.Item>
                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true }]}
                >
                    <Input.Password />
                </Form.Item>
                <Button type="primary" htmlType="submit" block>
                    Login with Username
                </Button>
            </Form>

            <Divider>Or</Divider>

            <Button
                icon={<GoogleOutlined />}
                block
                onClick={() => handleSocialLogin("google")}
                style={{ marginBottom: 8 }}
            >
                Login with Google
            </Button>
            <Button
                icon={<FacebookOutlined />}
                block
                onClick={() => handleSocialLogin("facebook")}
                style={{ marginBottom: 8 }}
            >
                Login with Facebook
            </Button>
            <Button
                block
                onClick={() => redirectToOkta()}
            >
                Login with Okta
            </Button>
        </div>
    );
};
