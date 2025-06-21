import React, { useState, useEffect, useContext } from 'react';
import { Card, Select, Switch, Button, List, Typography, Space, Pagination, Popconfirm } from 'antd';
import { DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import { ColorModeContext } from "../../contexts/color-mode";
import { IProjectGroup, IProject } from './interface';
import { 
    fetchPreferredProjects, 
    saveUserPreferences, 
    savePreferredProjects,
    deleteProjectGroups,
    getTimezoneOptions,
    getAllProjects,
    filterProjectsByGroup,
    getGroupOptions,
    fetchUserPreference
} from './user-preference-utils';
import moment from 'moment-timezone';

const { Title } = Typography;
const PAGE_SIZE = 15;

export const UserPreferencePage: React.FC = () => {
    const { mode, setMode } = useContext(ColorModeContext);
    const [timezone, setTimezone] = useState(moment.tz.guess());
    const [originalPreferredProjects, setOriginalPreferredProjects] = useState<IProjectGroup[]>([]);
    const [preferredProjects, setPreferredProjects] = useState<IProjectGroup[]>([]);
    const [deletedGroupIds, setDeletedGroupIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const [selectedGroup, setSelectedGroup] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [allProjects, setAllProjects] = useState<IProject[]>([]);

    useEffect(() => {
        // Clear any active navigation tab
        const navLinks = document.querySelectorAll('.ant-menu-item-selected');
        navLinks.forEach(link => {
            link.classList.remove('ant-menu-item-selected');
        });
        
        const initPreferredProjects = async () => {
            const projects = await fetchPreferredProjects();
            setOriginalPreferredProjects(projects);
            setPreferredProjects(projects);
            setAllProjects(getAllProjects(projects));
        };
        
        const initUserPreference = async () => {
            const userPref = await fetchUserPreference();
            if (userPref) {
                setTimezone(userPref.timezone);
            }
        };
        
        initPreferredProjects();
        initUserPreference();
    }, []);

    // Check if there are changes
    useEffect(() => {
        const hasProjectChanges = JSON.stringify(originalPreferredProjects) !== JSON.stringify(preferredProjects);
        const hasDeletedGroups = deletedGroupIds.length > 0;
        setHasChanges(hasProjectChanges || hasDeletedGroups);
    }, [originalPreferredProjects, preferredProjects, deletedGroupIds]);

    const handleGroupChange = (value: string) => {
        setSelectedGroup(value);
        setCurrentPage(1);
    };

    const displayedProjects = filterProjectsByGroup(allProjects, preferredProjects, selectedGroup);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginatedProjects = displayedProjects.slice(startIndex, endIndex);

    const getCurrentGroup = () => {
        if (selectedGroup === 'all') return null;
        return preferredProjects.find(g => g.group_name.toLowerCase() === selectedGroup.toLowerCase());
    };

    const handleRemoveProject = (projectUuid: string) => {
        setPreferredProjects(prevGroups =>
            prevGroups.map(group => ({
                ...group,
                projects: group.projects.filter(project => project.uuid !== projectUuid)
            })).filter(group => group.projects.length > 0) // Remove empty groups
        );

        // Update allProjects for immediate UI feedback
        setAllProjects(prev => prev.filter(project => project.uuid !== projectUuid));
    };

    const handleDeleteGroup = (groupName: string) => {
        const groupToDelete = preferredProjects.find(g => g.group_name === groupName);
        if (!groupToDelete) return;

        // Add to deleted groups if it has an ID (existing group)
        if (groupToDelete.group_id && groupToDelete.group_id !== 0) {
            setDeletedGroupIds(prev => [...prev, groupToDelete.group_id!]);
        }

        // Remove group from preferred projects
        setPreferredProjects(prev => prev.filter(g => g.group_name !== groupName));

        // Update allProjects by removing all projects from this group
        setAllProjects(prev => prev.filter(project => 
            !groupToDelete.projects.some(groupProject => groupProject.uuid === project.uuid)
        ));

        // Reset selected group if current group was deleted
        if (selectedGroup.toLowerCase() === groupName.toLowerCase()) {
            setSelectedGroup('all');
        }
    };

    const handleSave = async () => {
        setLoading(true);
        
        try {
            // Save user preferences (theme and timezone)
            const userPrefSuccess = await saveUserPreferences(mode === 'dark', timezone);
            
            // Save preferred projects if there are changes
            if (hasChanges) {
                let success = true;
                
                // Delete groups first if any
                if (deletedGroupIds.length > 0) {
                    success = await deleteProjectGroups(deletedGroupIds);
                }
                
                // Save/update preferred projects
                if (success && preferredProjects.length > 0) {
                    success = await savePreferredProjects(preferredProjects);
                }
                
                if (success) {
                    // Update original state and reset changes tracking
                    setOriginalPreferredProjects(preferredProjects);
                    setDeletedGroupIds([]);
                    
                    // Update global theme mode
                    if (userPrefSuccess) {
                        window.localStorage.setItem("colorMode", mode);
                    }
                }
            } else if (userPrefSuccess) {
                // Only user preferences changed
                window.localStorage.setItem("colorMode", mode);
            }
        } catch (error) {
            console.error('Error saving preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setPreferredProjects(originalPreferredProjects);
        setDeletedGroupIds([]);
        setAllProjects(getAllProjects(originalPreferredProjects));
        setSelectedGroup('all');
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 16 }}>
                        <Title level={5} style={{ margin: 0 }}>Group Project</Title>
                        {getCurrentGroup() && (
                            <Popconfirm
                                title={`Delete group "${getCurrentGroup()?.group_name}"?`}
                                description="This will remove all projects in this group from your preferences."
                                onConfirm={() => handleDeleteGroup(getCurrentGroup()!.group_name)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button 
                                    type="text" 
                                    size="small" 
                                    danger 
                                    icon={<CloseOutlined />}
                                    title="Delete this group"
                                >
                                    Delete Group
                                </Button>
                            </Popconfirm>
                        )}
                    </div>
                    
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
                        locale={{ emptyText: 'No projects in this group' }}
                        renderItem={(project) => (
                            <List.Item
                                actions={[
                                    <Popconfirm
                                        title={`Remove "${project.name}" from preferences?`}
                                        onConfirm={() => handleRemoveProject(project.uuid)}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <DeleteOutlined
                                            style={{ color: '#ff4d4f', cursor: 'pointer' }}
                                            title="Remove project"
                                        />
                                    </Popconfirm>
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

                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button
                        type="primary"
                        onClick={handleSave}
                        loading={loading}
                        icon={<span role="img" aria-label="save">🔒</span>}
                    >
                        Save
                    </Button>
                    {hasChanges && (
                        <Button
                            onClick={handleReset}
                            disabled={loading}
                        >
                            Reset Changes
                        </Button>
                    )}
                </div>
                
                {hasChanges && (
                    <div style={{ 
                        padding: '8px 12px', 
                        backgroundColor: '#fff7e6', 
                        border: '1px solid #ffd591',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#d46b08'
                    }}>
                        ⚠️ You have unsaved changes. Click "Save" to apply them.
                    </div>
                )}
            </Space>
        </Card>
    );
};