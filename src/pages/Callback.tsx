import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { oktaConfig } from "../utils/okta";
import { message } from "antd"; // Make sure antd is installed

export const Callback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleApiError = async (res: Response) => {
            const errorText = await res.text();
            const errorMessage = `Token request failed: ${res.status} ${errorText}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        };

        const exchangeCode = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const code = params.get("code");
                const verifier = localStorage.getItem("pkce_verifier");

                if (verifier) {
                    localStorage.removeItem("pkce_verifier")
                    const res = await fetch(`${oktaConfig.issuer}/v1/token`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                        body: new URLSearchParams({
                            grant_type: "authorization_code",
                            client_id: oktaConfig.clientId || "",
                            redirect_uri: oktaConfig.redirectUri,
                            code: code || "",
                            code_verifier: verifier || "",
                        }),
                    });

                    if (!res.ok) {
                        await handleApiError(res);
                    }

                    const token = await res.json().catch(() => {
                        throw new Error("Failed to parse token response");
                    });

                    if (token.access_token) {
                        localStorage.setItem("auth", JSON.stringify(token));
                        navigate("/");
                    } else {
                        throw new Error("No access token in response");
                    }
                } else {
                    navigate("/");
                }
            } catch (error: any) {
                console.error("Authentication error:", error);
                message.error(error.message || "Login failed");
                navigate("/login");
            }
        };

        exchangeCode();
    }, [navigate]);

    return <p>Logging in with Okta...</p>;
};
