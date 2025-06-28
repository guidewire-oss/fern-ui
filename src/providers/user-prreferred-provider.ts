import axios from "axios";

export const API_URL = process.env.VITE_FERN_REPORTER_BASE_URL!;

export interface ProjectSummary {
    uuid: string;
    name: string;
}

export interface GroupedProjectsResponse {
    group_id: number;
    group_name: string;
    projects: ProjectSummary[];
}

export interface GroupedProjectsRequest {
    group_id?: number;
    group_name: string;
    projects: string[];
}

export interface PreferenceResponse {
    cookie: string;
    preferred: GroupedProjectsResponse[];
}

export interface DeletePreferredRequest {
    preferred: {
        groupId: number;
    }[];
}

export async function fetchPreferredProjects(): Promise<GroupedProjectsResponse[]> {
    const response = await axios.get<PreferenceResponse>(`${API_URL}/user/preferred`, {
        withCredentials: true, // Ensures cookies are included
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (response.status !== 200) {
        throw new Error("Failed to fetch preferred projects " + response.data);
    }
    return response.data.preferred;
}

export async function savePreferredProjects(preferred: GroupedProjectsRequest[]): Promise<void> {
    const payload = { preferred };

    const response = await axios.post(`${API_URL}/user/preferred`, payload, {
        withCredentials: true, // Ensures cookies are included
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (response.status !== 201 || response.data.status !== "success") {
        throw new Error("Failed to save preferred projects");
    }
}

export async function deletePreferredProjects(deletePreferredRequest : DeletePreferredRequest): Promise<void> {

    const response = await axios.delete(`${API_URL}/user/preferred`,{
        withCredentials: true, // Ensures cookies are included
        headers: {
            "Content-Type": "application/json",
        },
        data: deletePreferredRequest
    });
    if (response.status !== 200 || response.data.status !== "deleted") {
        throw new Error("Failed to delete preferred projects");
    }
}
