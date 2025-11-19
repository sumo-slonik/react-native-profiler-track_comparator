import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import AddSection from './AddSection';
import RemoveSection from './RemoveSection';

interface DashboardControlsProps {
    count: number;
    onAdd: () => void;
    onRemove: () => void;
    isRemoveDisabled: boolean;
}

const DashboardControls: React.FC<DashboardControlsProps> = ({
                                                                 count,
                                                                 onAdd,
                                                                 onRemove,
                                                                 isRemoveDisabled,
                                                             }) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 640;

    return (
        <View style={[styles.wrapper, isMobile && styles.wrapperMobile]}>
            <View style={[styles.group, isMobile && styles.groupMobile]}>
                <Text style={styles.title}>Liczba grup: {count}</Text>

                <AddSection handleAddSection={onAdd} />
                <RemoveSection
                    isDisabled={isRemoveDisabled}
                    handleRemoveSection={onRemove}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    wrapperMobile: {
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    group: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    groupMobile: {
        flexDirection: 'column',
        alignItems: 'stretch',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#374151',
        marginRight: 16,
    },
});

export default DashboardControls;
