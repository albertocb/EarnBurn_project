import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme/theme';

const PlaceholderScreen = ({ name }: { name: string }) => (
    <View style= { styles.container } >
    <Text style={ styles.text }> { name } </Text>
        </View>
);

export const AthleteProfileScreen = () => <PlaceholderScreen name="Athlete Profile" />;
export const MacrocycleBuilderScreen = () => <PlaceholderScreen name="Macrocycle Builder" />;
export const MesocycleEditorScreen = () => <PlaceholderScreen name="Mesocycle Editor" />;
export const PlanCalendarScreen = () => <PlaceholderScreen name="Plan Calendar" />;
export const LiveWorkoutScreen = () => <PlaceholderScreen name="Live Workout" />;
export const BodyMetricsScreen = () => <PlaceholderScreen name="Body Metrics" />;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        ...typography.h2,
        color: colors.primary,
    },
});
