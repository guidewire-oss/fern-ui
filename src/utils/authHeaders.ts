export const getAuthHeaders = (): Record<string, string> => {
    const auth = localStorage.getItem("auth");
    let token: string | null = null;

    if (auth) {
        try {
            token = JSON.parse(auth)?.access_token;
        } catch (e) {
            console.error("Invalid auth token in localStorage:", e);
            // Optionally, remove the invalid item
            localStorage.removeItem("auth");
        }
    }

    return token ? { Authorization: `Bearer ${token}` } : {};
};
