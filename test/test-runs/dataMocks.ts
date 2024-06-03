import {ITestRun} from "../../src/pages/test-runs/interfaces";

interface IApiResponse {
    reportHeader: string;
    testRuns: ITestRun[];
    total: number;
}


export const apiResponse: IApiResponse = {
    "reportHeader": "Fern Acceptance Test Report",
    "testRuns": [
        {
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
                            "spec_description": "",
                            "status": "passed",
                            "message": "",
                            "tags": [],
                            "start_time": "2024-06-03T06:29:32.938876Z",
                            "end_time": "2024-06-03T06:29:32.938945Z"
                        },
                        {
                            "id": 2,
                            "suite_id": 1,
                            "spec_description": "Kpack add-on should have created kpack namespace",
                            "status": "skipped",
                            "message": "",
                            "tags": [{ id: 1, name: 'Tag1' }, { id: 2, name: 'Tag2' }],
                            "start_time": "2024-06-03T06:29:32.939083Z",
                            "end_time": "0001-01-01T00:00:00Z"
                        },
                        {
                            "id": 3,
                            "suite_id": 1,
                            "spec_description": "Atmos node health check when given an Atmos cluster with a list of nodes for the cluster all nodes should be in a ready state",
                            "status": "passed",
                            "message": "",
                            "tags": [{ id: 1, name: 'Tag1' }, { id: 2, name: 'Tag2' }],
                            "start_time": "2024-06-03T06:29:32.939165Z",
                            "end_time": "2024-06-03T06:29:32.939183Z"
                        },
                        {
                            "id": 4,
                            "suite_id": 1,
                            "spec_description": "System health check when given an Atmos cluster with a list of system namespaces should verify that all deployments are ready",
                            "status": "failed",
                            "message": "Expected\n    \u003Cint\u003E: 1\nto equal\n    \u003Cint\u003E: 0",
                            "tags": [{ id: 1, name: 'Tag1' }, { id: 2, name: 'Tag2' }],
                            "start_time": "2024-06-03T06:29:34.516708Z",
                            "end_time": "2024-06-03T06:29:34.516854Z"
                        }
                    ]
                }
            ]
        }
    ],
    "total": 1
};

