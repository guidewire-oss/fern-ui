export const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case "passed": return "#3ca454"; // green
        case "failed": return "#933340"; // red
        case "skipped": return "#ffd261"; // yellow
        default: return "#BDBDBD"; // grey for unknown
    }
};

export const getStatusBorderColor = (status: string) => {
    switch (status.toLowerCase()) {
        case "passed": return "#2e8040"; // darker green
        case "failed": return "#702732"; // darker red
        case "skipped": return "#d9b34f"; // darker yellow
        default: return "#9E9E9E"; // darker grey for unknown
    }
};