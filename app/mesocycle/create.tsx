import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/common/Button';
import { Select } from '../../src/components/common/Select';
import { Slider } from '../../src/components/common/Slider';
import { useProgramStore } from '../../src/store/programStore';
import { useSelectionStore } from '../../src/store/selectionStore';
import { Focus, Mesocycle } from '../../src/store/types';
import { colors, spacing, typography } from '../../src/theme/theme';

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
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Add Mesocycle', headerBackTitle: 'Cancel' }} />
            <ScrollView contentContainerStyle={styles.content}>

                <Select
                    label="Split Strategy"
                    value={splitStrategy}
                    onChange={(v) => setSplitStrategy(v as any)}
                    options={[
                        { label: 'Full-Body High Frequency', value: 'Full Body' },
                        { label: 'Upper / Lower', value: 'Upper/Lower' },
                        { label: 'Push / Pull / Legs', value: 'PPL' },
                    ]}
                />
                <Text style={styles.helperText}>
                    Higher frequency = distribute weekly volume into smaller per-session doses.
                </Text>

                <Slider
                    label="Sessions per Week"
                    value={sessionsPerWeek}
                    min={3}
                    max={7}
                    unit=" Sessions"
                    onValueChange={setSessionsPerWeek}
                />

                <Select
                    label="Weekly Volume Preset"
                    value={volumePreset}
                    onChange={(v) => setVolumePreset(v as any)}
                    options={[
                        { label: 'Hypertrophy (Moderate)', value: 'Hypertrophy' },
                        { label: 'Strength-Biased', value: 'Strength' },
                    ]}
                />

                <View style={styles.divider} />

                <Select
                    label="Focus"
                    value={focus}
                    onChange={(v) => setFocus(v as Focus)}
                    options={[
                        { label: 'Hypertrophy', value: 'Hypertrophy' },
                        { label: 'Strength', value: 'Strength' },
                        { label: 'Peaking', value: 'Peaking' },
                    ]}
                />

                <Slider
                    label="Length"
                    value={weeks}
                    min={4}
                    max={8}
                    unit=" Weeks"
                    onValueChange={setWeeks}
                />

                <Select
                    label="Progression Model"
                    value={progression}
                    onChange={setProgression}
                    options={[
                        { label: 'Linear', value: 'Linear' },
                        { label: 'Double', value: 'Double Progression' },
                        { label: 'RPE Stop', value: 'RPE Stop' },
                    ]}
                />

                <Slider
                    label="Target RIR (Reps In Reserve)"
                    value={rir}
                    min={0}
                    max={4}
                    unit=" RIR"
                    onValueChange={setRir}
                />


                <View style={styles.section}>
                    <Text style={styles.label}>Exercises</Text>
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
            </ScrollView>
        </SafeAreaView>
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
    selectionCount: { ...typography.bodyBold, color: colors.primary, marginBottom: spacing.s, marginTop: spacing.xs },
});
