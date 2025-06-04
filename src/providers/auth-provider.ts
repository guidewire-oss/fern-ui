import { AuthBindings } from "@refinedev/core";

const realAuthProvider: AuthBindings = {
    login: async ({ username, password, provider }) => {
        if (provider) {
            if( provider == "okta") {
                // Social login simulation
                localStorage.setItem("auth", JSON.stringify({provider}));
                return {success: true, redirectTo: "/"};
            }

            // Google and Facebook login handlers. Currently not implemented,
            const capitalizedProvider = provider.charAt(0).toUpperCase() + provider.slice(1);
            return {
                success: false,
                error: {
                    name: "Login not implemented",
                    message: `${capitalizedProvider} login is not implemented`,
                },
                redirectTo: "/login"
            };
        }

        // Username/password login is not implemented
        if (username) {
            return {
                success: false,
                error: {
                    name: "Login not implemented",
                    message: "Login with username/password is not implemented",
                },
                redirectTo: "/login"
            };
        }

        return {
            success: false,
            error: {
                name: "Login failed",
                message: "Invalid credentials",
            },
        };
    },

    logout: async () => {
        localStorage.removeItem("auth");
        return { success: true, redirectTo: "/login" };
    },

    check: async () => {
        const token = localStorage.getItem("auth");
        return token
            ? { authenticated: true }
            : { authenticated: false, redirectTo: "/login" };
    },

    getIdentity: async () => {
        const token = JSON.parse(localStorage.getItem("auth") || "{}");
        if (token?.access_token) {
            const res = await fetch(process.env.VITE_OKTA_ISSUER + "/oauth2/v1/userinfo", {
                headers: {
                    Authorization: `Bearer ${token.access_token}`,
                },
            });

            if (!res.ok) return null;
            const profile = await res.json();
            return {
                id: profile.sub,
                name: profile.name,
                email: profile.email,
            };
        }

        return {
            id: 1,
            name: token.username || token.provider,
        };
    },

    onError: async () => ({})
};

// Below code should be removed once Auth is implemented on Fern Reporter
const disableAuthProvider: AuthBindings = {
    login: async () => ({ success: true }),
    logout: async () => ({ success: true }),
    check: async () => ({ authenticated: true }),
    getIdentity: async () => ({ id: 0, name: "Guest" }),
    onError: async () => ({}),
};

const ENABLE_AUTH = process.env.VITE_ENABLE_AUTH === "true";
export const authProvider = ENABLE_AUTH ? realAuthProvider : disableAuthProvider;
