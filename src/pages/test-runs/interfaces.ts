export interface ITestRun {
    id: number;
    testProjectName: string;
    testSeed: number;
    startTime: string;
    endTime: string;
    gitBranch: string;
    gitSha: string;
    buildTriggerActor: string;
    buildUrl: string;
    suiteRuns: ISuiteRun[];
}

export interface ISuiteRun {
    id: number;
    testRunId: number;
    suiteName: string;
    startTime: string;
    endTime: string;
    specRuns: ISpecRun[];
}

export interface ISpecRun {
    id: number;
    suiteId: number;
    specDescription: string;
    status: string;
    message: string;
    tags: ITag[];
    startTime: string;
    endTime: string;
}

export interface ITag {
    id: number;
    name: string;
}
