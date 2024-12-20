import React, { useState } from "react";
import { List , useTable} from "@refinedev/antd";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Space, Tag, Table } from "antd";
import { HttpError, useCustom } from "@refinedev/core";
import { useDataGrid } from "@refinedev/mui";
import { ITestRun } from "./interfaces";
import {
  calculateDuration,
  calculateSpecRuns,
  expandedRowRender,
  generateTagColor,
  testRunsStatus,
  uniqueTags
} from "./list-utils";

const HEADER_NAME = import.meta.env.VITE_FERN_REPORTER_HEADER_NAME;

export const TestRunsList = () => {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const {tableProps} = useTable<ITestRun, HttpError>({
    // Should end with a slash to avoid CORS issues
    resource: "testruns/",
    pagination: {
      mode: "server", // Enables server-side pagination
    },
  });

  const { dataGridProps } = useDataGrid<ITestRun, HttpError>({
    metaData: {
      variables: {
        first: 10,
        after: cursor || "",
      },
    },
  });

  const { rows } = dataGridProps;
  const pageInfo = dataGridProps?.data?.pageInfo;

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "testProjectName",
      headerName: "Test Project Name",
      width: 200,
      renderCell: (params: GridRenderCellParams<ITestRun>) => params.row.testProjectName,
    },
    {
      field: "duration",
      headerName: "Duration",
      width: 150,
      renderCell: (params: GridRenderCellParams<ITestRun>) =>
          calculateDuration(params.row.startTime, params.row.endTime),
    },
    {
      field: "tags",
      headerName: "Tags",
      width: 500,
      renderCell: (params: GridRenderCellParams<ITestRun>) => (
          <Space style={{ minWidth: "200px" }}>
            {params.row.tags?.map((tag, index) => (
                <Tag key={index} color="blue">
                  {tag.name}
                </Tag>
            ))}
          </Space>
      ),
    },
  ];

  const handlePaginationChange = (model: any) => {
    if (pageInfo?.hasNextPage) {
      setCursor(pageInfo.endCursor); // Update cursor for the next page
    }
  };

  return (
      <List
          title={HEADER_NAME}
      >
        <Table {...tableProps} rowKey="id" expandable={{expandedRowRender}}>
          <Table.Column title="ID"
                        dataIndex="id"/>
          <Table.Column title="Test Project Name"
                        dataIndex="testProjectName"/>
          <Table.Column title="Test Suite Name"
                        key="suiteName"

                        render={(_text, record: ITestRun) => record.suiteRuns.map(suiteRun => suiteRun.suiteName).join(", ")}
          />
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
                        render={(_text, record: ITestRun) => calculateDuration(record.startTime, record.endTime)}/>
          <Table.Column title="Date"
                        key={"date"}
                        render={(_text, testRun: ITestRun) => new Date(testRun.startTime).toLocaleString() }/>
          <Table.Column title="Tags"
                        key="tags"
                        width={500}
                        render={(_text, record: ITestRun) => (
                            <Space style={{minWidth: '200px'}}>
                              {/*{*/}
                              {/*    uniqueTags(record*/}
                              {/*        .suite_runs*/}
                              {/*        .flatMap(suiteRun => suiteRun.spec_runs))*/}
                              {/*        .map((tag: ITag, tagIndex) => (*/}
                              {/*            <Tag key={tagIndex} color={generateTagColor(tag.name)}>*/}
                              {/*                {tag.name}*/}
                              {/*            </Tag>*/}
                              {/*        ))*/}
                              {/*}*/}
                            </Space>
                        )}/>
        </Table>
      </List>
    );
};
