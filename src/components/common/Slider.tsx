import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../theme/theme';

interface SliderProps {
    label: string;
    min: number;
    max: number;
    step?: number;
    value: number;
    onValueChange: (value: number) => void;
    unit?: string;
}

export const Slider = ({ label, min, max, step = 1, value, onValueChange, unit = '' }: SliderProps) => {
    const [width, setWidth] = useState(0);

    const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);

    const handleTouch = (x: number) => {
        if (width === 0) return;
        const newPercent = Math.min(Math.max(x / width, 0), 1);
        const rawValue = min + newPercent * (max - min);
        const steppedValue = Math.round(rawValue / step) * step;
        onValueChange(Math.min(Math.max(steppedValue, min), max));
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {!!label && <Text style={styles.label}>{label}</Text>}
                <Text style={styles.value}>{value}{unit}</Text>
            </View>
            <View
                style={styles.trackContainer}
                onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
                onTouchStart={(e) => handleTouch(e.nativeEvent.locationX)}
                onTouchMove={(e) => handleTouch(e.nativeEvent.locationX)}
            >
                <View style={styles.track} />
                <View style={[styles.fill, { width: `${percentage * 100}%` }]} />
                <View style={[styles.thumb, { left: `${percentage * 100}%` }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.m,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.s,
    },
    label: { ...typography.body, color: colors.textSecondary },
    value: { ...typography.bodyBold, color: colors.primary },
    trackContainer: {
        height: 40, // Expanded touch area
        justifyContent: 'center',
    },
    track: {
        height: 6,
        backgroundColor: colors.surfaceHighlight,
        borderRadius: borderRadius.round,
        width: '100%',
        position: 'absolute',
    },
    fill: {
        height: 6,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.round,
        position: 'absolute',
    },
    thumb: {
        width: 24,
        height: 24,
        backgroundColor: colors.text,
        borderRadius: borderRadius.round,
        position: 'absolute',
        marginLeft: -12, // Center the thumb
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});
