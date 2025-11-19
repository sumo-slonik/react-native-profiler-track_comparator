type AggregatedTimes = {
    totalDuration?: number;
    totalEffectDuration?: number;
    totalPassiveEffectDuration?: number;
};

type Updater = {
    id: number;
    displayName: string | null;
    hocDisplayNames: string[] | null;
    key: string | number | null;
    type: number;
    compiledWithForget: boolean;
};

type CommitDataEntry = {
    changeDescriptions: Array<any> | null;
    duration: number;
    effectDuration: number;
    passiveEffectDuration: number;
    fiberActualDurations: [number, number][];
    fiberSelfDurations: [number, number][];
    priorityLevel: string;
    timestamp: number;
    updaters: Updater[];
};

 type SnapshotNode = {
    id: number;
    children: number[];
    displayName: string | null;
    hocDisplayNames: string[] | null;
    key: number | string | null;
    type: number;
    compiledWithForget?: boolean;
};

 type SnapshotEntry = [number, SnapshotNode];

 type RootData = {
    commitData: CommitDataEntry[];
    snapshots: SnapshotEntry[];
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
    availableComponentNames: string[];
    fiberActualDurationsTotal: Map<string, number>;
    fiberSelfDurationsTotal: Map<string, number>;
    componentMap: Map<number, string>,
}

export type {AggregatedTimes, CommitDataEntry, RootData, ProfilerFile, FileStats, FileCommitData, SnapshotNode};
