import React, {useEffect, useState} from 'react';
import {useSimpleList} from "@refinedev/antd";
import {Button, Card, Dropdown, List, message, Switch} from "antd";
import {HttpError} from "@refinedev/core";
import TestHistoryGrid from "./summary-utils";
import {MenuOutlined, StarFilled, StarOutlined} from "@ant-design/icons";
import {fetchPreferredProjects} from "../../providers/user-prreferred-provider";
import {GroupHeatmapGrid} from "./heatmap/GroupHeatmapGrid";
import {GroupDropdownOverlay} from "./dropdown/GroupDropdownOverlay";
import {useFavorite} from '../../hooks/useFavorite';
import {useMessageProvider} from '../../hooks/useMessageProvider';

interface Group {
    id: number;
    name: string;
}

interface Project {
    id: string;
    name: string;
    uuid: string;
}

export const TestSummary = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [visibleDropdownId, setVisibleDropdownId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const data: Group[] = [];
            let groupedProjectsResponses = []
            groupedProjectsResponses = await fetchPreferredProjects();
            if (groupedProjectsResponses != null) {
                groupedProjectsResponses.map(groupedProjectsResponse => data.push(
                    { id: groupedProjectsResponse.group_id, name: groupedProjectsResponse.group_name }));
            }

            setGroups(data);
        } catch (err) {
            message.error('Failed to fetch groups');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visibleDropdownId !== null) {
            fetchGroups();
        }
    }, [visibleDropdownId]);

    const handleMenuClick = ({ key }: { key: string }, recordId: string, project: Project) => {
        if (key === 'add_to_group') {
            setVisibleDropdownId(recordId);
            setSelectedProject(project);
        }
    };

    const handleCloseDropdown = () => {
        setVisibleDropdownId(null);
        setSelectedProject(null);
    };

    const menu = (recordId: string, project: Project) => ({
        items: [
            {
                key: 'add_to_group',
                label: 'Add to group',
            },
        ],
        onClick: ({ key }: { key: string }) => handleMenuClick({ key }, recordId, project),
    });


    const { listProps } = useSimpleList<string[], HttpError>({
        resource: "projects/",
        dataProviderName: "summaries",
    });

    const { favorites, toggleFavorite, fetchFavorites} = useFavorite();
    const { success, error } = useMessageProvider();

    // State to control whether to show only favorites
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                await fetchFavorites();
            } catch {
                error("Unable to load favorites. Please try again.");
            }
        })();
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
                success("Added to favorites");
            } else {
                success("Removed from favorites");
            }
        } catch (err) {
            error("An error occurred while toggling the favorite.");
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
                extra={
                    <Dropdown menu={menu(item.id, item)} trigger={['click']}>
                        <Button aria-label={`Project ${item.id} menu`} data-testid={`Project ${item.id} menu`} type="text" icon={<MenuOutlined />} />
                    </Dropdown>
                }
            >
                <TestHistoryGrid id={item.id} projectName={item.name} projectUUID={item.uuid} />

                {visibleDropdownId === item.id && (
                    <GroupDropdownOverlay
                        groups={groups}
                        loading={loading}
                        selectedProject={selectedProject}
                        onClose={handleCloseDropdown}
                    />
                )}
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
                <GroupHeatmapGrid/>
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