import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { oktaConfig } from "../utils/okta";

export const Callback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const exchangeCode = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get("code");
            const verifier = localStorage.getItem("pkce_verifier");

            const res = await fetch(`${oktaConfig.issuer}/v1/token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    client_id: oktaConfig.clientId,
                    redirect_uri: oktaConfig.redirectUri,
                    code: code || "",
                    code_verifier: verifier || "",
                }),
            });

            const token = await res.json();
            if (token.access_token) {
                localStorage.setItem("auth", JSON.stringify(token));
                navigate("/");
            }
        };

        exchangeCode();
    }, [navigate]);

    return <p>Logging in with Okta...</p>;
};
