import React from 'react';
import { Platform, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../theme/theme';

interface SectionHeaderProps {
    title: string;
    style?: ViewStyle;
    variant?: 'accentBar' | 'pillDivider';
    icon?: string;
}

export const SectionHeader = ({ title, style, variant = 'accentBar', icon }: SectionHeaderProps) => {
    if (variant === 'pillDivider') {
        return (
            <View style={[styles.pillContainer, style]}>
                <View style={styles.divider} />
                <View style={styles.pill}>
                    <View style={styles.pillContent}>
                        <Text style={styles.pillIcon}>{icon || '✨'}</Text>
                        <Text style={styles.pillTitle}>{title}</Text>
                    </View>
                </View>
                <View style={styles.divider} />
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            <View style={styles.accentBar} />
            <Text style={styles.title}>{title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.m,
        marginTop: spacing.l,
    },
    accentBar: {
        width: 4,
        height: 20,
        backgroundColor: colors.primary,
        borderRadius: 2,
        marginRight: spacing.s,
    },
    title: {
        ...typography.sectionHeader,
        color: colors.text,
    },
    // Pill Divider Variant
    pillContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.m,
        marginTop: spacing.l,
    },
    pill: {
        backgroundColor: colors.surfaceHighlight,
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s,
        borderRadius: borderRadius.round,
        marginHorizontal: spacing.s,
        borderWidth: 1,
        borderColor: colors.border,
        flexShrink: 1,
    },
    pillContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        // Visually center text/emoji on Android using translateY
        transform: [{ translateY: Platform.OS === 'android' ? 2 : 0 }],
    },
    pillIcon: {
        fontSize: 18,
        lineHeight: 22,
        marginRight: spacing.s,
        color: colors.text,
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    pillTitle: {
        ...typography.sectionHeader,
        fontSize: 18,
        lineHeight: 22,
        color: colors.text,
        textAlign: 'center',
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
        opacity: 0.5,
    },
});
