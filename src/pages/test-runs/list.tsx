import React, { useEffect, useRef } from "react";
import { List } from "@refinedev/antd";
import { Table, Space, Tag, Typography } from "antd";
import { useInfiniteList } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { ITag, ITestRun } from "./interfaces";
import {
    calculateDuration,
    calculateSpecRuns,
    expandedRowRender,
    testRunsStatus,
    uniqueTags,
    generateTagColor
} from "./list-utils";

const HEADER_NAME = process.env.VITE_FERN_REPORTER_HEADER_NAME;

export const TestRunsList = () => {
    const { suiteId } = useParams(); // for /testruns/:suiteId
    const tableRef = useRef<HTMLDivElement>(null);

    const {
        data,
        isError,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteList<ITestRun>({
        resource: "testruns/",
        pagination: {
            mode: "server",
            pageSize: 250,
        },
        queryOptions: {
            getNextPageParam: (lastPage) => {
                return lastPage?.cursor?.hasNextPage ? lastPage.cursor.next : undefined;
            },
        },
    });

    // Combine all pages into a single array
    const allData = data?.pages.flatMap((page) => page.data) || [];

    // Infinite scroll
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight - 100 // Adjust threshold as needed
            ) {
                if (hasNextPage) {
                    fetchNextPage();
                }
            }
        };

        const debouncedHandleScroll = debounce(handleScroll, 250); // Adjust debounce time as needed

        window.addEventListener("scroll", debouncedHandleScroll);
        return () => window.removeEventListener("scroll", debouncedHandleScroll);

    }, [fetchNextPage, hasNextPage]);

    // Scroll to suiteId if present
    useEffect(() => {
        if (!suiteId || !tableRef.current) return;

        const timer = setTimeout(() => {
            const row = document.querySelector(`[data-suiteid="${suiteId}"]`);
            if (row) {
                row.scrollIntoView({ behavior: "smooth", block: "center" });
                row.classList.add("highlighted");

                setTimeout(() => {
                    row.classList.add("fading-out");

                    // After the transition, remove both classes to clean up
                    setTimeout(() => {
                        row.classList.remove("highlighted");
                        row.classList.remove("fading-out");
                    }, 1000); // match the CSS transition duration
                }, 5000);
            }
        }, 500); // delay to allow data rendering

        return () => clearTimeout(timer);
    }, [suiteId, allData.length]);

    if (isError) {
        return <div>Error loading data</div>;
    }

    return (
        <List title={HEADER_NAME}>
            <div ref={tableRef}>
                <Table
                    dataSource={allData}
                    rowKey="id"
                    expandable={{ expandedRowRender }}
                    pagination={false} // Disable default table pagination
                    expandRowByClick={true}
                    rowClassName={(record) => `suite-${record.suiteRuns[0]?.id}`}
                    onRow={(record) => ({
                        "data-suiteid": record.suiteRuns[0]?.id,
                    } as React.HTMLAttributes<HTMLTableRowElement>)}
                >
                    <Table.Column title="ID" dataIndex="id" key="id" />
                    <Table.Column title="Test Project Name" dataIndex="testProjectName" />
                    <Table.Column
                        title="Test Suite Name"
                        key="suiteName"
                        render={(_text, record: ITestRun) =>
                            record.suiteRuns?.map((suiteRun) => suiteRun.suiteName).join(", ") || "N/A"
                        }
                    />
                    <Table.Column
                        title="Status"
                        key="status"
                        width={280}
                        render={(_text, testRun: ITestRun) => {
                            const statusMap = testRunsStatus(testRun);
                            return (
                                <Space style={{ width: "100%", gap: "10px" }}>
                                    <Tag color="green">{statusMap.get("passed") || 0} Passed</Tag>
                                    <Tag color="red">{statusMap.get("failed") || 0} Failed</Tag>
                                    <Tag color="blue">{statusMap.get("skipped") || 0} Skipped</Tag>
                                </Space>
                            );
                        }}
                    />
                    <Table.Column
                        title="Spec Runs"
                        key="spec_runs"
                        render={(_text, testRun: ITestRun) => calculateSpecRuns(testRun)}
                    />
                    <Table.Column
                        title="Duration"
                        key="duration"
                        render={(_text, record: ITestRun) =>
                            calculateDuration(record.startTime, record.endTime)
                        }
                    />
                    <Table.Column
                        title="Date"
                        key="date"
                        render={(_text, testRun: ITestRun) =>
                            new Date(testRun.startTime).toLocaleString()
                        }
                    />
                <Table.Column title="Tags"
                        key="tags"
                        width={280}
                        render={(_text, record: ITestRun) => (
                                  <Space wrap style={{minWidth: '200px'}}>
                                      {
                                          uniqueTags(record
                                              .suiteRuns
                                              .flatMap(suiteRun => suiteRun.specRuns))
                                              .map((tag: ITag, tagIndex) => (
                                    <Tag key={tagIndex} color={generateTagColor(tag.name)}>
                                        {tag.name}
                                    </Tag>
                                              ))
                                      }
                            </Space>
                        )}
                    />

                    <Table.Column
                        title="Git Branch"
                        key="gitBranch"
                        render={(_text, testRun: ITestRun) => (
                            <Typography.Paragraph
                                style={{color: 'inherit' }}>
                                    {testRun.gitBranch}
                                </Typography.Paragraph>
                            )}
                    />

                    <Table.Column
                        title="Git SHA"
                        key="gitSha"
                        render={(_text, testRun: ITestRun) => (
                        <Typography.Paragraph
                            style={{ color: 'inherit' }}>
                                {testRun.gitSha}
                            </Typography.Paragraph>
                        )}
                    />

                    <Table.Column
                        title="Build Trigger Actor"
                        key="buildTriggerActor"
                        render={(_text, testRun: ITestRun) =>
                            <Typography.Paragraph
                                style={{ color: 'inherit' }}>
                                    {testRun.buildTriggerActor}
                                </Typography.Paragraph>
                        }
                    />

                    <Table.Column
                        title="Build URL"
                        key="buildUrl"
                        render={(_text, testRun: ITestRun) =>
                                <Typography.Link
                                style={{ color: '#66c2ff', textDecoration: 'underline' }}
                                    target="_blank"
                                href={testRun.buildUrl}>
                                    {testRun.buildUrl}
                                </Typography.Link>
                        }
                    />
                </Table>
            </div>
        </List>
    );
};

// debounce helper
const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function (this: any, ...args: any[]) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};
