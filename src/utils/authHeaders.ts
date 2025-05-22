export const getAuthHeaders = (): Record<string, string> => {
    const auth = localStorage.getItem("auth");
    const token = auth ? JSON.parse(auth)?.access_token : null;

    return token ? { Authorization: `Bearer ${token}` } : {};
};
