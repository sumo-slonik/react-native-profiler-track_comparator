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
