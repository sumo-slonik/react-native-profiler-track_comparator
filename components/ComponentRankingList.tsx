import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FileCommitData } from '../types/FileEntry';
import { MetricType } from './AnalysisModeMenu';

interface ComponentRankingListProps {
    fileEntry: FileCommitData;
    metricType: MetricType;
}

const ComponentRankingList: React.FC<ComponentRankingListProps> = ({
                                                                       fileEntry,
                                                                       metricType,
                                                                   }) => {
    const [showAll, setShowAll] = useState(false);

    const dataMap = metricType === 'actual'
        ? fileEntry.fiberActualDurationsTotal
        : fileEntry.fiberSelfDurationsTotal;

    const sortedComponents = Array.from(dataMap.entries())
        .sort((a, b) => b[1] - a[1]);

    const displayedComponents = showAll
        ? sortedComponents
        : sortedComponents.slice(0, 5);

    if (sortedComponents.length === 0) {
        return (
            <View style={styles.wrapper}>
                <Text style={styles.emptyText}>No component data available.</Text>
            </View>
        );
    }

    return (
        <View style={styles.wrapper}>
            <Text style={styles.title}>
                {showAll ? `Ranking (${sortedComponents.length})` : 'Top 5'}: {metricType === 'actual' ? 'Actual' : 'Self'} Duration
            </Text>

            <View style={styles.headerRow}>
                <Text style={[styles.headerText, { flex: 1 }]}>Component</Text>
                <Text style={styles.headerText}>Time (ms)</Text>
            </View>

            {displayedComponents.map(([name, time], index) => (
                <View key={name} style={styles.row}>
                    <Text style={styles.rank}>#{index + 1}</Text>
                    <Text style={styles.name} numberOfLines={1}>
                        {name}
                    </Text>
                    <Text style={styles.time}>
                        {time.toFixed(2)}
                    </Text>
                </View>
            ))}

            {sortedComponents.length > 5 && (
                <TouchableOpacity
                    style={styles.footerButton}
                    onPress={() => setShowAll(!showAll)}
                >
                    <Text style={styles.footerButtonText}>
                        {showAll
                            ? 'Show less (Top 5)'
                            : `Show all (${sortedComponents.length})`}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#475569',
        marginBottom: 12,
        textAlign: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
        paddingBottom: 4,
        marginBottom: 4,
    },
    headerText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    rank: {
        width: 30,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#94a3b8',
    },
    name: {
        flex: 1,
        fontSize: 13,
        color: '#334155',
        fontWeight: '500',
        marginRight: 8,
    },
    time: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#0f172a',
        fontVariant: ['tabular-nums'],
    },
    emptyText: {
        textAlign: 'center',
        color: '#94a3b8',
        fontStyle: 'italic',
        padding: 10,
    },
    footerButton: {
        marginTop: 12,
        paddingVertical: 8,
        alignItems: 'center',
        backgroundColor: '#e0e7ff',
        borderRadius: 6,
    },
    footerButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4f46e5',
    },
});

export default ComponentRankingList;
