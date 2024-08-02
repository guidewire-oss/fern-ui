import {List, useTable,} from "@refinedev/antd";
import {Space, Table, Tag} from "antd";
import React from "react";
import {HttpError} from "@refinedev/core";
import {ITag, ITestRun} from "./interfaces";
import {
    calculateDuration,
    calculateSpecRuns,
    expandedRowRender,
    randomTagColor,
    testRunsStatus,
    uniqueTags
} from "./list-utils";

const HEADER_NAME = import.meta.env.VITE_FERN_REPORTER_HEADER_NAME;

export const TestRunsList = () => {
    const {tableProps} = useTable<ITestRun, HttpError>({
        // Should end with a slash to avoid CORS issues
        resource: "testruns/",
    });

    return (
        <List
            title={HEADER_NAME}
        >
            <Table {...tableProps} rowKey="id" expandable={{expandedRowRender}}>
                <Table.Column title="ID"
                              dataIndex="id"/>
                <Table.Column title="Test Project Name"
                              dataIndex="test_project_name"/>
                <Table.Column title="Test Suite Name"
                              key="suite_name"
                              render={(_text, record: ITestRun) => record.suite_runs.map(suiteRun => suiteRun.suite_name).join(", ")}/>
                <Table.Column title="Status"
                              key="status"
                              width={320}
                              render={(_text, testRun: ITestRun) => {
                                  const statusMap = testRunsStatus(testRun);
                                  return (
                                      <Space style={{width: '100%', gap: '10px'}}>
                                          <Tag color="green">{statusMap.get('passed')} Passed</Tag>
                                          <Tag color="red">{statusMap.get('failed')} Failed</Tag>
                                          <Tag color="blue">{statusMap.get('skipped')} Skipped</Tag>
                                      </Space>
                                  );

                              }}/>
                <Table.Column title="Spec Runs"
                              key={"spec_runs"}
                              render={(_text, testRun: ITestRun) => calculateSpecRuns(testRun)}/>
                <Table.Column title="Duration"
                              key="duration"
                              render={(_text, record: ITestRun) => calculateDuration(record.start_time, record.end_time)}/>
                <Table.Column title="Tags"
                              key="tags"
                              width={500}
                              render={(_text, record: ITestRun) => (
                                  <Space style={{minWidth: '200px'}}>
                                      {
                                          uniqueTags(record
                                              .suite_runs
                                              .flatMap(suiteRun => suiteRun.spec_runs))
                                              .map((tag: ITag, tagIndex) => (
                                                  <Tag key={tagIndex} color={randomTagColor()}>
                                                      {tag.name}
                                                  </Tag>
                                              ))
                                      }
                                  </Space>
                              )}/>
            </Table>
        </List>
    );
};
