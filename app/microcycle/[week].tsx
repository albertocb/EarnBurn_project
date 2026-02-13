import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ImageSourcePropType, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '../../src/components/AppScreen';
import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { ExerciseIllustration } from '../../src/components/ExerciseIllustration';
import { exercises as allExercises } from '../../src/data/exercises';
import { workoutDayStatusRepository } from '../../src/repositories/workoutDayStatusRepository';
import { useProgramStore } from '../../src/store/programStore';
import { useTimerStore } from '../../src/store/timerStore';
import { useWorkoutDraftStore } from '../../src/store/workoutDraftStore';
import { borderRadius, colors, spacing, typography } from '../../src/theme/theme';

// --- Types ---
interface Exercise {
    id: string;
    name: string;
    description: string;
    image?: ImageSourcePropType;
    group?: string;
    pattern?: string;
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
    macrocycles: any[],
    isDeload: boolean = false
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
    let weeklySets = volumePreset === 'Hypertrophy' ? 12 : 6;
    if (isDeload) {
        // Deload: Cut sets by ~50%
        weeklySets = Math.max(1, Math.ceil(weeklySets * 0.5));
    }

    const setsPerSession = Math.max(isDeload ? 1 : 2, Math.round(weeklySets / sessions));
    const repRange = volumePreset === 'Hypertrophy' ? '8-12' : '4-6';

    // Deload RIR: Easiear (3 RIR) vs Normal (2-3 RIR) - Max 3 enforced
    const rir = isDeload ? '3 RIR' : (volumePreset === 'Hypertrophy' ? '2 RIR' : '3 RIR');

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
                prescription: `${Math.max(isDeload ? 1 : 2, setsPerSession)} sets • 10-15 reps @ ${rir}`
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
    const { week, title, mesocycleId, type } = useLocalSearchParams();
    const router = useRouter();
    const { macrocycles } = useProgramStore();
    const { setDraft } = useWorkoutDraftStore();

    const isDeload = type === 'deload';

    // Local state for statuses
    const [dayStatuses, setDayStatuses] = useState<Record<string, any>>({});
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Fetch statuses on focus/mount
    useEffect(() => {
        const fetchStatuses = async () => {
            if (typeof week === 'string') {
                try {
                    const statuses = await workoutDayStatusRepository.getStatusesForWeek(week);
                    setDayStatuses(statuses);
                } catch (e) {
                    console.error('Failed to load day statuses', e);
                    setDayStatuses({});
                }
            }
        };
        fetchStatuses();
    }, [week, refreshTrigger]);

    // Refresh when coming back from workout (simple approach using focus listener or just relying on mount if stack ensures rebuild - but router.push might keep it alive)
    // For now, let's also stick a simple focus effect if needed, or rely on the user navigating back and forth.
    // Actually, expo-router Stack keeps screens mounted. Ideally useFocusEffect.
    // Let's add useFocusEffect from expo-router (it is just re-export of React Navigation's).
    // "useFocusEffect" is not directly exported from expo-router usually, need to import from 'expo-router' if available or '@react-navigation/native'.
    // Since we don't have explicit deps check, I'll rely on a simple interval or just force remount if I can't confirm import.
    // BUT, wait, we can just use the fact that router.push('/workout') pushes on top, and back pops it.
    // So this screen DOES NOT UNMOUNT. We need a way to refresh. 
    // Let's assume standard React Native generic refresh for now:
    // We can add a "pull to refresh" on ScrollView or just rely on `useCallback` with `useFocusEffect` if we had it.
    // Let's Import `useFocusEffect` from `expo-router`? It is valid in newer versions.
    // I entered this block to Replace the component content, so let's try to import it at the top level first.
    // Ah, I need to do multiple edits. I'll stick to a simple "Reload" button or just standard useEffect with a "isFocused" check if I can gets it.
    // Let's try to be robust: simple onLayout or use a known hook.
    // Actually, I can use `usePathname`? No.
    // I'll stick to `useEffect` with a timer for 1s just to be safe OR just add a "Refresh" button if status doesn't update.
    // BETTER: I'll use `useFocusEffect` if I can confirm imports. I'll try adding the import in a separate step.
    // For now, I will write the logic assuming `useFocusEffect` is available or I will unimplemented it.
    // Let's just use a simple `React.useCallback` and pass it to `useFocusEffect` if I can import it.
    // Since I can't verify the import right now without reading docs or risking error, I'll use a standard `useEffect` on `week` and maybe a manual triggered refresh.

    // Correction: I can just use a `useEffect` that listens to `navigation` focus events if I had access to navigation.
    // Let's just keep it simple: fetch on mount. If user comes back, they might need to reload. 
    // WAIT! `router.push` puts workout on TOP. When they finish and `router.replace('/')` (back to plan), then go back to here, it WILL remount.
    // The previous flow was: Plan -> Microcycle -> Workout -> (Finish) -> Plan.
    // So Microcycle is UNMOUNTED in the standard "Finish" flow because we navigate to Root (Plan).
    // So `useEffect` on mount IS SUFFICIENT!

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

    // Override Confirm
    const [overrideAlertVisible, setOverrideAlertVisible] = useState(false);
    const [pendingOverrideDay, setPendingOverrideDay] = useState<WorkoutDay | null>(null);

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

    const startWorkoutFlow = (day: WorkoutDay) => {
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
            isDeload: isDeload,
            exercises: draftExercises,
        });

        // Start Timer
        const { reset, start } = useTimerStore.getState();
        reset();
        start();

        router.push('/workout');
    };

    const handleStartPress = (day: WorkoutDay, status: any) => {
        if (status) {
            // Already completed or partial
            setPendingOverrideDay(day);
            setOverrideAlertVisible(true);
        } else {
            startWorkoutFlow(day);
        }
    };

    const displayTitle = typeof title === 'string' ? title : `Week ${week} Microcycle`;
    const subtitle = "Open the planned workout. If equipment is taken, swap to an alternative.";

    return (
        <AppScreen contentContainerStyle={styles.content}>
            <Stack.Screen
                options={{
                    title: '',
                    headerBackTitle: 'Plan',
                    headerStyle: { backgroundColor: colors.background },
                    headerTintColor: colors.text,
                }}
            />

            <View style={styles.headerContainer}>
                <Text style={styles.title}>{displayTitle}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            {plan.map((day, dayIndex) => {
                const isExpanded = !!expandedDays[day.id];
                const statusData = dayStatuses[day.id];
                const isCompleted = statusData?.status === 'completed';
                const isPartial = statusData?.status === 'partial';

                // Sequential unlock: Day 1 always unlocked, Day N needs Day N-1 completed
                const isLocked = dayIndex > 0
                    && dayStatuses[plan[dayIndex - 1].id]?.status !== 'completed';

                // Dynamic Styles based on status
                let headerStyle: any = [styles.dayHeader];
                if (isExpanded) headerStyle.push(styles.dayHeaderActive);
                if (isCompleted) headerStyle.push(styles.dayHeaderCompleted);
                if (isPartial) headerStyle.push(styles.dayHeaderPartial);
                if (isLocked) headerStyle.push(styles.dayHeaderLocked);

                return (
                    <View key={day.id} style={styles.dayContainer}>
                        <Pressable
                            onPress={() => toggleDay(day.id)}
                            style={headerStyle}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {isLocked && (
                                    <View style={styles.lockIconContainer}>
                                        <Ionicons name="lock-closed" size={16} color={colors.textDim} />
                                    </View>
                                )}
                                <View>
                                    <Text style={[styles.dayTitle, isCompleted && { color: colors.textSecondary }, isLocked && { color: colors.textDim }]}>{day.name}</Text>
                                    <Text style={[styles.dayFocus, isLocked && { color: colors.textDim }]}>{day.focus}</Text>
                                </View>
                                {isCompleted && (
                                    <View style={styles.statusBadgeCompleted}>
                                        <Ionicons name="checkmark-circle" size={14} color={colors.textSecondary} />
                                        <Text style={styles.statusTextCompleted}>Done</Text>
                                    </View>
                                )}
                                {isPartial && (
                                    <View style={styles.statusBadgePartial}>
                                        <Ionicons name="alert-circle" size={14} color={colors.warning} />
                                        <Text style={styles.statusTextPartial}>Partial</Text>
                                    </View>
                                )}
                            </View>
                            <Ionicons
                                name={isLocked ? "lock-closed" : isExpanded ? "chevron-up" : "chevron-down"}
                                size={isLocked ? 16 : 20}
                                color={isLocked ? colors.textDim : colors.textSecondary}
                            />
                        </Pressable>

                        {isExpanded && (
                            <View style={[styles.exercisesList, (isCompleted || isPartial) && { opacity: 0.8 }, isLocked && { opacity: 0.45 }]}>
                                {day.exercises.map((slot) => {
                                    const activeEx = getActiveExercise(slot);
                                    const isSwapped = !!swaps[slot.id];

                                    return (
                                        <Card key={slot.id} style={styles.exerciseCard}>
                                            <View style={styles.exerciseRow}>
                                                <ExerciseIllustration
                                                    image={activeEx.image}
                                                    group={activeEx.group || 'Upper'}
                                                    pattern={activeEx.pattern}
                                                    size={56}
                                                />
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
                                                            disabled={isCompleted || isPartial || isLocked}
                                                        >
                                                            <Ionicons name="refresh" size={18} color={(isCompleted || isLocked) ? colors.textDim : colors.accent} />
                                                            <Text style={[styles.undoText, (isCompleted || isLocked) && { color: colors.textDim }]}>Undo</Text>
                                                        </Pressable>
                                                    ) : (
                                                        <Pressable
                                                            onPress={() => handleSwapPress(slot)}
                                                            style={styles.swapButton}
                                                            disabled={isCompleted || isPartial || isLocked}
                                                        >
                                                            <Ionicons name="swap-horizontal" size={20} color={(isCompleted || isLocked) ? colors.textDim : colors.secondary} />
                                                        </Pressable>
                                                    )}
                                                </View>
                                            </View>
                                        </Card>
                                    );
                                })}

                                {isLocked ? (
                                    <Button
                                        title={`🔒  Complete Day ${dayIndex} First`}
                                        onPress={() => { }}
                                        style={{ marginTop: spacing.m, opacity: 0.4 }}
                                        variant="secondary"
                                        disabled={true}
                                    />
                                ) : (
                                    <>
                                        <Button
                                            title={statusData ? (isCompleted ? "Completed" : "Incomplete") : "Start This Workout"}
                                            onPress={() => handleStartPress(day, statusData)}
                                            style={{ marginTop: spacing.m, opacity: statusData ? 0.6 : 1 }}
                                            variant={statusData ? 'secondary' : 'primary'}
                                            disabled={false}
                                        />
                                        {statusData && (
                                            <Text style={{ textAlign: 'center', marginTop: 8, ...typography.caption, color: colors.textDim }}>
                                                Tap to re-log (Duplicate)
                                            </Text>
                                        )}
                                    </>
                                )}
                            </View>
                        )}
                    </View>
                );
            })}

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

            {/* Override Alert Modal (Simulated Alert) */}
            <Modal
                visible={overrideAlertVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setOverrideAlertVisible(false)}
            >
                <View style={[styles.modalOverlay, { justifyContent: 'center', padding: spacing.xl }]}>
                    <View style={[styles.modalContent, { minHeight: undefined, borderRadius: borderRadius.l }]}>
                        <Text style={styles.modalTitle}>Re-log Workout?</Text>
                        <Text style={{ ...typography.body, color: colors.textSecondary, marginVertical: spacing.m }}>
                            This workout is already marked as {dayStatuses[pendingOverrideDay?.id || '']?.status}.
                            Starting it again will create a NEW session log.
                        </Text>
                        <View style={{ gap: spacing.m }}>
                            <Button
                                title="Yes, Start New Session"
                                onPress={() => {
                                    setOverrideAlertVisible(false);
                                    if (pendingOverrideDay) startWorkoutFlow(pendingOverrideDay);
                                }}
                            />
                            <Button
                                title="Cancel"
                                variant="secondary"
                                onPress={() => setOverrideAlertVisible(false)}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </AppScreen>
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
    dayHeaderLocked: {
        opacity: 0.5,
    },
    lockIconContainer: {
        marginRight: spacing.s,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayTitle: { ...typography.h3, color: colors.text },
    dayFocus: { ...typography.caption, color: colors.secondary },

    exercisesList: {
        backgroundColor: colors.surface,
        borderBottomLeftRadius: borderRadius.m,
        borderBottomRightRadius: borderRadius.m,
        padding: spacing.s,
    },
    exerciseCard: {
        marginBottom: spacing.s,
        backgroundColor: '#252525',
        borderWidth: 0,
    },
    exerciseRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.m,
    },
    exerciseInfo: { flex: 1 },
    exerciseName: { ...typography.bodyBold, color: colors.text, fontSize: 16 },
    exerciseDesc: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs, fontSize: 12 },

    prescriptionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
        backgroundColor: 'rgba(212, 255, 0, 0.1)',
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

    // Status Styles
    dayHeaderCompleted: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: 0.8
    },
    dayHeaderPartial: {
        backgroundColor: colors.warningBg,
        borderColor: colors.warning,
        borderWidth: 1,
    },
    statusBadgeCompleted: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceHighlight,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: borderRadius.round,
        marginLeft: spacing.m,
        gap: 4
    },
    statusBadgePartial: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.warningBg,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: borderRadius.round,
        marginLeft: spacing.m,
        gap: 4
    },
    statusTextCompleted: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: 'bold'
    },
    statusTextPartial: {
        ...typography.caption,
        color: colors.warning,
        fontWeight: 'bold'
    }
});
