import {
    DeleteButton,
    EditButton,
    List, MarkdownField,
    ShowButton, TagField,
    useTable,
} from "@refinedev/antd";
import { BaseRecord } from "@refinedev/core";
import { Space, Table } from "antd";
import React from "react";


export const TestRunsList = () => {
    const { tableProps } = useTable({
        resource: "testruns/",
    });

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="id" title={"ID"} />
                <Table.Column dataIndex="test_project_name" title={"Test Project Name"} />
                <Table.Column
                    dataIndex="spec_description"
                    title={"Spec Description"}
                    render={(value: any) => {
                        if (!value) return "-";
                        return <MarkdownField value={value.slice(0, 80) + "..."} />;
                    }}
                />
                <Table.Column dataIndex="status" title={"Status"} />
                <Table.Column dataIndex="spec_duration" title={"Spec Duration"} />
                <Table.Column dataIndex="spec_status" title={"Spec Status"} />
                <Table.Column
                    dataIndex="tags"
                    title="Tags"
                    render={(value: string) => <TagField value={value} />}
                />
                <Table.Column
                    title={"Actions"}
                    dataIndex="actions"
                    render={(_, record: BaseRecord) => (
                        <Space>
                            <ShowButton hideText size="small" recordItemId={record.id} />
                            <DeleteButton hideText size="small" recordItemId={record.id} />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
};
