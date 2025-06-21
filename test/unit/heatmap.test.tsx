import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import * as userPreferredProvider from '../../src/providers/user-prreferred-provider';
import * as testrunProvider from '../../src/providers/testrun-provider';
import {HeatmapTile} from "../../src/pages/test-summaries/heatmap/HeatmapTile";
import {GroupHeatmapGrid} from "../../src/pages/test-summaries/heatmap/GroupHeatmapGrid";
import {getStatusBorderColor, getStatusColor} from "../../src/pages/test-summaries/heatmap/utils";

jest.mock('../../src/providers/user-prreferred-provider');
jest.mock('../../src/providers/testrun-provider');


jest.mock('antd', () => ({
    message: {
        error: jest.fn()
    },
    Tooltip: ({ children, title }: { children: React.ReactNode; title: React.ReactNode }) => (
        <div data-testid="tooltip">
            <div data-testid="tooltip-content">{title}</div>
            {children}
        </div>
    )
}));

jest.mock('../../src/pages/test-summaries/heatmap/GroupHeatMap', () => ({
    GroupHeatmap: ({ groupName, projectTestRuns }: {
        groupName: string;
        projectTestRuns: Array<{
            id: number;
            uuid: string;
            name: string;
            status: string;
            passed: number;
            failed: number;
            skipped: number;
            executionTime: string;
        }>
    }) => (
        <div data-testid="group-heatmap" data-group-name={groupName} data-project-count={projectTestRuns.length}>
            <div className="heatmap-grid-square" data-testid="heatmap-grid-square" style={{
                gridTemplateRows: `repeat(${Math.ceil(Math.sqrt(projectTestRuns.length))}, 32px)`,
                gridTemplateColumns: `repeat(${Math.ceil(projectTestRuns.length / Math.ceil(Math.sqrt(projectTestRuns.length)))}, 32px)`
            }}></div>
        </div>
    )
}));

describe('Heatmap Components', () => {
    describe('Utility Functions', () => {
        test('getStatusColor returns correct colors for different statuses', () => {
            expect(getStatusColor('passed')).toBe('#3ca454');
            expect(getStatusColor('PASSED')).toBe('#3ca454');
            expect(getStatusColor('failed')).toBe('#933340');
            expect(getStatusColor('skipped')).toBe('#ffd261');
            expect(getStatusColor('unknown')).toBe('#BDBDBD');
        });

        test('getStatusBorderColor returns correct border colors', () => {
            expect(getStatusBorderColor('passed')).toBe('#2e8040');
            expect(getStatusBorderColor('failed')).toBe('#702732');
            expect(getStatusBorderColor('skipped')).toBe('#d9b34f');
            expect(getStatusBorderColor('other')).toBe('#9E9E9E');
        });
    });

    describe('HeatmapTile Component', () => {
        const defaultProps: {
            name: string;
            status: string;
            passed: number;
            failed: number;
            skipped: number;
            executionTime: string;
        } = {
            name: 'Test Project',
            status: 'passed',
            passed: 8,
            failed: 2,
            skipped: 0,
            executionTime: '2023-05-15T10:30:00Z'
        };

        test('renders with correct colors based on status', () => {
            const { rerender } = render(<HeatmapTile {...defaultProps} />);

            let tile = screen.getByTestId('tooltip').querySelector('.heatmap-tile');
            expect(tile).toHaveStyle(`background-color: ${getStatusColor('passed')}`);

            rerender(<HeatmapTile {...defaultProps} status="failed" />);
            tile = screen.getByTestId('tooltip').querySelector('.heatmap-tile');
            expect(tile).toHaveStyle(`background-color: ${getStatusColor('failed')}`);
        });

        test('tooltip shows correct project statistics', () => {
            render(<HeatmapTile {...defaultProps} />);

            const tooltipContent = screen.getByTestId('tooltip-content');
            expect(tooltipContent).toHaveTextContent('Test run for project Test Project');
            expect(tooltipContent).toHaveTextContent('Passed: 8/10 (80.00%)');
        });

        test('handles edge cases in test statistics', () => {
            const { rerender } = render(<HeatmapTile {...defaultProps} passed={0} failed={0} skipped={0} />);

            let tooltipContent = screen.getByTestId('tooltip-content');
            expect(tooltipContent).toHaveTextContent('N/A - no valid tests');

            rerender(<HeatmapTile {...defaultProps} skipped={3} />);
            tooltipContent = screen.getByTestId('tooltip-content');
            expect(tooltipContent).toHaveTextContent('3 specs skipped');
        });
    });

    describe('GroupHeatmapGrid Component', () => {
        const mockGroupData: Array<{
            group_id: number;
            group_name: string;
            projects: Array<{ uuid: string; name: string }>;
        }> = [
            {
                group_id: 1,
                group_name: 'Group 1',
                projects: [
                    { uuid: 'proj-1', name: 'Project 1' },
                    { uuid: 'proj-2', name: 'Project 2' }
                ]
            },
            {
                group_id: 2,
                group_name: 'Group 2',
                projects: [
                    { uuid: 'proj-3', name: 'Project 3' }
                ]
            }
        ];

        const mockTestRunData: Array<{
            status: string;
            end_time: string;
            suite_runs: Array<{
                spec_runs: Array<{ status: string }>;
            }>;
        }> = [
            {
                status: 'PASSED',
                end_time: '2023-01-01T12:00:00Z',
                suite_runs: [
                    {
                        spec_runs: [
                            { status: 'PASSED' }
                        ]
                    },
                    {
                        spec_runs: [
                            { status: 'FAILED' }
                        ]
                    }
                ]
            }
        ];

        beforeEach(() => {
            jest.clearAllMocks();
            (testrunProvider.fetchProjectGroups as jest.Mock).mockResolvedValue(mockGroupData);
            (testrunProvider.fetchTestRuns as jest.Mock).mockResolvedValue(mockTestRunData);
        });

        test('fetches and processes data correctly', async () => {
            render(<GroupHeatmapGrid />);

            await waitFor(() => {
                expect(testrunProvider.fetchProjectGroups).toHaveBeenCalledTimes(1);
                expect(testrunProvider.fetchTestRuns).toHaveBeenCalledTimes(3);
            });

            expect(testrunProvider.fetchTestRuns).toHaveBeenCalledWith(
                expect.objectContaining({
                    filters: { "project_uuid": "proj-1" },
                    fields: ['project', 'suiteruns'],
                    sortBy: 'end_time',
                    order: 'desc'
                })
            );
        });

        test('handles error gracefully', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
                // intentionally left blank
            });
            (testrunProvider.fetchProjectGroups as jest.Mock).mockRejectedValue(new Error('API error'));

            const antd = jest.requireMock('antd');

            render(<GroupHeatmapGrid />);

            await waitFor(() => {
                expect(antd.message.error).toHaveBeenCalledWith('Failed to fetch group data');
            });

            consoleErrorSpy.mockRestore();
        });

        test('calculates test status counts from API response', async () => {
            const customTestRunData: Array<{
                status: string;
                end_time: string;
                suite_runs: Array<{
                    spec_runs: Array<{ status: string }>;
                }>;
            }> = [
                {
                    status: 'PASSED',
                    end_time: '2023-01-01T12:00:00Z',
                    suite_runs: [
                        {
                            spec_runs: [
                                { status: 'PASSED' },
                                { status: 'PASSED' }
                            ]
                        },
                        {
                            spec_runs: [
                                { status: 'FAILED' }
                            ]
                        },
                        {
                            spec_runs: [
                                { status: 'SKIPPED' },
                                { status: 'SKIPPED' }
                            ]
                        }
                    ]
                }
            ];

            (testrunProvider.fetchTestRuns as jest.Mock).mockResolvedValue(customTestRunData);

            render(<GroupHeatmapGrid />);

            await waitFor(() => {
                expect(testrunProvider.fetchTestRuns).toHaveBeenCalled();
            });
        });
    });
});