import React, { useRef, useState } from "react";
import { StyleSheet, View, ScrollView, Dimensions, Animated } from "react-native";
import { scale } from "react-native-size-matters";
import TopBar from "../Components/TopBar";
import BottomNav from "../Components/Bottom_Navigator";
import { ARBOL_FINANCIERO_UNIT_LIST } from "../Navigation/NavegacionJuegos/arbolFinancieroConfig";
import { useGame } from "../api/context/GameContext";
import SoundManager from "../Utils/SoundManager";
import LevelSection from "../Components/NivelBellota/LevelSection";
import StickyLevelHeader from "../Components/NivelBellota/StickyLevelHeader";
import LessonsMenuModal from "../Components/NivelBellota/LessonsMenuModal";

const { width: SCREEN_WIDTH_NAF, height: SCREEN_H } = Dimensions.get("window");
const S = SCREEN_WIDTH_NAF / 406;
const TOPBAR_BOTTOM = Math.round(30 + 130 * S) + scale(4);
const HEADER_BOTTOM_Y = TOPBAR_BOTTOM + scale(10) + scale(72);
const SECTION_TOP_PADDING = scale(90);
const BOTTOM_OVERLAY = scale(16);
const SECTION_HEIGHT = SCREEN_H - scale(70);

type NivelArbolFinancieroProps = {
    onBackToSettings: () => void;
    onGoToProfile: () => void;
    onGoToLevels: () => void;
    onSelectLevel: (levelId: string) => void;
    onGoToAgendita?: () => void;
    onGoToLivesShop?: () => void;
};

export default function NivelArbolFinanciero({
    onBackToSettings,
    onGoToProfile,
    onGoToLevels,
    onGoToAgendita,
    onSelectLevel,
    onGoToLivesShop,
}: NivelArbolFinancieroProps) {
    const { score, lives, visibleLevelIds } = useGame();
    const scrollY = useRef(new Animated.Value(0)).current;
    const [activeUnitIndex, setActiveUnitIndex] = useState(0);
    const [menuVisible, setMenuVisible] = useState(false);

    const unitList = ARBOL_FINANCIERO_UNIT_LIST(Array.from(visibleLevelIds));

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: false,
            listener: (event: any) => {
                const y = event.nativeEvent.contentOffset.y;
                const idx = Math.min(
                    unitList.length - 1,
                    Math.max(0, Math.floor(y / SECTION_HEIGHT))
                );
                setActiveUnitIndex(idx);
            },
        }
    );

    const activeUnit = unitList[Math.min(activeUnitIndex, unitList.length - 1)];

    if (!activeUnit) return null;

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={{ paddingBottom: Math.round(SCREEN_H * 0.3) }}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={handleScroll}
            >
                {unitList.map((unit, index) => (
                    <LevelSection
                        key={unit.unitKey}
                        unitKey={unit.unitKey}
                        sublevels={unit.sublevels}
                        testUnlocked={unit.testUnlocked}
                        height={SECTION_HEIGHT}
                        topPadding={SECTION_TOP_PADDING}
                        bottomPadding={BOTTOM_OVERLAY}
                        scrollY={scrollY}
                        sectionIndex={index}
                        headerBottomY={HEADER_BOTTOM_Y}
                        onGoToQuiz={(levelId) => {
                            SoundManager.play('tap_primary');
                            onSelectLevel(levelId);
                        }}
                    />
                ))}
            </ScrollView>

            <StickyLevelHeader
                unit={activeUnit.unitKey}
                sectionNumber={activeUnit.unitKey}
                title={activeUnit.title}
                topOffset={TOPBAR_BOTTOM}
                onMenuPress={() => setMenuVisible(true)}
            />

            <LessonsMenuModal
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onSelectLesson={(id) => {
                    SoundManager.play('tap_primary');
                    onSelectLevel(id);
                }}
                unitList={unitList}
                menuTop={HEADER_BOTTOM_Y + 4}
                accentColor="#2D5C3A"
            />

            <TopBar
                score={score}
                lives={lives}
                onProfilePress={onGoToProfile}
                onSettingsPress={onBackToSettings}
                onLivesPress={onGoToLivesShop}
            />

            <BottomNav
                onBackToSettings={onBackToSettings}
                onGoToLevels={onGoToLevels}
                onGoToAgendita={onGoToAgendita}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#2D5C3A" },
    scroll: { flex: 1 },
});
