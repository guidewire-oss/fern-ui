import type { RefineThemedLayoutV2HeaderProps } from "@refinedev/antd";
import { useGetIdentity } from "@refinedev/core";
import { UserOutlined, SettingOutlined } from '@ant-design/icons';
import {
    Avatar,
    Layout as AntdLayout,
    Space,
    Switch,
    theme,
    Typography,
    Menu,
    Dropdown,
    Button
} from "antd";
import { MenuOutlined } from '@ant-design/icons';
import React, { useContext, useState, useEffect, useCallback } from "react";
import { ColorModeContext } from "../../contexts/color-mode";
import { useLocation, useNavigate } from "react-router-dom";
import { debounce } from "../../utils/debounce";



const { Text } = Typography;
const { useToken } = theme;

type IUser = {
    id: number;
    name: string;
    avatar: string;
};

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = ({
    sticky,
}) => {
    const { token } = useToken();
    const { data: user } = useGetIdentity<IUser>();
    const { mode, setMode } = useContext(ColorModeContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const handleResize = useCallback(() => {
        setWindowWidth(window.innerWidth);
    }, []);

    const debouncedHandleResize = useCallback(
        debounce(handleResize, 250),
        [handleResize]
    );

    useEffect(() => {
        window.addEventListener('resize', debouncedHandleResize);
        return () => window.removeEventListener('resize', debouncedHandleResize);
    }, [debouncedHandleResize]);

    const headerStyles: React.CSSProperties = {
        backgroundColor: token.colorBgElevated,
        display: "flex",
        flexDirection: "column",
        padding: 0,
        height: "auto",
    };

    if (sticky) {
        headerStyles.position = "sticky";
        headerStyles.top = 0;
        headerStyles.zIndex = 1;
    }

    const navTabs = [
        { label: "Test Summary", key: "testsummaries", path: "/testsummaries" },
        { label: "Test Run", key: "testruns", path: "/testruns" },
        
        // add more tabs here as needed in the future
    ];

    const activeTab = navTabs.find(tab => location.pathname.startsWith(tab.path))?.key || navTabs[0].key;

    const mobileMenuItems = navTabs.map(tab => ({
        key: tab.key,
        label: tab.label,
        onClick: () => navigate(tab.path)
    }));

    // User dropdown menu items
    const userMenuItems = [
        {
            key: 'preferences',
            icon: <SettingOutlined />,
            label: 'User Preferences',
            onClick: () => navigate('/preferences')
        }
    ];

    const isMobile = windowWidth < 768;

    return (
        <AntdLayout.Header style={headerStyles}>
            <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                padding: "0 24px", 
                height: "64px",
                flexWrap: "wrap"
            }}>
                <Space align="center" style={{ flexWrap: "nowrap" }}>
                    <img
                        src="fern-logo.png"
                        alt="Fern Logo"
                        style={{ height: 40, marginRight: 12 }}
                    />
                    {windowWidth > 480 && (
                        <Text strong style={{ fontSize: 20, whiteSpace: "nowrap" }}>Fern Reporter</Text>
                    )}
                    
                    {!isMobile ? (
                        <Menu
                            mode="horizontal"
                            selectedKeys={[activeTab]}
                            onClick={({ key }) => {
                                const tab = navTabs.find(tab => tab.key === key);
                                if (tab) navigate(tab.path);
                            }}
                            items={navTabs.map(tab => ({
                                label: tab.label,
                                key: tab.key,
                            }))}
                            style={{ 
                                borderBottom: 'none',
                                paddingLeft: '24px',
                                backgroundColor: token.colorBgElevated,
                            }}
                        />
                    ) : (
                        <Dropdown menu={{ items: mobileMenuItems }} placement="bottomLeft">
                            <Button 
                                type="text" 
                                icon={<MenuOutlined />} 
                                style={{ marginLeft: 8 }}
                            />
                        </Dropdown>
                    )}
                </Space>
                
                <Space align="center" style={{ flexWrap: "nowrap" }}>
                <Switch
                    checkedChildren="🌛"
                    unCheckedChildren="🔆"
                    onChange={() =>
                        setMode(mode === "light" ? "dark" : "light")
                    }
                    defaultChecked={mode === "dark"}
                    checked={mode === "dark"} // ensures that both switches stay in sync since they're both controlled by the same ColorModeContext state
                />
                <Dropdown 
                    menu={{ items: userMenuItems }} 
                    placement="bottom"
                    trigger={['hover']}
                >
                    <Space
                        style={{ marginLeft: "2px", cursor: "pointer" }}
                        size="middle"
                    >
                        {user?.name && <Text strong>{user.name}</Text>}
                        <Avatar
                            src={user?.avatar || null}
                            icon={!user?.avatar ? <UserOutlined /> : null}
                            alt={user?.name} 
                        />
                    </Space>
                </Dropdown>
                </Space>
            </div>
        </AntdLayout.Header>
    );
};
