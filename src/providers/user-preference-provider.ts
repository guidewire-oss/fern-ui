import axios from "axios";
import { IUserPreference } from "../pages/user-preference/interface";
import { getUserCookie } from "../utils/cookies";
import {API_URL} from "./testrun-provider";

const getCookieOrThrow = (): string => {
    const cookie = getUserCookie();
    if (!cookie) {
        throw new Error('User cookie is missing');
    }
    return cookie;
};

export const userPreferenceProvider = {
    updatePreference: async (data: IUserPreference) => {
        const response = await axios.put(`${API_URL}/user/preference`, {
            cookie: getCookieOrThrow(),
            ...data
        });
        return response.data;
    },

    getPreferredProjects: async () => {
        const response = await axios.get(`${API_URL}/user/preferred/${getCookieOrThrow()}`);
        return response.data;
    },

    removeFavouriteProject: async (projectId: string) => {
        const response = await axios.delete(`${API_URL}/user/favourite/${getCookieOrThrow()}/${projectId}`);
        return response.data;
    },

    getUserPreference: async () => {
        const response = await axios.get(`${API_URL}/user/preference/${getCookieOrThrow()}`);
        return response.data;
    },
};
