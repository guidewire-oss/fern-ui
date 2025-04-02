// graphqlQueries.ts

import { gql } from "graphql-request";

export const GET_TEST_RUNS = gql`
    query GetTestRuns($first: Int, $after: String, $isDescendingOrder: Boolean) {
        testRuns(first: $first, after: $after, desc: $isDescendingOrder) {
            edges {
                cursor
                testRun {
                    id
                    testProjectName
                    testSeed
                    startTime
                    endTime
                    gitBranch
                    gitSha
                    buildTriggerActor
                    buildUrl
                    suiteRuns {
                        id
                        suiteName
                        startTime
                        endTime
                        specRuns {
                            id
                            specDescription
                            status
                            tags {
                                id
                                name
                            }
                        }
                    }
                }
            }
            pageInfo {
                hasNextPage
                startCursor
                endCursor
            }
            totalCount
        }
    }
`;

export const GET_TEST_RUN_BY_ID = gql`
    query GetTestRunById($id: Int!) {
        testRunById(id: $id) {
            id
            testProjectName
            testSeed
            startTime
            endTime
            gitBranch
            gitSha
            buildTriggerActor
            buildUrl
            suiteRuns {
                id
                suiteName
                specRuns {
                    id
                    suiteId
                    specDescription
                    message
                    tags {
                        id
                        name
                    }
                }
            }
        }
    }
`;
