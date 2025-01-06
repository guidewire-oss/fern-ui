import { ITestRun } from "../../src/pages/test-runs/interfaces";

interface ITestRunsApiResponse {
    reportHeader: string;
    testRuns: {
        edges: Array<{
            cursor: string;
            testRun: ITestRun;
        }>;
        pageInfo: {
            hasNextPage: boolean;
            startCursor: string | null;
            endCursor: string | null;
        };
        totalCount: number;
    };
}

const testRun: ITestRun = {
    "id": 1,
    "testProjectName": "Atmos Acceptance Tests",
    "testSeed": 1717396142,
    "startTime": "2024-06-03T06:29:32.938772Z",
    "endTime": "2024-06-03T06:29:34.517009Z",
    "suiteRuns": [
        {
            "id": 1,
            "testRunId": 1,
            "suiteName": "AtmosE2eTests Suite",
            "startTime": "2024-06-03T06:29:32.938772Z",
            "endTime": "2024-06-03T06:29:34.516971Z",
            "specRuns": [
                {
                    "id": 1,
                    "suiteId": 1,
                    "specDescription": "A Passed Test",
                    "status": "passed",
                    "message": "",
                    "tags": [],
                    "startTime": "2024-06-03T06:29:32.938876Z",
                    "endTime": "2024-06-03T06:29:32.938945Z"
                },
                {
                    "id": 2,
                    "suiteId": 1,
                    "specDescription": "A Skipped Test",
                    "status": "skipped",
                    "message": "",
                    "tags": [{ id: 1, name: 'Tag1' }, { id: 2, name: 'Tag2' }],
                    "startTime": "2024-06-03T06:29:32.939083Z",
                    "endTime": "0001-01-01T00:00:00Z"
                },
                {
                    "id": 3,
                    "suiteId": 1,
                    "specDescription": "A Failed Test",
                    "status": "failed",
                    "message": "The test has failed",
                    "tags": [{ id: 1, name: 'Tag1' }, { id: 2, name: 'Tag2' }],
                    "startTime": "2024-06-03T06:29:34.516708Z",
                    "endTime": "2024-06-03T06:29:34.516854Z"
                }
            ]
        }
    ]
};

export const testrunsApiResponse: ITestRunsApiResponse = {
    "reportHeader": "Fern Acceptance Test Report",
    "testRuns": {
        edges: [
            {
                cursor: "1",
                testRun: testRun,
            }
        ],
        pageInfo: {
            hasNextPage: false,
            startCursor: "1",
            endCursor: "1"
        },
        totalCount: 1
    }
};
