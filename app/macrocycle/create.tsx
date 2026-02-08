import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import { useProgramStore } from '../../src/store/programStore';
import { colors, spacing } from '../../src/theme/theme';

export default function CreateMacrocycle() {
    const [name, setName] = useState('');
    const createMacrocycle = useProgramStore((state) => state.createMacrocycle);
    const router = useRouter();

    const handleCreate = () => {
        if (!name.trim()) return;
        createMacrocycle(name);
        // In a real app we'd get the ID back, but here we'll just go back to the list/plan view which should show the active one.
        // Or we assume the store sets it as active.
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'New Macrocycle', headerBackTitle: 'Cancel' }} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
                <View style={{ flex: 1 }}>
                    <Input
                        label="Macrocycle Name"
                        placeholder="e.g. Summer Shred 2026"
                        value={name}
                        onChangeText={setName}
                        autoFocus
                    />
                </View>
                <Button title="Create Plan" onPress={handleCreate} disabled={!name.trim()} />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, padding: spacing.l },
});
