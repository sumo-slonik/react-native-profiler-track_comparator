import React from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';

interface StackedBarProps {
    totalHeight: number; // Wysokość całkowita kontenera słupka
    width?: number;
    renderHeight: DimensionValue;
    layoutHeight: DimensionValue;
    passiveHeight: DimensionValue;
    backgroundColor?: string;
}

export const CHART_COLORS = {
    render: '#3b82f6',
    layout: '#f59e0b',
    passive: '#10b981',
    background: '#e5e7eb',
    empty: '#f3f4f6',
};

const StackedBar: React.FC<StackedBarProps> = ({
                                                   totalHeight,
                                                   width = 80,
                                                   renderHeight,
                                                   layoutHeight,
                                                   passiveHeight,
                                                   backgroundColor = CHART_COLORS.background,
                                               }) => {
    return (
        <View
            style={[
                styles.barStack,
                {
                    height: totalHeight,
                    width: width,
                    backgroundColor: backgroundColor,
                },
            ]}
        >
            <View
                style={[
                    styles.segment,
                    styles.passiveSegment,
                    { height: passiveHeight },
                ]}
            />
            <View
                style={[
                    styles.segment,
                    styles.layoutSegment,
                    { height: layoutHeight },
                ]}
            />
            <View
                style={[
                    styles.segment,
                    styles.renderSegment,
                    { height: renderHeight },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    barStack: {
        flexDirection: 'column-reverse', // Budujemy od dołu
        position: 'relative',
        borderRadius: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        overflow: 'hidden', // Ważne, żeby segmenty nie wystawały poza zaokrąglenia
    },
    segment: {
        width: '100%',
    },
    passiveSegment: {
        backgroundColor: CHART_COLORS.passive,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
    },
    layoutSegment: {
        backgroundColor: CHART_COLORS.layout,
    },
    renderSegment: {
        backgroundColor: CHART_COLORS.render,
    },
});

export default StackedBar;
