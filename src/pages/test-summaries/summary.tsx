import React, { useEffect, useState } from 'react';
import { useSimpleList } from "@refinedev/antd";
import { Button, Card, Dropdown, List, Menu, message } from "antd";
import { HttpError } from "@refinedev/core";
import TestHistoryGrid from "./summary-utils";
import { MenuOutlined } from "@ant-design/icons";
import {
    fetchPreferredProjects
} from "../../providers/user-prreferred-provider";
import { GroupHeatmapGrid } from "./heatmap/GroupHeatmapGrid";
import { GroupDropdownOverlay } from "./dropdown/GroupDropdownOverlay";

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

    const menu = (recordId: string, project: Project) => (
        <Menu onClick={({ key }) => handleMenuClick({ key }, recordId, project)} >
            <Menu.Item key="add_to_group">Add to group</Menu.Item>
        </Menu>
    );

    const { listProps } = useSimpleList<string[], HttpError>({
        resource: "projects/",
        dataProviderName: "summaries",
    });

    if (!listProps.dataSource || listProps.dataSource.length === 0) {
        return <div>No summary data available</div>;
    }

    const renderListItem = (item: any, index: number) => {
        return (
            <Card
                key={index}
                hoverable
                title={item.name}
                style={{ textAlign: 'center', marginBottom: '16px', width: '100%' }}
                extra={
                    <Dropdown overlay={menu(item.id, item)} trigger={['click']}>
                        <Button type="text" icon={<MenuOutlined />} />
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
                        fetchGroups={fetchGroups}
                    />
                )}
            </Card>
        );
    };

    return (
        <div>
            <GroupHeatmapGrid/>
            <List
                {...listProps}
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