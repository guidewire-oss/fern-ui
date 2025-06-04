import { useLogin } from "@refinedev/core";
import { Button, Divider, Form, Input, Typography } from "antd";
import { FacebookOutlined, GoogleOutlined, UserOutlined } from "@ant-design/icons";
import { redirectToOkta } from "../utils/okta";
import { ColorModeContext } from "../contexts/color-mode/index";
import { useContext } from "react";

const { Title } = Typography;

export const LoginPage = () => {
    const { mutate: login } = useLogin();
    const { mode } = useContext(ColorModeContext);

    const onFinish = (values: any) => {
        login(values);
    };

    const handleSocialLogin = (provider: string) => {
        login({ provider });
    };

    const isDark = mode === "dark";

    return (
        <div
            style={{
                maxWidth: 400,
                margin: "auto",
                padding: 24,
                marginTop: 100,
                boxShadow: isDark
                    ? "0 2px 8px rgba(0,0,0,0.7)"
                    : "0 2px 8px rgba(0,0,0,0.1)",
                borderRadius: 8,
                backgroundColor: isDark ? "#1a1a1a" : "#fff",
                color: isDark ? "#fff" : "#222",
            }}
        >
            <Title
                level={3}
                style={{
                    color: isDark ? "#fff" : "#222",
                    textAlign: "center",
                }}
            >
                Login
            </Title>

            <Form layout="vertical" onFinish={onFinish}>
                <Form.Item
                    label={<span style={{ color: isDark ? "#fff" : "#222" }}>Username</span>}
                    name="username"
                    rules={[{ required: true }]}
                >
                    <Input
                        prefix={<UserOutlined />}
                        style={{
                            backgroundColor: isDark ? "#222" : "#fff",
                            color: isDark ? "#fff" : "#222",
                        }}
                    />
                </Form.Item>
                <Form.Item
                    label={<span style={{ color: isDark ? "#fff" : "#222" }}>Password</span>}
                    name="password"
                    rules={[{ required: true }]}
                >
                    <Input.Password
                        style={{
                            backgroundColor: isDark ? "#222" : "#fff",
                            color: isDark ? "#fff" : "#222",
                        }}
                    />
                </Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    disabled
                    style={{
                        backgroundColor: isDark ? "#3a3a3a" : undefined,
                        color: isDark ? "#fff" : undefined,
                        borderColor: isDark ? "#444" : undefined,
                    }}
                >
                    Login with Username
                </Button>
            </Form>

            <Divider style={{ borderColor: isDark ? "#444" : undefined, color: isDark ? "#fff" : undefined }}>Or</Divider>

            <Button
                icon={<GoogleOutlined />}
                block
                onClick={() => handleSocialLogin("google")}
                style={{
                    marginBottom: 8,
                    color: isDark ? "#fff" : undefined,
                    backgroundColor: isDark ? "#4285F4" : undefined,
                    borderColor: isDark ? "#4285F4" : undefined,
                }}
                disabled
            >
                Login with Google
            </Button>
            <Button
                icon={<FacebookOutlined />}
                block
                onClick={() => handleSocialLogin("facebook")}
                style={{
                    marginBottom: 8,
                    color: isDark ? "#fff" : undefined,
                    backgroundColor: isDark ? "#1877f3" : undefined,
                    borderColor: isDark ? "#1877f3" : undefined,
                }}
                disabled
            >
                Login with Facebook
            </Button>
            <Button
                block
                onClick={() => redirectToOkta()}
                style={{
                    color: isDark ? "#fff" : undefined,
                    backgroundColor: isDark ? "#0057b8" : undefined,
                    borderColor: isDark ? "#0057b8" : undefined,
                }}
            >
                Login with Okta
            </Button>
        </div>
    );
};
