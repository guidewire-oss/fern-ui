import { message } from 'antd';
import { userPreferenceProvider } from '../../providers/user-preference-provider';
import { IProjectGroup, IProject, IUserPreference } from './interface';
import moment from 'moment-timezone';

export const fetchPreferredProjects = async (): Promise<IProjectGroup[]> => {
    try {
        const response = await userPreferenceProvider.getPreferredProjects();
        return response.preferred || [];
    } catch (error) {
        message.error('Failed to fetch preferred projects');
        return [];
    }
};

export const getAllProjects = (groups: IProjectGroup[] | null | undefined): IProject[] => {
    if (!groups) return [];
    return groups.flatMap(group => group.projects);
};

export const filterProjectsByGroup = (
    projects: IProject[], 
    groups: IProjectGroup[] | null | undefined, 
    selectedGroup: string
): IProject[] => {
    if (selectedGroup === 'all') {
        return projects;
    }
    if (!groups) return [];
    const group = groups.find(g => g.group_name.toLowerCase() === selectedGroup.toLowerCase());
    return group ? group.projects : [];
};

export const getGroupOptions = (groups: IProjectGroup[] | null | undefined) => {
    if (!groups) return [{ label: 'Show All', value: 'all' }];
    
    return [
        { label: 'Show All', value: 'all' },
        ...groups.map(group => ({
            label: group.group_name,
            value: group.group_name.toLowerCase()
        }))
    ];
};

export const saveUserPreferences = async (
    isDark: boolean,
    timezone: string
): Promise<boolean> => {
    try {
        await userPreferenceProvider.updatePreference({
            isDark,
            timezone,
        });
        message.success('User preferences saved successfully');
        return true;
    } catch (error) {
        message.error('Failed to save user preferences');
        return false;
    }
};

export const savePreferredProjects = async (
    preferredProjects: IProjectGroup[]
): Promise<boolean> => {
    try {
        // Transform the data to match the backend API format
        const payload = {
            preferred: preferredProjects.map(group => ({
                group_id: group.group_id || 0, // 0 for new groups
                group_name: group.group_name,
                projects: group.projects.map(project => project.uuid)
            }))
        };

        await userPreferenceProvider.savePreferredProjects(payload);
        message.success('Project preferences saved successfully');
        return true;
    } catch (error) {
        message.error('Failed to save project preferences');
        return false;
    }
};

export const deleteProjectGroups = async (groupIds: number[]): Promise<boolean> => {
    try {
        const payload = {
            preferred: groupIds.map(id => ({ group_id: id }))
        };

        await userPreferenceProvider.deletePreferredProjects(payload);
        message.success('Project groups deleted successfully');
        return true;
    } catch (error) {
        message.error('Failed to delete project groups');
        return false;
    }
};

export const fetchUserPreference = async (): Promise<IUserPreference | null> => {
    try {
        const response = await userPreferenceProvider.getUserPreference();
        return {
            isDark: response.IsDark !== undefined ? response.IsDark : false,
            timezone: response.Timezone || moment.tz.guess(),
        };
    } catch (error) {
        message.error('Failed to fetch user preferences');
        return null;
    }
};

export const getTimezoneOptions = () => {
    return moment.tz.names().map(tz => ({ label: tz, value: tz }));
};