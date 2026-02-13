import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/common/Button';
import { WARMUP_MS } from '../../src/constants/timer';
import { useTimerStore } from '../../src/store/timerStore';
import { useWorkoutDraftStore } from '../../src/store/workoutDraftStore';
import { borderRadius, colors, spacing, typography } from '../../src/theme/theme';

const RING_SIZE = 240;
const RING_STROKE = 10;

export default function WarmupScreen() {
    const router = useRouter();
    const { draft } = useWorkoutDraftStore();
    const { getElapsedMs, isRunning, toggle } = useTimerStore();

    const [remainingMs, setRemainingMs] = useState(WARMUP_MS);
    const [progress, setProgress] = useState(0); // 0 → 1

    const isComplete = remainingMs <= 0;
    const isPaused = !isRunning && !isComplete;

    // ── Tick loop ──────────────────────────────────────────────
    useEffect(() => {
        const update = () => {
            const elapsed = getElapsedMs();
            const rem = Math.max(0, WARMUP_MS - elapsed);
            setRemainingMs(rem);
            setProgress(Math.min(1, elapsed / WARMUP_MS));
        };

        update(); // initial

        const interval = setInterval(update, 500);
        return () => clearInterval(interval);
    }, [getElapsedMs, isRunning]);

    // ── Block hardware back (Android) ──────────────────────────
    useEffect(() => {
        if (Platform.OS !== 'android') return;

        const handler = () => true;
        const sub = BackHandler.addEventListener('hardwareBackPress', handler);
        return () => sub.remove();
    }, []);

    // ── Format mm:ss ───────────────────────────────────────────
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timeDisplay = `${pad(minutes)}:${pad(seconds)}`;

    // ── Tap to toggle timer ────────────────────────────────────
    const handleScreenTap = () => {
        if (isComplete) return; // don't toggle once done
        toggle();
    };

    // ── Navigate to workout ────────────────────────────────────
    const handleStart = () => {
        if (!isComplete) return;
        router.replace('/(tabs)/workout');
    };

    // ── Progress ring ──────────────────────────────────────────
    const halfSize = RING_SIZE / 2;
    const rotateDeg = progress * 360;
    const ringColor = isComplete ? colors.primary : (isPaused ? colors.textDim : colors.warning);

    return (
        <Pressable
            style={styles.container}
            onPress={handleScreenTap}
            testID="warmup-screen"
        >
            {/* Header context */}
            <View style={styles.header}>
                <Text style={styles.label}>WARM UP</Text>
                {draft && (
                    <Text style={styles.subtitle}>
                        {draft.dayName} — Week {draft.week}
                    </Text>
                )}
            </View>

            {/* Progress Ring + Timer area */}
            <View style={styles.ringContainer}>
                {/* Track (background ring) */}
                <View
                    style={[
                        styles.ring,
                        {
                            width: RING_SIZE,
                            height: RING_SIZE,
                            borderRadius: halfSize,
                            borderWidth: RING_STROKE,
                            borderColor: colors.surfaceHighlight,
                        },
                    ]}
                />

                {/* Progress overlay — left half */}
                <View style={[styles.halfClip, { width: halfSize, left: 0 }]}>
                    <View
                        style={[
                            styles.halfRing,
                            {
                                width: RING_SIZE,
                                height: RING_SIZE,
                                borderRadius: halfSize,
                                borderWidth: RING_STROKE,
                                borderColor: ringColor,
                                transform: [
                                    { rotate: rotateDeg > 180 ? `${rotateDeg - 180}deg` : '0deg' },
                                ],
                                opacity: rotateDeg > 180 ? 1 : 0,
                            },
                        ]}
                    />
                </View>

                {/* Progress overlay — right half */}
                <View style={[styles.halfClip, { width: halfSize, right: 0 }]}>
                    <View
                        style={[
                            styles.halfRing,
                            {
                                width: RING_SIZE,
                                height: RING_SIZE,
                                borderRadius: halfSize,
                                borderWidth: RING_STROKE,
                                borderColor: ringColor,
                                left: -halfSize,
                                transform: [
                                    { rotate: `${Math.min(rotateDeg, 180)}deg` },
                                ],
                            },
                        ]}
                    />
                </View>

                {/* Center content */}
                <View style={styles.centerContent}>
                    {!isComplete && !isPaused && (
                        <Text style={styles.fireEmoji}>🔥</Text>
                    )}
                    <Text
                        style={[
                            styles.countdown,
                            isComplete && { color: colors.primary },
                            isPaused && { color: colors.textDim },
                        ]}
                        testID="warmup-countdown"
                    >
                        {isComplete ? 'READY' : timeDisplay}
                    </Text>
                    {!isComplete && !isPaused && (
                        <Text style={styles.countdownLabel}>remaining</Text>
                    )}
                </View>

                {/* ── Pause Overlay ─────────────────────────────── */}
                {isPaused && (
                    <View style={styles.pauseOverlay} testID="pause-overlay">
                        <Ionicons
                            name="play"
                            size={48}
                            color={colors.primary}
                            testID="pause-play-icon"
                        />
                        <Text style={styles.pausedText}>PAUSED</Text>
                        <Text style={styles.tapHint}>Tap to resume</Text>
                    </View>
                )}
            </View>

            {/* Motivational text */}
            <Text style={styles.motivational}>
                {isComplete
                    ? 'Warm-up complete. Let\'s crush it! 💪'
                    : isPaused
                        ? 'Tap anywhere to resume'
                        : 'Prepare your body. Focus your mind.'}
            </Text>

            {/* Start button */}
            <View style={styles.buttonContainer}>
                <Button
                    title={isComplete ? '🚀  Start Workout' : `🔒  Warming Up…`}
                    onPress={handleStart}
                    disabled={!isComplete}
                    style={[
                        styles.button,
                        !isComplete && styles.buttonDisabled,
                    ]}
                    testID="start-workout-button"
                />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.l,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    label: {
        ...typography.caption,
        fontSize: 14,
        letterSpacing: 4,
        color: colors.warning,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        fontSize: 14,
    },

    // ── Progress ring ──
    ringContainer: {
        width: RING_SIZE,
        height: RING_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    ring: {
        position: 'absolute',
    },
    halfClip: {
        position: 'absolute',
        height: RING_SIZE,
        overflow: 'hidden',
    },
    halfRing: {
        position: 'absolute',
        top: 0,
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    fireEmoji: {
        fontSize: 32,
        marginBottom: spacing.xs,
    },
    countdown: {
        ...typography.h1,
        fontSize: 52,
        fontWeight: '800',
        color: colors.primary,
        fontVariant: ['tabular-nums'],
    },
    countdownLabel: {
        ...typography.caption,
        color: colors.textDim,
        fontSize: 13,
        marginTop: spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },

    // ── Pause overlay ──
    pauseOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.overlay,
        borderRadius: RING_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pausedText: {
        ...typography.bodyBold,
        color: colors.primary,
        fontSize: 16,
        letterSpacing: 3,
        marginTop: spacing.s,
    },
    tapHint: {
        ...typography.caption,
        color: colors.textDim,
        fontSize: 11,
        marginTop: spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    // ── Bottom ──
    motivational: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        fontSize: 15,
        marginBottom: spacing.xxl,
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: spacing.l,
    },
    button: {
        borderRadius: borderRadius.m,
    },
    buttonDisabled: {
        opacity: 0.4,
    },
});
