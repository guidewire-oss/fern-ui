import type { DataProvider } from "@refinedev/core";
import axios from "axios";

const API_URL = "http://localhost:8080/api";

export const dataProvider: DataProvider = {
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
