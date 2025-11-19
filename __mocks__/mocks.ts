import {ProfilerFile, SnapshotNode} from "../types/FileEntry";

const createNode = (id: number, displayName: string): SnapshotNode => ({
    id,
    children: [],
    displayName,
    hocDisplayNames: null,
    key: null,
    type: 1,
    compiledWithForget: false,
});

const commonSnapshots: [number, SnapshotNode][] = [
    [1, createNode(1, "App")],
    [2, createNode(2, "Header")],
    [3, createNode(3, "Button")],
    [4, createNode(4, "List")],
];

export const mockFile1: ProfilerFile = {
    version: 1.2,
    dataForRoots: [
        {
            snapshots: commonSnapshots,
            commitData: [
                {
                    duration: 10,
                    effectDuration: 1,
                    passiveEffectDuration: 1,
                    timestamp: 100,
                    priorityLevel: "Normal",
                    changeDescriptions: null,
                    updaters: [],
                    fiberActualDurations: [[1, 10], [2, 5], [3, 5]],
                    fiberSelfDurations:   [[1, 2],  [2, 5], [3, 3]],
                },
                {
                    duration: 5,
                    effectDuration: 0.5,
                    passiveEffectDuration: 0,
                    timestamp: 200,
                    priorityLevel: "Normal",
                    changeDescriptions: null,
                    updaters: [],
                    fiberActualDurations: [[2, 5]],
                    fiberSelfDurations:   [[2, 5]],
                },
                {
                    duration: 5,
                    effectDuration: 0.5,
                    passiveEffectDuration: 0,
                    timestamp: 300,
                    priorityLevel: "Normal",
                    changeDescriptions: null,
                    updaters: [],
                    fiberActualDurations: [[3, 5]],
                    fiberSelfDurations:   [[3, 5]],
                },
                {
                    duration: 5,
                    effectDuration: 0,
                    passiveEffectDuration: 0,
                    timestamp: 400,
                    priorityLevel: "Normal",
                    changeDescriptions: null,
                    updaters: [],
                    fiberActualDurations: [[4, 5]],
                    fiberSelfDurations:   [[4, 5]],
                },
            ],
        }
    ]
};

export const mockFile2: ProfilerFile = {
    version: 1.2,
    dataForRoots: [
        {
            snapshots: commonSnapshots,
            commitData: [
                {
                    duration: 20,
                    effectDuration: 2,
                    passiveEffectDuration: 2,
                    timestamp: 1000,
                    priorityLevel: "Normal",
                    changeDescriptions: null,
                    updaters: [],
                    fiberActualDurations: [[1, 20], [2, 10], [3, 5], [4, 5]],
                    fiberSelfDurations:   [[1, 5],  [2, 8],  [3, 5], [4, 2]],
                },
                {
                    duration: 4,
                    effectDuration: 1,
                    passiveEffectDuration: 0,
                    timestamp: 1100,
                    priorityLevel: "Normal",
                    changeDescriptions: null,
                    updaters: [],
                    fiberActualDurations: [[2, 4]],
                    fiberSelfDurations:   [[2, 4]],
                },
                {
                    duration: 4,
                    effectDuration: 0,
                    passiveEffectDuration: 0,
                    timestamp: 1200,
                    priorityLevel: "Normal",
                    changeDescriptions: null,
                    updaters: [],
                    fiberActualDurations: [[3, 4]],
                    fiberSelfDurations:   [[3, 4]],
                },
                {
                    duration: 4,
                    effectDuration: 0,
                    passiveEffectDuration: 0,
                    timestamp: 1300,
                    priorityLevel: "Normal",
                    changeDescriptions: null,
                    updaters: [],
                    fiberActualDurations: [[4, 4]],
                    fiberSelfDurations:   [[4, 4]],
                },
                {
                    duration: 8,
                    effectDuration: 1,
                    passiveEffectDuration: 0.5,
                    timestamp: 1400,
                    priorityLevel: "Normal",
                    changeDescriptions: null,
                    updaters: [],
                    fiberActualDurations: [[3, 8]],
                    fiberSelfDurations:   [[3, 8]],
                },
            ],
        }
    ]
} ;

export const mockFilesArray = [mockFile1, mockFile2];
