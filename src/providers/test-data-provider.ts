import type { DataProvider } from "@refinedev/core";
import { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";

if (!import.meta.env.GRAPH_QL_MOCK_SERVER_URL) {
    console.error('Error: GRAPH_QL_MOCK_SERVER_URL is not set');
}
//const API_URL = "http://localhost:4000/graphql"; // GraphQL endpoint

// GraphQL URL
export const GRAPHQL_URL = import.meta.env.GRAPH_QL_MOCK_SERVER_URL || "https://localhost:8080/query";
// Initialize the GraphQL Client
const client = new GraphQLClient(GRAPHQL_URL);

const cursorCache: Record<string, string | null> = {};

// Get a paginated list of TestRuns
export const dataProvider: DataProvider = {
    getList: async ({ resource, meta, pagination }) => {
        const { pageSize = 10, current = 1} = pagination || {}; // Extract pagination values
        const first = pageSize; // Number of items per page

        // Fetch the cursor from the cache if available
        let after: string | null = cursorCache[resource] || null;

        console.log("Cached cursor for resource:", resource, after);
        // If there is a next cursor in the metadata, use it for pagination
        if (meta?.pageInfo?.next) {
            //after = meta.pageInfo.next || null;
        }

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

            const response = await client.request(GET_TEST_RUNS, {
                first,
                after,
            });

            const edges = response.testRuns.edges || [];
            const { pageInfo, totalCount } = response.testRuns;

            // Log the response to ensure the data is correct
            console.log("Response received:", response);
            //console.log("pageInfo received:", pageInfo);

            // Map edges to data
            const data = edges.map((edge: any) => ({
                ...edge.testRun,
                cursor: edge.cursor, // Include cursor in the data for pagination
            }));

            // Update the cursor cache with the endCursor
            cursorCache[resource] = pageInfo.hasNextPage ? pageInfo.endCursor : null;
            // Log pagination object to see its structure
            console.log("Updated cursorCache:", cursorCache);

            // Return the paginated data
            return {
                data,
                total: totalCount, // Return total count of items
                pageInfo: {
                    nextCursor: pageInfo.hasNextPage ? pageInfo.endCursor : undefined,
                    previousCursor: pageInfo.hasPreviousPage
                        ? pageInfo.startCursor
                        : undefined,
                },
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
            const response = await client.request(GET_TEST_RUN_BY_ID, { id });
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
    getApiUrl: () => GRAPHQL_URL,

    // Custom operation (Not implemented)
    custom: async () => {
        throw new Error("Not implemented");
    },
};
