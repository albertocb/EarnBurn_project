import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { borderRadius, colors, spacing } from '../../theme/theme';

interface CardProps {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
}

export const Card = ({ children, style }: CardProps) => {
    return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        padding: spacing.m,
        borderRadius: borderRadius.l,
        marginBottom: spacing.m,
        borderWidth: 1,
        borderColor: colors.border,
    },
});
