import {IReportSummary, IReportProject} from "../../src/pages/test-summaries/interfaces";

export const reportSummary: IReportSummary = {
    StartTime: "2024-04-20T04:20:00.000000Z",
    SuiteRunID: 1,
    SuiteName: "Dummy Suite",
    TestProjectName: "Dummy Project",
    TotalPassedSpecRuns: 3,
    TotalSkippedSpecRuns: 0,
    TotalSpecRuns: 4
}

export const reportProject: IReportProject = {
    id: 1,
    name: "Dummy Project",
    uuid: "996ad860-2a9a-504f-8861-aeafd0b2ae29"
}

export const testsummariesApiResponse: IReportSummary[] = [
    reportSummary
];

export const projectApiResponse: IReportProject[] = [
    reportProject
];