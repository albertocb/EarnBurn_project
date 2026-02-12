import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../theme/theme';

interface InputProps extends TextInputProps {
    label: string;
    suffix?: string;
}

export const Input = ({ label, suffix, style, ...props }: InputProps) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={colors.textDim}
                    keyboardAppearance="dark"
                    {...props}
                />
                {suffix && <Text style={styles.suffix}>{suffix}</Text>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.m,
    },
    label: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceHighlight,
        borderRadius: borderRadius.m,
        paddingHorizontal: spacing.m,
        height: 50,
    },
    input: {
        flex: 1,
        ...typography.bodyBold,
        height: '100%',
    },
    suffix: {
        fontSize: typography.body.fontSize,
        fontWeight: typography.body.fontWeight,
        color: colors.textDim,
        marginLeft: spacing.s,
    },
});
