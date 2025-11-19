import { StyleSheet, Text, View, TouchableOpacity, LayoutAnimation, Platform, UIManager, Pressable } from "react-native";
import React, { useState } from "react";
import { FileCommitData } from "../types/FileEntry";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const styles = StyleSheet.create({
    collapsibleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 8,
        backgroundColor: '#f9fafb',
        borderRadius: 6,
        marginBottom: 8,
    },
    collapsibleTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4b5563',
    },
    collapsibleIcon: {
        fontSize: 12,
        color: '#6b7280',
    },

    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
    checkmark: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    checkboxLabel: {
        fontSize: 12,
        color: '#6b7280',
    },

    fileStatRow: {
        fontFamily: 'monospace',
        color: '#374151',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
        paddingHorizontal: 4,
    },
    fileStatName: {
        fontWeight: 'bold',
        flex: 1,
        color: '#374151',
    },
    fileStatMetrics: {
        flexDirection: 'row',
        flexShrink: 0,
    },
    fileStatCommits: {
        fontSize: 12,
        color: '#1d4ed8',
    },
    fileStatSeparator: {
        fontSize: 12,
        color: '#6b7280',
        marginHorizontal: 4,
    },
    fileStatDuration: {
        fontSize: 12,
        color: '#8b5cf6',
    },
});

const FilesList = ({ fileEntry }: { fileEntry: FileCommitData }) => {
    const [expanded, setExpanded] = useState(false);
    const [showCommits, setShowCommits] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <View>
            <TouchableOpacity
                onPress={toggleExpand}
                activeOpacity={0.7}
                style={styles.collapsibleHeader}
            >
                <Text style={styles.collapsibleTitle}>
                    Files ({fileEntry.fileStats.length})
                </Text>
                <Text style={styles.collapsibleIcon}>
                    {expanded ? '▲ Collapse' : '▼ Expand'}
                </Text>
            </TouchableOpacity>

            {expanded && (
                <View>
                    <View style={styles.controlsRow}>
                        <Pressable
                            style={styles.checkboxContainer}
                            onPress={() => setShowCommits(!showCommits)}
                        >
                            <View style={[styles.checkbox, showCommits && styles.checkboxChecked]}>
                                {showCommits && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.checkboxLabel}>Show commit count</Text>
                        </Pressable>
                    </View>

                    {fileEntry.fileStats.map((stats, i) => (
                        <View key={i} style={styles.fileStatRow}>
                            <Text style={styles.fileStatName} numberOfLines={1}>
                                {stats.fileName}:
                            </Text>
                            <View style={styles.fileStatMetrics}>
                                {showCommits && (
                                    <>
                                        <Text style={styles.fileStatCommits}>
                                            {stats.commitCount} commits
                                        </Text>
                                        <Text style={styles.fileStatSeparator}> / </Text>
                                    </>
                                )}
                                <Text style={styles.fileStatDuration}>
                                    {stats.totalDuration.toFixed(2)} ms (Total)
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

export default FilesList;
