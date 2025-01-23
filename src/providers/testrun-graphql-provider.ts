import type {BaseRecord, DataProvider, GetListResponse, GetListParams} from "@refinedev/core";
import { GraphQLClient } from "graphql-request";
import { GET_TEST_RUNS, GET_TEST_RUN_BY_ID } from "../pages/test-runs/graphQlQueries";

// Check if the environment variable is set
const VITE_FERN_REPORTER_GRAPHQL_BASE_URL = import.meta.env.VITE_FERN_REPORTER_GRAPHQL_BASE_URL;

if (!VITE_FERN_REPORTER_GRAPHQL_BASE_URL) {
    console.error('Error: VITE_FERN_REPORTER_GRAPHQL_BASE_URL is not set');
    throw new Error('VITE_FERN_REPORTER_GRAPHQL_BASE_URL must be set in the environment variables.');
}

const API_URL = VITE_FERN_REPORTER_GRAPHQL_BASE_URL;
const TestRunsSortOrder = {
    ASCENDING: false,
    DESCENDING: true,
};


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
export const graphqlDataProvider: DataProvider = {
    getList: async <TData extends BaseRecord = BaseRecord>({resource, meta, pagination,}: GetListParams) => {
        const { pageSize=5, current = 1 } = pagination || {}; // Extract pagination values
        const first = pageSize; // Number of items per page
        const isDescendingOrder = TestRunsSortOrder.DESCENDING;

        // Fetch the cursor from the meta if available
        const after: string | null = meta?.queryContext?.pageParam || null;

        try {
            const response: GetTestRunsResponse = await client.request(GET_TEST_RUNS, {
                first,
                after,
                isDescendingOrder,
            });

            const edges = response.testRuns.edges || [];
            const { pageInfo, totalCount } = response.testRuns;

            // Map edges to data
            const data = edges.map((edge) => ({
                ...edge.testRun,
                id: edge.testRun.id.toString(),
                cursor: edge.cursor, // Include cursor in the data for pagination
            }));
            // Return the paginated data
            return {
                data,
                total: totalCount, // Return total count of items
                cursor: {
                    next: pageInfo.endCursor,
                    prev: pageInfo.startCursor,
                    hasNextPage: pageInfo.hasNextPage,
                },
            } as unknown as GetListResponse<TData>;
        } catch (error) {
            console.error("Error fetching testRuns:", error);
            throw error;
        }

    },

    // Fetch a single TestRun by ID
    getOne: async ({ id }) => {
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