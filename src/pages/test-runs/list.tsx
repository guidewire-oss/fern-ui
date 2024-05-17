import { List, useTable } from "@refinedev/antd";
import { Table, Spin } from "antd";
import React, { useState } from "react";
import moment from "moment";
import axios from "axios";

export const TestRunsList = () => {
    const { tableProps } = useTable({
        resource: "testrun/",
    });

    const calculateDuration = (start: moment.MomentInput, end: moment.MomentInput) => {
        const duration = moment(end).diff(moment(start));
        return moment.duration(duration).asMilliseconds();
    };

    const API_URL = "http://localhost:8080";
    const GRAPHQL_QUERY_URL = API_URL + "/query";
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);
    const [expandedData, setExpandedData] = useState({});
    const [loading, setLoading] = useState({});

    const fetchExpandedData = async (testRunId) => {
        setLoading((prev) => ({ ...prev, [testRunId]: true }));
        try {
            const testRunByIdQuery = `
                query testRunById {
                  testRunById(id: ${testRunId}) {
                    id
                    testProjectName
                    testSeed
                    startTime
                    endTime
                    suiteRuns {
                      suiteName
                      specRuns {
                        id
                        specDescription
                        status
                        startTime
                        endTime
                        message
                      }
                    }
                  }
                }`;

            const response = await axios.post(GRAPHQL_QUERY_URL, {
                query: testRunByIdQuery,
            });

            setExpandedData((prevData) => ({
                ...prevData,
                [testRunId]: response.data.data.testRunById,
            }));
        } catch (error) {
            console.error("Failed to fetch expanded data:", error);
        } finally {
            setLoading((prev) => ({ ...prev, [testRunId]: false }));
        }
    };

    const handleExpand = (expanded, record) => {
        if (expanded) {
            setExpandedRowKeys((prevKeys) => [...prevKeys, record.id]);
            if (!expandedData[record.id]) {
                fetchExpandedData(record.id);
            }
        } else {
            setExpandedRowKeys((prevKeys) =>
                prevKeys.filter((key) => key !== record.id)
            );
        }
    };

    return (
        <List>
            <Table
                {...tableProps}
                rowKey="id"
                expandable={{
                    expandedRowKeys,
                    onExpand: handleExpand,
                    expandedRowRender: (record) => {
                        const suiteRuns = expandedData[record.id]?.suiteRuns;
                        if (loading[record.id] || !suiteRuns) {
                            return <Spin />;
                        }
                        return (
                            <>
                                {suiteRuns.map((suiteRun, suiteIndex) => (
                                    <div key={`suite-${suiteIndex}`}>
                                        <h4>Suite: {suiteRun.suiteName}</h4>
                                        <Table
                                            dataSource={suiteRun.specRuns}
                                            pagination={false}
                                            rowKey={(specRun) => `spec-${specRun.id}`}
                                        >
                                            <Table.Column title="Spec Run ID" dataIndex="id" key="id" />
                                            <Table.Column title="Description" dataIndex="specDescription" key="specDescription" />
                                            <Table.Column title="Status" dataIndex="status" key="status" />
                                            <Table.Column
                                                title="Duration(ms)"
                                                key="duration"
                                                render={(text, specRun) => calculateDuration(specRun.startTime, specRun.endTime)}
                                            />
                                            <Table.Column title="Message" dataIndex="message" key="message" />
                                        </Table>
                                    </div>
                                ))}
                            </>
                        );
                    },
                }}
            >
                <Table.Column title="ID" dataIndex="id" key="id" />
                <Table.Column title="Test Project Name" dataIndex="testProjectName" key="testProjectName" />
                <Table.Column title="Start Time" dataIndex="startTime" key="startTime" render={(text) => moment(text).format('LLL')} />
                <Table.Column title="End Time" dataIndex="endTime" key="endTime" render={(text) => moment(text).format('LLL')} />
            </Table>
        </List>
    );
};
