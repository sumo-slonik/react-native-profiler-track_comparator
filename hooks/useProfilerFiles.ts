import { useState, useCallback, useEffect } from 'react';
import { FileCommitData, FileStats, ProfilerFile } from '../types/FileEntry';
import {
    aggregateCommitTimes,
    calculateAverageTimes,
    calculateComponentStats,
    extractComponentMap
} from '../utils/profilerUtils';

const createNewFileEntry = (id: number, index: number): FileCommitData => ({
    id,
    groupName: `Grupa ${index + 1}`,
    fileNames: [],
    profilerDataArray: [],
    averageSummary: {
        totalDuration: 0,
        totalEffectDuration: 0,
        totalPassiveEffectDuration: 0,
    },
    loadingError: null,
    fileStats: [],
    availableComponentNames: [],
    fiberActualDurationsTotal: new Map(),
    fiberSelfDurationsTotal: new Map(),
    componentMap: new Map(),
});

export const useProfilerFiles = () => {
    const [files, setFiles] = useState<FileCommitData[]>([]);

    const addSection = useCallback(() => {
        setFiles((prevFiles) => {
            const newId =
                prevFiles.length > 0 ? Math.max(...prevFiles.map((f) => f.id)) + 1 : 0;
            const newIndex = prevFiles.length;
            return [...prevFiles, createNewFileEntry(newId, newIndex)];
        });
    }, []);

    const removeSection = useCallback((idToRemove: number) => {
        setFiles((prevFiles) => prevFiles.filter((f) => f.id !== idToRemove));
    }, []);

    const clearFiles = useCallback((index: number) => {
        setFiles((prevFiles) => {
            const newFiles = [...prevFiles];
            newFiles[index] = {
                ...newFiles[index],
                fileNames: [],
                profilerDataArray: [],
                averageSummary: null,
                loadingError: null,
                fileStats: [],
                availableComponentNames: [],
                componentMap: new Map(),
                fiberActualDurationsTotal: new Map(),
                fiberSelfDurationsTotal: new Map(),
            };
            return newFiles;
        });
    }, []);

    const updateGroupName = useCallback((newName: string, index: number) => {
        setFiles((prevFiles) => {
            const newFiles = [...prevFiles];
            newFiles[index] = {
                ...newFiles[index],
                groupName: newName,
            };
            return newFiles;
        });
    }, []);

    const processLoadedFiles = useCallback(
        (dataArray: ProfilerFile[], fileNames: string[], index: number) => {
            setFiles((prevFiles) => {
                const newFiles = [...prevFiles];
                const fileStats: FileStats[] = dataArray.map((data, i) => {
                    const totals = aggregateCommitTimes(data);
                    return {
                        fileName: fileNames[i],
                        totalDuration: totals.totalDuration || 0,
                        commitCount: totals.commitCount,
                    };
                });
                const averageSummary = calculateAverageTimes(dataArray);

                const mergedComponentMap = new Map<number, string>();

                dataArray.forEach((profilerFile) => {
                    const fileMap = extractComponentMap(profilerFile);
                    fileMap.forEach((name, id) => mergedComponentMap.set(id, name));
                });

                const sortedComponentNames = Array.from(new Set(mergedComponentMap.values())).sort();

                const { fiberActualDurationsTotal, fiberSelfDurationsTotal } =
                    calculateComponentStats(dataArray, mergedComponentMap);

                newFiles[index] = {
                    ...newFiles[index],
                    fileNames: fileNames,
                    profilerDataArray: dataArray,
                    averageSummary: averageSummary,
                    loadingError: null,
                    fileStats: fileStats,
                    availableComponentNames: sortedComponentNames,
                    componentMap: mergedComponentMap,
                    fiberActualDurationsTotal: fiberActualDurationsTotal,
                    fiberSelfDurationsTotal: fiberSelfDurationsTotal,
                };
                return newFiles;
            });
        },
        []
    );

    const reportError = useCallback((message: string, index: number) => {
        setFiles((prevFiles) => {
            const newFiles = [...prevFiles];
            newFiles[index] = {
                ...newFiles[index],
                loadingError: message,
                fileNames: [],
                profilerDataArray: [],
                averageSummary: null,
                fileStats: [],
                fiberActualDurationsTotal: new Map(),
                fiberSelfDurationsTotal: new Map(),
            };
            return newFiles;
        });
    }, []);

    useEffect(() => {
        if (files.length === 0) {
            addSection();
        }
    }, [files.length, addSection]);

    return {
        files,
        addSection,
        removeSection,
        clearFiles,
        updateGroupName,
        processLoadedFiles,
        reportError,
    };
};
