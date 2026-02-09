import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/common/Button';
import { workoutDayStatusRepository } from '../../src/repositories/workoutDayStatusRepository';
import { workoutRepository } from '../../src/repositories/workoutRepository';
import { useTimerStore } from '../../src/store/timerStore';
import { useWorkoutDraftStore } from '../../src/store/workoutDraftStore';
import { borderRadius, colors, spacing, typography } from '../../src/theme/theme';

interface SetLog {
    id: string;
    reps: number;
    weight: number;
    rpe?: number;
    completed: boolean;
    weightText?: string;
    repsText?: string;
}

interface Exercise {
    id: string;
    name: string;
    sets: SetLog[];
    targetReps: string;
    targetRPE?: number;
    rest?: number; // seconds
    prescription?: string;
}

// Mock Workout Data
const MOCK_WORKOUT: Exercise[] = [
    {
        id: '1',
        name: 'Barbell Squat',
        targetReps: '6-8',
        targetRPE: 8,
        rest: 180,
        sets: [
            { id: 's1', reps: 8, weight: 100, completed: false },
            { id: 's2', reps: 8, weight: 100, completed: false },
            { id: 's3', reps: 8, weight: 100, completed: false },
        ]
    },
    {
        id: '2',
        name: 'Bench Press',
        targetReps: '8-10',
        targetRPE: 8,
        rest: 120,
        sets: [
            { id: 's4', reps: 10, weight: 80, completed: false },
            { id: 's5', reps: 10, weight: 80, completed: false },
        ]
    }
];

export default function WorkoutScreen() {
    const router = useRouter();
    const { draft, clearDraft } = useWorkoutDraftStore();
    const [exercises, setExercises] = useState<Exercise[]>(MOCK_WORKOUT);

    useEffect(() => {
        if (draft) {
            const draftExercises: Exercise[] = draft.exercises.map(ex => ({
                id: ex.id,
                name: ex.name,
                targetReps: '8-12', // Fallback
                prescription: ex.prescription,
                sets: [
                    { id: `s-${ex.id}-1`, reps: 0, weight: 0, completed: false },
                    { id: `s-${ex.id}-2`, reps: 0, weight: 0, completed: false },
                    { id: `s-${ex.id}-3`, reps: 0, weight: 0, completed: false },
                ]
            }));
            setExercises(draftExercises);
        } else {
            // Reset to empty when draft is cleared or null
            setExercises([]);
        }
    }, [draft]);

    const updateSet = (exerciseId: string, setId: string, updates: Partial<SetLog>) => {
        setExercises(prev => prev.map(ex => {
            if (ex.id !== exerciseId) return ex;
            return {
                ...ex,
                sets: ex.sets.map(s => s.id === setId ? { ...s, ...updates } : s)
            };
        }));
    };

    const toggleSetCompletion = (exerciseId: string, setId: string) => {
        setExercises(prev => prev.map(ex => {
            if (ex.id !== exerciseId) return ex;
            return {
                ...ex,
                sets: ex.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s)
            };
        }));
    };

    const handleWeightChange = (exerciseId: string, setId: string, text: string) => {
        // Parse weight
        const normalizedText = text.replace(',', '.');
        const weightVal = parseFloat(normalizedText);

        const updates: Partial<SetLog> = { weightText: text };
        if (!isNaN(weightVal)) {
            updates.weight = weightVal;
        }
        updateSet(exerciseId, setId, updates);
    };

    const handleRepsChange = (exerciseId: string, setId: string, text: string) => {
        const repsVal = parseInt(text, 10);
        const updates: Partial<SetLog> = { repsText: text };
        if (!isNaN(repsVal)) {
            updates.reps = repsVal;
        }
        updateSet(exerciseId, setId, updates);
    };

    const handleWeightBlur = (exerciseId: string, setId: string, currentText: string | undefined, currentWeight: number) => {
        if (!currentText || currentText.trim() === '') {
            updateSet(exerciseId, setId, { weight: 0, weightText: '' });
        }
    };

    const handleRepsBlur = (exerciseId: string, setId: string, currentText: string | undefined, currentReps: number) => {
        if (!currentText || currentText.trim() === '') {
            updateSet(exerciseId, setId, { reps: 0, repsText: '' });
        }
    };

    const handleFinishWorkout = async () => {
        let savedOk = false;
        try {
            // Stop Timer & Get Duration
            const { pause, getElapsedMs } = useTimerStore.getState();
            pause();
            const durationMs = getElapsedMs();
            const durationSeconds = Math.floor(durationMs / 1000);

            const sessionId = Date.now().toString();
            await workoutRepository.createSession({
                id: sessionId,
                date: new Date().toISOString(),
                durationSeconds: durationSeconds,
                durationMs: durationMs,
            });

            for (const ex of exercises) {
                for (const [index, set] of ex.sets.entries()) {
                    if (set.completed) {
                        await workoutRepository.addSet({
                            id: `${sessionId}-${ex.id}-${set.id}`,
                            workoutSessionId: sessionId,
                            exerciseName: ex.name,
                            setOrder: index,
                            weight: set.weight,
                            reps: set.reps,
                            rpe: set.rpe,
                            isWarmup: false,
                        });
                    }
                }
            }
            savedOk = true;

        } catch (e) {
            console.error('Failed to save workout', e);
            Alert.alert('Save Failed', 'Could not save workout session. Check logs.');
        }

        if (savedOk) {
            // Status Tracking Logic
            if (draft && draft.week && draft.dayId) {
                const totalExercises = exercises.length;
                const completedExercises = exercises.filter(ex => ex.sets.some(s => s.completed)).length;
                const isCompleted = completedExercises === totalExercises && totalExercises > 0;
                const status = isCompleted ? 'completed' : 'partial';

                try {
                    await workoutDayStatusRepository.setDayStatus({
                        week: draft.week,
                        dayId: draft.dayId,
                        status: status,
                        totalExercises,
                        completedExercises,
                        completedAt: new Date().toISOString()
                    });

                    const title = 'Workout Saved';
                    const message = isCompleted
                        ? 'Session marked as completed.'
                        : `Marked as incomplete (${completedExercises}/${totalExercises} exercises).`;

                    Alert.alert(title, message, [
                        {
                            text: 'OK',
                            onPress: () => {
                                clearDraft();
                                router.replace('/');
                            }
                        }
                    ]);
                } catch (saveError) {
                    console.error("Failed to save day status", saveError);
                    // Fallback alert if status save fails but workout saved
                    Alert.alert('Workout Saved', 'Session logged, but status update failed.', [
                        {
                            text: 'OK',
                            onPress: () => {
                                clearDraft();
                                router.replace('/');
                            }
                        }
                    ]);
                }
            } else {
                // Fallback for when draft metadata is missing
                Alert.alert('Workout Saved', 'Session logged locally.', [
                    {
                        text: 'OK',
                        onPress: () => {
                            clearDraft();
                            router.replace('/');
                        }
                    }
                ]);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{draft ? draft.dayName : 'Push Hypertrophy'}</Text>
                    <Text style={styles.subtitle}>
                        {draft ? `Week ${draft.week} • ${draft.title}${draft.isDeload ? ' • DELOAD' : ''}` : 'Mesocycle 1 • Week 2'}
                    </Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {exercises.map((exercise) => (
                    <View key={exercise.id} style={styles.exerciseContainer}>
                        <View style={styles.exerciseHeader}>
                            <Text style={styles.exerciseName}>{exercise.name}</Text>
                            <View style={styles.targets}>
                                {exercise.prescription ? (
                                    <Text style={styles.targetText}>{exercise.prescription}</Text>
                                ) : (
                                    <>
                                        <Text style={styles.targetText}>{exercise.targetReps} Reps</Text>
                                        <Text style={styles.targetText}>@ RPE {exercise.targetRPE ?? 8}</Text>
                                    </>
                                )}
                            </View>
                        </View>

                        {exercise.sets.map((set, index) => (
                            <View
                                key={set.id}
                                style={[styles.setRow, set.completed && styles.setRowCompleted]}
                            >
                                <View style={styles.setIndex}>
                                    <Text style={[styles.setNumber, set.completed && styles.completedText]}>{index + 1}</Text>
                                </View>

                                <View style={styles.setData}>
                                    <Text style={styles.label}>Previous</Text>
                                    <Text style={[styles.value, set.completed && styles.completedText]}>{set.weight}kg x {set.reps}</Text>
                                </View>

                                <View style={[styles.inputContainer, set.completed && styles.inputContainerCompleted]}>
                                    <TextInput
                                        style={[styles.inputValue, set.completed && styles.completedText]}
                                        value={set.weightText !== undefined ? set.weightText : String(set.weight)}
                                        onChangeText={(text) => handleWeightChange(exercise.id, set.id, text)}
                                        onBlur={() => handleWeightBlur(exercise.id, set.id, set.weightText, set.weight)}
                                        keyboardType="decimal-pad"
                                        placeholder="kg"
                                        placeholderTextColor={colors.textDim}
                                        selectTextOnFocus
                                    />
                                </View>

                                <View style={[styles.inputContainer, set.completed && styles.inputContainerCompleted]}>
                                    <TextInput
                                        style={[styles.inputValue, set.completed && styles.completedText]}
                                        value={set.repsText !== undefined ? set.repsText : String(set.reps)}
                                        onChangeText={(text) => handleRepsChange(exercise.id, set.id, text)}
                                        onBlur={() => handleRepsBlur(exercise.id, set.id, set.repsText, set.reps)}
                                        keyboardType="number-pad"
                                        placeholder="reps"
                                        placeholderTextColor={colors.textDim}
                                        selectTextOnFocus
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.checkCircle, set.completed && styles.checkCircleCompleted]}
                                    onPress={() => toggleSetCompletion(exercise.id, set.id)}
                                >
                                    {set.completed && <Ionicons name="checkmark" size={20} color={colors.background} />}
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                ))}

                <Button
                    title="Finish Workout"
                    onPress={handleFinishWorkout}
                    style={{ marginTop: spacing.xl, marginBottom: spacing.xl }}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        paddingHorizontal: spacing.l,
        paddingBottom: spacing.m,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: { ...typography.h1, color: colors.primary, fontSize: 28 },
    subtitle: { ...typography.body, color: colors.textSecondary },
    timerChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceHighlight,
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s,
        borderRadius: borderRadius.round,
        gap: 4
    },
    timerText: { ...typography.bodyBold, color: colors.primary },
    scroll: { padding: spacing.l },
    exerciseContainer: { marginBottom: spacing.xl },
    exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.m, alignItems: 'flex-end' },
    exerciseName: { ...typography.h2, color: colors.text },
    targets: { flexDirection: 'row', gap: spacing.m },
    targetText: { ...typography.caption, color: colors.textDim },

    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        marginBottom: spacing.s,
        padding: spacing.m,
        borderRadius: borderRadius.m,
        justifyContent: 'space-between'
    },
    setRowCompleted: {
        backgroundColor: colors.success + '20', // 20% opacity
    },
    setIndex: { width: 24, alignItems: 'center' },
    setNumber: { ...typography.bodyBold, color: colors.textSecondary },
    setData: { flex: 1, paddingLeft: spacing.m },
    label: { ...typography.caption, color: colors.textDim },
    value: { ...typography.bodyBold, color: colors.textDim },

    inputContainer: {
        backgroundColor: colors.surfaceHighlight,
        borderRadius: borderRadius.s,
        paddingHorizontal: spacing.s,
        paddingVertical: spacing.s,
        flexDirection: 'row',
        alignItems: 'center',
        width: 70,
        justifyContent: 'center',
        marginRight: spacing.s,
        borderWidth: 1,
        borderColor: 'transparent'
    },
    inputContainerCompleted: {
        backgroundColor: 'transparent',
        borderColor: colors.success + '40',
    },
    inputValue: { ...typography.h3, color: colors.text, textAlign: 'center', width: '100%', padding: 0 },
    unit: { ...typography.caption, color: colors.textDim },

    checkCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center'
    },
    checkCircleCompleted: {
        backgroundColor: colors.success,
    },
    completedText: {
        color: colors.success,
    }
});
