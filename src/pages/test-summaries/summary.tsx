import React from 'react';
import { List, useTable } from "@refinedev/antd";
import {Card} from "antd";
import { HttpError } from "@refinedev/core";
import TestHistoryGrid from "./summary-utils";

export const TestSummary = () => {
    const { tableProps } = useTable<string[], HttpError>({
        resource: "projects/",
        dataProviderName: "summaries",
    });

    if (!tableProps.dataSource || tableProps.dataSource.length === 0) {
        return <div>No summary data available</div>;
    }

    return (
        <List title={"Test Result Overview"}>
            {tableProps.dataSource.map((projectName, index) => (
                <Card
                    hoverable
                    title={projectName.toString()}
                    style={{ textAlign: 'center', marginBottom: '16px', width: '100%' }}
                >
                    <TestHistoryGrid projectName={projectName.toString()} />
                </Card>
            ))}
        </List>
    );
};