import type {DataProvider} from "@refinedev/core";
import axios from "axios";

const API_URL = "http://localhost:8080";
const GRAPHQL_QUERY_URL = API_URL + "/query";

export const dataProvider: DataProvider = {
    getList: async ({resource}) => {
        const testRunsQuery = `
                query testRuns {
                  testRuns {
                    id
                    testProjectName
                    testSeed                    
                  }
                }`;

        try {
            const response = await axios.post(GRAPHQL_QUERY_URL, {
                query: testRunsQuery
            });

            return {
                data: response.data.data.testRuns,
                total: response.data.total,
            };
        } catch (error) {
            console.error('Error fetching data(testRunsQuery):', error);
            throw error;
        }
    },

    getOne: async ({resource, id}) => {
        const testRunByIdQuery = `
        query testRunById {
          testRunById(id: ${id}) {
            id
            testProjectName
            testSeed
            startTime
            endTime
          }
        }`

        try {
            const response = await axios.post(GRAPHQL_QUERY_URL, {
                query: testRunByIdQuery
            });

            if (response.status < 200 || response.status > 299) throw response;

            const data = await response.data();

            return {data};

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
