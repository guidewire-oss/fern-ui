import React from "react";
import { List } from "@refinedev/antd";
import { Table, Space, Tag, Button } from "antd";
import { useInfiniteList } from "@refinedev/core";
import { ITestRun } from "./interfaces";
import {
    calculateDuration,
    calculateSpecRuns,
    expandedRowRender,
    testRunsStatus,
} from "./list-utils";

const HEADER_NAME = import.meta.env.VITE_FERN_REPORTER_HEADER_NAME;

export const TestRunsList = () => {
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        isFetchingNextPage,
        hasNextPage,
    } = useInfiniteList<ITestRun>({
        resource: "testruns/",
        pagination: {
            mode: "server",
            pageSize: 10,
        },
        queryOptions: {
            getNextPageParam: (lastPage) => {
                console.log("Cursor Info:", lastPage?.cursor);
                return lastPage?.cursor?.hasNextPage ? lastPage.cursor.next : undefined;
            },
        },
    });

    // Combine all pages into a single array
    const allData = data?.pages.flatMap((page) => page.data) || [];

    // Error handling
    if (isError) {
        return <div>Error loading data</div>;
    }

    return (
        <List title={HEADER_NAME}>
            <Table
                dataSource={allData}
                rowKey="id"
                loading={isLoading || isFetchingNextPage}
                expandable={{ expandedRowRender }}
                pagination={false} // Disable default table pagination
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
                    width={320}
                    render={(_text, testRun: ITestRun) => {
                        const statusMap = testRunsStatus(testRun);
                        return (
                            <Space style={{ width: "100%", gap: "10px" }}>
                                <Tag color="green">{statusMap.get("passed")} Passed</Tag>
                                <Tag color="red">{statusMap.get("failed")} Failed</Tag>
                                <Tag color="blue">{statusMap.get("skipped")} Skipped</Tag>
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
                <Table.Column
                    title="Tags"
                    key="tags"
                    width={500}
                    render={(_text, record: ITestRun) => (
                        <Space style={{ minWidth: "200px" }}>
                            {record.tags?.map((tag, index) => (
                                <Tag key={index} color="blue">
                                    {tag.name}
                                </Tag>
                            )) || <Tag color="default">No Tags</Tag>}
                        </Space>
                    )}
                />
            </Table>

            {/* Load More Button */}
            {hasNextPage && (
                <div style={{ textAlign: "center", margin: "20px 0" }}>
                    <Button
                        onClick={fetchNextPage}
                        disabled={isFetchingNextPage || isLoading}
                    >
                        {isFetchingNextPage ? "Loading..." : "Load More"}
                    </Button>
                </div>
            )}
        </List>
    );
};
