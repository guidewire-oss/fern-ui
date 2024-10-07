import type { DataProvider } from "@refinedev/core";
import axios from "axios";

if (!import.meta.env.VITE_FERN_REPORTER_BASE_URL) {
    console.log('Error: FERN_REPORTER_BASE_URL is not set');
}

export const API_URL = import.meta.env.VITE_FERN_REPORTER_BASE_URL;

export const testrunProvider: DataProvider = {
    getList: async ({ resource}) => {
        const url = `${API_URL}/reports/${resource}`;

        const response = await axios.get(url);
        return {
            data: response.data.testRuns,
            total: response.data.total,
        };
    },

    getOne: async ({resource, id}) => {
        const response = await axios(`${API_URL}/reports/${resource}/${id}`);

        if (response.status < 200 || response.status > 299) throw response;

        const data = await response.data();

        return { data };
    },

    update: () => {
        throw new Error("Not implemented");
    },
    create: () => {
        throw new Error("Not implemented");
    },
    deleteOne: () => {
        throw new Error("Not implemented");
    },
    getApiUrl: () => API_URL,
    // Optional methods:
    // getMany: () => { /* ... */ },
    // createMany: () => { /* ... */ },
    // deleteMany: () => { /* ... */ },
    // updateMany: () => { /* ... */ },
    // custom: () => { /* ... */ },
};