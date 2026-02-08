import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { VolumeStat } from '../../services/analyticsService';
import { borderRadius, colors, spacing, typography } from '../../theme/theme';
import { Card } from '../common/Card';

interface Props {
    data: VolumeStat[];
}

export const VolumeWidget = ({ data }: Props) => {
    // Simple bar chart Logic
    const maxVol = Math.max(...data.map(d => d.volume), 1);

    return (
        <Card style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="bar-chart" size={20} color={colors.primary} />
                <Text style={styles.title}>Weekly Volume (kg)</Text>
            </View>

            <View style={styles.chartContainer}>
                {data.slice(-5).map((stat, index) => (
                    <View key={index} style={styles.barGroup}>
                        <View style={styles.barTrack}>
                            <View
                                style={[
                                    styles.bar,
                                    { height: `${(stat.volume / maxVol) * 100}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.label}>{new Date(stat.date).getDate()}/{new Date(stat.date).getMonth() + 1}</Text>
                    </View>
                ))}
                {data.length === 0 && <Text style={styles.emptyText}>No volume data available.</Text>}
            </View>
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
        marginBottom: spacing.l,
    },
    title: {
        ...typography.h3,
        marginLeft: spacing.s,
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 150,
        paddingBottom: spacing.s,
    },
    barGroup: {
        alignItems: 'center',
        height: '100%',
        justifyContent: 'flex-end',
        flex: 1,
    },
    barTrack: {
        height: '85%',
        width: 12,
        backgroundColor: colors.surfaceHighlight,
        borderRadius: borderRadius.s,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    bar: {
        width: '100%',
        backgroundColor: colors.primary,
        borderRadius: borderRadius.s,
    },
    label: {
        ...typography.caption,
        marginTop: spacing.xs,
        color: colors.textSecondary,
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
        position: 'absolute',
        bottom: 70,
        width: '100%',
        textAlign: 'center',
    }
});
