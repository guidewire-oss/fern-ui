import React from 'react';
import {IReportSummary} from './interfaces';
import {Button, Popover} from 'antd';
import {HttpError} from "@refinedev/core";
import {useTable} from "@refinedev/antd";

const TestHistoryGrid: React.FC<{ projectName: string }> = ({ projectName }) => {
    const {tableProps} = useTable<IReportSummary, HttpError>({
        resource: `summary/${projectName}/`,
        dataProviderName: "summaries",
    });

    if(!tableProps.dataSource || tableProps.dataSource.length === 0) {
        return (
            <div>
                <p>No test data available.</p>
            </div>
        );
    }

    const totalTests = tableProps.dataSource.length;
    const passedTests = tableProps.dataSource.reduce((acc, item) =>
        acc + (item.TotalPassedSpecRuns+item.TotalSkippedSpecRuns === item.TotalSpecRuns ? 1 : 0 ), 0);
    const failedTests = totalTests - passedTests;

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(20px, 1fr))',
        gap: '4px',
        padding: '10px',
    };


    return (
        <div>
            <div style={{marginBottom: '16px', textAlign: 'left'}}>
                <Button style={{marginRight: '8px', cursor: 'default', borderColor: '#949494'}}>
                    <b>Total tests:</b> {totalTests}
                </Button>
                <Button style={{ marginRight: '8px', color: '#3ca454', borderColor: '#216c33', cursor: 'default'}}>
                    <b>Passed:</b> {passedTests}
                </Button>
                <Button style={{color:  '#a43c4f', borderColor: '#2f171a', cursor: 'default'}}>
                    <b>Failed:</b> {failedTests}
                </Button>
            </div>
            <div style={gridStyle}>
                {tableProps.dataSource.map((item) => (
                    <Popover
                        content={
                            <>
                                <div> <b>Passed: </b>
                                    {item.TotalSpecRuns - item.TotalSkippedSpecRuns > 0 ? (
                                        <> {item.TotalPassedSpecRuns}/{item.TotalSpecRuns - item.TotalSkippedSpecRuns}
                                        {" "}
                                        ({(100 * item.TotalPassedSpecRuns / (item.TotalSpecRuns - item.TotalSkippedSpecRuns)).toFixed(2)}%) </>
                                    ) : (' N/A - no valid tests')}
                                    {item.TotalSkippedSpecRuns !== 0 && (
                                        <div><b>{item.TotalSkippedSpecRuns}</b> specs skipped</div>
                                    )}
                                    <div> {new Date(item.StartTime).toLocaleString()} </div>
                                </div>
                            </>
                        }
                        key={item.SuiteRunID}
                    >
                        <div style={getBoxStyle(item)}
                             onClick={() => window.open('/testruns/', '_blank')}>
                        </div>
                    </Popover>
                ))}
            </div>
        </div>
    );
};
export default TestHistoryGrid;

const getBoxStyle = (item: IReportSummary) => {
    let backgroundColor;

    if (item.TotalPassedSpecRuns === item.TotalSpecRuns) {
        backgroundColor = '#3ca454'; // box is green if all tests pass and no tests are skipped
    } else if (item.TotalPassedSpecRuns + item.TotalSkippedSpecRuns === item.TotalSpecRuns) {
        backgroundColor = '#ffd261'; // box is yellow if all tests passed, but there are skipped tests
    } else {
        backgroundColor = '#933340'; // box is red otherwise
    }

    return {
        position: 'relative' as const,
        paddingBottom: '100%',
        borderRadius: '3px',
        backgroundColor,
        overflow: 'hidden',
        textAlign: 'center' as const,
    };
};