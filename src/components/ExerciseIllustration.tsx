import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';

/** Icon/color mapping per muscle group + pattern */
const GROUP_ICON_MAP: Record<string, { icon: keyof typeof Ionicons.glyphMap; bg: string; color: string }> = {
    'Upper-Push': { icon: 'barbell-outline', bg: 'rgba(212,255,0,0.12)', color: '#D4FF00' },
    'Upper-Pull': { icon: 'fitness-outline', bg: 'rgba(0,229,255,0.12)', color: '#00E5FF' },
    'Upper-Isolation': { icon: 'flash-outline', bg: 'rgba(212,255,0,0.12)', color: '#D4FF00' },
    'Lower-Squat': { icon: 'body-outline', bg: 'rgba(0,255,133,0.12)', color: '#00FF85' },
    'Lower-Hinge': { icon: 'body-outline', bg: 'rgba(0,255,133,0.12)', color: '#00FF85' },
    'Lower-Lunge': { icon: 'walk-outline', bg: 'rgba(0,255,133,0.12)', color: '#00FF85' },
    'Lower-Isolation': { icon: 'body-outline', bg: 'rgba(0,255,133,0.12)', color: '#00FF85' },
    'Core-Isolation': { icon: 'shield-outline', bg: 'rgba(255,193,7,0.12)', color: '#FFC107' },
    'Cardio-Cardio': { icon: 'heart-outline', bg: 'rgba(255,68,68,0.12)', color: '#FF4444' },
    'Full Body-Carry': { icon: 'walk-outline', bg: 'rgba(0,229,255,0.12)', color: '#00E5FF' },
};

function getFallback(group: string, pattern: string) {
    return (
        GROUP_ICON_MAP[`${group}-${pattern}`] ||
        GROUP_ICON_MAP[`${group}-Isolation`] ||
        { icon: 'barbell-outline' as const, bg: 'rgba(212,255,0,0.12)', color: '#D4FF00' }
    );
}

interface ExerciseIllustrationProps {
    /** Optional image source (local require or URI) */
    image?: ImageSourcePropType;
    /** Exercise muscle group for fallback icon */
    group: string;
    /** Exercise pattern for fallback icon */
    pattern?: string;
    /** Thumbnail size (default 56) */
    size?: number;
}

export const ExerciseIllustration: React.FC<ExerciseIllustrationProps> = ({
    image,
    group,
    pattern = 'Isolation',
    size = 56,
}) => {
    const containerStyle = {
        width: size,
        height: size,
        borderRadius: size * 0.22,
    };

    if (image) {
        return (
            <View style={[styles.container, containerStyle]} testID="exercise-illustration">
                <Image
                    source={image}
                    style={[styles.image, { width: size, height: size, borderRadius: size * 0.22 }]}
                    resizeMode="cover"
                    testID="exercise-image"
                />
            </View>
        );
    }

    const { icon, bg, color } = getFallback(group, pattern);
    return (
        <View
            style={[styles.container, containerStyle, { backgroundColor: bg }]}
            testID="exercise-illustration"
        >
            <Ionicons name={icon} size={size * 0.45} color={color} testID="exercise-fallback-icon" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        // dimensions set inline
    },
});
