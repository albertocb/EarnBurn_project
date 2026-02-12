import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTimerStore } from '../store/timerStore';
import { colors, typography } from '../theme/theme';

import { WARMUP_MS } from '../constants/timer';

export const TimerBar = () => {
    const { isRunning, toggle, getElapsedMs } = useTimerStore();
    const [displayTime, setDisplayTime] = useState('00:00:00');
    // Using simple state to trigger re-renders for elapsed time logic if needed, 
    // though getElapsedMs is imperative. We can rely on the re-render from isRunning 
    // or the interval to update styles if elapsed time crosses the threshold.
    // However, the interval below only updates `displayTime`. 
    // We should also track the current elapsed time in state or ref to update the UI styles 
    // when crossing the 10-minute mark.
    const [elapsedMs, setElapsedMs] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        const updateTime = () => {
            const ms = getElapsedMs();
            setElapsedMs(ms);

            // Logic for display:
            // If in warm-up (ms < WARMUP_MS), display ms.
            // If warm-up finished (ms >= WARMUP_MS), display (ms - WARMUP_MS).
            const displayMs = (ms < WARMUP_MS) ? ms : Math.max(0, ms - WARMUP_MS);

            const totalSeconds = Math.floor(displayMs / 1000);
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

    const PAUSED_NEON = '#39FF14';
    const WARMUP_RUNNING = colors.warning ?? '#FFB000'; // Warm orange/amber
    const NORMAL_RUNNING = colors.primary;

    const hasStarted = isRunning || elapsedMs > 0;
    const isWarmup = hasStarted && elapsedMs < WARMUP_MS;
    const isIdle = !isRunning && elapsedMs === 0;

    let accent: string;
    let backgroundColor: string;

    if (isIdle) {
        accent = colors.border; // Neutral
        backgroundColor = colors.surface; // Default surface
    } else if (isWarmup) {
        // Warm-up phase
        if (isRunning) {
            accent = WARMUP_RUNNING;
            backgroundColor = 'rgba(255, 176, 0, 0.12)'; // Warm tint
        } else {
            accent = PAUSED_NEON;
            backgroundColor = 'rgba(57, 255, 20, 0.12)'; // Neon tint
        }
    } else {
        // Normal phase (after 10 mins)
        if (isRunning) {
            accent = NORMAL_RUNNING;
            backgroundColor = colors.surface; // Back to normal surface
        } else {
            accent = PAUSED_NEON;
            backgroundColor = 'rgba(57, 255, 20, 0.12)'; // Neon tint
        }
    }

    return (
        <TouchableOpacity
            style={[
                styles.square,
                {
                    borderColor: accent,
                    backgroundColor: backgroundColor,
                    borderWidth: isIdle ? 1 : (isRunning ? 1 : 2), // Keep logic consistent: thicker border when paused (unless idle)
                }
            ]}
            onPress={toggle}
            activeOpacity={0.8}
        >
            {isWarmup && (
                <Text style={[styles.warmupSymbol, { color: accent }]}>
                    🔥
                </Text>
            )}
            <Text
                style={[styles.timeText, { color: accent }]}
                adjustsFontSizeToFit
                numberOfLines={1}
            >
                {displayTime}
            </Text>
        </TouchableOpacity>
    );

};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 150,
        alignItems: 'flex-end',
        zIndex: 9999,
    },
    square: {
        width: 84,
        height: 26,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0, // Minimized padding
        borderRadius: 5,
        borderWidth: 1,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    timeText: {
        ...typography.bodyBold,
        fontSize: 20, // Slightly larger
        lineHeight: 21, // Tight line height, close to font size
        textAlign: 'center',
        textAlignVertical: 'center', // Android vertical center
        includeFontPadding: false,   // Android remove extra padding
        fontVariant: ['tabular-nums'],
        width: '100%',
    },
    warmupSymbol: {
        position: 'absolute',
        top: 2,
        right: -19,
        fontSize: 14,
        fontWeight: 'bold',
        opacity: 0.9,
    },
});


