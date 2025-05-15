// GroupHeatmapGrid.tsx
import React, {useEffect, useState} from "react";
import {GroupHeatmap, GroupHeatmapArgs} from "./GroupHeatMap";
import "./HeatmapStyles.css";
import {fetchPreferredProjects} from "../../../providers/user-prreferred-provider";
import {fetchProjectTestRuns, ProjectTestRuns} from "../../../providers/project-provider";

export const GroupHeatmapGrid = () => {
    const [heatmapData, setHeatmapData] = useState<GroupHeatmapArgs[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHeatmapData = async () => {
            try {
                const groupedProjectsResponses = await fetchPreferredProjects();

                const result: GroupHeatmapArgs[] = []

                for (const group of groupedProjectsResponses) {

                    const projectTestRunsArr: ProjectTestRuns[] = []
                    for (const project of group.projects) {
                        const projectTestRuns = await fetchProjectTestRuns(project.uuid)
                        projectTestRunsArr.push(projectTestRuns)
                    }
                    const groupHeatmapArgs: GroupHeatmapArgs = {
                        groupId: group.group_id,
                        groupName: group.group_name,
                        projectTestRuns: projectTestRunsArr
                    }
                    result.push(groupHeatmapArgs)
                }
                setHeatmapData(result);
            } catch (error) {
                console.error("Failed to fetch heatmap data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHeatmapData();
    }, []);


    return (
        <div className="heatmap-grid-container">
            {heatmapData.map((groupHeatmapArgs) => (
                <div key={1} className="heatmap-group-block">
                    <GroupHeatmap groupName={groupHeatmapArgs.groupName}
                                  projectTestRuns={groupHeatmapArgs.projectTestRuns}/>
                </div>
            ))}
        </div>
    );
};
