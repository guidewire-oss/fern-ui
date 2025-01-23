import React, {useEffect} from "react";
import { List } from "@refinedev/antd";
import { Table, Space, Tag } from "antd";
import { useInfiniteList } from "@refinedev/core";
import {ITag, ITestRun} from "./interfaces";
import {
    calculateDuration,
    calculateSpecRuns,
    expandedRowRender,
    testRunsStatus,
    uniqueTags,
    generateTagColor
} from "./list-utils";

const HEADER_NAME = import.meta.env.VITE_FERN_REPORTER_HEADER_NAME;

export const TestRunsList = () => {
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

    const debounce = (func: (...args: any[]) => void, wait: number | undefined) => {
        let timeout: NodeJS.Timeout | undefined;
        return function (this: any, ...args: any[]) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };
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

    if (isError) {
        return <div>Error loading data</div>;
    }

    return (
        <List title={HEADER_NAME}>
            <Table
                dataSource={allData}
                rowKey="id"
                expandable={{ expandedRowRender }}
                pagination={false} // Disable default table pagination
                expandRowByClick={true}

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
                                <Tag color="green">{statusMap.get("passed") || 0} Passed</Tag>
                                <Tag color="red">{statusMap.get("failed") || 0} Failed</Tag>
                                <Tag color="blue">{statusMap.get("skipped") || 0 } Skipped</Tag>
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
                              width={500}
                              render={(_text, record: ITestRun) => (
                                  <Space style={{minWidth: '200px'}}>
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
            </Table>
        </List>
    );
};
