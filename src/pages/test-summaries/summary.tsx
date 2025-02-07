import React from 'react';
import {PageHeader, useSimpleList} from "@refinedev/antd";
import {Breadcrumb, Card, List} from "antd";
import {HttpError} from "@refinedev/core";
import TestHistoryGrid from "./summary-utils";

export const TestSummary = () => {
    const { listProps } = useSimpleList<string[], HttpError>({
        resource: "projects/",
        dataProviderName: "summaries",
    });

    if (!listProps.dataSource || listProps.dataSource.length === 0) {
        return <div>No summary data available</div>;
    }

    const renderListItem = (item: any, index: number) => {
        return (
            <Card
                key={index}
                hoverable
                title={item.toString()}
                style={{ textAlign: 'center', marginBottom: '16px', width: '100%' }}
            >
                <TestHistoryGrid projectName={item.toString()} />
            </Card>
        );
    };

    return (
        <>
            <Breadcrumb
                items={[
                    {
                        title: 'Test reports',
                    },
                    {
                        title: <a href="">Summaries</a>,
                    },
                ]}
            />
            <PageHeader title={"Test Result Overview"} style={{ marginBottom: 12 }} />
            <List
                {...listProps}
                renderItem={renderListItem}
                pagination={{
                    ...listProps.pagination,
                    position: "bottom",
                    size: "small",
                }}
            />
        </>
    );
};