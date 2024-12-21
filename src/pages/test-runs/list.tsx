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
    const [data, setData] = useState<ITestRun[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasNextPage, setHasNextPage] = useState<boolean>(true);
    const [cursor, setCursor] = useState<string | undefined>(undefined);

    const { tableQueryResult, pagination } = useTable<ITestRun, HttpError>({
        resource: "testruns/",
        pagination: {
            mode: "server",
            pageSize: 5,
        },
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            if (tableQueryResult.data) {
                const { data, pageInfo } = tableQueryResult.data;
                setData((prevData) => [...prevData, ...data]);
                setCursor(pageInfo?.nextCursor);
                setHasNextPage(pageInfo?.hasNextPage || false);
            } else {
                console.error("No data received from useTable");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tableQueryResult.data) {
            fetchData();
        }
    }, [tableQueryResult.data]);

    const handleLoadMore = () => {
        if (hasNextPage) {
            fetchData();
        }
    };

    return (
        <List title={HEADER_NAME}>
            <Form>
                <Table
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    expandable={{ expandedRowRender }}
                    pagination={{
                        current: pagination?.current || 1,
                        pageSize: pagination?.pageSize || 5,
                        total: pagination?.total || 0,
                        onChange: pagination?.setCurrent,
                    }}
                    onPaginationModelChange={(model, details) => {
                        const lastRow = data?.data[data.data.length - 1];
                        const next = lastRow?.commit.committer.date;
                        if (next) {
                            setNext(next);
                        }
                        dataGridProps.onPaginationModelChange?.(model, details);
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