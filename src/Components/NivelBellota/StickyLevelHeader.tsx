import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { scale } from 'react-native-size-matters';
import NivelTextoBox from './NivelTextoBox';

type Props = {
    unit: number;
    sectionNumber: number;
    title: string;
    topOffset: number;
    onMenuPress?: () => void;
};

export default function StickyLevelHeader({ unit, sectionNumber, title, topOffset, onMenuPress }: Props) {
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const prevKey = useRef(`${unit}-${sectionNumber}`);
    const currentKey = `${unit}-${sectionNumber}`;

    useEffect(() => {
        if (prevKey.current === currentKey) return;
        prevKey.current = currentKey;
        // Animación suave de cambio de texto
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
    }, [currentKey, fadeAnim]);

    return (
        <View pointerEvents="box-none" style={[styles.absoluteContainer, { top: topOffset }]}>
            <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
                <NivelTextoBox
                    unit={unit}
                    sectionNumber={sectionNumber}
                    title={title}
                    onMenuPress={onMenuPress}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    absoluteContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 450, // Debajo del TopBar (500+) pero arriba del contenido (100)
        paddingTop: scale(10),
        alignItems: 'center',
    },
});
