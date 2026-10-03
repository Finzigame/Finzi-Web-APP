import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { AlertButton } from 'react-native';
import { dismissAlert, subscribeAlerts, WebAlert } from './alertStore';

// Reemplazo visual de Alert.alert para web (ver setup.web.ts)
export default function AlertHost() {
    const [queue, setQueue] = useState<WebAlert[]>([]);

    useEffect(() => subscribeAlerts(setQueue), []);

    const current = queue[0];
    if (!current) return null;

    const handlePress = (button: AlertButton) => {
        dismissAlert(current.id);
        button.onPress?.();
    };

    const stacked = current.buttons.length > 2;

    return (
        <Modal transparent visible animationType="fade" onRequestClose={() => {}}>
            <View style={styles.backdrop}>
                <View style={styles.card} accessibilityRole="alert">
                    <Text style={styles.title}>{current.title}</Text>
                    {!!current.message && <Text style={styles.message}>{current.message}</Text>}
                    <View style={[styles.buttons, stacked && styles.buttonsStacked]}>
                        {current.buttons.map((button, i) => {
                            const isCancel = button.style === 'cancel';
                            const isDestructive = button.style === 'destructive';
                            return (
                                <Pressable
                                    key={`${button.text}-${i}`}
                                    accessibilityRole="button"
                                    onPress={() => handlePress(button)}
                                    style={({ pressed }) => [
                                        styles.button,
                                        !stacked && styles.buttonFlex,
                                        isCancel ? styles.buttonCancel : styles.buttonPrimary,
                                        isDestructive && styles.buttonDestructive,
                                        pressed && styles.buttonPressed,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.buttonText,
                                            isCancel ? styles.buttonTextCancel : styles.buttonTextPrimary,
                                        ]}
                                    >
                                        {button.text ?? 'OK'}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(9, 64, 105, 0.45)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingTop: 22,
        paddingHorizontal: 20,
        paddingBottom: 18,
        shadowColor: '#094069',
        shadowOpacity: 0.25,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 8 },
    },
    title: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 20,
        color: '#183336',
        textAlign: 'center',
    },
    message: {
        fontFamily: 'Fredoka-Regular',
        fontSize: 16,
        color: '#3C5A5E',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 22,
    },
    buttons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 20,
    },
    buttonsStacked: {
        flexDirection: 'column',
    },
    button: {
        minHeight: 46,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    buttonFlex: {
        flex: 1,
    },
    buttonPrimary: {
        backgroundColor: '#00AACC',
    },
    buttonCancel: {
        backgroundColor: '#E6F4F7',
    },
    buttonDestructive: {
        backgroundColor: '#E5484D',
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.97 }],
    },
    buttonText: {
        fontFamily: 'Fredoka-Medium',
        fontSize: 16,
    },
    buttonTextPrimary: {
        color: '#FFFFFF',
    },
    buttonTextCancel: {
        color: '#094069',
    },
});
