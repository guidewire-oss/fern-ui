import { authProvider } from "../../src/providers/auth-provider";

// Setup localStorage mock
beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
});

describe("authProvider", () => {
    describe("login", () => {
        it("should log in with Okta provider and store token", async () => {
            const response = await authProvider.login({ provider: "okta" });

            expect(response.success).toBe(true);
            expect(localStorage.getItem("auth")).toBe(JSON.stringify({ provider: "okta" }));
        });

        it("should fail for unimplemented social provider", async () => {
            const response = await authProvider.login({ provider: "facebook" });

            expect(response.success).toBe(false);
            expect(response.error?.message).toBe("Facebook login is not implemented");
            expect(response.redirectTo).toBe("/login");
        });

        it("should fail for username/password login", async () => {
            const response = await authProvider.login({ username: "user", password: "pass" });

            expect(response.success).toBe(false);
            expect(response.error?.message).toBe("Login with username/password is not implemented");
        });

        it("should fail for missing credentials", async () => {
            const response = await authProvider.login({});

            expect(response.success).toBe(false);
            expect(response.error?.message).toBe("Invalid credentials");
        });
    });

    describe("logout", () => {
        it("should clear auth and redirect", async () => {
            localStorage.setItem("auth", JSON.stringify({ provider: "okta" }));

            const response = await authProvider.logout({});
            expect(response.success).toBe(true);
            expect(response.redirectTo).toBe("/login");
            expect(localStorage.getItem("auth")).toBeNull();
        });
    });

    describe("check", () => {
        it("should return authenticated if auth exists", async () => {
            localStorage.setItem("auth", JSON.stringify({ provider: "okta" }));
            const result = await authProvider.check();
            expect(result.authenticated).toBe(true);
        });

        it("should return unauthenticated if auth does not exist", async () => {
            const result = await authProvider.check();
            expect(result.authenticated).toBe(false);
            expect(result.redirectTo).toBe("/login");
        });
    });

    describe("getIdentity", () => {
        const mockProfile = {
            sub: "123",
            name: "Test User",
            email: "test@example.com",
        };

        it("should return identity using access_token", async () => {
            localStorage.setItem("auth", JSON.stringify({ access_token: "test-token" }));

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockProfile),
            }) as jest.Mock;

            const identity = await authProvider.getIdentity?.();
            expect(identity).toEqual({
                id: "123",
                name: "Test User",
                email: "test@example.com",
            });

            expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/userinfo"), {
                headers: {
                    Authorization: "Bearer test-token",
                },
            });
        });

        it("should return fallback identity without access_token", async () => {
            localStorage.setItem("auth", JSON.stringify({ username: "testuser" }));

            const identity = await authProvider.getIdentity?.();
            expect(identity).toEqual({
                id: 1,
                name: "testuser",
            });
        });

        it("should return fallback identity with only provider", async () => {
            localStorage.setItem("auth", JSON.stringify({ provider: "okta" }));

            const identity = await authProvider.getIdentity?.();
            expect(identity).toEqual({
                id: 1,
                name: "okta",
            });
        });

        it("should return null if access_token call fails", async () => {
            localStorage.setItem("auth", JSON.stringify({ access_token: "bad-token" }));

            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
            }) as jest.Mock;

            const identity = await authProvider.getIdentity?.();
            expect(identity).toBeNull();
        });
    });

    describe("onError", () => {
        it("should resolve to an empty object", async () => {
            const result = await authProvider.onError?.({});
            expect(result).toEqual({});
        });
    });
});
