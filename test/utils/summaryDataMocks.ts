import {IReportSummary} from "../../src/pages/test-summaries/interfaces";

export const reportSummary: IReportSummary = {
    StartTime: "2024-04-20T04:20:00.000000Z",
    SuiteRunID: 1,
    TestProjectName: "Dummy Project",
    TotalPassedSpecRuns: 3,
    TotalSkippedSpecRuns: 0,
    TotalSpecRuns: 4
}

export const testsummariesApiResponse: IReportSummary[] = [
    reportSummary
];