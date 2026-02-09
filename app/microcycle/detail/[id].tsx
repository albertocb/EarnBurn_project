import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppScreen } from '../../../src/components/AppScreen';
import { Card } from '../../../src/components/common/Card';
import { programRepository } from '../../../src/repositories/programRepository';
import { colors, spacing, typography } from '../../../src/theme/theme';

export default function MicrocycleDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [microcycle, setMicrocycle] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);

    useEffect(() => {
        if (id) {
            loadData(id as string);
        }
    }, [id]);

    const loadData = async (microId: string) => {
        // We might need a repo method to get microcycle details + sessions
        // For now, assuming we can get sessions by microcycle ID.
        // We'll likely need to extend programRepository or just query directly.
        // Let's assume we fetch sessions linked to this microcycle.
        try {
            // Fetch microcycle metadata (mock or implement repo method)
            // For MVP, we might just query sessions.
            const fetchedSessions = await programRepository.getSessionsForMicrocycle(microId);
            setSessions(fetchedSessions);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <AppScreen contentContainerStyle={styles.scroll}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Week Plan</Text>
            </View>


            {sessions.length === 0 ? (
                <Text style={styles.emptyText}>No sessions planned for this week.</Text>
            ) : (
                sessions.map((session, index) => (
                    <TouchableOpacity
                        key={session.id}
                        onPress={() => router.push(`/session/${session.id}`)}
                    >
                        <Card style={styles.sessionCard}>
                            <Text style={styles.dayLabel}>Day {session.dayNumber}</Text>
                            <Text style={styles.sessionName}>{session.name}</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </Card>
                    </TouchableOpacity>
                ))
            )}

        </AppScreen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.l,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceHighlight,
    },
    backButton: { marginRight: spacing.m },
    title: { ...typography.h1, color: colors.primary },
    scroll: { padding: spacing.l },
    sessionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.l,
        marginBottom: spacing.m,
        justifyContent: 'space-between',
    },
    dayLabel: {
        ...typography.caption,
        color: colors.accent,
        width: 50,
        fontWeight: 'bold',
    },
    sessionName: {
        ...typography.body,
        color: colors.text,
        flex: 1,
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.xl,
    }
});
