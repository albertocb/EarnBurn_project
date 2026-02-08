import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { useWorkoutDraftStore } from '../../src/store/workoutDraftStore';
import { borderRadius, colors, spacing, typography } from '../../src/theme/theme';

// --- Placeholder Data Types ---
interface Exercise {
    id: string;
    name: string;
    description: string;
}

interface ExerciseSlot {
    id: string;
    primary: Exercise;
    alternatives: Exercise[];
    prescription: string; // "3-4 sets • 8-12 reps"
    currentChoice?: Exercise; // undefined means primary
}

interface WorkoutDay {
    id: string;
    name: string;
    focus: string;
    exercises: ExerciseSlot[];
}

// --- Placeholder Data ---
const PLACEHOLDER_PLAN: WorkoutDay[] = [
    {
        id: 'day-a',
        name: 'Day A',
        focus: 'Upper Body Focus',
        exercises: [
            {
                id: 'ex-1',
                primary: { id: 'bp', name: 'Barbell Bench Press', description: 'Compound • Chest • Barbell' },
                alternatives: [
                    { id: 'dbp', name: 'Dumbbell Bench Press', description: 'Compound • Chest • Dumbbell' },
                    { id: 'mp', name: 'Machine Chest Press', description: 'Compound • Chest • Machine' },
                ],
                prescription: '3 sets • 5-8 reps @ 2 RIR',
            },
            {
                id: 'ex-2',
                primary: { id: 'row', name: 'Barbell Row', description: 'Compound • Back • Barbell' },
                alternatives: [
                    { id: 'db-row', name: 'Dumbbell Row', description: 'Compound • Back • Dumbbell' },
                    { id: 'cable-row', name: 'Cable Row', description: 'Compound • Back • Cable' },
                ],
                prescription: '3 sets • 8-10 reps @ 2 RIR',
            },
            {
                id: 'ex-3',
                primary: { id: 'ohp', name: 'Overhead Press', description: 'Compound • Shoulders • Barbell' },
                alternatives: [
                    { id: 'db-ohp', name: 'Dumbbell Shoulder Press', description: 'Compound • Shoulders • Dumbbell' },
                    { id: 'machine-ohp', name: 'Machine Shoulder Press', description: 'Compound • Shoulders • Machine' },
                ],
                prescription: '3 sets • 8-12 reps @ 1 RIR',
            },
        ],
    },
    {
        id: 'day-b',
        name: 'Day B',
        focus: 'Lower Body Focus',
        exercises: [
            {
                id: 'ex-4',
                primary: { id: 'squat', name: 'Back Squat', description: 'Compound • Legs • Barbell' },
                alternatives: [
                    { id: 'leg-press', name: 'Leg Press', description: 'Compound • Legs • Machine' },
                    { id: 'hack-squat', name: 'Hack Squat', description: 'Compound • Legs • Machine' },
                ],
                prescription: '3 sets • 5-8 reps @ 2 RIR',
            },
            {
                id: 'ex-5',
                primary: { id: 'rdl', name: 'Romanian Deadlift', description: 'Compound • Hamstrings • Barbell' },
                alternatives: [
                    { id: 'leg-curl', name: 'Seated Leg Curl', description: 'Isolation • Hamstrings • Machine' },
                ],
                prescription: '3 sets • 8-10 reps @ 2 RIR',
            },
        ],
    },
    {
        id: 'day-c',
        name: 'Day C',
        focus: 'Full Body',
        exercises: [
            {
                id: 'ex-6',
                primary: { id: 'dl', name: 'Deadlift', description: 'Compound • Posterior Chain • Barbell' },
                alternatives: [
                    { id: 'trap-dl', name: 'Trap Bar Deadlift', description: 'Compound • Legs • Trap Bar' }
                ],
                prescription: '3 sets • 3-5 reps @ 2 RIR',
            },
        ],
    },
];

export default function MicrocycleScreen() {
    const { week, title, type } = useLocalSearchParams();
    const router = useRouter();
    const { setDraft } = useWorkoutDraftStore();

    // Local state for collapsed days
    const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({
        'day-a': true, // Default expand first day
    });

    // Local state for swapped exercises: Record<slotId, exerciseId>
    const [swaps, setSwaps] = useState<Record<string, string>>({});

    // Modal state
    const [swapModalVisible, setSwapModalVisible] = useState(false);
    const [activeSwapSlot, setActiveSwapSlot] = useState<ExerciseSlot | null>(null);

    const toggleDay = (dayId: string) => {
        setExpandedDays((prev) => ({ ...prev, [dayId]: !prev[dayId] }));
    };

    const handleSwapPress = (slot: ExerciseSlot) => {
        setActiveSwapSlot(slot);
        setSwapModalVisible(true);
    };

    const confirmSwap = (exercise: Exercise) => {
        if (activeSwapSlot) {
            setSwaps((prev) => ({ ...prev, [activeSwapSlot.id]: exercise.id }));
            setSwapModalVisible(false);
            setActiveSwapSlot(null);
        }
    };

    const undoSwap = (slotId: string) => {
        setSwaps((prev) => {
            const newState = { ...prev };
            delete newState[slotId];
            return newState;
        });
    };

    const getActiveExercise = (slot: ExerciseSlot): Exercise => {
        const swappedId = swaps[slot.id];
        if (swappedId) {
            return slot.alternatives.find((a) => a.id === swappedId) || slot.primary;
        }
        return slot.primary;
    };

    const handleStartWorkout = (day: WorkoutDay) => {
        const draftExercises = day.exercises.map(slot => {
            const activeEx = getActiveExercise(slot);
            return {
                id: activeEx.id,
                name: activeEx.name,
                description: activeEx.description,
                prescription: slot.prescription,
            };
        });

        setDraft({
            title: day.focus,
            week: typeof week === 'string' ? week : '1',
            dayId: day.id,
            dayName: day.name,
            exercises: draftExercises,
        });

        router.push('/workout');
    };

    const displayTitle = typeof title === 'string' ? title : `Week ${week} Microcycle`;
    const subtitle = "Open the planned workout. If equipment is taken, swap to an alternative.";

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <Stack.Screen
                options={{
                    title: '',
                    headerBackTitle: 'Plan',
                    headerStyle: { backgroundColor: colors.background },
                    headerTintColor: colors.text,
                }}
            />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>{displayTitle}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </View>

                {PLACEHOLDER_PLAN.map((day) => {
                    const isExpanded = !!expandedDays[day.id];
                    return (
                        <View key={day.id} style={styles.dayContainer}>
                            <Pressable
                                onPress={() => toggleDay(day.id)}
                                style={[styles.dayHeader, isExpanded && styles.dayHeaderActive]}
                            >
                                <View>
                                    <Text style={styles.dayTitle}>{day.name}</Text>
                                    <Text style={styles.dayFocus}>{day.focus}</Text>
                                </View>
                                <Ionicons
                                    name={isExpanded ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color={colors.textSecondary}
                                />
                            </Pressable>

                            {isExpanded && (
                                <View style={styles.exercisesList}>
                                    {day.exercises.map((slot) => {
                                        const activeEx = getActiveExercise(slot);
                                        const isSwapped = !!swaps[slot.id];

                                        return (
                                            <Card key={slot.id} style={styles.exerciseCard}>
                                                <View style={styles.exerciseRow}>
                                                    <View style={styles.exerciseInfo}>
                                                        <Text style={styles.exerciseName}>{activeEx.name}</Text>
                                                        <Text style={styles.exerciseDesc}>{activeEx.description}</Text>
                                                        <View style={styles.prescriptionContainer}>
                                                            <Ionicons name="fitness-outline" size={14} color={colors.primary} />
                                                            <Text style={styles.prescriptionText}>{slot.prescription}</Text>
                                                        </View>
                                                        {isSwapped && (
                                                            <View style={styles.badge}>
                                                                <Text style={styles.badgeText}>Substituted</Text>
                                                            </View>
                                                        )}
                                                    </View>

                                                    <View style={styles.actions}>
                                                        {isSwapped ? (
                                                            <Pressable
                                                                onPress={() => undoSwap(slot.id)}
                                                                style={styles.undoButton}
                                                            >
                                                                <Ionicons name="refresh" size={18} color={colors.accent} />
                                                                <Text style={styles.undoText}>Undo</Text>
                                                            </Pressable>
                                                        ) : (
                                                            <Pressable
                                                                onPress={() => handleSwapPress(slot)}
                                                                style={styles.swapButton}
                                                            >
                                                                <Ionicons name="swap-horizontal" size={20} color={colors.secondary} />
                                                            </Pressable>
                                                        )}
                                                    </View>
                                                </View>
                                            </Card>
                                        );
                                    })}

                                    <Button
                                        title="Start This Workout"
                                        onPress={() => handleStartWorkout(day)}
                                        style={{ marginTop: spacing.m }}
                                    />
                                </View>
                            )}
                        </View>
                    );
                })}

                <View style={styles.footerSpace} />
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    title="Start Workout"
                    onPress={() => alert('Workout logging coming soon!')}
                />
            </View>

            {/* Swap Modal */}
            <Modal
                visible={swapModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSwapModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Swap Exercise</Text>
                            <Pressable onPress={() => setSwapModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </Pressable>
                        </View>
                        <Text style={styles.modalSubtitle}>
                            Alternatives for <Text style={{ fontWeight: '700' }}>{activeSwapSlot?.primary.name}</Text>
                        </Text>

                        {activeSwapSlot?.alternatives.map((alt) => (
                            <Pressable
                                key={alt.id}
                                style={styles.altOption}
                                onPress={() => confirmSwap(alt)}
                            >
                                <Text style={styles.altName}>{alt.name}</Text>
                                <Text style={styles.altDesc}>{alt.description}</Text>
                            </Pressable>
                        ))}
                        {activeSwapSlot?.alternatives.length === 0 && (
                            <Text style={{ color: colors.textDim, fontStyle: 'italic', marginTop: spacing.m }}>
                                No alternatives available.
                            </Text>
                        )}

                        <View style={{ marginTop: spacing.l }}>
                            <Button
                                title="Cancel"
                                variant="secondary"
                                onPress={() => setSwapModalVisible(false)}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.l },
    headerContainer: { marginBottom: spacing.l },
    title: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
    subtitle: { ...typography.body, color: colors.textSecondary },

    dayContainer: { marginBottom: spacing.m },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: spacing.m,
        borderRadius: borderRadius.m,
        marginBottom: 2,
    },
    dayHeaderActive: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        backgroundColor: colors.surfaceHighlight,
    },
    dayTitle: { ...typography.h3, color: colors.text },
    dayFocus: { ...typography.caption, color: colors.secondary },

    exercisesList: {
        backgroundColor: colors.surface, // Slightly darker than card
        borderBottomLeftRadius: borderRadius.m,
        borderBottomRightRadius: borderRadius.m,
        padding: spacing.s,
    },
    exerciseCard: {
        marginBottom: spacing.s,
        backgroundColor: '#252525', // Slightly lighter than surface
        borderWidth: 0,
    },
    exerciseRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    exerciseInfo: { flex: 1, marginRight: spacing.s },
    exerciseName: { ...typography.bodyBold, color: colors.text, fontSize: 16 },
    exerciseDesc: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs, fontSize: 12 },

    prescriptionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
        backgroundColor: 'rgba(212, 255, 0, 0.1)', // Primary low opacity
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.s,
        paddingVertical: 2,
        borderRadius: borderRadius.s,
    },
    prescriptionText: { ...typography.caption, color: colors.primary, marginLeft: 4, fontWeight: '600' },

    badge: {
        marginTop: spacing.s,
        backgroundColor: colors.surfaceHighlight,
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.s,
        paddingVertical: 2,
        borderRadius: borderRadius.s,
        borderWidth: 1,
        borderColor: colors.accent,
    },
    badgeText: { ...typography.caption, color: colors.accent, fontSize: 10, fontWeight: '700' },

    actions: { justifyContent: 'center', alignItems: 'center' },
    swapButton: {
        padding: spacing.s,
        backgroundColor: colors.surfaceHighlight,
        borderRadius: borderRadius.round,
    },
    undoButton: {
        alignItems: 'center',
    },
    undoText: { ...typography.caption, color: colors.accent, fontSize: 10, marginTop: 2 },

    footerSpace: { height: 80 },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.l,
        backgroundColor: colors.surface, // Or transparent with blur
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: colors.overlay,
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing.l,
        minHeight: '40%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.m,
    },
    modalTitle: { ...typography.h2, color: colors.text },
    modalSubtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.l },
    altOption: {
        padding: spacing.m,
        backgroundColor: colors.background,
        borderRadius: borderRadius.m,
        marginBottom: spacing.s,
        borderWidth: 1,
        borderColor: colors.border,
    },
    altName: { ...typography.bodyBold, color: colors.text },
    altDesc: { ...typography.caption, color: colors.textDim },
});
