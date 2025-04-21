import React, { useEffect, useState } from 'react';
import {useSimpleList} from "@refinedev/antd";
import {Button, Card, List, message, Switch} from "antd";
import {HttpError} from "@refinedev/core";
import TestHistoryGrid from "./summary-utils";
import { useFavorite } from '../../hooks/useFavorite';
import { StarFilled, StarOutlined } from "@ant-design/icons"; 

export const TestSummary = () => {
    const { listProps } = useSimpleList<string[], HttpError>({
        resource: "projects/",
        dataProviderName: "summaries",
    });

    const { favorites, toggleFavorite, fetchFavorites} = useFavorite();

    // State to control whether to show only favorites
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);
    

    if (!listProps.dataSource || listProps.dataSource.length === 0) {
        return <div>No summary data available</div>;
    }

    const filteredDataSource = showFavoritesOnly
        ? listProps.dataSource.filter((item: any) => favorites.has(item.uuid))
        : listProps.dataSource;

    const handleFavoriteToggle = async (projectUUID: string, isFavorite: boolean) => {
        try {
            await toggleFavorite(projectUUID, isFavorite);
            
            if (!isFavorite) {
                message.success("Added to favorites");
            } else {
                message.success("Removed from favorites");
            }
        } catch (error) {
            message.error("An error occurred while toggling the favorite.");
        }
    };
    
    const renderListItem = (item: any, index: number) => {
        const isFavorite = favorites.has(item.uuid);
        return (
            <Card
                key={index}
                hoverable
                title={
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        {item.name}
                        <Button
                            type="text"
                            onClick={ () => handleFavoriteToggle(item.uuid, isFavorite)}
                            icon={
                                isFavorite ? (
                                    <StarFilled style={{ color: "#faad14", fontSize: "24px" }} />
                                ) : (
                                    <StarOutlined style={{ color: "#d9d9d9", fontSize: "24px" }} />
                                )
                            }
                        />
                    </div>
                }
                style={{ textAlign: 'center', marginBottom: '16px', width: '100%' }}
            >
                <TestHistoryGrid id={item.id} projectName={item.name} projectUUID={item.uuid}/>
            </Card>
        );
    };

        return (
            <div>
                <div style={{ marginBottom: "16px", textAlign: "right", paddingRight: "28px" }}>
                    <Switch
                        checked={showFavoritesOnly}
                        onChange={() => setShowFavoritesOnly((prev) => !prev)}
                        checkedChildren="Favorites Only"
                        unCheckedChildren="All Projects"
                        style={{ transform: "scale(1.5)" }}
                    />
                </div>
                <List
                    {...listProps}
                    dataSource={filteredDataSource}
                    renderItem={renderListItem}
                    pagination={{
                        ...listProps.pagination,
                        position: "bottom",
                        size: "small",
                    }}
                />
            </div>
        );
};