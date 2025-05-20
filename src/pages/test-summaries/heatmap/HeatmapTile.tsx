import React from "react";
import {Tooltip} from "antd";
import {getStatusBorderColor, getStatusColor} from "./utils";

interface HeatmapTileProps {
    name: string;
    status: string;
    passed: number
    failed: number
    skipped: number
    executionTime: string
}

export const HeatmapTile: React.FC<HeatmapTileProps> = ({name, status, passed, failed, skipped, executionTime}) => {
    const total = passed + failed + skipped
    return (
        <Tooltip
            data-testid="tooltip"
            title={
                <>
                    <div>
                        <div><b>Test run for project {name}</b></div>
                        <b>Passed: </b>
                        {total != 0 ? (
                            <> {passed}/{total - skipped}
                                {" "}
                                ({(100 * passed / (total - skipped)).toFixed(2)}%) </>
                        ) : (' N/A - no valid tests')}
                        {skipped !== 0 && (
                            <div><b>{skipped}</b> specs skipped</div>
                        )}
                        <div> {new Date(executionTime).toLocaleString()} </div>
                    </div>
                </>

            }
        >
            <div
                className="heatmap-tile"
                style={{
                    backgroundColor: getStatusColor(status),
                    borderColor: getStatusBorderColor(status),
                }}
            />
        </Tooltip>
    );
};
