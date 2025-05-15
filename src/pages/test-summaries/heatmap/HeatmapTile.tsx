import React from "react";
import { Tooltip } from "antd";
import {getStatusBorderColor, getStatusColor} from "./utils";

interface HeatmapTileProps {
    name: string;
    status: string;
    testRunTitle: string;
}

export const HeatmapTile : React.FC<HeatmapTileProps> = ({ name, status, testRunTitle }) => {
    return (
        <Tooltip title={`${name}: ${testRunTitle} (${status})`}>
            <div
                className="heatmap-tile"
                style={{
                    backgroundColor: getStatusColor(status),
                    borderColor : getStatusBorderColor(status),
            }}
            />
        </Tooltip>
    );
};
