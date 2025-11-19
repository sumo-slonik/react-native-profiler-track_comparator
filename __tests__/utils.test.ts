import {mockFile1, mockFile2} from "../__mocks__/mocks";
import {
    aggregateCommitTimes,
    calculateAverageTimes,
    calculateComponentStats,
    extractComponentMap
} from "../utils/profilerUtils";

describe('profilerUtils', () => {

    describe('aggregateCommitTimes', () => {
        it('correctly aggregates times for MockFile1 (4 commits)', () => {
            const result = aggregateCommitTimes(mockFile1);

            expect(result.totalDuration).toBeCloseTo(25);
            expect(result.commitCount).toBe(4);
        });

        it('correctly aggregates times for MockFile2 (5 commits)', () => {
            const result = aggregateCommitTimes(mockFile2);

            expect(result.totalDuration).toBeCloseTo(40);
            expect(result.commitCount).toBe(5);
        });
    });

    describe('calculateAverageTimes', () => {
        it('calculates average times across multiple files', () => {
            const files = [mockFile1, mockFile2];
            const result = calculateAverageTimes(files);

            expect(result.totalDuration).toBeCloseTo(32.5);
        });

        it('returns zeros for empty file array', () => {
            const result = calculateAverageTimes([]);
            expect(result.totalDuration).toBe(0);
            expect(result.totalEffectDuration).toBe(0);
        });
    });

    describe('extractComponentMap', () => {
        it('extracts component names correctly', () => {
            const map = extractComponentMap(mockFile1);

            expect(map.size).toBe(4);
            expect(map.get(1)).toBe('App');
            expect(map.get(2)).toBe('Header');
            expect(map.get(3)).toBe('Button');
            expect(map.get(4)).toBe('List');
        });
    });

    describe('calculateComponentStats', () => {
        it('correctly sums up Actual and Self durations for specific components', () => {
            const files = [mockFile1, mockFile2];

            const componentMap = extractComponentMap(mockFile1);

            const stats = calculateComponentStats(files, componentMap);

            expect(stats.fiberActualDurationsTotal.get('Button')).toBeCloseTo(13.5);

            expect(stats.fiberSelfDurationsTotal.get('Button')).toBeCloseTo(12.5);

            expect(stats.fiberActualDurationsTotal.get('App')).toBeCloseTo(15);
        });

        it('handles missing component names gracefully', () => {
            // ZMIANA TUTAJ: Usunięto <number, string>
            const emptyMap = new Map();
            const stats = calculateComponentStats([mockFile1], emptyMap);

            expect(stats.fiberActualDurationsTotal.size).toBe(0);
        });
    });
});
