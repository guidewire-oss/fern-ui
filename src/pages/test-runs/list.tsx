import {List, useTable,} from "@refinedev/antd";
import {Space, Table, Tag} from "antd";
import React from "react";
import moment from "moment";


export const TestRunsList = () => {
    const {tableProps} = useTable({
        resource: "testruns/",
    });

    const calculateDuration = (start: moment.MomentInput, end: moment.MomentInput) => {
        const duration = moment(end).diff(moment(start));
        return moment.duration(duration).humanize();
    };

    return (
        <List>
            <Table {...tableProps} rowKey="id" expandable={{
                expandedRowRender(testRun) {
                    return console.log(testRun),
                        <>
                            {testRun.suite_runs.map((suiteRun: { spec_runs: any[]; }, suiteIndex: any) => (
                                suiteRun.spec_runs.map((specRun, specIndex) => (
                                    <Table key={`suite-${suiteIndex}-spec-${specIndex}`}>
                                        <Table.Column title="Test Run ID" dataIndex="id"
                                                      render={() => specRun.id}/>
                                        <Table.Column title="Project Name" dataIndex="test_project_name"
                                                      render={() => testRun.test_project_name}/>
                                        <Table.Column title="Description" dataIndex="spec_description"
                                                      render={() => specRun.spec_description}/>
                                        <Table.Column title="Status" dataIndex="status" render={(specRun.status)}/>
                                        <Table.Column title="Duration"
                                                      render={() => calculateDuration(specRun.start_time, specRun.end_time)}/>
                                        {/*<Table.Column title="Tags" dataIndex="tags" render={() => (*/}
                                        {/*    <Space>*/}
                                        {/*        {specRun.tags.map((tag, tagIndex) => (*/}
                                        {/*            <Tag key={tagIndex}>{tag.name}</Tag>*/}
                                        {/*        ))}*/}
                                        {/*    </Space>*/}
                                        {/*)}/>*/}
                                        <Table.Column title="Message" render={() => specRun.message}/>
                                    </Table>
                                ))
                            ))}
                        </>;
                }
            }}>
                <Table.Column title="ID" dataIndex="id"/>
                <Table.Column title="Test Project Name" dataIndex="test_project_name"/>
                <Table.Column title="Start Time" dataIndex="start_time"
                              render={(text) => moment(text).format('LLL')}/>
                <Table.Column title="End Time" dataIndex="end_time"
                              render={(text) => moment(text).format('LLL')}/>
            </Table>
        </List>
    );
};
