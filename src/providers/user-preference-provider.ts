import axios from "axios";
import { IUserPreference } from "../pages/user-preference/interface";
import { API_URL } from "./testrun-provider";

export const userPreferenceProvider = {
    updatePreference: async (data: IUserPreference) => {
        const response = await axios.put(
            `${API_URL}/user/preference`,
            data,
            { withCredentials: true }
        );
        return response.data;
    },

    getPreferredProjects: async () => {
        const response = await axios.get(`${API_URL}/user/preferred`, {
            withCredentials: true
        });
        return response.data;
    },

    savePreferredProjects: async (data: any) => {
        const response = await axios.post(`${API_URL}/user/preferred`, data, {
            withCredentials: true
        });
        return response.data;
    },

    deletePreferredProjects: async (data: any) => {
        const response = await axios.delete(`${API_URL}/user/preferred`, {
            withCredentials: true,
            data: data
        });
        return response.data;
    },

    getUserPreference: async () => {
        const response = await axios.get(`${API_URL}/user/preference`, {
            withCredentials: true
        });
        return response.data;
    },
};