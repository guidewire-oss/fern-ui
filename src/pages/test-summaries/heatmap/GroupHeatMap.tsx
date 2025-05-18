import React from "react";
import {HeatmapTile} from "./HeatmapTile";
import "./HeatmapStyles.css";
import {ProjectTestRunStatus} from "../../../providers/project-provider";

export interface GroupHeatmapArgs {
    groupId?: number
    groupName: string
    projectTestRuns: ProjectTestRunStatus[]
}


export const GroupHeatmap = (groupHeatmapArgs: GroupHeatmapArgs) => {
    let numRows, numCols;
    const projectCount = groupHeatmapArgs.projectTestRuns.length;

    if (projectCount <= 25) {
        // For 25 or fewer tiles, aim for a square grid
        numRows = Math.ceil(Math.sqrt(projectCount));
        numCols = Math.ceil(projectCount / numRows);
    } else {
        // For more than 25 tiles, enforce max 5 rows
        numRows = 5;
        numCols = Math.ceil(projectCount / numRows);
    }

    const gridStyle = {
        gridTemplateRows: `repeat(${numRows}, 32px)`,
        gridTemplateColumns: `repeat(${numCols}, 32px)`
    };

    const gridWidth = numCols * 32 + (numCols - 1) * 4;

    return (
        <div className="group-heatmap">
            <div className="heatmap-label" style={{width: `${gridWidth}px`}}>
                {groupHeatmapArgs.groupName}
            </div>
            <div className="heatmap-grid-square" style={gridStyle}>
                {groupHeatmapArgs.projectTestRuns.map((proj, idx) => (
                    <HeatmapTile
                        key={idx}
                        name={proj.name}
                        status={proj.status}
                        passed={proj.passed}
                        failed={proj.failed}
                        skipped={proj.skipped}
                        executionTime={proj.executionTime}
                    />
                ))}
            </div>
        </div>
    );
};
