import {List, useTable,} from "@refinedev/antd";
import {Space, Table, Tag} from "antd";
import React from "react";
import moment from "moment";
import {HttpError} from "@refinedev/core";
import {ISpecRun, ITag, ITestRun} from "./interfaces";

export const TestRunsList = () => {
    const {tableProps} = useTable<ITestRun, HttpError>({
        // Should end with a slash to avoid CORS issues
        resource: "testruns/",
    });

    const calculateDuration = (start: moment.MomentInput, end: moment.MomentInput) => {
        const duration = moment(end).diff(moment(start));
        return moment.duration(duration).asSeconds().toFixed();
    };
    const expandedRowRender = (testRun: ITestRun) => (
        <>
            {testRun.suite_runs.map((suiteRun, suiteIndex) =>
                <Table dataSource={suiteRun.spec_runs.filter(specRun => specRun.status !== 'skipped')}
                       pagination={false}
                       key={suiteIndex}>
                    <Table.Column title="Test Run ID"
                                  dataIndex="id" key="id"/>
                    <Table.Column title="Project Name"
                                  dataIndex="test_project_name" key="test_project_name"
                                  render={() => testRun.test_project_name}/>
                    <Table.Column title="Description"
                                  dataIndex="spec_description" key="spec_description"/>
                    <Table.Column title="Status"
                                  dataIndex="status"
                                  key="status"/>
                    <Table.Column title="Duration"
                                  key="duration"
                                  render={(_text, record: ISpecRun) => calculateDuration(record.start_time, record.end_time)}/>
                    <Table.Column title="Tags"
                                  key="tags"
                                  render={(_text, record: ISpecRun) => (
                                      <Space>
                                          {record.tags.map((tag: ITag, tagIndex) => (
                                              <Tag key={tagIndex}>{tag.name}</Tag>
                                          ))}
                                      </Space>
                                  )}/>
                    <Table.Column title="Message"
                                  dataIndex="message"
                                  key="message"/>
                </Table>
            )}
        </>
    );

    return (
        <List
            title={"Atmos Tests"}
        >
            <Table {...tableProps} rowKey="id" expandable={{expandedRowRender}}>
                <Table.Column title="ID" dataIndex="id"/>
                <Table.Column title="Test Project Name" dataIndex="test_project_name"/>
                <Table.Column title="Duration (seconds)" key={"duration"}
                              render={(_text, record: ISpecRun) => calculateDuration(record.start_time, record.end_time)}/>
            </Table>
        </List>
    );
};
