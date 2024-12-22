import React, { useState, useEffect } from "react";
import { List, useTable } from "@refinedev/antd";
import { Table, Space, Tag, Button, Form } from "antd";
import { HttpError } from "@refinedev/core";
import { ITestRun } from "./interfaces";
import {
    calculateDuration,
    calculateSpecRuns,
    expandedRowRender,
    testRunsStatus,
} from "./list-utils";

const HEADER_NAME = import.meta.env.VITE_FERN_REPORTER_HEADER_NAME;

export const TestRunsList = () => {
    const [data, setData] = useState<ITestRun[]>([]); // Store accumulated data
    const [loading, setLoading] = useState<boolean>(false); // Loading state
    const [page, setPage] = useState<number>(1); // Current page
    const [pageSize, setPageSize] = useState<number>(5); // Items per page
    const [total, setTotal] = useState<number>(0); // Total items count
    const [endCursor, setEndCursor] = useState<string>(""); // Cursor for pagination

    const { tableQueryResult } = useTable<ITestRun, HttpError>({
        resource: "testruns/",
        pagination: {
            mode: "server", // Server-side pagination
            pageSize: pageSize,
            current: page,
        },
        meta: {
            cursor: {
                after: endCursor, // Pass cursor to the backend
            },
        },
    });

    // Fetch and accumulate data
    const fetchData = async () => {
        setLoading(true); // Set loading state
        try {
            console.log("Fetching data with query result:", tableQueryResult);
            const result = tableQueryResult?.data || { data: [], total: 0, cursor: {} };
            const { data: newData, total: totalItems, cursor } = result;

            if (newData?.length) {
                setData((prevData) => [...prevData, ...newData]); // Append new data
                setTotal(totalItems || 0); // Update total count
                setEndCursor(cursor?.next || ""); // Update cursor for the next page
            } else {
                console.warn("No data received or data is empty.");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    // Effect to fetch data on component mount or query result change
    useEffect(() => {
        fetchData();
    }, [tableQueryResult?.data]);

    // Handle pagination changes
    const handleTableChange = (pagination: { current: number; pageSize: number }) => {
        const { current, pageSize } = pagination;
        setPage(current);
        setPageSize(pageSize);

        tableQueryResult?.refetch({
            pagination: {
                current,
                pageSize,
            },
            meta: {
                cursor: {
                    after: endCursor,
                },
            },
        });
    };

    // Handle "Load More" button click
    const handleLoadMore = async () => {
        const nextPage = page + 1;
        setPage(nextPage);

        tableQueryResult?.refetch({
            pagination: {
                current: nextPage,
                pageSize,
            },
            meta: {
                cursor: {
                    after: endCursor,
                },
            },
        });
    };

    const hasNextPage = page * pageSize < total; // Determine if more pages are available

    return (
        <List title={HEADER_NAME}>
            <Form>
                <Table
                    dataSource={data || []}
                    rowKey="id"
                    loading={loading}
                    expandable={{ expandedRowRender }}
                    pagination={{
                        current: page,
                        pageSize: pageSize,
                        total: total,
                        onChange: handleTableChange,
                    }}
                >
                    <Table.Column title="ID" dataIndex="id" />
                    <Table.Column title="Test Project Name" dataIndex="testProjectName" />
                    <Table.Column
                        title="Test Suite Name"
                        key="suiteName"
                        render={(_text, record: ITestRun) =>
                            record.suiteRuns.map((suiteRun) => suiteRun.suiteName).join(", ")
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
                        key={"spec_runs"}
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
                        key={"date"}
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
                                ))}
                            </Space>
                        )}
                    />
                </Table>
            </Form>
            {hasNextPage && (
                <div style={{ textAlign: "center", margin: "20px 0" }}>
                    <Button onClick={handleLoadMore} loading={loading}>
                        Load More
                    </Button>
                </div>
            )}
        </List>
    );
};
