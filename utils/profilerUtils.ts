import {ProfilerFile, AggregatedTimes, FileCommitData, SnapshotNode} from "../types/FileEntry";

export const aggregateCommitTimes = (
    profilerData: ProfilerFile
): AggregatedTimes & { commitCount: number } => {
    let totalDuration = 0;
    let totalEffectDuration = 0;
    let totalPassiveEffectDuration = 0;
    let commitCount = 0;

    for (const root of profilerData.dataForRoots) {
        commitCount += root.commitData.length;
        for (const commit of root.commitData) {
            totalDuration += commit.duration || 0;
            totalEffectDuration += commit.effectDuration || 0;
            totalPassiveEffectDuration += commit.passiveEffectDuration || 0;
        }
    }
    return {
        totalDuration,
        totalEffectDuration,
        totalPassiveEffectDuration,
        commitCount,
    };
};

export const calculateAverageTimes = (
    profilerDataArray: ProfilerFile[]
): AggregatedTimes => {
    if (profilerDataArray.length === 0) {
        return {
            totalDuration: 0,
            totalEffectDuration: 0,
            totalPassiveEffectDuration: 0,
        };
    }
    let totalDurationSum = 0;
    let totalEffectDurationSum = 0;
    let totalPassiveEffectDurationSum = 0;

    for (const profilerData of profilerDataArray) {
        const totals = aggregateCommitTimes(profilerData);
        totalDurationSum += totals.totalDuration || 0;
        totalEffectDurationSum += totals.totalEffectDuration || 0;
        totalPassiveEffectDurationSum += totals.totalPassiveEffectDuration || 0;
    }
    const count = profilerDataArray.length;
    return {
        totalDuration: totalDurationSum / count,
        totalEffectDuration: totalEffectDurationSum / count,
        totalPassiveEffectDuration: totalPassiveEffectDurationSum / count,
    };
};

export const extractComponentMap = (profilerData: ProfilerFile): Map<number, string> => {
    const componentMap = new Map<number, string>();

    profilerData.dataForRoots.forEach((root) => {
        if (Array.isArray(root.snapshots)) {
            root.snapshots.forEach((entry) => {
                const id = entry[0];
                const node = entry[1];

                if (node && node.displayName) {
                    componentMap.set(id, node.displayName);
                }
            });
        }
    });

    return componentMap;
};


export const getUniqueComponentNames = (
    profilerDataArray: ProfilerFile[]
): { mergedMap: Map<number, string>, sortedNames: string[] } => {
    const mergedMap = new Map<number, string>();
    profilerDataArray.forEach((profilerFile) => {
        const fileMap = extractComponentMap(profilerFile);
        fileMap.forEach((name, id) => mergedMap.set(id, name));
    });

    const sortedNames = Array.from(new Set(mergedMap.values())).sort();

    return { mergedMap, sortedNames };
};

export const calculateComponentStats = (
    profilerDataArray: ProfilerFile[]
) => {
    const actualTotal = new Map<string, number>();
    const selfTotal = new Map<string, number>();

    for (const profilerData of profilerDataArray) {

        const traceComponentMap = extractComponentMap(profilerData);

        if (!profilerData.dataForRoots) {
            continue;
        }

        for (const root of profilerData.dataForRoots) {
            for (const commit of root.commitData) {

                if (commit.fiberActualDurations) {
                    for (const [id, time] of commit.fiberActualDurations) {
                        const name = traceComponentMap.get(id);
                        if (name) {
                            const currentTotal = actualTotal.get(name) || 0;
                            actualTotal.set(name, currentTotal + time);
                        }
                    }
                }

                if (commit.fiberSelfDurations) {
                    for (const [id, time] of commit.fiberSelfDurations) {
                        const name = traceComponentMap.get(id);
                        if (name) {
                            const currentTotal = selfTotal.get(name) || 0;
                            selfTotal.set(name, currentTotal + time);
                        }
                    }
                }
            }
        }
    }

    const fileCount = profilerDataArray.length;

    if (fileCount > 1) {
        for (const [key, value] of actualTotal) {
            actualTotal.set(key, value / fileCount);
        }
        for (const [key, value] of selfTotal) {
            selfTotal.set(key, value / fileCount);
        }
    }

    return {
        fiberActualDurationsTotal: actualTotal,
        fiberSelfDurationsTotal: selfTotal,
    };
};
