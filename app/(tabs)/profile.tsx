import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { Input } from '../../src/components/common/Input';
import { useUserStore } from '../../src/store/userStore';
import { useWorkoutDraftStore } from '../../src/store/workoutDraftStore';
import { borderRadius, colors, spacing, typography } from '../../src/theme/theme';

export default function ProfileScreen() {
    const { profile, updateProfile } = useUserStore();
    const [localProfile, setLocalProfile] = useState(profile);

    // Sync back to global store on blur or manual save (simplified here)
    const handleChange = (key: keyof typeof profile, value: string | number | boolean) => {
        const updated = { ...localProfile, [key]: value };
        setLocalProfile(updated);
        updateProfile(updated);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll}>
                    <Text style={styles.title}>Athlete Profile</Text>

                    <Card>
                        <Text style={styles.sectionTitle}>Stats</Text>
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: spacing.s }}>
                                <Input
                                    label="Age"
                                    value={localProfile.age.toString()}
                                    onChangeText={(t) => handleChange('age', Number(t))}
                                    keyboardType="number-pad"
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: spacing.s }}>
                                <Input
                                    label="Height"
                                    suffix="cm"
                                    value={localProfile.height.toString()}
                                    onChangeText={(t) => handleChange('height', Number(t))}
                                    keyboardType="number-pad"
                                />
                            </View>
                        </View>
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: spacing.s }}>
                                <Input
                                    label="Weight"
                                    suffix="kg"
                                    value={localProfile.weight.toString()}
                                    onChangeText={(t) => handleChange('weight', Number(t))}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: spacing.s }}>
                                <Input
                                    label="Body Fat"
                                    suffix="%"
                                    value={localProfile.bodyFat.toString()}
                                    onChangeText={(t) => handleChange('bodyFat', Number(t))}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        </View>
                    </Card>

                    <Text style={styles.sectionTitle}>Trends</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendScroll}>
                        <View style={styles.trendCard}>
                            <Text style={styles.trendLabel}>Weight Trend</Text>
                            <View style={styles.mockChart}>
                                {[40, 60, 50, 70, 65, 80].map((h, i) => (
                                    <View key={i} style={[styles.bar, { height: `${h}%` as any, backgroundColor: colors.secondary }]} />
                                ))}
                            </View>
                            <Text style={styles.trendValue}>-1.2 kg <Text style={{ color: colors.textDim }}>Last 30d</Text></Text>
                        </View>
                        <View style={styles.trendCard}>
                            <Text style={styles.trendLabel}>Volume Load</Text>
                            <View style={styles.mockChart}>
                                {[20, 30, 45, 60, 80, 70].map((h, i) => (
                                    <View key={i} style={[styles.bar, { height: `${h}%` as any, backgroundColor: colors.primary }]} />
                                ))}
                            </View>
                            <Text style={styles.trendValue}>+5% <Text style={{ color: colors.textDim }}>Last 30d</Text></Text>
                        </View>
                    </ScrollView>

                    <Card style={{ marginTop: spacing.l }}>
                        <View style={styles.settingRow}>
                            <Text style={styles.settingText}>Use Metric Units</Text>
                            <Switch
                                value={localProfile.units === 'metric'}
                                onValueChange={(v) => handleChange('units', v ? 'metric' : 'imperial')}
                                trackColor={{ false: colors.surfaceHighlight, true: colors.primary }}
                            />
                        </View>
                    </Card>

                    <Button
                        title="Reset Database (Dev Only)"
                        variant="secondary"
                        style={{ marginTop: spacing.xl, borderColor: colors.error }}
                        onPress={async () => {
                            try {
                                const { resetDatabase } = await import('../../src/db/reset');
                                await resetDatabase();

                                // Clear stores
                                useWorkoutDraftStore.getState().clearDraft();
                                const { reset: resetProgram } = await import('../../src/store/programStore').then(m => m.useProgramStore.getState());
                                resetProgram();
                                const { reset: resetUser } = await import('../../src/store/userStore').then(m => m.useUserStore.getState());
                                resetUser();

                                alert('Database and app state cleared.');

                                // Navigate to Plan tab
                                const { router } = await import('expo-router');
                                router.replace('/');

                            } catch (e) {
                                alert('Failed to reset DB');
                                console.error(e);
                            }
                        }}
                    />


                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: spacing.m },
    title: { ...typography.h1, color: colors.primary, marginBottom: spacing.l },
    sectionTitle: { ...typography.h3, marginBottom: spacing.m, marginTop: spacing.s },
    row: { flexDirection: 'row' },
    trendScroll: { marginHorizontal: -spacing.m, paddingHorizontal: spacing.m },
    trendCard: {
        backgroundColor: colors.surface,
        padding: spacing.m,
        borderRadius: borderRadius.l,
        width: 160,
        height: 140,
        marginRight: spacing.m,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.border,
    },
    trendLabel: { ...typography.body, color: colors.textSecondary },
    mockChart: { flexDirection: 'row', alignItems: 'flex-end', height: 50, justifyContent: 'space-between' },
    bar: { width: 12, borderRadius: 4 },
    trendValue: { ...typography.bodyBold, color: colors.text },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    settingText: { ...typography.body, color: colors.text },
});
