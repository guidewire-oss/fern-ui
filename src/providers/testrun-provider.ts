import type { DataProvider } from "@refinedev/core";
import axios from "axios";
import {getAuthHeaders} from "../utils/authHeaders";

if (!process.env.VITE_FERN_REPORTER_BASE_URL) {
    console.log('Error: FERN_REPORTER_BASE_URL is not set');
}

export const API_URL = process.env.VITE_FERN_REPORTER_BASE_URL!;

export const testrunProvider: DataProvider = {
    getList: async ({ resource}) => {
        const url = `${API_URL}/reports/${resource}`;

        const response = await axios.get(url, {
            headers: getAuthHeaders(),
        });
        return {
            data: response.data.testRuns.reverse(),
            total: response.data.total,
        };
    },

    getOne: async ({resource, id}) => {
        const response = await axios(`${API_URL}/reports/${resource}/${id}`,{
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

interface TestRun {
    id: string;
    test_project_name: string;
    test_seed: string;
    start_time: string;
    end_time: string;
    git_branch: string;
    git_sha: string;
    build_trigger_actor: string;
    build_url: string;
    status: string;
    suite_runs: {
        id: string;
        suite_name: string;
        start_time: string;
        end_time: string;
        spec_runs: {
            id: string;
            spec_description: string;
            status: string;
        }[];
    }[];
    project: {
        uuid: string;
        name: string;
        team_name: string;
        comment: string;
        created_at: string;
        updated_at: string;
    };
}


export async function fetchTestRuns({
                                        filters = {},
                                        fields = [""],
                                        sortBy = 'end_time',
                                        order = 'desc'
                                    } = {}) : Promise<TestRun[]> {
    try {
        const params = {
            ...filters,
            fields: "",
            sort_by: sortBy,
            order: order,
        };

        if (fields.length > 0) {
            params.fields = fields.join(',');
        }

        const response = await axios.get(`${API_URL}/testrun/`, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                },
                params
            }
        );

        return response.data;
    } catch (error) {
        console.error('Failed to fetch test runs:', error);
        throw error;
    }
}


export interface ProjectSummary {
    uuid: string;
    name: string;
    status: string;
    test_count: number;
    test_passed: number;
    test_failed: number;
    test_skipped: number;
    date: string;
    git_branch: string;
}

export interface GroupedProjectsResponse {
    group_id: number;
    group_name: string;
    projects: ProjectSummary[];
}

export interface PreferenceResponse {
    cookie: string;
    project_groups: GroupedProjectsResponse[];
}

export async function fetchProjectGroups(): Promise<GroupedProjectsResponse[]> {
    const response = await axios.get<PreferenceResponse>(`${API_URL}/testrun/project-groups`, {
        withCredentials: true, // Ensures cookies are included
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (response.status !== 200) {
        throw new Error("Failed to fetch preferred projects " + response.data);
    }
    return response.data.project_groups;
}