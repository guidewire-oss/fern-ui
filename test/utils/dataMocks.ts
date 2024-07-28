import {ITestRun} from "../../src/pages/test-runs/interfaces";
import {IReportSummary} from "../../src/pages/test-summaries/interfaces";

interface ITestRunsApiResponse {
    reportHeader: string;
    testRuns: ITestRun;
    total: number;
}


const testRun: ITestRun = {
    "id": 1,
    "test_project_name": "Atmos Acceptance Tests",
    "test_seed": 1717396142,
    "start_time": "2024-06-03T06:29:32.938772Z",
    "end_time": "2024-06-03T06:29:34.517009Z",
    "suite_runs": [
        {
            "id": 1,
            "test_run_id": 1,
            "suite_name": "AtmosE2eTests Suite",
            "start_time": "2024-06-03T06:29:32.938772Z",
            "end_time": "2024-06-03T06:29:34.516971Z",
            "spec_runs": [
                {
                    "id": 1,
                    "suite_id": 1,
                    "spec_description": "A Passed Test",
                    "status": "passed",
                    "message": "",
                    "tags": [],
                    "start_time": "2024-06-03T06:29:32.938876Z",
                    "end_time": "2024-06-03T06:29:32.938945Z"
                },
                {
                    "id": 2,
                    "suite_id": 1,
                    "spec_description": "A Skipped Test",
                    "status": "skipped",
                    "message": "",
                    "tags": [{ id: 1, name: 'Tag1' }, { id: 2, name: 'Tag2' }],
                    "start_time": "2024-06-03T06:29:32.939083Z",
                    "end_time": "0001-01-01T00:00:00Z"
                },
                {
                    "id": 3,
                    "suite_id": 1,
                    "spec_description": "A Failed Test",
                    "status": "failed",
                    "message": "The test has failed",
                    "tags": [{ id: 1, name: 'Tag1' }, { id: 2, name: 'Tag2' }],
                    "start_time": "2024-06-03T06:29:34.516708Z",
                    "end_time": "2024-06-03T06:29:34.516854Z"
                }
            ]
        }
    ]
}

export const testrunsApiResponse: ITestRunsApiResponse = {
    "reportHeader": "Fern Acceptance Test Report",
    "testRuns": testRun,
    "total": 1
};

