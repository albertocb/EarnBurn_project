import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTimerStore } from '../store/timerStore';
import { colors, typography } from '../theme/theme';

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

    const barColor = isRunning ? colors.primary : '#D946EF'; // Magenta-ish when paused

    return (
        <View style={[styles.container, { top: insets.top + 8 }]} pointerEvents="box-none">
            <TouchableOpacity
                style={[
                    styles.square,
                    {
                        borderColor: barColor,
                        backgroundColor: isRunning ? colors.surface : '#FAE8FF' // Very light magenta tint when paused
                    }
                ]}
                onPress={toggle}
                activeOpacity={0.8}
            >
                <Text
                    style={[styles.timeText, { color: barColor }]}
                    adjustsFontSizeToFit
                    numberOfLines={1}
                >
                    {displayTime}
                </Text>
            </TouchableOpacity>
        </View>
    );

};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 16,
        alignItems: 'flex-end',
        zIndex: 9999,
    },
    square: {
        width: 72,
        height: 72,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
        borderRadius: 16, // Rounded square
        borderWidth: 2,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    timeText: {
        ...typography.bodyBold,
        fontSize: 13,
        textAlign: 'center',
        fontVariant: ['tabular-nums'],
        width: '100%',
    },
});


