import { getUserCookie } from "../utils/cookies";

// Use a hardcoded API URL for testing
const API_URL = process.env.NODE_ENV === 'test' 
  ? 'http://localhost:8080/api' 
  : (typeof import.meta !== 'undefined' ? import.meta.env.VITE_FERN_REPORTER_BASE_URL : 'http://localhost:8080/api');

export const mockPreferredProjects = {
    cookie: "00c04fd430c8",
    preferred: [
        {
            group_name: "My Favorite Projects",
            projects: [
                {
                    uuid: "proj_003",
                    name: "Phoenix Migration"
                },
                {
                    uuid: "proj_004",
                    name: "Billing API"
                }
            ]
        },
        {
            group_name: "Work Projects",
            projects: [
                {
                    uuid: "proj_006",
                    name: "Analytics Dashboard"
                }
            ]
        }
    ]
};

// Rest of the file remains the same
export const mockUserPreference = {
    cookie: "00c04fd430c8",
    isDark: false,
    timezone: "America/Los_Angeles"
};

//mock the GET calls
export const mockUserPreferenceProvider = {
    updatePreference: async (data: any) => {
        const cookie = getUserCookie() || "00c04fd430c8";
        const mockResponse = {
            cookie,
            ...data
        };
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockResponse;
    },

    getPreferredProjects: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockPreferredProjects;
    },

    removeFavouriteProject: async (projectId: string) => {
        const cookie = getUserCookie() || "00c04fd430c8";
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, cookie };
    },

    getUserPreference: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockUserPreference;
    }
};