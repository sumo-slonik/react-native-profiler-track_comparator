import React from 'react';
import { StyleSheet, Text, View, DimensionValue } from 'react-native';
import { AggregatedTimes, FileCommitData } from '../types/FileEntry';
import StackedBar, { CHART_COLORS } from './StackedBar';

const ChartLabels = ({ fileEntry }: { fileEntry: FileCommitData }) => {
    const summary = fileEntry.averageSummary;

    return (
        <View style={styles.avgTable}>
            <Text style={styles.avgRow}>
                <Text style={styles.avgLabelTotal}>Average Total Duration: </Text>
                <Text style={styles.avgValue}>
                    {summary?.totalDuration?.toFixed(2) || '0.00'} ms
                </Text>
            </Text>
            <Text style={styles.avgRow}>
                <Text style={styles.avgLabelLayout}>Average Layout Effects: </Text>
                <Text style={styles.avgValue}>
                    {summary?.totalEffectDuration?.toFixed(2) || '0.00'} ms
                </Text>
            </Text>
            <Text style={styles.avgRow}>
                <Text style={styles.avgLabelPassive}>Average Passive Effects: </Text>
                <Text style={styles.avgValue}>
                    {summary?.totalPassiveEffectDuration?.toFixed(2) || '0.00'} ms
                </Text>
            </Text>
        </View>
    );
};

interface CommitTimeChartProps {
    data: AggregatedTimes;
    title: string;
}

const CommitTimeChart: React.FC<CommitTimeChartProps> = ({ data, title }) => {
    const {
        totalDuration = 0,
        totalEffectDuration = 0,
        totalPassiveEffectDuration = 0,
    } = data;

    const totalEffects = totalEffectDuration + totalPassiveEffectDuration;
    const totalRenderAndCommitDuration = Math.max(
        0,
        totalDuration - totalEffects
    );

    const renderHeight = `${
        (totalRenderAndCommitDuration / totalDuration) * 100 || 0
    }%` as DimensionValue;

    const layoutHeight = `${
        (totalEffectDuration / totalDuration) * 100 || 0
    }%` as DimensionValue;

    const passiveHeight = `${
        (totalPassiveEffectDuration / totalDuration) * 100 || 0
    }%` as DimensionValue;

    return (
        <View style={styles.chartWrapper}>
            <Text style={styles.chartTitle}>{title}</Text>

            <View style={styles.barContainer}>
                <StackedBar
                    totalHeight={200}
                    renderHeight={renderHeight}
                    layoutHeight={layoutHeight}
                    passiveHeight={passiveHeight}
                    backgroundColor={
                        totalDuration === 0 ? CHART_COLORS.empty : CHART_COLORS.background
                    }
                />
            </View>

            <Text style={styles.totalText}>
                Average Total: {totalDuration.toFixed(2)} ms
            </Text>
        </View>
    );
};

const SectionChart = ({ fileEntry }: { fileEntry: FileCommitData }) => {
    if (!fileEntry.averageSummary) return null;

    return (
        <>
            <ChartLabels fileEntry={fileEntry} />
            <CommitTimeChart
                data={fileEntry.averageSummary}
                title={`Chart for: ${fileEntry.groupName}`}
            />
        </>
    );
};

const styles = StyleSheet.create({
    avgTable: {
        marginTop: 16,
        marginBottom: 16,
        padding: 8,
        backgroundColor: '#f0f9ff',
        borderRadius: 8,
    },
    avgRow: {
        marginBottom: 2,
    },
    avgValue: {
        fontWeight: 'bold',
        color: '#1f2937',
    },
    avgLabelTotal: { fontWeight: '600', color: '#1d4ed8' },
    avgLabelLayout: { fontWeight: '600', color: '#d97706' },
    avgLabelPassive: { fontWeight: '600', color: '#059669' },

    chartWrapper: {
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        marginTop: 0,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#374151',
    },
    barContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    totalText: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 8,
        color: '#374151',
    },
});

export default SectionChart;
