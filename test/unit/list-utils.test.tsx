import { calculateDuration, calculateSpecRuns, generateTagColor, testRunsStatus, uniqueTags } from "../../src/pages/test-runs/list-utils";
import { testrunsApiResponse } from "../utils/dataMocks";
import { ISpecRun, ITestRun } from "../../src/pages/test-runs/interfaces";

// Mock the useTable hook
jest.mock('@refinedev/antd', () => ({
    useTable: jest.fn(() => ({
        tableProps: {
            dataSource: testrunsApiResponse.testRuns.edges.map(edge => edge.testRun),
        },
    })),
}));

describe('TestRunsList Unit Tests', () => {

    it('should calculate duration correctly', () => {
        const start = '2021-01-01T00:00:00Z';
        const end = '2021-01-01T01:00:00Z';
        expect(calculateDuration(start, end)).toBe('an hour');
    });

    it('should return the correct status counts', () => {
        const testRun = testrunsApiResponse.testRuns.edges[0].testRun; // Accessing the correct testRun object
        const statusMap = testRunsStatus(testRun);
        expect(statusMap.get('passed')).toBe(1);
        expect(statusMap.get('failed')).toBe(1);
        expect(statusMap.get('skipped')).toBe(1);
    });

    it('should return unique tags', () => {
        const specRuns = testrunsApiResponse.testRuns.edges[0].testRun.suiteRuns[0].specRuns as ISpecRun[]; // Corrected specRuns access
        const tags = uniqueTags(specRuns);
        expect(tags).toHaveLength(2);
        expect(tags).toEqual([{ id: 1, name: 'Tag1' }, { id: 2, name: 'Tag2' }]);
    });

    it('should calculate spec runs correctly', () => {
        const testRun = testrunsApiResponse.testRuns.edges[0].testRun; // Accessing the correct testRun object
        expect(calculateSpecRuns(testRun)).toBe('1/2');
    });

    it('should assign consistent colors to the same tags', () => {
        const tagOne = "acceptance";
        const tagTwo = "unit";
        const tagThree = "acceptance";

        const tagOneColor = generateTagColor(tagOne);
        const tagTwoColor = generateTagColor(tagTwo);
        const tagThreeColor = generateTagColor(tagThree);

        expect(tagOneColor).toEqual(tagThreeColor);
        expect(tagTwoColor).not.toEqual(tagOneColor);
    });
});
