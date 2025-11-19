import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FileCommitData } from '../types/FileEntry';
import StackedBar, { CHART_COLORS } from './StackedBar';

interface MultiGroupComparisonChartProps {
    files: FileCommitData[];
    showMeasurementCount: boolean;
}

const MultiGroupComparisonChart: React.FC<MultiGroupComparisonChartProps> = ({
                                                                                 files,
                                                                                 showMeasurementCount,
                                                                             }) => {
    const totalChartHeight = 200;

    const validFiles = files.filter(
        (f) =>
            f.averageSummary &&
            f.averageSummary.totalDuration &&
            f.averageSummary.totalDuration > 0
    );

    if (validFiles.length === 0) {
        return (
            <View style={styles.wrapperError}>
                <Text style={styles.textError}>
                    Brak wczytanych danych do porównania (lub wszystkie czasy są zerowe).
                </Text>
            </View>
        );
    }

    const maxDuration = validFiles.reduce((max, f) => {
        const duration = f.averageSummary?.totalDuration || 0;
        return Math.max(max, duration);
    }, 0);

    let scaleMax = 100;
    if (maxDuration > 0) {
        if (maxDuration > 1000) scaleMax = Math.ceil(maxDuration / 500) * 500;
        else if (maxDuration > 200) scaleMax = Math.ceil(maxDuration / 100) * 100;
        else if (maxDuration > 50) scaleMax = Math.ceil(maxDuration / 50) * 50;
        else scaleMax = Math.ceil(maxDuration / 10) * 10;
    }

    const yAxisMarkers = [0.75, 0.5, 0.25, 0].map((multiplier) => ({
        value: scaleMax * multiplier,
        bottom: multiplier * totalChartHeight,
    }));
    yAxisMarkers.push({ value: scaleMax, bottom: totalChartHeight });

    return (
        <View style={styles.wrapper}>
            <Text style={styles.title}>
                Zbiorcze Porównanie Średnich Czasów Commitów
            </Text>

            <View style={styles.legend}>
                <LegendItem color={CHART_COLORS.render} label="Render + Commit" />
                <LegendItem color={CHART_COLORS.layout} label="Layout Effects" />
                <LegendItem color={CHART_COLORS.passive} label="Passive Effects" />
            </View>

            <View style={styles.chartContainer}>
                <View style={styles.yAxis}>
                    {yAxisMarkers.map((marker, index) => (
                        <View
                            key={index}
                            style={[
                                styles.yAxisMarker,
                                {
                                    bottom: marker.bottom,
                                    borderBottomWidth:
                                        index < yAxisMarkers.length - 1 && index > 0 ? 1 : 0,
                                },
                            ]}
                        >
                            <Text style={styles.yAxisText}>
                                {marker.value.toFixed(0)} ms
                            </Text>
                        </View>
                    ))}
                </View>

                <ScrollView
                    horizontal={true}
                    style={styles.barListWrapper}
                    contentContainerStyle={styles.barListContent}
                >
                    {validFiles.map((fileEntry) => {
                        const data = fileEntry.averageSummary!;
                        const totalDuration = data.totalDuration || 0;

                        const totalEffects =
                            (data.totalEffectDuration || 0) +
                            (data.totalPassiveEffectDuration || 0);
                        const totalRenderAndCommitDuration = Math.max(
                            0,
                            totalDuration - totalEffects
                        );

                        const barHeight = (totalDuration / scaleMax) * totalChartHeight;
                        const renderHeightPx =
                            (totalRenderAndCommitDuration / scaleMax) * totalChartHeight || 0;
                        const layoutHeightPx =
                            (data.totalEffectDuration! / scaleMax) * totalChartHeight || 0;
                        const passiveHeightPx =
                            (data.totalPassiveEffectDuration! / scaleMax) * totalChartHeight ||
                            0;

                        return (
                            <View key={fileEntry.id} style={styles.barWrapper}>
                                <Text style={styles.barLabelTop}>
                                    Średnia: {totalDuration.toFixed(2)} ms
                                </Text>

                                <StackedBar
                                    totalHeight={barHeight}
                                    width={80}
                                    renderHeight={renderHeightPx}
                                    layoutHeight={layoutHeightPx}
                                    passiveHeight={passiveHeightPx}
                                />

                                <Text style={styles.barLabelBottom} numberOfLines={1}>
                                    {fileEntry.groupName}
                                </Text>
                                {showMeasurementCount && (
                                    <Text style={styles.barLabelTop}>
                                        ({fileEntry.fileNames.length} pom.)
                                    </Text>
                                )}
                            </View>
                        );
                    })}
                </ScrollView>
            </View>

            <Text style={styles.footerText}>
                Wysokość słupka jest skalowana względem{' '}
                <Text style={{ fontWeight: 'bold' }}>
                    Maksymalnej Skali Czasu ({scaleMax.toFixed(0)} ms)
                </Text>
                .
            </Text>
        </View>
    );
};

const LegendItem = ({ color, label }: { color: string; label: string }) => (
    <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: color }]} />
        <Text>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    wrapper: {
        marginTop: 32,
        padding: 24,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderTopWidth: 8,
        borderTopColor: '#4f46e5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    wrapperError: {
        marginTop: 32,
        padding: 24,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderTopWidth: 4,
        borderTopColor: '#4f46e5',
    },
    textError: {
        textAlign: 'center',
        color: '#6b7280',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 24,
        textAlign: 'center',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
        padding: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        flexWrap: 'wrap',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 12,
        marginBottom: 4,
    },
    legendDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 8,
    },
    chartContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 200,
    },
    yAxis: {
        height: 200,
        width: 48,
        marginRight: 8,
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
    },
    yAxisMarker: {
        position: 'absolute',
        right: 0,
        width: '100%',
        paddingRight: 8,
        borderColor: '#e5e7eb',
        paddingBottom: 3,
    },
    yAxisText: {
        textAlign: 'right',
        fontSize: 12,
        color: '#6b7280',
    },
    barListWrapper: {
        flex: 1,
        height: 200,
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db',
    },
    barListContent: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 8,
        paddingBottom: 4,
    },
    barWrapper: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%',
        marginHorizontal: 16,
    },
    barLabelTop: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 8,
    },
    barLabelBottom: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1f2937',
        maxWidth: 80,
    },
    footerText: {
        marginTop: 24,
        textAlign: 'center',
        fontSize: 14,
        color: '#4b5563',
    },
});

export default MultiGroupComparisonChart;
