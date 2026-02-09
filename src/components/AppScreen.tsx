import React, { ReactNode } from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/theme';
import { TimerBar } from './TimerBar';

interface AppScreenProps {
    children: ReactNode;
    scroll?: boolean;
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    paddingHorizontal?: number;
    paddingBottom?: number;
}

export const AppScreen = ({
    children,
    scroll = true,
    style,
    contentContainerStyle,
    paddingHorizontal = spacing.m,
    paddingBottom = spacing.xl,
}: AppScreenProps) => {
    const insets = useSafeAreaInsets();

    const timerContainerStyle = {
        alignItems: 'center' as const,
        marginTop: insets.top + spacing.s,
        marginBottom: spacing.m,
    };

    const commonContent = (
        <>
            <View style={timerContainerStyle}>
                <TimerBar />
            </View>
            {children}
        </>
    );

    if (scroll) {
        return (
            <View style={[styles.container, style]}>
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        contentContainerStyle,
                        { paddingHorizontal, paddingBottom }
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    {commonContent}
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={[styles.container, style, { paddingHorizontal, paddingBottom }]}>
            {commonContent}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
    },
});
