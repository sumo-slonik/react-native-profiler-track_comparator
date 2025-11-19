import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FileCommitData, ProfilerFile } from '../types/FileEntry';
import GroupNameInput from './GroupNameInput';
import FilesList from './FilesList';
import SectionChart from './SectionChart';
import JsonFileInput from "../JsonFileInput";

interface MeasurementSectionProps {
    item: FileCommitData;
    index: number;
    numColumns: number;
    onGroupNameChange: (newName: string, index: number) => void;
    onFilesLoaded: (dataArray: ProfilerFile[], fileNames: string[], index: number) => void;
    onError: (message: string, index: number) => void;
}

const MeasurementSection: React.FC<MeasurementSectionProps> = ({
                                                                   item: fileEntry,
                                                                   index,
                                                                   numColumns,
                                                                   onGroupNameChange,
                                                                   onFilesLoaded,
                                                                   onError,
                                                               }) => {
    const itemWidth = numColumns > 1 ? `${(100 / numColumns).toFixed(2)}%` : '100%';
    const itemPadding = numColumns > 1 ? 12 : 0;

    return (
        <View
            style={[
                styles.sectionWrapper,
                { width: itemWidth, paddingHorizontal: itemPadding },
            ]}
        >
            <View style={styles.sectionContent}>
                <GroupNameInput
                    index={index}
                    initialName={fileEntry.groupName}
                    onNameChange={onGroupNameChange}
                />

                <JsonFileInput
                    index={index}
                    onFilesLoaded={onFilesLoaded}
                    onError={onError}
                />

                <View style={styles.summaryWrapper}>
                    <Text style={styles.summaryTitle}>Podsumowanie</Text>

                    {fileEntry.loadingError && (
                        <Text style={styles.errorText}>
                            ❌ Błąd wczytywania: {fileEntry.loadingError}
                        </Text>
                    )}

                    {fileEntry.fileNames.length > 0 && !fileEntry.loadingError && (
                        <View style={styles.loadedInfo}>
                            <Text style={{ fontWeight: 'bold' }}>
                                ✅ Wczytano: {fileEntry.fileNames.length} pomiar(y).
                            </Text>
                            <FilesList fileEntry={fileEntry} />
                        </View>
                    )}

                    {fileEntry.averageSummary && <SectionChart fileEntry={fileEntry} />}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionWrapper: {
        marginBottom: 24,
        minHeight: 1, // Potrzebne dla FlatList na webie
    },
    sectionContent: {
        backgroundColor: '#ffffff',
        padding: 24,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 4,
        borderTopWidth: 4,
        borderTopColor: '#a855f7', // border-violet-500
    },
    summaryWrapper: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#8b5cf6',
        marginBottom: 8,
    },
    errorText: {
        color: '#dc2626',
        fontWeight: '500',
    },
    loadedInfo: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 8,
        padding: 8,
        backgroundColor: '#f9fafb',
        borderRadius: 4,
    },
});

export default MeasurementSection;
