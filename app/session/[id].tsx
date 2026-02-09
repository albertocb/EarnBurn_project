import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppScreen } from '../../src/components/AppScreen';
import { Card } from '../../src/components/common/Card';
import { programRepository } from '../../src/repositories/programRepository';
import { borderRadius, colors, spacing, typography } from '../../src/theme/theme';

export default function SessionDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [session, setSession] = useState<any>(null);
    const [exercises, setExercises] = useState<any[]>([]);

    useEffect(() => {
        if (id) {
            loadData(id as string);
        }
    }, [id]);

    const loadData = async (sessionId: string) => {
        try {
            const data = await programRepository.getSessionDetails(sessionId);
            setSession(data.session);
            setExercises(data.exercises);
        } catch (e) {
            console.error(e);
        }
    };

    if (!session) return (
        <AppScreen contentContainerStyle={styles.container}>
            <Text style={styles.loading}>Loading...</Text>
        </AppScreen>
    );

    return (
        <AppScreen contentContainerStyle={styles.scroll}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>{session.name}</Text>
            </View>


            {exercises.map((exercise, index) => (
                <Card key={exercise.id} style={styles.exerciseCard}>
                    <View style={styles.exerciseHeader}>
                        <Text style={styles.exerciseIndex}>{index + 1}</Text>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                    </View>

                    <View style={styles.setsContainer}>
                        {exercise.sets.map((set: any, sIndex: number) => (
                            <View key={sIndex} style={styles.setRow}>
                                <View style={styles.setSimple}>
                                    <Text style={styles.setLabel}>{set.numSets} x {set.targetReps}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </Card>
            ))}


            <View style={styles.footer}>
                <TouchableOpacity style={styles.startButton} onPress={() => {
                    // Future: Start specific workout from here
                    router.push('/(tabs)/workout');
                }}>
                    <Text style={styles.startButtonText}>Start Workout</Text>
                </TouchableOpacity>
            </View>
        </AppScreen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loading: { ...typography.body, color: colors.textSecondary, margin: spacing.l },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.l,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceHighlight,
    },
    backButton: { marginRight: spacing.m },
    title: { ...typography.h2, color: colors.primary },
    scroll: { padding: spacing.l },
    exerciseCard: {
        padding: spacing.m,
        marginBottom: spacing.m,
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.s,
    },
    exerciseIndex: {
        ...typography.h3,
        color: colors.textSecondary,
        width: 30,
    },
    exerciseName: {
        ...typography.h3,
        color: colors.text,
        flex: 1,
    },
    setsContainer: {
        paddingLeft: 30,
    },
    setRow: {
        marginBottom: spacing.xs,
    },
    setSimple: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    setLabel: {
        ...typography.body,
        color: colors.accent,
        fontWeight: 'bold',
    },
    footer: {
        padding: spacing.l,
        borderTopWidth: 1,
        borderTopColor: colors.surfaceHighlight,
    },
    startButton: {
        backgroundColor: colors.primary,
        padding: spacing.m,
        borderRadius: borderRadius.m,
        alignItems: 'center',
    },
    startButtonText: {
        ...typography.button,
        color: colors.background,
    }
});
