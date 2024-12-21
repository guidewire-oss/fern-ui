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
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(5);
    const [total, setTotal] = useState<number>(0);

    const { tableQueryResult } = useTable<ITestRun, HttpError>({
        resource: "testruns/",
        pagination: {
            mode: "server",
            pageSize: pageSize,
            current: page,
        },
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            if (tableQueryResult.data) {
                const { data, total } = tableQueryResult.data;
                setData(data);
                setTotal(total);
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
        fetchData();
    }, [tableQueryResult.data, page, pageSize]);

    const handleTableChange = (pagination) => {
        setPage(pagination.current);
        setPageSize(pagination.pageSize);
    };

    const handleLoadMore = () => {
        setPage((prevPage) => prevPage + 1);
    };

    const hasNextPage = page * pageSize < total;

    return (
        <List title={HEADER_NAME}>
            <Form>
                <Table
                    dataSource={data}
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