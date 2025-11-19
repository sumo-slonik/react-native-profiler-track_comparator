import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FileCommitData } from '../types/FileEntry';
import { MetricType } from './AnalysisModeMenu';

interface ComponentAnalysisTableProps {
    files: FileCommitData[];
    selectedComponent: string | null;
    metricType: MetricType;
    mainSectionId: number | null;
    onSetMain: (id: number) => void;
}

const ComponentAnalysisTable: React.FC<ComponentAnalysisTableProps> = ({
                                                                           files,
                                                                           selectedComponent,
                                                                           metricType,
                                                                           mainSectionId,
                                                                           onSetMain,
                                                                       }) => {
    if (!selectedComponent) {
        return (
            <View style={styles.wrapper}>
                <Text style={styles.placeholderText}>
                    Wybierz komponent z listy powyżej, aby zobaczyć analizę.
                </Text>
            </View>
        );
    }
    debugger;
    const getComponentDuration = (file: FileCommitData): number => {
        const map = metricType === 'actual'
            ? file.fiberActualDurationsTotal
            : file.fiberSelfDurationsTotal;
        return map.get(selectedComponent) || 0;
    };

    const mainFile = files.find((f) => f.id === mainSectionId);
    const baselineDuration = mainFile ? getComponentDuration(mainFile) : 0;

    return (
        <View style={styles.wrapper}>
            <Text style={styles.title}>
                Analiza: <Text style={{ color: '#4f46e5' }}>{selectedComponent}</Text>
            </Text>
            <Text style={styles.subtitle}>
                Metryka: {metricType === 'actual' ? 'Total Actual Duration' : 'Total Self Duration'}
            </Text>

            {/* Nagłówek */}
            <View style={styles.headerRow}>
                <View style={[styles.colBase, styles.colName]}>
                    <Text style={styles.headerText}>Grupa</Text>
                </View>
                <View style={[styles.colBase, styles.colValue]}>
                    <Text style={styles.headerText}>Czas (ms)</Text>
                </View>
                <View style={[styles.colBase, styles.colDiff]}>
                    <Text style={styles.headerText}>Różnica</Text>
                </View>
                <View style={[styles.colBase, styles.colAction, styles.noBorder]}>
                    <Text style={styles.headerText}>Baseline</Text>
                </View>
            </View>

            {/* Wiersze */}
            <View>
                {files.map((file) => {
                    const currentDuration = getComponentDuration(file);
                    const isMain = file.id === mainSectionId;

                    // Obliczenia różnicy
                    const diffMs = currentDuration - baselineDuration;
                    const diffPercent = baselineDuration > 0
                        ? (diffMs / baselineDuration) * 100
                        : 0;

                    // Kolorowanie
                    let diffColor = '#6b7280';
                    let diffSign = '';

                    if (!isMain && mainSectionId !== null) {
                        if (diffMs < 0) {
                            diffColor = '#10b981'; // zielony (szybciej)
                            diffSign = '';
                        } else if (diffMs > 0) {
                            diffColor = '#ef4444'; // czerwony (wolniej)
                            diffSign = '+';
                        }
                    }

                    return (
                        <View key={file.id} style={[styles.row, isMain && styles.rowMain]}>
                            {/* Nazwa Grupy */}
                            <View style={[styles.colBase, styles.colName, styles.cellLeft]}>
                                <Text style={styles.cellText} numberOfLines={1}>
                                    {file.groupName}
                                </Text>
                            </View>

                            {/* Czas */}
                            <View style={[styles.colBase, styles.colValue, styles.cellRight]}>
                                <Text style={styles.cellText}>
                                    {currentDuration.toFixed(2)}
                                </Text>
                            </View>

                            {/* Różnica */}
                            <View style={[styles.colBase, styles.colDiff, styles.cellCenter]}>
                                {mainSectionId !== null && !isMain ? (
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ color: diffColor, fontWeight: 'bold', fontSize: 12 }}>
                                            {diffSign}{diffMs.toFixed(2)} ms
                                        </Text>
                                        <Text style={{ color: diffColor, fontSize: 10 }}>
                                            ({diffSign}{diffPercent.toFixed(1)}%)
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={styles.dash}>-</Text>
                                )}
                            </View>

                            {/* Radio Button */}
                            <TouchableOpacity
                                style={[styles.colBase, styles.colAction, styles.noBorder, styles.cellCenter]}
                                onPress={() => onSetMain(file.id)}
                            >
                                <View style={[styles.radioOuter, isMain && styles.radioOuterSelected]}>
                                    {isMain && <View style={styles.radioInner} />}
                                </View>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginTop: 24,
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    placeholderText: {
        textAlign: 'center',
        color: '#6b7280',
        fontSize: 14,
        fontStyle: 'italic',
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 16,
        fontWeight: '500',
    },
    headerRow: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'stretch',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    rowMain: {
        backgroundColor: '#f0f9ff',
    },
    colBase: {
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderRightWidth: 1,
        borderRightColor: '#f3f4f6',
        justifyContent: 'center',
    },
    noBorder: { borderRightWidth: 0 },

    // Szerokości kolumn
    colName: { flex: 2 },
    colValue: { flex: 2 },
    colDiff: { flex: 2.5 },
    colAction: { flex: 1 },

    headerText: {
        fontWeight: '600',
        color: '#4b5563',
        fontSize: 12,
        textAlign: 'center',
    },
    cellText: {
        fontSize: 13,
        color: '#374151',
    },
    cellLeft: { alignItems: 'flex-start', paddingLeft: 8 },
    cellRight: { alignItems: 'flex-end', paddingRight: 8 },
    cellCenter: { alignItems: 'center' },

    dash: { color: '#9ca3af' },

    radioOuter: {
        width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#d1d5db',
        justifyContent: 'center', alignItems: 'center',
    },
    radioOuterSelected: { borderColor: '#3b82f6' },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3b82f6' },
});

export default ComponentAnalysisTable;
