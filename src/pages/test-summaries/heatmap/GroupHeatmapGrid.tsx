// GroupHeatmapGrid.tsx
import React, {useEffect, useState} from "react";
import {GroupHeatmap, GroupHeatmapArgs} from "./GroupHeatMap";
import "./HeatmapStyles.css";
import {fetchPreferredProjects} from "../../../providers/user-prreferred-provider";
import {ProjectTestRunStatus} from "../../../providers/project-provider";
import {fetchTestRuns} from "../../../providers/testrun-provider";

export const GroupHeatmapGrid = () => {
    const [heatmapData, setHeatmapData] = useState<GroupHeatmapArgs[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHeatmapData = async () => {
            try {
                const groupedProjectsResponses = await fetchPreferredProjects();

                const result: GroupHeatmapArgs[] = []

                for (const group of groupedProjectsResponses) {

                    const projectTestRunsArr: ProjectTestRunStatus[] = []
                    for (const project of group.projects) {

                        const testRuns = await fetchTestRuns({
                            filters : {"project_uuid" : project.uuid},
                            fields: ['project', 'suiteruns'],
                            sortBy: 'end_time',
                            order: 'desc'
                        })

                        const suiteRuns = testRuns[0]?.suite_runs ?? [];

                        const projectTestRuns: ProjectTestRunStatus = {
                            id: 0,
                            uuid: project.uuid,
                            name: project.name,
                            status: testRuns[0]?.status ?? 'UNKNOWN',
                            passed: suiteRuns.filter((suite) =>
                                suite.spec_runs?.some((spec) => spec.status === "PASSED")
                            ).length,
                            failed: suiteRuns.filter((suite) =>
                                suite.spec_runs?.some((spec) => spec.status === "FAILED")
                            ).length,
                            skipped: suiteRuns.filter((suite) =>
                                suite.spec_runs?.some((spec) => spec.status === "SKIPPED")
                            ).length,
                            executionTime: testRuns[0].end_time
                        };
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
                //TODO: Need to add a notification message here.
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
