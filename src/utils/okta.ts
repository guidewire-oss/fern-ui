export const oktaConfig = {
    clientId: process.env.VITE_OKTA_CLIENT_ID!,
    issuer: process.env.VITE_OKTA_ISSUER!,
    redirectUri: `${window.location.origin}/callback`,
    scopes: "openid profile email",
};

export const generateCodeVerifier = () => {
    const array = new Uint32Array(56);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).slice(-2)).join('');
};

export const generateCodeChallenge = async (verifier: string) => {
    const data = new TextEncoder().encode(verifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const redirectToOkta = async () => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    localStorage.setItem("pkce_verifier", verifier);

    const url = new URL(`${oktaConfig.issuer}/v1/authorize`);
    url.searchParams.set("client_id", oktaConfig.clientId);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", oktaConfig.scopes);
    url.searchParams.set("redirect_uri", oktaConfig.redirectUri);
    url.searchParams.set("state", "your_app_state");
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set("code_challenge_method", "S256");

    window.location.href = url.toString();
};
