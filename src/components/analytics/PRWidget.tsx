import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OneRepMax } from '../../services/analyticsService';
import { colors, spacing, typography } from '../../theme/theme';
import { Card } from '../common/Card';

interface Props {
    prs: OneRepMax[];
}

export const PRWidget = ({ prs }: Props) => {
    if (!prs.length) {
        return (
            <Card style={styles.container}>
                <View style={styles.header}>
                    <Ionicons name="trophy" size={20} color={colors.accent} />
                    <Text style={styles.title}>Recent Records</Text>
                </View>
                <Text style={styles.emptyText}>No personal records yet. Start lifting!</Text>
            </Card>
        );
    }

    return (
        <Card style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="trophy" size={20} color={colors.accent} />
                <Text style={styles.title}>Estimated 1RM Records</Text>
            </View>

            {prs.map((pr, index) => (
                <View key={index} style={styles.row}>
                    <Text style={styles.exerciseName}>{pr.exerciseName}</Text>
                    <View style={styles.valueContainer}>
                        <Text style={styles.weight}>{pr.weight}kg</Text>
                        <Text style={styles.date}>{new Date(pr.date).toLocaleDateString()}</Text>
                    </View>
                </View>
            ))}
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.m,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.m,
    },
    title: {
        ...typography.h3,
        marginLeft: spacing.s,
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.s,
        paddingVertical: spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceHighlight,
    },
    exerciseName: {
        ...typography.body,
        fontWeight: '600',
        color: colors.text,
    },
    valueContainer: {
        alignItems: 'flex-end',
    },
    weight: {
        ...typography.h3,
        color: colors.accent,
    },
    date: {
        ...typography.caption,
        color: colors.textSecondary,
    },
});
