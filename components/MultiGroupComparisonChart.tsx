import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { FileCommitData } from '../types/FileEntry';
import StackedBar, { CHART_COLORS } from './StackedBar';
import MeasurementToggle from "./MeasurementToggle";

interface MultiGroupComparisonChartProps {
    files: FileCommitData[];
}

const MultiGroupComparisonChart: React.FC<MultiGroupComparisonChartProps> = ({
                                                                                 files,
                                                                             }) => {

    const [showMeasurementCount, setShowMeasurementCount] = useState(true);
    const [isVisible, setIsVisible] = useState(false);

    const totalChartHeight = 200; //

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
            {/* Nagłówek */}
            <View style={styles.headerRow}>
                <Text style={styles.title}>
                    Zbiorcze Porównanie
                </Text>

                <Pressable
                    style={styles.toggleButton}
                    onPress={() => setIsVisible(!isVisible)}
                >
                    <View style={[styles.checkbox, isVisible && styles.checkboxChecked]}>
                        {isVisible && <Text style={styles.checkboxCheck}>✓</Text>}
                    </View>
                    <Text style={styles.toggleText}>Pokaż wykres</Text>
                </Pressable>
            </View>

            {isVisible && (
                <>
                    <MeasurementToggle
                        checked={showMeasurementCount}
                        onToggle={setShowMeasurementCount}
                    />
                    <View style={styles.legend}>
                        <LegendItem color={CHART_COLORS.render} label="Render + Commit" />
                        <LegendItem color={CHART_COLORS.layout} label="Layout Effects" />
                        <LegendItem color={CHART_COLORS.passive} label="Passive Effects" />
                    </View>

                    {/* Kontener Wykresu */}
                    <View style={styles.chartRow}>

                        {/* Oś Y */}
                        <View style={[styles.yAxis, { height: totalChartHeight }]}>
                            {yAxisMarkers.map((marker, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.yAxisMarker,
                                        {
                                            bottom: marker.bottom,
                                            // Linie poziome (grid) tylko dla wartości pośrednich
                                            borderBottomWidth: 0,
                                        },
                                    ]}
                                >
                                    {/* Linia siatki */}
                                    <View style={styles.gridLine} />
                                    <Text style={styles.yAxisText}>
                                        {marker.value.toFixed(0)}
                                    </Text>
                                </View>
                            ))}
                            {/* Zero na dole */}
                            <View style={[styles.yAxisMarker, { bottom: 0 }]}>
                                <Text style={styles.yAxisText}>0</Text>
                            </View>
                        </View>

                        {/* Obszar Słupków */}
                        <ScrollView
                            horizontal={true}
                            style={styles.scrollArea}
                            contentContainerStyle={styles.scrollContent}
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
                                    <View key={fileEntry.id} style={styles.columnWrapper}>

                                        {/* GÓRA: Obszar rysowania (Wysokość równa osi Y) */}
                                        {/* borderBottomWidth tutaj to Oś X */}
                                        <View style={[styles.plotArea, { height: totalChartHeight }]}>

                                            {/* Wartość liczbowa nad słupkiem */}
                                            <Text style={styles.barValueText}>
                                                {totalDuration.toFixed(0)}
                                            </Text>

                                            {/* Słupek - przylega do dołu dzięki justifyContent: flex-end */}
                                            <StackedBar
                                                totalHeight={barHeight}
                                                width={50}
                                                renderHeight={renderHeightPx}
                                                layoutHeight={layoutHeightPx}
                                                passiveHeight={passiveHeightPx}
                                            />
                                        </View>

                                        {/* DÓŁ: Etykiety tekstowe pod osią X */}
                                        <View style={styles.labelsArea}>
                                            <Text style={styles.groupNameText} numberOfLines={2}>
                                                {fileEntry.groupName}
                                            </Text>
                                            {showMeasurementCount && (
                                                <Text style={styles.measurementCountText}>
                                                    ({fileEntry.fileNames.length})
                                                </Text>
                                            )}
                                        </View>
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
                </>
            )}
        </View>
    );
};

const LegendItem = ({ color, label }: { color: string; label: string }) => (
    <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: color }]} />
        <Text style={{ fontSize: 12 }}>{label}</Text>
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
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    toggleText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4b5563',
    },
    checkbox: {
        width: 16,
        height: 16,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 4,
        marginRight: 6,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    checkboxChecked: {
        backgroundColor: '#4f46e5',
        borderColor: '#4f46e5',
    },
    checkboxCheck: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
        flexWrap: 'wrap',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
        marginBottom: 4,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },

    chartRow: {
        flexDirection: 'row',
    },

    yAxis: {
        width: 40,
        marginRight: 8,
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db',
        position: 'relative',
    },
    yAxisMarker: {
        position: 'absolute',
        right: 0,
        width: '100%',
        paddingRight: 6,
        justifyContent: 'center',
        height: 0,
        overflow: 'visible',
    },
    gridLine: {
        position: 'absolute',
        right: 0,
        width: 5,
        height: 1,
        backgroundColor: '#d1d5db',
    },
    yAxisText: {
        textAlign: 'right',
        fontSize: 10,
        color: '#9ca3af',
        transform: [{ translateY: -6 }],
    },

    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 8,
    },

    columnWrapper: {
        flexDirection: 'column',
        alignItems: 'center',
        marginHorizontal: 10,
        minWidth: 60,
    },

    plotArea: {
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db',
        overflow: 'visible',
    },
    barValueText: {
        fontSize: 10,
        color: '#6b7280',
        marginBottom: 4,
    },

    labelsArea: {
        marginTop: 8,
        alignItems: 'center',
        width: 80,
    },
    groupNameText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1f2937',
        textAlign: 'center',
    },
    measurementCountText: {
        fontSize: 10,
        color: '#9ca3af',
        textAlign: 'center',
        marginTop: 2,
    },

    footerText: {
        marginTop: 24,
        textAlign: 'center',
        fontSize: 12,
        color: '#9ca3af',
    },
});

export default MultiGroupComparisonChart;
