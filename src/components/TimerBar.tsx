import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTimerStore } from '../store/timerStore';
import { borderRadius, colors, spacing, typography } from '../theme/theme';

export const TimerBar = () => {
    const insets = useSafeAreaInsets();
    const { isRunning, toggle, getElapsedMs } = useTimerStore();
    const [displayTime, setDisplayTime] = useState('00:00:00');

    // Update the display every 500ms when running, or once when paused
    useEffect(() => {
        let interval: NodeJS.Timeout;

        const updateTime = () => {
            const ms = getElapsedMs();
            const totalSeconds = Math.floor(ms / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            const pad = (n: number) => n.toString().padStart(2, '0');
            setDisplayTime(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
        };

        // Initial update
        updateTime();

        if (isRunning) {
            interval = setInterval(updateTime, 500) as unknown as NodeJS.Timeout;
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning, getElapsedMs]);

    // If timer is at 0 and not running, maybe hide it? 
    // Requirement says "always visible" but usually a 00:00:00 timer floating is annoying.
    // Spec says: "Global stopwatch shown... (same spot on every screen)" implies always visible.
    // Let's keep it visible.

    const barColor = isRunning ? colors.primary : '#FF00FF'; // Magenta-ish when paused
    // Theme doesn't have magenta, using hardcoded for now or maybe 'secondary' if we prefer.
    // Requirement: "magenta-ish... if available; otherwise define a single constant"
    const accentColor = isRunning ? colors.primary : '#D946EF'; // Fuchsia-500 style

    return (
        <View style={[styles.container, { bottom: 85 + insets.bottom }]}>
            {/* 
               Position: 
               - Above Tab Bar (approx 50-60px + safe area)
               - Let's say 85px from bottom to clear tabs
            */}
            <TouchableOpacity
                style={[styles.pill, { borderColor: accentColor }]}
                onPress={toggle}
                activeOpacity={0.8}
            >
                <View style={styles.content}>
                    <Text style={[styles.timeText, { color: accentColor }]}>
                        {displayTime}
                    </Text>
                    <View style={[styles.iconContainer, { backgroundColor: accentColor }]}>
                        <Ionicons
                            name={isRunning ? "pause" : "play"}
                            size={16}
                            color={colors.background}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999, // On top of everything
        pointerEvents: 'box-none', // Allow clicks pass through outside the pill
    },
    pill: {
        backgroundColor: colors.surface,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.round,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.s,
    },
    timeText: {
        ...typography.bodyBold,
        fontVariant: ['tabular-nums'], // Fixed width numbers to prevent jitter
    },
    iconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
