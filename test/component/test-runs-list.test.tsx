import {testrunsApiResponse} from "../utils/dataMocks";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import React from "react";
import {TestRunsList} from "../../src/pages/test-runs";

// Mock the useTable hook
jest.mock('@refinedev/antd', () => {
    const originalModule = jest.requireActual('@refinedev/antd');
    return {
        ...originalModule,
        useTable: jest.fn(() => ({
            tableProps: {
                dataSource: [
                    testrunsApiResponse.testRuns
                ]
            },
        })),
    };
});

describe('TestRunsList Component Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('displays the title and table headers correctly',() => {
        // Render the component into a virtual DOM in the test environment
        render(<TestRunsList />);

        // Assert page title is rendered correctly
        expect(screen.getByText('Atmos Tests')).toBeInTheDocument();

        // Assert table headers are rendered correctly
        expect(screen.getByText('ID')).toBeInTheDocument();
        expect(screen.getByText('Test Project Name')).toBeInTheDocument();
        expect(screen.getByText('Test Suite Name')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Spec Runs')).toBeInTheDocument();
        expect(screen.getByText('Duration')).toBeInTheDocument();
        expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    test('displays the correct status counts',  () => {
        render(<TestRunsList />);

        // Assert the status counts are rendered correctly
        expect(screen.getByText('1 Passed')).toBeInTheDocument();
        expect(screen.getByText('1 Failed')).toBeInTheDocument();
        expect(screen.getByText('1 Skipped')).toBeInTheDocument();
    });

    test('displays the correct spec runs', () => {
        render(<TestRunsList />);
        expect(screen.getByText('1/2')).toBeInTheDocument();
    });

    test('displays the correct duration', () => {
        render(<TestRunsList />);
        expect(screen.getByText('a few seconds')).toBeInTheDocument();
    });

    test('displays the correct tags', () => {
        render(<TestRunsList />);
        expect(screen.getByText('Tag1')).toBeInTheDocument();
        expect(screen.getByText('Tag2')).toBeInTheDocument();
    });

    test('expandable button and toggle its state', () => {
        render(<TestRunsList />);

        // Get the expand button
        const expandButton = screen.getByRole('button', { name: /expand row/i });

        // Initial state assertions
        expect(expandButton).toBeInTheDocument();
        expect(expandButton).toHaveAttribute('aria-expanded', 'false');
        expect(expandButton).toHaveClass('ant-table-row-expand-icon-collapsed');

        // Click the button
        fireEvent.click(expandButton);

        // Assertions after interaction
        expect(expandButton).toHaveAttribute('aria-expanded', 'true');
        expect(expandButton).toHaveClass('ant-table-row-expand-icon-expanded');
    })

    test('displays the spec run details when expanded',() => {
        render(<TestRunsList />);

        const expandButton = screen.getByRole('button', { name: /expand row/i });
        fireEvent.click(expandButton);

        // Check if expandable content is rendered correctly
        expect(screen.getByText('A Passed Test')).toBeInTheDocument();
        expect(screen.getByText('A Failed Test')).toBeInTheDocument();
        expect(screen.getByText('The test has failed')).toBeInTheDocument();

        // QueryBy returns null if the element is not rendered.
        expect(screen.queryByText('A Skipped Test')).toBe(null);
    });
});
