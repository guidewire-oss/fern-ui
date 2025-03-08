export interface IReportSummary {
    SuiteRunID: number;
    SuiteName: string;
    TestProjectName: string;
    StartTime: string;
    TotalPassedSpecRuns: number;
    TotalSkippedSpecRuns: number;
    TotalSpecRuns: number;
}
