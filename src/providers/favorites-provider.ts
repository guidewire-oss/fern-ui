import axios from "axios";
import { API_URL } from "./testrun-provider";

export const favoritesProvider = {
    // Fetch all favorite projects
    fetchFavorites: async () => {
        const url = `${API_URL}/user/preferred`;
        try {
            const { data } = await axios.get(url, { withCredentials: true });
            const uuids = new Set<string>();
            data.preferred.forEach((group: { projects: any[] }) => {
                group.projects.forEach((project) => {
                    uuids.add(project.uuid);
                });
            });
            return uuids;
        } catch (error) {
            console.error("Failed to fetch favorites:", error);
            throw error;
        }
    },

    // Mark a project as favorite
    markAsFavorite: async (projectUUID: string) => {
        const url = `${API_URL}/user/favourite`;
        try {
            const response = await axios.post(
                url,
                { favourite: projectUUID },
                { withCredentials: true }
            );
            if (response.status === 201) {
                return projectUUID;
            } else {
                console.error("Failed to mark as favorite:", response.data);
                throw new Error("Failed to mark as favorite");
            }
        } catch (error) {
            console.error("Error marking as favorite:", error);
            throw error;
        }
    },

    // Unmark a project as favorite
    unmarkAsFavorite: async (projectUUID: string) => {
        const url = `${API_URL}/user/favourite/${projectUUID}`;
        try {
            const response = await axios.delete(url, { withCredentials: true });
            if (response.status === 200) {
                return projectUUID;
            } else {
                console.error("Failed to unmark as favorite:", response.data);
                throw new Error("Failed to unmark as favorite");
            }
        } catch (error) {
            console.error("Error unmarking as favorite:", error);
            throw error;
        }
    },
};