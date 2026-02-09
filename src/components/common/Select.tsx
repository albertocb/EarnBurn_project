import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../theme/theme';

interface Option {
    label: string;
    value: string;
}

interface SelectProps {
    label: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
}

export const Select = ({ label, options, value, onChange }: SelectProps) => {
    return (
        <View style={styles.container}>
            {!!label && <Text style={styles.label}>{label}</Text>}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.options}>
                {options.map((opt) => {
                    const isSelected = value === opt.value;
                    return (
                        <TouchableOpacity
                            key={opt.value}
                            style={[
                                styles.pill,
                                isSelected ? styles.pillSelected : styles.pillUnselected
                            ]}
                            onPress={() => onChange(opt.value)}
                        >
                            <Text style={[
                                styles.pillText,
                                isSelected ? styles.pillTextSelected : styles.pillTextUnselected
                            ]}>
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: spacing.m },
    label: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.s },
    options: { flexDirection: 'row' },
    pill: {
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.m,
        borderRadius: borderRadius.round,
        marginRight: spacing.s,
        borderWidth: 1,
    },
    pillUnselected: {
        borderColor: colors.border,
        backgroundColor: 'transparent',
    },
    pillSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary,
    },
    pillText: { ...typography.bodyBold },
    pillTextUnselected: { color: colors.text },
    pillTextSelected: { color: colors.background },
});
