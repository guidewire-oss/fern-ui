import {reportProject, testsummariesApiResponse} from "../utils/summaryDataMocks";
import React from "react";
import { TestSummary } from "../../src/pages/test-summaries";
import TestHistoryGrid from "../../src/pages/test-summaries/summary-utils";
import {useSimpleList} from "@refinedev/antd";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import * as userPreferredProvider from "../../src/providers/user-prreferred-provider";

jest.mock('@refinedev/antd', () => {
    const originalModule = jest.requireActual('@refinedev/antd');
    return {
        ...originalModule,
        useSimpleList: jest.fn(),
    };
});

jest.mock('../../src/providers/user-prreferred-provider', () => ({
    fetchPreferredProjects: jest.fn() as jest.MockedFunction<typeof import('../../src/providers/user-prreferred-provider').fetchPreferredProjects>,
    savePreferredProjects: jest.fn() as jest.MockedFunction<typeof import('../../src/providers/user-prreferred-provider').savePreferredProjects>,
}));

jest.mock('antd', () => {
    const originalModule = jest.requireActual('antd');
    return {
        ...originalModule,
        message: {
            success: jest.fn(),
            error: jest.fn(),
            warning: jest.fn(),
        },
    };
});

import { message } from 'antd';

describe('TestSummary Component Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        (userPreferredProvider.fetchPreferredProjects as jest.Mock).mockResolvedValue([
            {
                group_id: 1,
                group_name: "Existing Group",
                projects: [
                    { id: "2", name: "Another Project", uuid: "another-uuid" }
                ]
            }
        ]);

        (userPreferredProvider.savePreferredProjects as jest.Mock).mockResolvedValue(true);
    });

    test('displays the title and table headers correctly', () => {
        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [
                    reportProject
                ],
            },
        });

        render(<TestSummary />);

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

        render(<TestSummary />);

        expect(screen.getByText('Dummy Project')).toBeInTheDocument();
    });

    test('displays the correct message when no data is available', () => {
        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [],
            },
        });

        render(<TestSummary />);

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
        render(<TestHistoryGrid id={'1'} projectName={'Dummy Projects'} projectUUID={'996ad860-2a9a-504f-8861-aeafd0b2ae29'}/>);
    });

    test('displays the expected message under project card when no data is available', () => {
        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [],
            },
        });

        render(<TestHistoryGrid id={'1'} projectName={'Dummy Tests'} projectUUID={'996ad860-2a9a-504f-8861-aeafd0b2ae29'}/>);
        expect(screen.getByText('No test data available.')).toBeInTheDocument();
    });

    test('should open group dropdown overlay when clicking "Add to group" menu item', async () => {
        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [reportProject],
                pagination: {},
            },
        });

        render(<TestSummary />);

        const menuButton = screen.getAllByRole('button')[0];
        menuButton.click();

        const addToGroupOption = await screen.findByText('Add to group');
        addToGroupOption.click();

        expect(await screen.findByText('Group Name')).toBeInTheDocument();
    });

    test('should fetch groups when dropdown overlay is opened', async () => {
        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [reportProject],
                pagination: {},
            },
        });

        render(<TestSummary />);

        const menuButton = screen.getAllByRole('button')[0];
        menuButton.click();

        const addToGroupOption = await screen.findByText('Add to group');
        addToGroupOption.click();

        await screen.findByText('Group Name');

        expect(userPreferredProvider.fetchPreferredProjects).toHaveBeenCalled();
    });

    test('should display existing groups in the dropdown', async () => {
        (userPreferredProvider.fetchPreferredProjects as jest.Mock).mockResolvedValue([
            { group_id: 1, group_name: "Group 1", projects: [] },
            { group_id: 2, group_name: "Group 2", projects: [] }
        ]);

        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [reportProject],
                pagination: {},
            },
        });

        render(<TestSummary />);

        const menuButton = screen.getAllByRole('button')[0];
        menuButton.click();

        const addToGroupOption = await screen.findByText('Add to group');
        addToGroupOption.click();

        const selectElement = screen.getByPlaceholderText('Select or add group');
        fireEvent.mouseDown(selectElement);

        expect(await screen.findByText('Group 1')).toBeInTheDocument();
        expect(await screen.findByText('Group 2')).toBeInTheDocument();
    });

    test('should allow creating a new group', async () => {
        (userPreferredProvider.fetchPreferredProjects as jest.Mock).mockResolvedValue([
            { group_id: 1, group_name: "Existing Group", projects: [] }
        ]);

        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [reportProject],
                pagination: {},
            },
        });

        render(<TestSummary />);

        const menuButton = screen.getAllByRole('button')[0];
        menuButton.click();

        const addToGroupOption = await screen.findByText('Add to group');
        addToGroupOption.click();

        const selectElement = screen.getByPlaceholderText('Select or add group');
        fireEvent.mouseDown(selectElement);

        fireEvent.change(selectElement, { target: { value: "New Group" }});

        const addOption = await screen.findByText(/\+ Add "New Group"/);
        addOption.click();

        const saveButton = screen.getByText('Save');
        saveButton.click();

        await waitFor(() => {
            expect(userPreferredProvider.savePreferredProjects).toHaveBeenCalled();
        });
    });

    test('should add project to existing group', async () => {
        (userPreferredProvider.fetchPreferredProjects as jest.Mock).mockResolvedValue([
            { group_id: 1, group_name: "Existing Group", projects: [] }
        ]);

        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [reportProject],
                pagination: {},
            },
        });

        render(<TestSummary />);

        const menuButton = screen.getAllByRole('button')[0];
        menuButton.click();

        const addToGroupOption = await screen.findByText('Add to group');
        addToGroupOption.click();

        const selectElement = screen.getByPlaceholderText('Select or add group');
        fireEvent.mouseDown(selectElement);

        const existingGroup = await screen.findByText('Existing Group');
        existingGroup.click();

        const saveButton = screen.getByText('Save');
        saveButton.click();

        await waitFor(() => {
            expect(userPreferredProvider.savePreferredProjects).toHaveBeenCalled();
        });

        expect(userPreferredProvider.savePreferredProjects).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    group_name: "Existing Group"
                })
            ])
        );
    });

    test('should show warning when trying to save without selecting a group', async () => {
        (userPreferredProvider.fetchPreferredProjects as jest.Mock).mockResolvedValue([
            { group_id: 1, group_name: "Existing Group", projects: [] }
        ]);

        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [reportProject],
                pagination: {},
            },
        });

        render(<TestSummary />);

        const menuButton = screen.getAllByRole('button')[0];
        menuButton.click();

        const addToGroupOption = await screen.findByText('Add to group');
        addToGroupOption.click();

        const saveButton = screen.getByText('Save');
        saveButton.click();

        expect(message.warning).toHaveBeenCalledWith('Please select or enter a group name');

        expect(userPreferredProvider.savePreferredProjects).not.toHaveBeenCalled();
    });

    test('should handle error when saving fails', async () => {
        (userPreferredProvider.fetchPreferredProjects as jest.Mock).mockResolvedValue([
            { group_id: 1, group_name: "Existing Group", projects: [] }
        ]);

        (userPreferredProvider.savePreferredProjects as jest.Mock).mockRejectedValue(new Error('Save failed'));

        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [reportProject],
                pagination: {},
            },
        });

        render(<TestSummary />);

        const menuButton = screen.getAllByRole('button')[0];
        menuButton.click();

        const addToGroupOption = await screen.findByText('Add to group');
        addToGroupOption.click();

        const selectElement = screen.getByPlaceholderText('Select or add group');
        fireEvent.mouseDown(selectElement);
        const existingGroup = await screen.findByText('Existing Group');
        existingGroup.click();

        const saveButton = screen.getByText('Save');
        saveButton.click();

        await waitFor(() => {
            expect(message.error).toHaveBeenCalledWith('Failed to save group');
        });
    });

    test('should close the overlay when clicking the close button', async () => {
        (userPreferredProvider.fetchPreferredProjects as jest.Mock).mockResolvedValue([
            { group_id: 1, group_name: "Existing Group", projects: [] }
        ]);

        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [reportProject],
                pagination: {},
            },
        });

        render(<TestSummary />);

        const menuButton = screen.getAllByRole('button')[0];
        menuButton.click();

        const addToGroupOption = await screen.findByText('Add to group');
        addToGroupOption.click();

        await screen.findByText('Group Name');

        const closeButton = screen.getByRole('button', { name: '' });
        closeButton.click();

        await waitFor(() => {
            expect(screen.queryByText('Group Name')).not.toBeInTheDocument();
        });
    });
});