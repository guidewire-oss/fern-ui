import {reportProject, testsummariesApiResponse} from "../utils/summaryDataMocks";
import React from "react";
import {TestSummary} from "../../src/pages/test-summaries";
import TestHistoryGrid from "../../src/pages/test-summaries/summary-utils";
import {useSimpleList} from "@refinedev/antd";
import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import * as userPreferredProvider from "../../src/providers/user-prreferred-provider";

jest.mock('@refinedev/antd', () => {
    const originalModule = jest.requireActual('@refinedev/antd');
    return {
        ...originalModule,
        useSimpleList: jest.fn(),
    };
});

jest.mock('../../src/providers/user-prreferred-provider', () => ({
    fetchPreferredProjects: jest.fn(),
    savePreferredProjects: jest.fn(),
}));

const mockedUserPreferredProvider = userPreferredProvider as jest.Mocked<typeof userPreferredProvider>;


describe('TestSummary Component Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    test('displays the title and table headers correctly', () => {
        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [
                    reportProject
                ],
            },
        });

        render(<TestSummary/>);

        expect(screen.getByText('Dummy Project')).toBeInTheDocument();
    });

    test('displays the expected project', () => {
        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [
                    reportProject
                ],
            },
        });

        render(<TestSummary/>);

        expect(screen.getByText('Dummy Project')).toBeInTheDocument();
    });

    test('displays the correct message when no data is available', () => {
        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [],
            },
        });

        render(<TestSummary/>);

        expect(screen.getByText('No summary data available')).toBeInTheDocument();
    });

    test('calculates the expected tests under the project card when data is available', () => {
        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [
                    testsummariesApiResponse
                ],
            },
        });
        render(<TestHistoryGrid id={'1'} projectName={'Dummy Projects'}
                                projectUUID={'996ad860-2a9a-504f-8861-aeafd0b2ae29'}/>);
    });

    test('displays the expected message under project card when no data is available', () => {
        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [],
            },
        });

        render(<TestHistoryGrid id={'1'} projectName={'Dummy Tests'}
                                projectUUID={'996ad860-2a9a-504f-8861-aeafd0b2ae29'}/>);
        expect(screen.getByText('No test data available.')).toBeInTheDocument();
    });

    test('should open group dropdown overlay when clicking "Add to group" menu item', async () => {
        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [reportProject],
                pagination: {},
            },
        });

        render(<TestSummary/>);

        const menuButton = screen.getByLabelText('Project 1 menu');
        fireEvent.click(menuButton);

        const addToGroupOption = await screen.findByText('Add to group');

        fireEvent.click(addToGroupOption);

        expect(await screen.findByText('Group Name')).toBeInTheDocument();
    });

    test('should open group dropdown overlay when clicking "Add to group" menu item 1', async () => {
        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [reportProject],
                pagination: {},
            },
        });

        render(<TestSummary/>);

        const menuButton = screen.getByLabelText('Project 1 menu');
        fireEvent.click(menuButton);

        const addToGroupOption = await screen.findByText('Add to group');

        fireEvent.click(addToGroupOption);

        expect(await screen.findByText('Group Name')).toBeInTheDocument();
    });


    test('should fetch groups when dropdown overlay is opened', async () => {
        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [reportProject],
                pagination: {},
            },
        });

        render(<TestSummary/>);

        const menuButton = screen.getByLabelText('Project 1 menu');
        fireEvent.click(menuButton);

        const addToGroupOption = await screen.findByText('Add to group');
        fireEvent.click(addToGroupOption);

        await screen.findByText('Group Name');

        expect(userPreferredProvider.fetchPreferredProjects).toHaveBeenCalled();
    });


    test('should close the overlay when clicking the close button', async () => {
        mockedUserPreferredProvider.fetchPreferredProjects.mockResolvedValue([
            {group_id: 1, group_name: "Dummy group", projects: []}
        ]);

        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [reportProject],
                pagination: {},
            },
        });

        render(<TestSummary/>);

        const menuButton = screen.getByLabelText('Project 1 menu');
        fireEvent.click(menuButton);

        const addToGroupOption = await screen.findByText('Add to group');
        fireEvent.click(addToGroupOption);


        await screen.findByText('Group Name');

        const closeButton = screen.getByLabelText('Project 1 close menu');
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText('Group Name')).not.toBeInTheDocument();
        });
    });
});