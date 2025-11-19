import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface MeasurementToggleProps {
    checked: boolean;
    onToggle: (newValue: boolean) => void;
}

const MeasurementToggle: React.FC<MeasurementToggleProps> = ({
                                                                 checked,
                                                                 onToggle,
                                                             }) => {
    return (
        <View style={styles.toggleWrapper}>
            <Pressable
                style={styles.toggleButton}
                onPress={() => onToggle(!checked)}
            >
                <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                    {checked && <Text style={styles.checkboxCheck}>✓</Text>}
                </View>
                <Text style={styles.toggleText}>
                    Show/Hide measurement count on chart
                </Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    toggleWrapper: {
        marginTop: 24,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 4,
        marginRight: 8,
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
        fontSize: 14,
        fontWeight: 'bold',
    },
    toggleText: {
        color: '#374151',
        fontWeight: '500',
    },
});

export default MeasurementToggle;
