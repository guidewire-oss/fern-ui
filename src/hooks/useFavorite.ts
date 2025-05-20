import { useCallback, useState } from "react";
import { favoritesProvider } from "../providers/favorites-provider";

export const useFavorite = () => {
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    // Fetch all favorites and update state
    const fetchFavorites = useCallback(async () => {
        try {
            const uuids = await favoritesProvider.fetchFavorites();
            setFavorites(uuids);
        } catch (error) {
            console.error("Failed to fetch favorites:", error);
            throw error;
        }
    }, []);

    // Toggle favorite status with user feedback
    const toggleFavorite = async (projectUUID: string, isFavorite: boolean) => {
        try {
            if (isFavorite) {
                await favoritesProvider.unmarkAsFavorite(projectUUID);
                setFavorites((prev) => {
                    const updated = new Set(prev);
                    updated.delete(projectUUID);
                    return updated;
                });
            } else {
                await favoritesProvider.markAsFavorite(projectUUID);
                setFavorites((prev) => new Set(prev).add(projectUUID));
            }
        } catch (error) {
            throw error;
        }
    };

    return { favorites, fetchFavorites, toggleFavorite };
};