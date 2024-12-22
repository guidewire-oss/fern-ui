import React, { useState, useEffect, useRef } from "react";
import { List } from "@refinedev/antd";
import { Table, Space, Tag, Button } from "antd";
import { HttpError } from "@refinedev/core";
import { ITestRun } from "./interfaces";
import { dataProvider } from "../../providers/data-provider";
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
    const [endCursor, setEndCursor] = useState<string>("");
    const [refetchTrigger, setRefetchTrigger] = useState(0);
    const endCursorRef = useRef("");

    // const { tableQueryResult } = useTable<ITestRun, HttpError>({
    //     resource: "testruns/",
    //     pagination: {
    //         mode: "server",
    //         pageSize: pageSize,
    //         current: page,
    //     },
    //     meta: {
    //         cursor: {
    //             after: endCursor,
    //         },
    //     },
    // });

    const fetchData = async () => {
        setLoading(true);
        try {
            console.log("Fetching data for page:", page, "with cursor:", endCursorRef.current);

            const { data, total, cursor } = await dataProvider.getList({
                resource: "testruns/",
                meta: { cursor: { after: endCursorRef.current } },
                pagination: { current: page, pageSize : pageSize},
            });

            setData(data);
            setTotal(total);
            endCursorRef.current = cursor?.next || null;
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, pageSize]);

    const handleTableChange = (newPage: number, newPageSize: number) => {
        //const { current, pageSize } = pagination;
        console.warn("newPage", newPage);
        setPage(newPage);
        setPageSize(newPageSize);
    };

    const hasNextPage = page * pageSize < total;

    return (
        <List title={HEADER_NAME}>
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

        </List>
    );
};