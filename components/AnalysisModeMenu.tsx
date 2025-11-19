import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Pressable,
    Modal,
    FlatList,
    TextInput,
} from 'react-native';

export type AnalysisMode = 'total' | 'component';
export type MetricType = 'actual' | 'self';

interface AnalysisModeMenuProps {
    mode: AnalysisMode;
    onModeChange: (mode: AnalysisMode) => void;

    metricType: MetricType;
    onMetricChange: (type: MetricType) => void;

    selectedComponent: string | null;
    onComponentChange: (componentName: string) => void;
    componentList: string[];
}

const AnalysisModeMenu: React.FC<AnalysisModeMenuProps> = ({
                                                               mode,
                                                               onModeChange,
                                                               metricType,
                                                               onMetricChange,
                                                               selectedComponent,
                                                               onComponentChange,
                                                               componentList,
                                                           }) => {
    const [isModalVisible, setModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');

    const filteredList = componentList.filter(name =>
        name.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleSelect = (name: string) => {
        onComponentChange(name);
        setModalVisible(false);
        setSearchText('');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Analysis Mode:</Text>

            <View style={styles.modeSwitch}>
                <TouchableOpacity
                    style={[styles.modeButton, mode === 'total' && styles.modeButtonActive]}
                    onPress={() => onModeChange('total')}
                >
                    <Text style={[styles.modeText, mode === 'total' && styles.modeTextActive]}>
                        Total commits
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.modeButton, mode === 'component' && styles.modeButtonActive]}
                    onPress={() => onModeChange('component')}
                >
                    <Text style={[styles.modeText, mode === 'component' && styles.modeTextActive]}>
                        Per Component
                    </Text>
                </TouchableOpacity>
            </View>

            {mode === 'component' && (
                <View style={styles.componentOptions}>

                    <View style={styles.controlGroup}>
                        <Text style={styles.subLabel}>Select Component:</Text>
                        <TouchableOpacity
                            style={styles.comboBox}
                            onPress={() => setModalVisible(true)}
                        >
                            <Text style={styles.comboBoxText}>
                                {selectedComponent || '-- Click to select --'}
                            </Text>
                            <Text style={styles.comboBoxArrow}>▼</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.radioRow}>
                        <RadioButton
                            label="Total Actual Duration"
                            selected={metricType === 'actual'}
                            onSelect={() => onMetricChange('actual')}
                        />
                        <RadioButton
                            label="Total Self Duration"
                            selected={metricType === 'self'}
                            onSelect={() => onMetricChange('self')}
                        />
                    </View>
                </View>
            )}

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Component</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.closeButton}>Close</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search..."
                            value={searchText}
                            onChangeText={setSearchText}
                            autoFocus={false}
                        />

                        <FlatList
                            data={filteredList}
                            keyExtractor={(item) => item}
                            style={{ maxHeight: 400 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.listItem,
                                        item === selectedComponent && styles.listItemSelected
                                    ]}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text style={[
                                        styles.listItemText,
                                        item === selectedComponent && styles.listItemTextSelected
                                    ]}>
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No components found</Text>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const RadioButton = ({ label, selected, onSelect }: { label: string, selected: boolean, onSelect: () => void }) => (
    <Pressable style={styles.radioContainer} onPress={onSelect}>
        <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
            {selected && <View style={styles.radioInner} />}
        </View>
        <Text style={styles.radioLabel}>{label}</Text>
    </Pressable>
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    modeSwitch: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: 4,
        marginBottom: 8,
    },
    modeButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    modeButtonActive: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    modeText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
    },
    modeTextActive: {
        color: '#4f46e5',
        fontWeight: '600',
    },
    componentOptions: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    controlGroup: {
        marginBottom: 12,
    },
    subLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 4,
    },
    comboBox: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    comboBoxText: {
        fontSize: 14,
        color: '#1f2937',
    },
    comboBoxArrow: {
        fontSize: 12,
        color: '#6b7280',
    },
    radioRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 8,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    radioOuterSelected: {
        borderColor: '#4f46e5',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4f46e5',
    },
    radioLabel: {
        fontSize: 14,
        color: '#374151',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 500,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    closeButton: {
        color: '#4f46e5',
        fontWeight: '600',
        padding: 4,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
        fontSize: 14,
    },
    listItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    listItemSelected: {
        backgroundColor: '#f0f9ff',
    },
    listItemText: {
        fontSize: 14,
        color: '#374151',
    },
    listItemTextSelected: {
        color: '#4f46e5',
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        color: '#9ca3af',
        marginTop: 20,
    }
});

export default AnalysisModeMenu;
