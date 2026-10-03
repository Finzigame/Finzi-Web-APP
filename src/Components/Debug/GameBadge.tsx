import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type GameBadgeProps = {
    levelId: string | null;
    game: string;
    isRepaso?: boolean;
};

/** Etiqueta pequena para identificar nivel y tipo de juego durante las pruebas. */
export default function GameBadge({ levelId, game, isRepaso = false }: GameBadgeProps) {
    return (
        <View style={styles.badge} pointerEvents="none">
            <Text style={styles.text}>
                {levelId ?? '?'} · {game}{isRepaso ? ' · repaso' : ''}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        bottom: 6,
        left: 6,
        zIndex: 9999,
        elevation: 9999,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        backgroundColor: 'rgba(0,0,0,0.65)',
    },
    text: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
});