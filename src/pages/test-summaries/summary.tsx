import React, { useEffect, useState } from 'react';
import { useSimpleList } from "@refinedev/antd";
import { Button, Card, Dropdown, Input, List, Menu, message, Modal, Select, Spin } from "antd";
import { HttpError } from "@refinedev/core";
import TestHistoryGrid from "./summary-utils";
import { HamburgerMenu } from "@refinedev/mui";
import {HeatMapOutlined, MenuOutlined, MoreOutlined} from "@ant-design/icons";
import {
    fetchPreferredProjects,
    GroupedProjectsRequest,
    savePreferredProjects
} from "../../providers/user-prreferred-provider";
import axios from "axios";
import {GroupHeatmap, GroupHeatmapArgs} from "./heatmap/GroupHeatMap";
import {fetchProjectTestRuns, ProjectTestRuns} from "../../providers/project-provider";
import {GroupHeatmapGrid} from "./heatmap/GroupHeatmapGrid";
// import { Select } from 'antd';
// import HamburgerMenu from "../../components/common/HamburgerMenu";

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
    const [selectedGroup, setSelectedGroup] = useState<string>("");
    const [visibleDropdownId, setVisibleDropdownId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);




    // Placeholder: Fetch group list from API
    const fetchGroups = async () => {
        setLoading(true);
        try {
            const data: Group[] = [
                { id: 1, name: 'Engineering' },
                { id: 2, name: 'Marketing' },
                { id: 3, name: 'Design' },
            ];
            let groupedProjectsResponses = []
            try {
                groupedProjectsResponses = await fetchPreferredProjects();
                if (groupedProjectsResponses != null) {
                    groupedProjectsResponses.map(groupedProjectsResponse => data.push(
                        { id: groupedProjectsResponse.group_id, name: groupedProjectsResponse.group_name }));
                }
            } catch (err) {
                console.log(err)
                console.log("**** Failed to fetch preferred projects");
            }

            setGroups(data);
        } catch (err) {
            message.error('Failed to fetch groups');
        } finally {
            setLoading(false);
        }
    };

    const saveGroup = async (groupName: string) => {
        try {
            let groupedProjectsResponseArr = await fetchPreferredProjects();
            const groupAlreadyExists = groupedProjectsResponseArr == null ? false : (groupedProjectsResponseArr
                .filter(groupedProjectsResponse => groupedProjectsResponse.group_name === groupName)
                .length === 1)


            // groupedProjectsResponses.concat({group_name: groupName, projects : [selectedProject?.uuid]})
            const groupProjectRequest: GroupedProjectsRequest[] = []
            const projectUuid = selectedProject != null ? selectedProject.uuid : ""
            if (!groupAlreadyExists) {
                groupProjectRequest.push({ group_name: groupName, projects: [projectUuid] })
            } else {
                groupedProjectsResponseArr = groupedProjectsResponseArr.map((groupProjectResponse) =>
                    groupProjectResponse.group_name === groupName ?
                        { ...groupProjectResponse, projects: [...groupProjectResponse.projects, { id: '', name: '', uuid: projectUuid }] }
                        : groupProjectResponse
                )
            }

            if (groupedProjectsResponseArr != null) {
                groupedProjectsResponseArr.map(groupedProjectsResponse =>
                    groupProjectRequest.push({
                        group_id: groupedProjectsResponse.group_id,
                        group_name: groupedProjectsResponse.group_name,
                        projects: groupedProjectsResponse.projects.flatMap(projectSummary => projectSummary.uuid)
                    })
                );
            }

            await savePreferredProjects(groupProjectRequest)

            console.log(`Saving project ${selectedProject?.name} to group:`, groupName);
            message.success(`"${selectedProject?.name}" added to group "${groupName}"`);
            setVisibleDropdownId(null);
            setSelectedProject(null);
        } catch (err) {
            console.log(err)
            message.error('Failed to save group');
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

    const menu = (recordId: string, project: Project) => (
        <Menu onClick={({ key }) => handleMenuClick({ key }, recordId, project)}>
            <Menu.Item key="add_to_group">Add to group</Menu.Item>
        </Menu>
    );

    const handleSearch = (value: string) => {
        setSearchValue(value);
    };

    const handleSelect = (value: string) => {
        setSelectedGroup(value);
    };

    const handleSave = () => {
        const value = selectedGroup || searchValue;
        if (!value) {
            message.warning('Please select or enter a group name');
            return;
        }

        saveGroup(selectedGroup);

    };

    const dropdownOverlay = (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 1000,
            padding: 24,
            width: 400,
            maxWidth: '90%',
        }}>
            <Select
                showSearch
                value={selectedGroup}
                placeholder="Select or add group"
                style={{ width: '100%' }}
                onSearch={handleSearch}
                onSelect={handleSelect}
                onChange={(value: string) => setSelectedGroup(value)}
                notFoundContent={
                    loading ? (
                        <Spin size="small" />
                    ) : searchValue ? (
                        <div
                            onClick={() => setSelectedGroup(searchValue)}
                            style={{ padding: '5px', cursor: 'pointer' }}
                        >
                            + Add "{searchValue}"
                        </div>
                    ) : null
                }
                filterOption={(input: string, option?: React.ReactElement) =>
                    (option?.props.children as string)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                }
            >
                {groups.map((group) => (
                    <Select.Option key={group.id} value={group.name}>
                        {group.name}
                    </Select.Option>
                ))}
            </Select>
            <Button
                type="primary"
                onClick={handleSave}
                style={{ marginTop: 10, width: '100%' }}
            >
                Save
            </Button>
        </div>
    );


    const { listProps } = useSimpleList<string[], HttpError>({
        resource: "projects/",
        dataProviderName: "summaries",
    });

    //************************************************heatmap changes***************************************************
    const [heatmapData, setHeatmapData] = useState<GroupHeatmapArgs[]>([]);
    // const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHeatmapData = async () => {
            try {
                const groupedProjectsResponses = await fetchPreferredProjects();

                const result : GroupHeatmapArgs[] = []

                for(const group of groupedProjectsResponses) {

                    const projectTestRunsArr : ProjectTestRuns[] = []
                    for(const project of group.projects) {
                        const projectTestRuns = await fetchProjectTestRuns(project.uuid)
                        projectTestRunsArr.push(projectTestRuns)
                    }
                    const groupHeatmapArgs : GroupHeatmapArgs = {groupName : group.group_name, projectTestRuns : projectTestRunsArr}
                    result.push(groupHeatmapArgs)
                }
                setHeatmapData(result);
            } catch (error) {
                console.error("Failed to fetch heatmap data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHeatmapData();
    }, []);

    //Handle loading part
    // if (loading) return <Spin />;


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
                    <div
                        style={{
                            position: 'absolute',
                            top: 80,
                            left: 20,
                            background: '#fff',
                            border: '1px solid #ccc',
                            borderRadius: 6,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            zIndex: 1000,
                        }}
                    >
                        {dropdownOverlay}
                    </div>
                )}

            </Card>
        );
    };

    return (
        <div>
            {/*{heatmapData.map((groupHeatmapArgs) => (*/}
            {/*    <GroupHeatmap groupName={groupHeatmapArgs.groupName} projectTestRuns={groupHeatmapArgs.projectTestRuns}/>*/}
            {/*))}*/}
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

        // <List
        //     {...listProps}
        //     renderItem={renderListItem}
        //     pagination={{
        //         ...listProps.pagination,
        //         position: "bottom",
        //         size: "small",
        //     }}
        // />
    );
};