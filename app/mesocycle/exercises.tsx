import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '../../src/components/AppScreen';
import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { Input } from '../../src/components/common/Input';
import { exercises } from '../../src/data/exercises';
import { useSelectionStore } from '../../src/store/selectionStore';
import { borderRadius, colors, spacing, typography } from '../../src/theme/theme';

const FILTERS = ['All', 'Upper', 'Lower', 'Push', 'Pull', 'Legs', 'Full Body'];

export default function ExerciseSelection() {
    const router = useRouter();
    const { selectedExerciseIds, toggleExercise, clearSelection } = useSelectionStore();
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const filteredExercises = exercises.filter((ex) => {
        const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter =
            activeFilter === 'All' ||
            ex.group === activeFilter ||
            ex.pattern === activeFilter ||
            (activeFilter === 'Legs' && ex.group === 'Lower'); // Simple mapping

        return matchesSearch && matchesFilter;
    });

    const handleSave = () => {
        router.back();
    };

    return (
        <AppScreen scroll={false} style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Select Exercises',
                    headerStyle: { backgroundColor: colors.background },
                    headerTintColor: colors.text,
                }}
            />

            <View style={styles.header}>
                <Input
                    label="Search"
                    placeholder="Search exercises..."
                    value={search}
                    onChangeText={setSearch}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    {FILTERS.map((filter) => (
                        <Pressable
                            key={filter}
                            style={[
                                styles.chip,
                                activeFilter === filter ? styles.chipActive : null,
                            ]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <Text
                                style={[
                                    styles.chipText,
                                    activeFilter === filter ? styles.chipTextActive : null,
                                ]}
                            >
                                {filter}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredExercises}
                style={{ flex: 1 }}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    const isSelected = selectedExerciseIds.includes(item.id);
                    return (
                        <Pressable onPress={() => toggleExercise(item.id)}>
                            <Card style={[styles.card, isSelected ? styles.cardSelected : null]}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.exerciseName}>{item.name}</Text>
                                    {isSelected && <View style={styles.checkBadge} />}
                                </View>
                                <Text style={styles.description}>{item.description}</Text>
                                <View style={styles.tags}>
                                    <Text style={styles.tag}>{item.group}</Text>
                                    <Text style={styles.tagSeparator}>•</Text>
                                    <Text style={styles.tag}>{item.equipment}</Text>
                                </View>
                            </Card>
                        </Pressable>
                    );
                }}
            />

            <View style={styles.footer}>
                <View style={styles.footerInfo}>
                    <Text style={styles.footerText}>Selected: {selectedExerciseIds.length}</Text>
                    <Pressable onPress={clearSelection}>
                        <Text style={styles.clearText}>Clear</Text>
                    </Pressable>
                </View>
                <Button title="Save Selection" onPress={handleSave} />
            </View>
        </AppScreen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { padding: spacing.m, paddingBottom: 0 },
    filterScroll: { marginVertical: spacing.s },
    chip: {
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s,
        borderRadius: borderRadius.round,
        backgroundColor: colors.surface,
        marginRight: spacing.s,
        borderWidth: 1,
        borderColor: colors.border,
    },
    chipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipText: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    chipTextActive: {
        color: colors.background,
    },
    listContent: { padding: spacing.m },
    card: {
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.surfaceHighlight, // Subtle highlight
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    exerciseName: {
        ...typography.bodyBold,
        fontSize: 18,
    },
    checkBadge: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary,
    },
    description: {
        ...typography.caption,
        fontSize: 14,
        marginBottom: spacing.s,
        color: colors.textSecondary,
    },
    tags: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tag: {
        ...typography.caption,
        color: colors.textDim,
    },
    tagSeparator: {
        marginHorizontal: spacing.xs,
        color: colors.textDim,
    },
    footer: {
        padding: spacing.m,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
    },
    footerInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.m
    },
    footerText: {
        ...typography.bodyBold
    },
    clearText: {
        ...typography.body,
        color: colors.error,
        fontSize: 14
    }
});
