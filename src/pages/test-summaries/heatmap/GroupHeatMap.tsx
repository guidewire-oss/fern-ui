import React from "react";
import {HeatmapTile} from "./HeatmapTile";
import "./HeatmapStyles.css";
import {ProjectTestRuns} from "../../../providers/project-provider";

export interface GroupHeatmapArgs {
    groupId?: number
    groupName: string
    projectTestRuns: ProjectTestRuns[]
}


export const GroupHeatmap = (groupHeatmapArgs: GroupHeatmapArgs) => {
    const numCols = Math.ceil(Math.sqrt(groupHeatmapArgs.projectTestRuns.length));
    const gridClass = `heatmap-grid-square dynamic-rows-${numCols}`;

    return (
        <div className="group-heatmap">
            <div className={gridClass}>
                {groupHeatmapArgs.projectTestRuns.map((proj, idx) => (
                    <HeatmapTile
                        key={idx}
                        name={proj.name}
                        status={proj.testRuns[0].status}
                        testRunTitle={proj.testRuns[0].testProjectName}
                    />
                ))}
            </div>
            <div className="heatmap-label">{groupHeatmapArgs.groupName}</div>
        </div>
    );
};
