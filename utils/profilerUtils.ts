import { ProfilerFile, AggregatedTimes } from "../types/FileEntry";

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

export const calculateComponentStats = (
    profilerDataArray: ProfilerFile[],
    componentMap: Map<number, string>
) => {
    const actualTotal = new Map<string, number>();
    const selfTotal = new Map<string, number>();

    const addTime = (
        targetMap: Map<string, number>,
        fiberId: number,
        duration: number
    ) => {
        const name = componentMap.get(fiberId);
        if (name) {
            const currentTotal = targetMap.get(name) || 0;
            targetMap.set(name, currentTotal + duration);
        }
    };

    for (const file of profilerDataArray) {
        for (const root of file.dataForRoots) {
            for (const commit of root.commitData) {

                if (commit.fiberActualDurations) {
                    for (const [id, time] of commit.fiberActualDurations) {
                        addTime(actualTotal, id, time);
                    }
                }

                if (commit.fiberSelfDurations) {
                    for (const [id, time] of commit.fiberSelfDurations) {
                        addTime(selfTotal, id, time);
                    }
                }
            }
        }
    }

    return {
        fiberActualDurationsTotal: actualTotal,
        fiberSelfDurationsTotal: selfTotal,
    };
};
