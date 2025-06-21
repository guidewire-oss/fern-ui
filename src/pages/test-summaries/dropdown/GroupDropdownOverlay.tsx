import React, { useRef } from 'react';
import { Button, Card, Select, Spin, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { GroupedProjectsRequest, savePreferredProjects, fetchPreferredProjects } from '../../../providers/user-prreferred-provider';
import './GroupDropdownOverlay.css';

interface Group {
    id: number;
    name: string;
}

interface Project {
    id: string;
    name: string;
    uuid: string;
}

interface GroupDropdownOverlayProps {
    groups: Group[];
    loading: boolean;
    selectedProject: Project | null;
    onClose: () => void;
}

export const GroupDropdownOverlay: React.FC<GroupDropdownOverlayProps> = ({
                                                                              groups,
                                                                              loading,
                                                                              selectedProject,
                                                                              onClose,
                                                                          }) => {
    const [selectedGroup, setSelectedGroup] = React.useState<string>("");
    const [searchValue, setSearchValue] = React.useState('');
    const selectRef = useRef<any>(null);

    const handleSearch = (value: string) => {
        setSearchValue(value);
    };

    const handleSelect = (value: string) => {
        setSelectedGroup(value);
    };

    const saveGroup = async (groupName: string) => {
        try {
            let groupedProjectsResponseArr = await fetchPreferredProjects();

            console.log("groupedProjectsResponseArr", groupedProjectsResponseArr)

            const groupAlreadyExists = groupedProjectsResponseArr == null ? false : (groupedProjectsResponseArr
                .filter(groupedProjectsResponse => groupedProjectsResponse.group_name === groupName)
                .length === 1)

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

            console.log("groupProjectRequest", groupProjectRequest)

            await savePreferredProjects(groupProjectRequest)

            message.success(`"${selectedProject?.name}" added to group "${groupName}"`);
            onClose();
        } catch (err) {
            message.error('Failed to save group');
        }
    };

    const handleSave = () => {
        const value = selectedGroup || searchValue;
        if (!value) {
            message.warning('Please select or enter a group name');
            return;
        }

        saveGroup(selectedGroup);
    };

    return (
        <Card
            title="Group Name"
            className="group-dropdown-overlay"
            extra={
                <Button
                    aria-label={`Project ${selectedProject?.id} close menu`}
                    type="text"
                    onClick={onClose}
                    icon={<CloseOutlined />}
                />
            }
        >
            <Select
                aria-label={`Project ${selectedProject?.id} group dropdown`}
                showSearch
                value={selectedGroup}
                placeholder="Select or add group"
                className="group-dropdown-select"
                onSearch={handleSearch}
                onSelect={handleSelect}
                onChange={(value: string) => setSelectedGroup(value)}
                ref={selectRef}
                notFoundContent={
                    loading ? (
                        <Spin size="small" />
                    ) : searchValue ? (
                        <div
                            onClick={() => {
                                setSelectedGroup(searchValue)
                                selectRef.current?.blur();
                            }}
                            className="group-dropdown-add-option"
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
                className="group-dropdown-save-button"
            >
                Save
            </Button>
        </Card>
    );
};