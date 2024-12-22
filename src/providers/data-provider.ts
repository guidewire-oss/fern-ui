import type { DataProvider } from "@refinedev/core";
import { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";

const API_URL = "http://localhost:4000/graphql"; // GraphQL endpoint

// Initialize the GraphQL Client
const client = new GraphQLClient(API_URL);

// Define types for the GraphQL response
interface TestRun {
    id: string;
    testProjectName: string;
    testSeed: string;
    startTime: string;
    endTime: string;
    suiteRuns: {
        id: string;
        suiteName: string;
        startTime: string;
        endTime: string;
        specRuns: {
            id: string;
            specDescription: string;
            status: string;
        }[];
    }[];
}

interface PageInfo {
    hasNextPage: boolean;
    startCursor: string;
    endCursor: string;
}

interface GetTestRunsResponse {
    testRuns: {
        edges: {
            cursor: string;
            testRun: TestRun;
        }[];
        pageInfo: PageInfo;
        totalCount: number;
    };
}

// Get a paginated list of TestRuns
export const dataProvider: DataProvider = {
    getList: async ({ resource, meta, pagination }) => {
        console.log("Inside dataProvider.getList function with:", { resource, meta, pagination });
        const { pageSize=5, current = 1 } = pagination || {}; // Extract pagination values
        const first = pageSize; // Number of items per page

        // Fetch the cursor from the meta if available
        const after: string | null = meta?.cursor?.after || null;
        console.log("===================after", after);
        console.log("===================first", first);

        // Define GraphQL query for paginated test runs
        const GET_TEST_RUNS = gql`
            query GetTestRuns($first: Int, $after: String) {
                testRuns(first: $first, after: $after) {
                    edges {
                        cursor
                        testRun {
                            id
                            testProjectName
                            testSeed
                            startTime
                            endTime
                            suiteRuns {
                                id
                                suiteName
                                startTime
                                endTime
                                specRuns {
                                    id
                                    specDescription
                                    status
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

        try {
            // Log the request variables
            console.log("Request variables:", { first, after });

            const response: GetTestRunsResponse = await client.request(GET_TEST_RUNS, {
                first,
                after,
            });

            console.log("Raw response from GraphQL API:", response); //

            const edges = response.testRuns.edges || [];
            const { pageInfo, totalCount } = response.testRuns;

            // Log the response to ensure the data is correct
            console.log("Response received totalCount:", totalCount);

            // Map edges to data
            const data = edges.map((edge) => ({
                ...edge.testRun,
                id: edge.testRun.id.toString(),
                cursor: edge.cursor, // Include cursor in the data for pagination
            }));

            // Log the updated data
            console.log("Updated data:", data);

            console.log("pageInfo.endCursor:", pageInfo.endCursor);
            console.log("pageInfo.startCursor:", pageInfo.startCursor);

            // Return the paginated data
            return {
                data,
                total: totalCount, // Return total count of items
                cursor: {
                    next: pageInfo.endCursor,
                    prev: pageInfo.startCursor,
                },
                // pageInfo: {
                //     nextCursor: pageInfo.hasNextPage ? pageInfo.endCursor : undefined,
                // },
            };
        } catch (error) {
            console.error("Error fetching testRuns:", error);
            throw error;
        }
    },

    // Fetch a single TestRun by ID
    getOne: async ({ id }) => {
        const GET_TEST_RUN_BY_ID = gql`
            query GetTestRunById($id: Int!) {
                testRunById(id: $id) {
                    id
                    testProjectName
                    testSeed
                    startTime
                    endTime
                    suiteRuns {
                        id
                        suiteName
                        startTime
                        endTime
                    }
                }
            }
        `;

        try {
            const response: any = await client.request(GET_TEST_RUN_BY_ID, { id });
            const testRun = response.testRunById;

            return { data: testRun };
        } catch (error) {
            console.error("Error fetching testRun by ID:", error);
            throw error;
        }
    },

    // Create operation (Not implemented)
    create: async () => {
        throw new Error("Not implemented");
    },

    // Update operation (Not implemented)
    update: async () => {
        throw new Error("Not implemented");
    },

    // Delete operation (Not implemented)
    deleteOne: async () => {
        throw new Error("Not implemented");
    },

    // Get the API URL
    getApiUrl: () => API_URL,

    // Custom operation (Not implemented)
    custom: async () => {
        throw new Error("Not implemented");
    },
};