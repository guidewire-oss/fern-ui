export interface IUserPreference {
    isDark: boolean;
    timezone: string;
}

export interface IProjectGroup {
    group_name: string;
    projects: IProject[];
}

export interface IProject {
    uuid: string;
    name: string;
}
