export interface ITestRun {
    id: number;
    test_project_name: string;
    test_seed: number;
    start_time: string;
    end_time: string;
    suite_runs: ISuiteRun[];
}

export interface ISuiteRun {
    id: number;
    test_run_id: number;
    suite_name: string;
    start_time: string;
    end_time: string;
    spec_runs: ISpecRun[];
}

export interface ISpecRun {
    id: number;
    suite_id: number;
    spec_description: string;
    status: string;
    message: string;
    tags: ITag[];
    start_time: string;
    end_time: string;
}

export interface ITag {
    id: number;
    name: string;
}
