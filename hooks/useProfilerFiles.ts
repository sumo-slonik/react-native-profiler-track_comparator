import { useState, useCallback, useEffect } from 'react';
import { FileCommitData, FileStats, ProfilerFile } from '../types/FileEntry';
import { aggregateCommitTimes, calculateAverageTimes } from '../utils/profilerUtils';

const createNewFileEntry = (id: number, index: number): FileCommitData => ({
    id,
    groupName: `Grupa ${index + 1}`,
    fileNames: [],
    profilerDataArray: [],
    averageSummary: null,
    loadingError: null,
    fileStats: [],
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

    const removeSection = useCallback(() => {
        setFiles((prevFiles) => {
            if (prevFiles.length > 0) {
                const updatedFiles = prevFiles.slice(0, -1).map((f, index) => ({
                    ...f,
                    groupName: f.groupName.startsWith('Grupa ')
                        ? `Grupa ${index + 1}`
                        : f.groupName,
                }));
                return updatedFiles;
            }
            return prevFiles;
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
                newFiles[index] = {
                    ...newFiles[index],
                    fileNames: fileNames,
                    profilerDataArray: dataArray,
                    averageSummary: averageSummary,
                    loadingError: null,
                    fileStats: fileStats,
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
        updateGroupName,
        processLoadedFiles,
        reportError,
    };
};
