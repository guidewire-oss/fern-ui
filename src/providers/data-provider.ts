import type { DataProvider } from "@refinedev/core";
import axios from "axios";

const API_URL = "http://localhost:8080";
const GRAPHQL_QUERY_URL = API_URL + "/query";

export const dataProvider: DataProvider = {
    getList: async ({ resource, pagination }) => {
        const { pageSize, current } = pagination || {};
        const first = pageSize || 10;
        const after = current ? (current - 1) * first : ""; // Adjust pagination

        const testRunsQuery = `
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
                  hasPreviousPage
                  startCursor
                  endCursor
                }
                totalCount
              }
            }`;

        try {
            const response = await axios.post(GRAPHQL_QUERY_URL, {
                query: testRunsQuery,
                variables: { first, after }
            });

            // Extract the data from the response
            const testRuns = response.data.data.testRuns.edges.map((edge: { testRun: any; }) => edge.testRun);  // Use `testRun` instead of `node`
            const total = response.data.data.testRuns.totalCount; // Total count of test runs

            return {
                data: testRuns,
                total: total,
            };
        } catch (error) {
            console.error('Error fetching data(testRunsQuery):', error);
            throw error;
        }
    },

    getOne: async ({ resource, id }) => {
        const testRunByIdQuery = `
        query testRunById($id: ID!) {
          testRunById(id: $id) {
            id
            testProjectName
            testSeed
            startTime
            endTime
          }
        }`;

        try {
            const response = await axios.post(GRAPHQL_QUERY_URL, {
                query: testRunByIdQuery,
                variables: { id }
            });

            if (response.status < 200 || response.status > 299) throw response;

            const data = response.data.data.testRunById;

            return { data };

        } catch (error) {
            console.error('Error fetching data(testRunByIdQuery):', error);
            throw error;
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
