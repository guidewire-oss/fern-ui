import {calculateDuration, calculateSpecRuns, testRunsStatus, uniqueTags} from "../../src/pages/test-runs/list-utils";
import {apiResponse} from "./dataMocks";
import {ITestRun} from "../../src/pages/test-runs/interfaces";

// Mock the useTable hook
jest.mock('@refinedev/antd', () => ({
    useTable: jest.fn(() => ({
        tableProps: {
            dataSource: apiResponse
        },
    })),
}));

describe('TestRunsList', () => {

    it('should calculate duration correctly', () => {
        const start = '2021-01-01T00:00:00Z';
        const end = '2021-01-01T01:00:00Z';
        expect(calculateDuration(start, end)).toBe('an hour');
    });

    it('should return the correct status counts', () => {
        // @ts-ignore
        const testRun = apiResponse.testRuns[0] as ITestRun;
        const statusMap = testRunsStatus(testRun);
        expect(statusMap.get('passed')).toBe(2);
        expect(statusMap.get('failed')).toBe(1);
        expect(statusMap.get('skipped')).toBe(1);
    });

    it('should return unique tags', () => {
        // @ts-ignore
        const specRuns = apiResponse.testRuns[0].suite_runs[0].spec_runs;
        const tags = uniqueTags(specRuns);
        expect(tags).toHaveLength(2);
        expect(tags).toEqual([{id: 1, name: 'Tag1'}, {id: 2, name: 'Tag2'}]);
    });

    it('should calculate spec runs correctly', () => {
        // @ts-ignore
        const testRun = apiResponse.testRuns[0];
        expect(calculateSpecRuns(testRun)).toBe('2/3');
    });
});
