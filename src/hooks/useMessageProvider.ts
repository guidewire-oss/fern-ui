import { App as AntdApp } from "antd";

export const useMessageProvider = () => {
    const { message } = AntdApp.useApp();

    return {
        open: (config: any) => message.open(config),
        success: (content: string) => message.success(content),
        error: (content: string) => message.error(content),
        info: (content: string) => message.info(content),
        warning: (content: string) => message.warning(content),
        loading: (content: string) => message.loading(content),
    };
};