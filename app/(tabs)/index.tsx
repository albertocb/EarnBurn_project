import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PRWidget } from '../../src/components/analytics/PRWidget';
import { VolumeWidget } from '../../src/components/analytics/VolumeWidget';
import { AppScreen } from '../../src/components/AppScreen';
import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { WorkoutDayStatusData, workoutDayStatusRepository } from '../../src/repositories/workoutDayStatusRepository';
import { workoutRepository } from '../../src/repositories/workoutRepository';
import { AnalyticsService } from '../../src/services/analyticsService';
import { useProgramStore } from '../../src/store/programStore';
import { useUserStore } from '../../src/store/userStore';
import { borderRadius, colors, spacing, typography } from '../../src/theme/theme';

/**
 * Check whether all days in a given week are completed.
 * `weekKey` is the string used as the `week` column, e.g. "1", "2".
 * `sessionsPerWeek` is how many day-slots exist in that week.
 */
function isWeekFullyCompleted(
    weekKey: string,
    sessionsPerWeek: number,
    allStatuses: WorkoutDayStatusData[]
): boolean {
    const weekStatuses = allStatuses.filter(
        (s) => s.week === weekKey && s.status === 'completed'
    );
    return weekStatuses.length >= sessionsPerWeek;
}

export default function PlanScreen() {
    const { activeMacrocycleId, activeMacrocycleId: macroId, macrocycles } = useProgramStore();
    const router = useRouter();
    const { profile } = useUserStore();

    // Analytics State
    const [prs, setPrs] = useState<any[]>([]);
    const [volumeData, setVolumeData] = useState<any[]>([]);

    // Week unlock state
    const [allStatuses, setAllStatuses] = useState<WorkoutDayStatusData[]>([]);

    useEffect(() => {
        loadAnalytics();
        loadStatuses();
    }, []);

    const loadStatuses = async () => {
        try {
            const statuses = await workoutDayStatusRepository.getAllStatuses();
            setAllStatuses(statuses);
        } catch (e) {
            console.error('Failed to load all day statuses', e);
            setAllStatuses([]);
        }
    };

    const loadAnalytics = async () => {
        try {
            const sessions = await workoutRepository.getAllSessions();
            let allSets: any[] = [];

            for (const session of sessions) {
                const sets = await workoutRepository.getSessionSets(session.id);
                sets.forEach(s => allSets.push({ ...s, date: session.date }));
            }

            const recentPrs = AnalyticsService.getPRs(allSets);
            const volume = AnalyticsService.getWeeklyVolume(allSets);

            setPrs(recentPrs.slice(0, 3));
            setVolumeData(volume);
        } catch (e) {
            console.error('Failed to load analytics', e);
        }
    };

    const activeMacro = macrocycles.find(m => m.id === macroId);

    if (!activeMacro) {
        return (
            <AppScreen contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Good Morning,</Text>
                        <Text style={styles.username}>{profile.name}</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/profile')}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{profile.name.charAt(0)}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Analytics Dashboard (Even without active plan) */}
                <PRWidget prs={prs} />
                <VolumeWidget data={volumeData} />

                <View style={styles.emptyState}>
                    <Text style={styles.title}>Your Plan</Text>
                    <Text style={styles.subtitle}>No active training plan.</Text>
                    <Button title="Start New Macrocycle" onPress={() => router.push('/macrocycle/create')} />
                </View>
            </AppScreen>
        );
    }

    return (
        <AppScreen contentContainerStyle={styles.scroll}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Good Morning,</Text>
                    <Text style={styles.username}>{profile.name || 'Campeón'}</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/profile')}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{(profile.name || 'C').charAt(0)}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Analytics Dashboard */}
            <PRWidget prs={prs} />
            <VolumeWidget data={volumeData} />

            <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionHeader}>{activeMacro.name}</Text>
                <TouchableOpacity>
                    <Ionicons name="settings-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {activeMacro.mesocycles.map((meso, index) => (
                <Card key={meso.id} style={styles.mesoCard}>
                    <View style={styles.mesoHeader}>
                        <Text style={styles.mesoIndex}>Block {index + 1}</Text>
                        <Text style={styles.mesoFocus}>{meso.focus}</Text>
                    </View>
                    <View style={styles.mesoDetails}>
                        <Text style={styles.mesoDetailText}>{meso.progressionModel}</Text>
                    </View>

                    <View style={styles.weeksContainer}>
                        {Array.from({ length: meso.weeks + 1 }).map((_, wIndex) => {
                            const isDeload = wIndex === meso.weeks; // Last week (N+1) is Deload
                            const prevWeekKey = String(wIndex); // previous week number as string
                            const sessionsPerWeek = meso.sessionsPerWeek || 5;

                            // Week 1 (wIndex===0) is always unlocked.
                            // Week N is locked unless all days in Week N-1 are completed.
                            const isWeekLocked = wIndex > 0
                                && !isWeekFullyCompleted(prevWeekKey, sessionsPerWeek, allStatuses);

                            const handleWeekPress = () => {
                                if (isWeekLocked) {
                                    Alert.alert(
                                        '🔒 Week Locked',
                                        `Complete all sessions in Week ${wIndex} before starting Week ${wIndex + 1}.`
                                    );
                                    return;
                                }
                                router.push({
                                    pathname: `/microcycle/${wIndex + 1}` as any,
                                    params: {
                                        type: isDeload ? 'deload' : 'standard',
                                        title: isDeload ? `W${wIndex + 1} Deload` : `W${wIndex + 1} Standard Microcycle`,
                                        mesocycleId: meso.id
                                    }
                                });
                            };

                            return (
                                <TouchableOpacity
                                    key={wIndex}
                                    onPress={handleWeekPress}
                                    activeOpacity={isWeekLocked ? 1 : 0.7}
                                >
                                    <View style={[
                                        styles.weekRow,
                                        isDeload && styles.deloadRow,
                                        isWeekLocked && styles.weekRowLocked
                                    ]}>
                                        <View style={[
                                            styles.weekIndicator,
                                            isWeekLocked && styles.weekIndicatorLocked
                                        ]}>
                                            {isWeekLocked
                                                ? <Ionicons name="lock-closed" size={14} color={colors.textDim} />
                                                : <Text style={styles.weekText}>W{wIndex + 1}</Text>
                                            }
                                        </View>
                                        <View style={styles.weekContent}>
                                            <Text style={[
                                                styles.weekLabel,
                                                isDeload && styles.deloadText,
                                                isWeekLocked && styles.weekLabelLocked
                                            ]}>
                                                {isDeload ? 'Deload & Recovery' : 'Standard Microcycle'}
                                            </Text>
                                        </View>
                                        {isDeload && !isWeekLocked && <Ionicons name="battery-charging" size={16} color={colors.accent} />}
                                        <Ionicons
                                            name={isWeekLocked ? "lock-closed" : "chevron-forward"}
                                            size={isWeekLocked ? 16 : 20}
                                            color={isWeekLocked ? colors.textDim : colors.textSecondary}
                                            style={{ marginLeft: spacing.s }}
                                        />
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Card>
            ))}

            <Button
                title="Add Mesocycle"
                variant="secondary"
                onPress={() => router.push('/mesocycle/create')}
                style={styles.addButton}
            />
        </AppScreen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    emptyState: { alignItems: 'center', padding: spacing.l, marginTop: spacing.xl },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.l,
    },
    greeting: { ...typography.caption, color: colors.textSecondary },
    username: { ...typography.h2, color: colors.text },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { ...typography.h3, color: colors.primary },
    sectionHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.m,
        marginTop: spacing.l,
    },
    title: { ...typography.h1, color: colors.primary, marginBottom: spacing.s },
    subtitle: { ...typography.body, marginBottom: spacing.l, color: colors.textSecondary },
    scroll: { padding: spacing.l },
    sectionHeader: { ...typography.h3, color: colors.text },
    mesoCard: { padding: spacing.l },
    mesoHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.s },
    mesoIndex: { ...typography.h3, color: colors.text },
    mesoFocus: { ...typography.bodyBold, color: colors.secondary },
    mesoDetails: { flexDirection: 'row', gap: spacing.s, marginBottom: spacing.m },
    mesoDetailText: { ...typography.caption, color: colors.textSecondary },
    badge: {
        backgroundColor: colors.surfaceHighlight,
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.s,
        paddingVertical: 2,
        borderRadius: borderRadius.s
    },
    badgeText: { ...typography.caption, color: colors.textDim },
    addButton: { marginTop: spacing.m },
    weeksContainer: { marginTop: spacing.m, gap: spacing.s },
    weekRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceHighlight,
        padding: spacing.s,
        borderRadius: borderRadius.m
    },
    weekRowLocked: {
        opacity: 0.45,
    },
    deloadRow: {
        backgroundColor: 'rgba(0, 255, 133, 0.1)',
        borderColor: colors.accent,
        borderWidth: 1,
    },
    weekIndicator: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
    },
    weekIndicatorLocked: {
        backgroundColor: colors.surfaceHighlight,
    },
    weekText: { ...typography.caption, color: colors.text, fontWeight: '700' },
    weekContent: { flex: 1 },
    weekLabel: { ...typography.body, color: colors.textSecondary },
    weekLabelLocked: { color: colors.textDim },
    deloadText: { color: colors.accent, fontWeight: '700' },
});
