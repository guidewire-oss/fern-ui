import { testsummariesApiResponse } from "../utils/summaryDataMocks";
import React from "react";
import { TestSummary } from "../../src/pages/test-summaries";
import TestHistoryGrid from "../../src/pages/test-summaries/summary-utils";
import {useSimpleList} from "@refinedev/antd";
import {render, screen} from "@testing-library/react";

jest.mock('@refinedev/antd', () => {
    const originalModule = jest.requireActual('@refinedev/antd');
    return {
        ...originalModule,
        useSimpleList: jest.fn(),
    };
});

describe('TestSummary Component Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('displays the title and table headers correctly', () => {
        // Mock useSimpleList to return data
        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [
                    testsummariesApiResponse
                ],
            },
        });

        // Render the component into a virtual DOM in the test environment
        render(<TestSummary />);

        // Assert page title is rendered correctly
        expect(screen.getByText('Test Result Overview')).toBeInTheDocument();
    });

    test('displays the expected project', () => {
        // Mock useSimpleList to return data
        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [
                   "Dummy Project"
                ],
            },
        });

        render(<TestSummary />);

        expect(screen.getByText('Dummy Project')).toBeInTheDocument();
    });

    test('displays the correct message when no data is available', () => {
        // Mock useSimpleList to return no data
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
        render(<TestHistoryGrid projectName={'Dummy Projects'} />);
    });

    test('displays the expected message under project card when no data is available', () => {
        // Mock useSimpleList to return data
        (useSimpleList as jest.Mock).mockReturnValue({
            listProps: {
                dataSource: [],
            },
        });

        render(<TestHistoryGrid projectName={'Dummy Tests'} />);
        expect(screen.getByText('No test data available.')).toBeInTheDocument();
    });

});
