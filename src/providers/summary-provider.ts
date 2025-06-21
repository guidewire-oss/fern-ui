import type { DataProvider } from "@refinedev/core";
import axios from "axios";
import {API_URL} from "./testrun-provider";
import {getAuthHeaders} from "../utils/authHeaders";


export const summaryProvider: DataProvider = {
    getList: async ({ resource}) => {
        const url = `${API_URL}/reports/${resource}`;
        const response = await axios.get(url, {
            headers: getAuthHeaders(),
        });
        if(resource.startsWith("projects")) {
            return {
                data: response.data.projects,
                total: response.data.total,
            };
        }
        else if(resource.startsWith("summary")) {
            return {
                data: response?.data,
                total: response?.data?.total,
            };
        }
        return {
            data: [],
            total: 0,
        };
    },

    getOne: async ({resource, id}) => {
        const response = await axios(`${API_URL}/reports/${resource}/${id}`, {
            headers: getAuthHeaders(),
        });

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
