import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { colors } from '../../src/theme/theme';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textDim,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Plan',
                    tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="workout"
                options={{
                    title: 'Workout',
                    tabBarIcon: ({ color, size }) => <Ionicons name="barbell" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
