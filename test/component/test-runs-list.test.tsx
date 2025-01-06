import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { TestRunsList } from "../../src/pages/test-runs/list";
import { useInfiniteList } from "@refinedev/core";
import { ITestRun } from "../../src/pages/test-runs/interfaces";

// Mocking @refinedev/antd
jest.mock('@refinedev/antd', () => ({
    ...jest.requireActual('@refinedev/antd'),
    List: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, // Mock List component
    useTranslate: jest.fn().mockReturnValue((key: string) => key), // Mock translation function
}));

// Mocking useInfiniteList hook
jest.mock("@refinedev/core", () => ({
    useInfiniteList: jest.fn(),
}));

describe("TestRunsList Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // it('should display the title and table headers correctly',() => {
    //     const mockData = [
    //         {
    //             id: "1",
    //             testProjectName: "Project A",
    //             suiteRuns: [
    //                 {
    //                     suiteName: "Suite 1",
    //                     specRuns: [
    //                         { status: "passed" },
    //                         { status: "failed" },
    //                         { status: "skipped" },
    //                     ],
    //                 },
    //             ],
    //             startTime: "2022-01-01T00:00:00Z",
    //             endTime: "2022-01-01T01:00:00Z",
    //         },
    //     ];
    //
    //     (useInfiniteList as jest.Mock).mockReturnValue({
    //         data: { pages: [{ data: mockData }] },
    //         isLoading: false,
    //         isError: false,
    //         fetchNextPage: jest.fn(),
    //         isFetchingNextPage: false,
    //         hasNextPage: false,
    //     });
    //
    //     // Render the component into a virtual DOM in the test environment
    //     render(<TestRunsList />);
    //
    //     // Assert table headers are rendered correctly
    //     expect(screen.getByText('ID')).toBeInTheDocument();
    //     expect(screen.getByText('Test Project Name')).toBeInTheDocument();
    //     expect(screen.getByText('Test Suite Name')).toBeInTheDocument();
    //     expect(screen.getByText('Status')).toBeInTheDocument();
    //     expect(screen.getByText('Spec Runs')).toBeInTheDocument();
    //     expect(screen.getByText('Duration')).toBeInTheDocument();
    //     expect(screen.getByText('Tags')).toBeInTheDocument();
    // });
    //
    // it("should render loading state", () => {
    //     // Mock useInfiniteList to return loading state
    //     (useInfiniteList as jest.Mock).mockReturnValue({
    //         data: null,
    //         isLoading: true,
    //         isError: false,
    //         fetchNextPage: jest.fn(),
    //         isFetchingNextPage: false,
    //         hasNextPage: false,
    //     });
    //
    //     render(<TestRunsList />);
    //
    //     // Assert loading state
    //     expect(screen.getByText("No data")).toBeInTheDocument();
    // });
    //
    // it("should render no data state", () => {
    //     // Mock useInfiniteList to return error state
    //     (useInfiniteList as jest.Mock).mockReturnValue({
    //         data: null,
    //         isLoading: false,
    //         isError: true,
    //         fetchNextPage: jest.fn(),
    //         isFetchingNextPage: false,
    //         hasNextPage: false,
    //     });
    //
    //     render(<TestRunsList />);
    //
    //     // Assert error state
    //     expect(screen.getByText("Error loading data")).toBeInTheDocument();
    // });
    //
    // it("should render test run data", async () => {
    //     const mockData = [
    //         {
    //             id: "1",
    //             testProjectName: "Project A",
    //             suiteRuns: [{ suiteName: "Suite 1", specRuns: [] }],
    //             startTime: "2022-01-01T00:00:00Z",
    //             endTime: "2022-01-01T01:00:00Z",
    //         },
    //     ];
    //
    //     // Mock useInfiniteList to return data
    //     (useInfiniteList as jest.Mock).mockReturnValue({
    //         data: { pages: [{ data: mockData }] },
    //         isLoading: false,
    //         isError: false,
    //         fetchNextPage: jest.fn(),
    //         isFetchingNextPage: false,
    //         hasNextPage: false,
    //     });
    //
    //     render(<TestRunsList />);
    //
    //     // Wait for data to be rendered
    //     await waitFor(() => {
    //         expect(screen.getByText("Project A")).toBeInTheDocument();
    //         expect(screen.getByText("Suite 1")).toBeInTheDocument();
    //     });
    // });
    //
    // it("should trigger fetchNextPage on scroll", async () => {
    //     const mockData = [
    //         {
    //             id: "1",
    //             testProjectName: "Project A",
    //             suiteRuns: [{ suiteName: "Suite 1", specRuns: [] }],
    //             startTime: "2022-01-01T00:00:00Z",
    //             endTime: "2022-01-01T01:00:00Z",
    //         },
    //     ];
    //     const fetchNextPageMock = jest.fn();
    //
    //     (useInfiniteList as jest.Mock).mockReturnValue({
    //         data: { pages: [{ data: mockData }] },
    //         isLoading: false,
    //         isError: false,
    //         fetchNextPage: fetchNextPageMock,
    //         isFetchingNextPage: false,
    //         hasNextPage: true,
    //     });
    //
    //     render(<TestRunsList />);
    //
    //     // Simulate scroll event to trigger fetchNextPage
    //     fireEvent.scroll(window, { target: { scrollY: 1000 } });
    //
    //     await waitFor(() => {
    //         expect(fetchNextPageMock).toHaveBeenCalledTimes(1);
    //     });
    // });
    //
    // it('should display the correct spec runs', () => {
    //     const mockData = [
    //         {
    //             id: "1",
    //             testProjectName: "Project A",
    //             suiteRuns: [
    //                 {
    //                     suiteName: "Suite 1",
    //                     specRuns: [
    //                         { status: "passed" },
    //                         { status: "failed" },
    //                         { status: "skipped" },
    //                     ],
    //                 },
    //             ],
    //             startTime: "2022-01-01T00:00:00Z",
    //             endTime: "2022-01-01T01:00:00Z",
    //         },
    //     ];
    //
    //     (useInfiniteList as jest.Mock).mockReturnValue({
    //         data: { pages: [{ data: mockData }] },
    //         isLoading: false,
    //         isError: false,
    //         fetchNextPage: jest.fn(),
    //         isFetchingNextPage: false,
    //         hasNextPage: false,
    //     });
    //
    //     render(<TestRunsList />);
    //     expect(screen.getByText('1/2')).toBeInTheDocument();
    // });
    //
    // it("should display correct status counts", async () => {
    //     const mockData = [
    //         {
    //             id: "1",
    //             testProjectName: "Project A",
    //             suiteRuns: [
    //                 {
    //                     suiteName: "Suite 1",
    //                     specRuns: [
    //                         { status: "passed" },
    //                         { status: "failed" },
    //                         { status: "skipped" },
    //                     ],
    //                 },
    //             ],
    //             startTime: "2022-01-01T00:00:00Z",
    //             endTime: "2022-01-01T01:00:00Z",
    //         },
    //     ];
    //
    //     (useInfiniteList as jest.Mock).mockReturnValue({
    //         data: { pages: [{ data: mockData }] },
    //         isLoading: false,
    //         isError: false,
    //         fetchNextPage: jest.fn(),
    //         isFetchingNextPage: false,
    //         hasNextPage: false,
    //     });
    //
    //     render(<TestRunsList />);
    //
    //     await waitFor(() => {
    //         expect(screen.getByText("1 Passed")).toBeInTheDocument();
    //         expect(screen.getByText("1 Failed")).toBeInTheDocument();
    //         expect(screen.getByText("1 Skipped")).toBeInTheDocument();
    //     });
    // });
    //
    // it("should render spec runs and duration", async () => {
    //     const mockData = [
    //         {
    //             id: "1",
    //             testProjectName: "Project A",
    //             suiteRuns: [{ suiteName: "Suite 1", specRuns: [] }],
    //             startTime: "2022-01-01T00:00:00Z",
    //             endTime: "2022-01-01T01:00:00Z",
    //         },
    //     ];
    //
    //     // Mock useInfiniteList to return data
    //     (useInfiniteList as jest.Mock).mockReturnValue({
    //         data: { pages: [{ data: mockData }] },
    //         isLoading: false,
    //         isError: false,
    //         fetchNextPage: jest.fn(),
    //         isFetchingNextPage: false,
    //         hasNextPage: false,
    //     });
    //
    //     render(<TestRunsList />);
    //
    //     // Wait for data to be rendered
    //     await waitFor(() => {
    //         expect(screen.getByText("an hour")).toBeInTheDocument(); // Assuming the calculated duration
    //     });
    // });

    it('displays the correct tags', () => {
        const mockData = [
            {
                id: "1",
                testProjectName: "Project A",
                suiteRuns: [
                    {
                        suiteName: "Suite 1",
                        specRuns: [
                            { status: "passed" , tags :  [{ id: 1, name: 'Tag1' }, { id: 2, name: 'Tag2' }]},
                            { status: "failed" , tags :  [{ id: 1, name: 'Tag1' }, { id: 2, name: 'Tag2' }]},
                            { status: "skipped" , tags : [{ id: 1, name: 'Tag1' }, { id: 2, name: 'Tag2' }]},
                        ],
                    },
                ],
                startTime: "2022-01-01T00:00:00Z",
                endTime: "2022-01-01T01:00:00Z",
            },
        ];

        (useInfiniteList as jest.Mock).mockReturnValue({
            data: { pages: [{ data: mockData }] },
            isLoading: false,
            isError: false,
            fetchNextPage: jest.fn(),
            isFetchingNextPage: false,
            hasNextPage: false,
        });

        render(<TestRunsList />);
        expect(screen.getByText('Tag1')).toBeInTheDocument();
        expect(screen.getByText('Tag2')).toBeInTheDocument();
    });
});
