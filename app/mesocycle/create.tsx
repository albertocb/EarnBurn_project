import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '../../src/components/AppScreen';
import { Button } from '../../src/components/common/Button';
import { SectionHeader } from '../../src/components/common/SectionHeader';
import { Select } from '../../src/components/common/Select';
import { Slider } from '../../src/components/common/Slider';
import { useProgramStore } from '../../src/store/programStore';
import { useSelectionStore } from '../../src/store/selectionStore';
import { Focus, Mesocycle } from '../../src/store/types';
import { borderRadius, colors, spacing, typography } from '../../src/theme/theme';

export default function CreateMesocycle() {
    const router = useRouter();
    const { activeMacrocycleId, addMesocycle } = useProgramStore();
    const { selectedExerciseIds, clearSelection } = useSelectionStore();

    const [weeks, setWeeks] = useState(4);
    const [splitStrategy, setSplitStrategy] = useState<'Full Body' | 'Upper/Lower' | 'PPL'>('Full Body');
    const [sessionsPerWeek, setSessionsPerWeek] = useState(5);
    const [volumePreset, setVolumePreset] = useState<'Hypertrophy' | 'Strength'>('Hypertrophy');
    const [focus, setFocus] = useState<Focus>('Hypertrophy');
    const [progression, setProgression] = useState('Linear');
    // autoDeload removed - mandatory
    const [rir, setRir] = useState(2); // Mock: Target RIR

    useEffect(() => {
        clearSelection();
    }, []);

    const handleSave = () => {
        if (!activeMacrocycleId) return;

        const newMeso: Mesocycle = {
            id: Date.now().toString(),
            name: `${focus} Block (${splitStrategy})`,
            weeks,
            focus,
            splitStrategy,
            sessionsPerWeek,
            volumePreset,
            progressionModel: progression as any,
            // autoDeload removed
            volumeRamp: true, // simplified
            exercises: selectedExerciseIds,
        };

        addMesocycle(activeMacrocycleId, newMeso);
        router.back();
    };

    return (
        <AppScreen contentContainerStyle={[styles.content, { paddingBottom: 100, paddingTop: spacing.xl }]}>
            <Stack.Screen options={{ title: 'Add Mesocycle', headerBackTitle: 'Cancel' }} />

            <SectionHeader title="Split Strategy" variant="pillDivider" icon="🧩" />
            <View style={styles.splitOptionsContainer}>
                {[
                    { label: 'Full-Body High Frequency', value: 'Full Body', desc: 'Rec. for 3-5 sessions' },
                    { label: 'Upper / Lower', value: 'Upper/Lower', desc: 'Rec. for 4-6 sessions' },
                    { label: 'Push / Pull / Legs', value: 'PPL', desc: 'Rec. for 6 sessions' },
                ].map((opt) => {
                    const isSelected = splitStrategy === opt.value;
                    return (
                        <Pressable
                            key={opt.value}
                            onPress={() => setSplitStrategy(opt.value as any)}
                            style={[
                                styles.splitCard,
                                isSelected ? styles.splitCardSelected : styles.splitCardUnselected
                            ]}
                        >
                            <View>
                                <Text style={[styles.splitLabel, isSelected && styles.splitLabelSelected]}>
                                    {opt.label}
                                </Text>
                                <Text style={[styles.splitDesc, isSelected && styles.splitDescSelected]}>
                                    {opt.desc}
                                </Text>
                            </View>
                            {isSelected && (
                                <View style={styles.checkCircle}>
                                    <View style={styles.checkInner} />
                                </View>
                            )}
                        </Pressable>
                    );
                })}
            </View>

            <Text style={styles.helperText}>
                Higher frequency (Full Body) allows for more quality sets per muscle group across the week.
            </Text>

            <SectionHeader title="Sessions per Week" variant="pillDivider" icon="📅" />
            <Slider
                label=""
                value={sessionsPerWeek}
                min={3}
                max={7}
                unit=" Sessions"
                onValueChange={setSessionsPerWeek}
            />

            <SectionHeader title="Weekly Volume Preset" variant="pillDivider" icon="📊" />
            <Select
                label=""
                value={volumePreset}
                onChange={(v) => setVolumePreset(v as any)}
                options={[
                    { label: 'Hypertrophy (Moderate)', value: 'Hypertrophy' },
                    { label: 'Strength-Biased', value: 'Strength' },
                ]}
            />

            <View style={styles.divider} />

            <SectionHeader title="Focus" variant="pillDivider" icon="🎯" />
            <Select
                label=""
                value={focus}
                onChange={(v) => setFocus(v as Focus)}
                options={[
                    { label: 'Hypertrophy', value: 'Hypertrophy' },
                    { label: 'Strength', value: 'Strength' },
                    { label: 'Peaking', value: 'Peaking' },
                ]}
            />

            <SectionHeader title="Length" variant="pillDivider" icon="⏱️" />
            <Slider
                label=""
                value={weeks}
                min={4}
                max={8}
                unit=" Weeks"
                onValueChange={setWeeks}
            />

            <SectionHeader title="Progression Model" variant="pillDivider" icon="📈" />
            <Select
                label=""
                value={progression}
                onChange={setProgression}
                options={[
                    { label: 'Linear', value: 'Linear' },
                    { label: 'Double', value: 'Double Progression' },
                    { label: 'RPE Stop', value: 'RPE Stop' },
                ]}
            />

            <SectionHeader title="Target RIR (Reps In Reserve)" variant="pillDivider" icon="🧠" />
            <Slider
                label=""
                value={rir}
                min={0}
                max={3}
                unit=" RIR"
                onValueChange={setRir}
            />


            <View style={styles.section}>
                <SectionHeader title="Exercises" variant="pillDivider" icon="🏋️" />
                <Text style={styles.selectionCount}>
                    {selectedExerciseIds.length} Selected
                </Text>
                <Button
                    title="Select Exercises"
                    onPress={() => router.push('/mesocycle/exercises')}
                    variant="secondary"
                />
            </View>

            <View style={{ height: 20 }} />
            <Button title="Add to Plan" onPress={handleSave} />

        </AppScreen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.l },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.m },
    label: { ...typography.body, color: colors.textSecondary },
    helperText: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.m, fontStyle: 'italic' },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.m },
    section: { marginBottom: spacing.m },
    // sectionLabel removed - replaced by component
    splitOptionsContainer: { gap: spacing.s, marginBottom: spacing.s },
    splitCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.m,
        borderRadius: borderRadius.m,
        borderWidth: 1,
    },
    splitCardUnselected: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
    },
    splitCardSelected: {
        backgroundColor: colors.surfaceHighlight,
        borderColor: colors.primary,
    },
    splitLabel: { ...typography.bodyBold, color: colors.text },
    splitLabelSelected: { color: colors.primary },
    splitDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    splitDescSelected: { color: colors.text },
    checkCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    selectionCount: { ...typography.bodyBold, color: colors.primary, marginBottom: spacing.s, marginTop: spacing.xs },
});
