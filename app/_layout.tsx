import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useRunMigrations } from '../src/db/migrations';
import { workoutDayStatusRepository } from '../src/repositories/workoutDayStatusRepository';
import { useProgramStore } from '../src/store/programStore';
import { useUserStore } from '../src/store/userStore';
import { colors } from '../src/theme/theme';

export default function RootLayout() {
    const { success, error } = useRunMigrations();

    useEffect(() => {
        if (success) {
            // Initialize stores once DB is ready
            useUserStore.getState().init();
            useProgramStore.getState().init();
            // Ensure workout day status table exists (manual init)
            workoutDayStatusRepository.ensureTable().catch(e => console.error("Failed to init status table", e));
        }
    }, [success]);

    if (error) {
        return (
            <SafeAreaProvider>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                    <Text style={{ color: colors.error }}>Migration Error: {error.message}</Text>
                </View>
            </SafeAreaProvider>
        );
    }

    if (!success) {
        return (
            <SafeAreaProvider>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <StatusBar style="light" />
                <Stack
                    screenOptions={{
                        headerStyle: { backgroundColor: colors.background },
                        headerTintColor: colors.text,
                        headerTitleStyle: { fontWeight: 'bold' },
                        contentStyle: { backgroundColor: colors.background },
                        headerShown: false,
                    }}
                >
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack>
            </View>
        </SafeAreaProvider>
    );
}
