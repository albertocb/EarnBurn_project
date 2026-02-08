import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../theme/theme';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline';
    loading?: boolean;
}

export const Button = ({ title, variant = 'primary', loading, style, ...props }: ButtonProps) => {
    const isOutline = variant === 'outline';
    const isSecondary = variant === 'secondary';

    const bg = isOutline ? 'transparent' : isSecondary ? colors.surfaceHighlight : colors.primary;
    const textColor = isOutline ? colors.primary : isSecondary ? colors.text : colors.background;
    const borderColor = isOutline ? colors.primary : 'transparent';

    return (
        <TouchableOpacity
            style={[
                styles.container,
                { backgroundColor: bg, borderColor, borderWidth: isOutline ? 2 : 0 },
                style,
            ]}
            activeOpacity={0.8}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={textColor} />
            ) : (
                <Text style={[styles.text, { color: textColor }]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: spacing.m,
        paddingHorizontal: spacing.l,
        borderRadius: borderRadius.round,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56, // Big click area
    },
    text: {
        ...typography.button,
    },
});
