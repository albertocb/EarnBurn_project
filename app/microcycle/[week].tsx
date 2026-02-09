import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { exercises as allExercises } from '../../src/data/exercises';
import { useProgramStore } from '../../src/store/programStore';
import { useWorkoutDraftStore } from '../../src/store/workoutDraftStore';
import { borderRadius, colors, spacing, typography } from '../../src/theme/theme';

// --- Types ---
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

// --- Dynamic Plan Generator ---
const generatePlan = (
    mesoId: string | undefined,
    macrocycles: any[]
): WorkoutDay[] => {
    // 1. Find Mesocycle
    let mesocycle = null;
    for (const macro of macrocycles) {
        const found = macro.mesocycles.find((m: any) => m.id === mesoId);
        if (found) {
            mesocycle = found;
            break;
        }
    }

    // Default Configuration (Fallback)
    const strategy = mesocycle?.splitStrategy || 'Full Body';
    const sessions = mesocycle?.sessionsPerWeek || 5;
    const volumePreset = mesocycle?.volumePreset || 'Hypertrophy';

    // Volume Constants
    const weeklySets = volumePreset === 'Hypertrophy' ? 12 : 6;
    const setsPerSession = Math.max(2, Math.round(weeklySets / sessions));
    const repRange = volumePreset === 'Hypertrophy' ? '8-12' : '4-6';
    const rir = volumePreset === 'Hypertrophy' ? '2 RIR' : '3 RIR';
    const prescription = `${setsPerSession} sets • ${repRange} reps @ ${rir}`;

    const days: WorkoutDay[] = [];

    // Helper to find exercises by criteria
    const findEx = (pattern: string, group?: string, excludeIds: string[] = []) => {
        return allExercises.find(e =>
            e.pattern === pattern &&
            (!group || e.group === group) &&
            !excludeIds.includes(e.id)
        );
    };

    const findAlts = (primaryId: string, pattern: string, group?: string) => {
        return allExercises
            .filter(e => e.pattern === pattern && (!group || e.group === group) && e.id !== primaryId)
            .slice(0, 2);
    };

    // 2. Generate Days
    for (let i = 1; i <= sessions; i++) {
        // Simple Rotation Logic
        // Day 1: Squat + Push (Horizontal) + Pull (Vertical)
        // Day 2: Hinge + Push (Vertical) + Pull (Horizontal)
        // Day 3: Squat + Push (Incline/Iso) + Pull (Iso/Vertical) ... etc

        const dayExercises: ExerciseSlot[] = [];
        const usedIds: string[] = [];

        // --- Slot 1: Legs (Squat vs Hinge) ---
        const legPattern = i % 2 !== 0 ? 'Squat' : 'Hinge';
        const legEx = findEx(legPattern, 'Lower', usedIds);

        if (legEx) {
            usedIds.push(legEx.id);
            dayExercises.push({
                id: `d${i}-s1`,
                primary: legEx,
                alternatives: findAlts(legEx.id, legPattern, 'Lower'),
                prescription // Distribute volume
            });
        }

        // --- Slot 2: Push (Horizontal vs Vertical) ---
        const pushPattern = i % 2 !== 0 ? 'Push' : 'Push'; // Simplify to generic Push for now, or rotate equipment
        // Let's try to rotate specific exercises by index if possible, 
        // but for MVP just picking distinct Push exercises is good enough.
        // We can filter by 'group' to ensure Upper.
        const pushEx = allExercises.find(e =>
            e.group === 'Upper' &&
            e.pattern === 'Push' &&
            !usedIds.includes(e.id) &&
            (i % 2 !== 0 ? !e.name.includes('Overhead') : true) // Bias Chest on odd days
        );

        if (pushEx) {
            usedIds.push(pushEx.id);
            dayExercises.push({
                id: `d${i}-s2`,
                primary: pushEx,
                alternatives: findAlts(pushEx.id, 'Push', 'Upper'),
                prescription
            });
        }

        // --- Slot 3: Pull (Vertical vs Horizontal) ---
        const pullEx = allExercises.find(e =>
            e.group === 'Upper' &&
            e.pattern === 'Pull' &&
            !usedIds.includes(e.id)
        );

        if (pullEx) {
            usedIds.push(pullEx.id);
            dayExercises.push({
                id: `d${i}-s3`,
                primary: pullEx,
                alternatives: findAlts(pullEx.id, 'Pull', 'Upper'),
                prescription
            });
        }

        // --- Slot 4: Accessory / Isolation ---
        // Rotate: Shoulders, Arms, Abs
        let isoPattern = 'Isolation';
        let isoTarget = 'Upper';

        if (i % 3 === 1) isoTarget = 'Upper'; // Arms/Delts
        else if (i % 3 === 2) isoTarget = 'Lower'; // Calves/Iso legs
        else isoTarget = 'Core';

        const isoEx = allExercises.find(e =>
            (e.pattern === 'Isolation' || e.group === isoTarget) &&
            !usedIds.includes(e.id)
        );

        if (isoEx) {
            usedIds.push(isoEx.id);
            dayExercises.push({
                id: `d${i}-s4`,
                primary: isoEx,
                alternatives: findAlts(isoEx.id, 'Isolation'),
                prescription: `${Math.max(2, setsPerSession)} sets • 10-15 reps @ ${rir}`
            });
        }

        days.push({
            id: `day-${i}`,
            name: `Day ${i}`,
            focus: 'Full Body',
            exercises: dayExercises
        });
    }

    return days;
};


export default function MicrocycleScreen() {
    const { week, title, type, mesocycleId } = useLocalSearchParams();
    const router = useRouter();
    const { macrocycles } = useProgramStore();
    const { setDraft } = useWorkoutDraftStore();

    // Generate Plan (Memoized)
    const plan = useMemo(() => {
        return generatePlan(mesocycleId as string, macrocycles);
    }, [mesocycleId, macrocycles]);

    // Local state for collapsed days
    const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({
        'day-1': true,
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

                {plan.map((day) => {
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
            </ScrollView>

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
