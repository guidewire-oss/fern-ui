import type { DataProvider } from "@refinedev/core";
import { request, gql } from "graphql-request";

if (!import.meta.env.VITE_FERN_REPORTER_BASE_URL) {
    console.error('Error: FERN_REPORTER_BASE_URL is not set');
}

// GraphQL API URL
export const API_URL = import.meta.env.VITE_FERN_REPORTER_BASE_URL || "https://localhost:8080/query";

// Cursor-based Pagination Parsing
const parseCursorPagination = (pagination?: any) => {
    const { current = 1, pageSize = 10 } = pagination || {};
    const after = current > 1 ? Buffer.from(`cursor${(current - 1) * pageSize}`).toString("base64") : "";
    return { first: pageSize, after };
};

// Refine Data Provider
export const testrunProvider: DataProvider = {
    getList: async ({ resource, pagination }) => {
        const { first, after } = parseCursorPagination(pagination);

        // GraphQL Query
        const query = gql`
            query getTestRuns($first: Int!, $after: String) {
                testRuns(first: $first, after: $after) {
                    edges {
                        cursor
                        testRun {
                            id
                            testProjectName
                            testSeed
                            startTime
                            endTime
                        }
                    }
                    pageInfo {
                        hasNextPage
                        endCursor
                    }
                    totalCount
                }
            }
        `;

        // Execute the Query
        try {
            const data = await request(API_URL, query, { first, after });

            // Map Response to Refine's Format
            return {
                data: data.testRuns.edges.map((edge: any) => ({
                    id: edge.testRun.id,
                    ...edge.testRun,
                })),
                total: data.testRuns.totalCount,
                pageInfo: {
                    hasNextPage: data.testRuns.pageInfo.hasNextPage,
                    endCursor: data.testRuns.pageInfo.endCursor,
                },
            };
        } catch (error) {
            console.error("GraphQL Error:", error);
            throw new Error("Error fetching test runs");
        }
    },

    getOne: async ({ id }) => {
        const query = gql`
            query getTestRunById($id: ID!) {
                testRun(id: $id) {
                    id
                    testProjectName
                    testSeed
                    startTime
                    endTime
                }
            }
        `;

        const variables = { id };

        try {
            const data = await request(API_URL, query, variables);
            return {
                data: {
                    id: data.testRun.id,
                    ...data.testRun,
                },
            };
        } catch (error) {
            console.error("GraphQL Error:", error);
            throw new Error("Error fetching the test run");
        }
    },

    update: () => {
        throw new Error("Not implemented");
    },

    create: () => {
        throw new Error("Not implemented");
    },

    deleteOne: () => {
        throw new Error("Not implemented");
    },

    getApiUrl: () => API_URL,
};
