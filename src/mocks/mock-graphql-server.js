import { createYoga } from 'graphql-yoga';
import { createServer } from 'http';
import { makeExecutableSchema } from '@graphql-tools/schema';

// Define the GraphQL schema
const typeDefs = `
  type Tag {
    id: Int
    name: String
  }

  type SpecRun {
    id: Int
    suiteId: Int
    specDescription: String
    status: String
    message: String
    startTime: String
    endTime: String
    tags: [Tag]
  }

  type SuiteRun {
    id: Int!
    testRunId: Int!
    suiteName: String
    startTime: String
    endTime: String
    specRuns: [SpecRun]
  }

  type TestRun {
    id: Int!
    testProjectName: String
    testSeed: Int
    startTime: String
    endTime: String
    suiteRuns: [SuiteRun!]!
  }

  input TestRunFilter {
    id: Int
    testProjectName: String
  }

  type Query {
    testRuns(first: Int, after: String): TestRunConnection!
    testRun(testRunFilter: TestRunFilter!): [TestRun!]!
    testRunById(id: Int!): TestRun
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String!
    endCursor: String!
  }

  type TestRunEdge {
    cursor: String!
    testRun: TestRun!
  }

  type TestRunConnection {
    edges: [TestRunEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }
`;

// Mock data
// Utility to generate mock data
const generateMockData = () => {
  const tags = [
    { id: 1, name: "Critical" },
    { id: 2, name: "Smoke" },
    { id: 3, name: "Regression" },
    { id: 4, name: "Sanity" },
    { id: 5, name: "Performance" },
  ];

  // Generate SpecRun
  const generateSpecRuns = (suiteId) =>
      Array.from({ length: 3 }, (_, i) => ({
        id: i + 1,
        suiteId,
        specDescription: `Spec description ${i + 1} for suite ${suiteId}`,
        status: i % 2 === 0 ? "PASSED" : "FAILED",
        message: i % 2 === 0 ? "Executed successfully" : "Error occurred",
        startTime: `2024-06-01T10:0${i}:00Z`,
        endTime: `2024-06-01T10:0${i + 1}:00Z`,
        tags: [tags[Math.floor(Math.random() * tags.length)]],
      }));

  // Generate SuiteRun
  const generateSuiteRuns = (testRunId) =>
      Array.from({ length: 2 }, (_, i) => ({
        id: i + 1,
        testRunId,
        suiteName: `Suite ${i + 1} for TestRun ${testRunId}`,
        startTime: `2024-06-01T10:00:00Z`,
        endTime: `2024-06-01T10:30:00Z`,
        specRuns: generateSpecRuns(i + 1),
      }));

  // Generate TestRuns
  return Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    testProjectName: `Project ${i + 1}`,
    testSeed: Math.floor(Math.random() * 10000),
    startTime: `2024-06-01T09:00:00Z`,
    endTime: `2024-06-01T11:00:00Z`,
    suiteRuns: generateSuiteRuns(i + 1),
  }));
};

const testRuns = generateMockData();


// Resolvers
const resolvers = {
  Query: {
    testRuns: (_, { first, after }) => {
      // Default values for first and after
      const limit = first || 10;
      const cursor = after ? parseInt(after, 10) : 0;

      // Slice data based on pagination arguments
      const slicedData = testRuns.slice(cursor, cursor + limit);

      // Create edges
      const edges = slicedData.map((item, index) => ({
        cursor: String(cursor + index + 1), // Cursor for each record
        testRun: item,
      }));

      // PageInfo
      const hasNextPage = cursor + limit < testRuns.length;
      const endCursor = edges.length > 0 ? String(cursor + edges.length) : String(cursor);

      return {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor, // Always return a valid string
          startCursor: edges.length > 0 ? String(cursor + 1) : String(cursor),
        },
        totalCount: testRuns.length,
      };
    },
  },
};



// Combine schema and resolvers
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Create a Yoga instance
const yoga = createYoga({ schema });

// Attach Yoga to a Node.js HTTP server
const server = createServer(yoga);

// Start the server
server.listen(4000, () => {
  console.log("🚀 Mock GraphQL server running at http://localhost:4000/graphql");
});
