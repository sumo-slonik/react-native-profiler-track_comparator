type AggregatedTimes = {
    totalDuration?: number;
    totalEffectDuration?: number;
    totalPassiveEffectDuration?: number;
};
type CommitDataEntry = {
    duration: number;
    effectDuration: number;
    passiveEffectDuration: number;
};
type RootData = {
    commitData: CommitDataEntry[];
};
type ProfilerFile = {
    version: number;
    dataForRoots: RootData[];
};
type FileStats = {
    fileName: string;
    totalDuration: number;
    commitCount: number;
};

type FileCommitData = {
    id: number;
    groupName: string;
    fileNames: string[];
    profilerDataArray: ProfilerFile[];
    averageSummary: AggregatedTimes | null;
    loadingError: string | null;
    fileStats: FileStats[];
}

export type {AggregatedTimes, CommitDataEntry, RootData, ProfilerFile, FileStats, FileCommitData};
