import axios from "axios";
import {GroupedProjectsResponse, PreferenceResponse} from "./user-prreferred-provider";

if (!import.meta.env.VITE_FERN_REPORTER_BASE_URL) {
    console.error("FERN_REPORTER_BASE_URL is not set");
}

export const API_URL = import.meta.env.VITE_FERN_REPORTER_BASE_URL;


export interface TestRun {
    id: string
    testProjectName: string
    startTime: string
    endTime: string
    status: string
}

export interface ProjectTestRuns {
    id: number
    uuid: string
    name: string
    testRuns : TestRun[]
}


export async function fetchProjectTestRuns(uuid: string): Promise<ProjectTestRuns> {
    const response = await axios.get<ProjectTestRuns>(`${API_URL}/project/${uuid}/testruns`, {
        withCredentials: true, // Ensures cookies are included
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (response.status !== 200) {
        console.log("Failed to fetch preferred projects", response.data);
        throw new Error("Failed to fetch preferred projects " + response.data);
    }
    return response.data;
}