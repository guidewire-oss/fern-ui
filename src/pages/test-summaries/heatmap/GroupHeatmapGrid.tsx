import React, {useEffect, useState} from "react";
import {GroupHeatmap, GroupHeatmapProps} from "./GroupHeatMap";
import "./HeatmapStyles.css";
import {message} from "antd";
import {fetchProjectGroups} from "../../../providers/testrun-provider";

export interface ProjectTestRunStatus {
    id: number
    uuid: string
    name: string
    status: string
    passed: number
    failed: number
    skipped: number
    executionTime: string,
    branch: string
}

export const GroupHeatmapGrid = () => {
    const [heatmapData, setHeatmapData] = useState<GroupHeatmapProps[]>([]);

    useEffect(() => {
        const fetchHeatmapData = async () => {
            try {
                const groupedProjectsResponses = await fetchProjectGroups();

                console.log(groupedProjectsResponses);

                const result: GroupHeatmapProps[] = []

                for (const group of groupedProjectsResponses) {
                    const projectTestRunsArr: ProjectTestRunStatus[] = []
                    for(const project of group.projects){
                        const projectTestRuns: ProjectTestRunStatus = {
                            id: 0,
                            uuid: project.uuid,
                            name: project.name,
                            status: project.status,
                            passed: project.test_passed,
                            failed: project.test_failed,
                            skipped: project.test_skipped,
                            executionTime: project.date,
                            branch: project.git_branch
                        }
                        projectTestRunsArr.push(projectTestRuns)
                    }
                    const groupHeatmapArgs: GroupHeatmapProps = {
                        groupId: group.group_id,
                        groupName: group.group_name,
                        projectTestRuns: projectTestRunsArr
                    }
                    result.push(groupHeatmapArgs)
                }
                console.log("Heatmap data fetched:", result);
                setHeatmapData(result);
            } catch (error) {
                message.error("Failed to fetch group data")
                console.error("Failed to fetch heatmap data", error);
            }
        };

        fetchHeatmapData();
    }, []);


    return (
        <div className="heatmap-grid-container" data-testid="heatmap-grid-containe">
            {heatmapData.map((groupHeatmapArgs) => (
                <div key={groupHeatmapArgs.groupId} className="heatmap-group-block">
                    <GroupHeatmap groupName={groupHeatmapArgs.groupName}
                                  projectTestRuns={groupHeatmapArgs.projectTestRuns}/>
                </div>
            ))}
        </div>
    );
};
