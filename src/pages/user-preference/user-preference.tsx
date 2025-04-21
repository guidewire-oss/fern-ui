import React, { useState, useEffect, useContext } from 'react';
import { Card, Select, Switch, Button, List, Typography, Space, Pagination } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { ColorModeContext } from "../../contexts/color-mode";
import { IProjectGroup, IProject } from './interface';
import { 
    fetchPreferredProjects, 
    saveUserPreferences, 
    removeProjectFromGroup,
    getTimezoneOptions,
    getAllProjects,
    filterProjectsByGroup,
    getGroupOptions,
} from './user-preference-utils';
import moment from 'moment-timezone';

const { Title } = Typography;
const PAGE_SIZE = 15;

export const UserPreferencePage: React.FC = () => {
    const { mode, setMode } = useContext(ColorModeContext);
    const [timezone, setTimezone] = useState(moment.tz.guess());
    const [preferredProjects, setPreferredProjects] = useState<IProjectGroup[]>([]);
    const [loading, setLoading] = useState(false);

    const [selectedGroup, setSelectedGroup] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [allProjects, setAllProjects] = useState<IProject[]>([]);

    useEffect(() => {
        const initPreferredProjects = async () => {
            const projects = await fetchPreferredProjects();
            setPreferredProjects(projects);
            setAllProjects(getAllProjects(projects));
        };
        initPreferredProjects();
    }, []);

    const handleGroupChange = (value: string) => {
        setSelectedGroup(value);
        setCurrentPage(1);
    };

    const displayedProjects = filterProjectsByGroup(allProjects, preferredProjects, selectedGroup);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginatedProjects = displayedProjects.slice(startIndex, endIndex);

    const handleSave = async () => {
        setLoading(true);
        const success = await saveUserPreferences(mode === 'dark', timezone);
        if (success) {
            // Update the global theme mode
            window.localStorage.setItem("colorMode", mode);
        }
        setLoading(false);
    };

    const handleRemoveProject = async (groupIndex: number, projectIndex: number) => {
        const project = preferredProjects[groupIndex].projects[projectIndex];
        const updatedProjects = await removeProjectFromGroup(
            project.uuid, 
            preferredProjects
        );
        if (updatedProjects) {
            setPreferredProjects(updatedProjects);
        }
    };

    return (
        <Card title="User Preference" style={{ maxWidth: 800, margin: '0 auto' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                    <Title level={5}>Timezone</Title>
                    <Select
                        style={{ width: '30%' }}
                        value={timezone}
                        onChange={setTimezone}
                        options={getTimezoneOptions()}
                    />
                </div>

                <div>
                    <Title level={5}>Dark mode</Title>
                    <Switch
                        checkedChildren="🌛"
                        unCheckedChildren="🔆"
                        checked={mode === 'dark'}
                        onChange={() => setMode(mode === "light" ? "dark" : "light")}
                    />
                </div>

                <div>
                    <Title level={5}>Group Project</Title>
                    <Select
                        style={{ width: '30%', marginBottom: 16 }}
                        value={selectedGroup}
                        onChange={handleGroupChange}
                        options={getGroupOptions(preferredProjects)}
                    />
                    <List
                        size="small"
                        bordered
                        dataSource={paginatedProjects}
                        renderItem={(project) => (
                            <List.Item
                                actions={[
                                    <DeleteOutlined
                                        onClick={() => {
                                            const groupIndex = preferredProjects.findIndex(g =>
                                                g.projects.some(p => p.uuid === project.uuid)
                                            );

                                            if (groupIndex === -1) return;

                                            const projectIndex = preferredProjects[groupIndex].projects.findIndex(p =>
                                                p.uuid === project.uuid
                                            );

                                            if (projectIndex === -1) return;

                                            handleRemoveProject(groupIndex, projectIndex);
                                        }}
                                        style={{ color: '#ff4d4f', cursor: 'pointer' }}
                                    />

                                ]}
                            >
                                {project.name}
                            </List.Item>
                        )}
                        pagination={false} 
                    />
                    {displayedProjects.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px'}}>
                            <Pagination
                                size="small"
                                total={displayedProjects.length}
                                pageSize={PAGE_SIZE}
                                current={currentPage}
                                onChange={setCurrentPage}
                                showSizeChanger={false}
                            />
                        </div>
                    )}
                </div>

                <Button
                    type="primary"
                    onClick={handleSave}
                    loading={loading}
                    icon={<span role="img" aria-label="save">🔒</span>}
                >
                    Save
                </Button>
            </Space>
        </Card>
    );
};