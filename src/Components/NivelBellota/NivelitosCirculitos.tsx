import React from 'react';
import { View, Animated } from 'react-native';
import EclipseCircles from './Circulo_Nivel_Bellota';
import EclipseTest from './NivelTest';
import { computeZigzagPositions, type BellotaSublevel } from '../../Navigation/NavegacionJuegos/bellotaConfig';
import { useGame } from '../../api/context/GameContext';

type Props = {
    unitKey: number;
    sublevels: BellotaSublevel[];
    testUnlocked: boolean;
    onGoToQuiz: (levelId: string) => void;
    scrollY: Animated.Value;
    sectionIndex: number;
    sectionHeight: number;
    headerBottomY: number;
};

const NivelitosCirculitos: React.FC<Props> = ({
    unitKey,
    sublevels,
    testUnlocked,
    onGoToQuiz,
    scrollY,
    sectionIndex,
    sectionHeight,
    headerBottomY,
}) => {
    const { isLevelCompleted, isLevelUnlocked, isLevelFailed } = useGame();
    const positions = computeZigzagPositions(sublevels.length);

    const testId = `${unitKey}.test`;

    return (
        <View style={{ position: 'absolute', inset: 0, zIndex: 1000 }}>
            {sublevels.map((sublevel, i) => (
                <EclipseCircles
                    key={sublevel.id}
                    levelId={sublevel.id}
                    size={85}
                    bottom={positions[i].bottom}
                    left={positions[i].left}
                    zIndex={1000}
                    unlocked={isLevelUnlocked(sublevel.id)}
                    completed={isLevelCompleted(sublevel.id)}
                    failed={isLevelFailed(sublevel.id)}
                    scrollY={scrollY}
                    sectionIndex={sectionIndex}
                    sectionHeight={sectionHeight}
                    headerBottomY={headerBottomY}
                    onPress={() => onGoToQuiz(sublevel.id)}
                />
            ))}

            <EclipseTest
                levelId={testId}
                size={110}
                bottom={positions[sublevels.length].bottom}
                left={positions[sublevels.length].left}
                zIndex={1001}
                unlocked={isLevelUnlocked(testId)}
                completed={isLevelCompleted(testId)}
                scrollY={scrollY}
                sectionIndex={sectionIndex}
                sectionHeight={sectionHeight}
                headerBottomY={headerBottomY}
                onPress={() => onGoToQuiz(testId)}
            />
        </View>
    );
};

export default NivelitosCirculitos;
