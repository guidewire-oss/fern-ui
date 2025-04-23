import { message } from 'antd';
import { userPreferenceProvider } from '../../providers/user-preference-provider';
import { IProjectGroup, IProject, IUserPreference } from './interface';
import moment from 'moment-timezone';

export const fetchPreferredProjects = async (): Promise<IProjectGroup[]> => {
    try {
        const response = await userPreferenceProvider.getPreferredProjects();
        return response.preferred;
    } catch (error) {
        message.error('Failed to fetch preferred projects');
        return [];
    }
};

export const getAllProjects = (groups: IProjectGroup[]): IProject[] => {
    return groups.flatMap(group => group.projects);
};

export const filterProjectsByGroup = (
    projects: IProject[], 
    groups: IProjectGroup[], 
    selectedGroup: string
): IProject[] => {
    if (selectedGroup === 'all') {
        return projects;
    }
    const group = groups.find(g => g.group_name.toLowerCase() === selectedGroup.toLowerCase());
    return group ? group.projects : [];
};

export const getGroupOptions = (groups: IProjectGroup[]) => {
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
        message.success('Preferences saved successfully');
        return true;
    } catch (error) {
        message.error('Failed to save preferences');
        return false;
    }
};

export const removeProjectFromGroup = async (
    projectUuid: string,
    preferredProjects: IProjectGroup[]
): Promise<IProjectGroup[] | null> => {
    try {
        await userPreferenceProvider.removeFavouriteProject(projectUuid);
        message.success('Project removed successfully');
        return preferredProjects.map(group => ({
            ...group,
            projects: group.projects.filter(project => project.uuid !== projectUuid)
        }));
    } catch (error) {
        message.error('Failed to remove project');
        return null;
    }
};

export const fetchUserPreference = async (): Promise<IUserPreference | null> => {
    try {
        const response = await userPreferenceProvider.getUserPreference();
        return response;
    } catch (error) {
        message.error('Failed to fetch user preferences');
        return null;
    }
};

export const getTimezoneOptions = () => {
    return moment.tz.names().map(tz => ({ label: tz, value: tz }));
};