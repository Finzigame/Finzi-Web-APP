import React, { useMemo } from "react";
import { Dimensions, StyleSheet, View, Animated } from "react-native";
import { scale } from "react-native-size-matters";
import Puntitos from "./Puntitos";
import GameScreen from "./NivelitosCirculitos";
import Ramas from "./Ramas";
import Arbusto from "../../assets/Images/Nivel_Bellota/arbusto";
import type { BellotaSublevel } from "../../Navigation/NavegacionJuegos/bellotaConfig";

const { width: SCREEN_WIDTH, height: WINDOW_H } = Dimensions.get("window");
const ARBUSTO_WIDTH = Math.round(SCREEN_WIDTH * 1.15);
const ARBUSTO_HEIGHT = Math.round(ARBUSTO_WIDTH * (195 / 515) * 1.5);
const ARBUSTO_OFFSET_X = Math.round((ARBUSTO_WIDTH - SCREEN_WIDTH) / 2);

type Props = {
    unitKey: number;
    sublevels: BellotaSublevel[];
    testUnlocked: boolean;
    height: number;
    topPadding: number;
    bottomPadding: number;
    scrollY: Animated.Value;
    sectionIndex: number;
    headerBottomY: number;
    onGoToQuiz: (levelId: string) => void;
};

export default function LevelSection({
    unitKey,
    sublevels,
    testUnlocked,
    height,
    topPadding,
    bottomPadding,
    scrollY,
    sectionIndex,
    headerBottomY,
    onGoToQuiz,
}: Props) {
    const absoluteY = sectionIndex * height;

    const { bushScale, bushOpacity, bushTranslateY } = useMemo(() => {
        const scale = scrollY.interpolate({
            inputRange: [absoluteY - WINDOW_H, absoluteY - WINDOW_H + 350],
            outputRange: [0.4, 1],
            extrapolate: 'clamp',
        });
        return {
            bushScale: scale,
            bushOpacity: scrollY.interpolate({
                inputRange: [absoluteY - WINDOW_H + 50, absoluteY - WINDOW_H + 250],
                outputRange: [0, 1],
                extrapolate: 'clamp',
            }),
            bushTranslateY: scale.interpolate({ inputRange: [0.4, 1], outputRange: [20, 0] }),
        };
    }, [scrollY, absoluteY]);

    return (
        <View style={[styles.section, { height }]}>
            <Ramas
                scrollY={scrollY}
                sectionIndex={sectionIndex}
                sectionHeight={height}
            />

            <Puntitos cantidad={8} />

            <Animated.View
                pointerEvents="none"
                style={[
                    styles.arbustoHeader,
                    {
                        left: -ARBUSTO_OFFSET_X,
                        opacity: bushOpacity,
                        transform: [
                            { scale: bushScale },
                            { translateY: bushTranslateY },
                        ]
                    }
                ]}
            >
                <Arbusto width={ARBUSTO_WIDTH} height={ARBUSTO_HEIGHT} />
            </Animated.View>

            <View
                style={[
                    styles.contentArea,
                    {
                        paddingTop: topPadding + scale(40),
                        paddingBottom: bottomPadding,
                    },
                ]}
            >
                <GameScreen
                    unitKey={unitKey}
                    sublevels={sublevels}
                    testUnlocked={testUnlocked}
                    onGoToQuiz={onGoToQuiz}
                    scrollY={scrollY}
                    sectionIndex={sectionIndex}
                    sectionHeight={height}
                    headerBottomY={headerBottomY}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        backgroundColor: "#00646D",
        overflow: "visible",
    },
    contentArea: {
        flex: 1,
        zIndex: 100,
    },
    arbustoHeader: {
        position: "absolute",
        top: -scale(10),
        zIndex: 400,
    },
});
