import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import GameBadge from '../Components/Debug/GameBadge';
import { SHOW_GAME_BADGES } from '../api/config/env';

import Welcome from '../Screen/Welcome';
import EntryScreen from '../Screen/EntryScreen';
import LoginScreen from '../Screen/LoginScreen';
import RegisterScreen from '../Screen/RegisterScreen';
import ForgotPasswordScreen from '../Screen/ForgotPasswordScreen';
import ResetPasswordScreen from '../Screen/ResetPasswordScreen';
import RepasoIntroScreen from '../Screen/RepasoIntroScreen';
import Levels from '../Screen/Levels';
import Settings from '../Screen/Settings';
import Profile from '../Screen/Profile';
import NivelBellota from '../Screen/NivelBellota';
import CongratulationsScreen from '../Screen/CongratulationsScreen';
import IncorrectScreen from '../Screen/IncorrectScreen';
import LivesShopScreen from '../Screen/LivesShopScreen';
import QuizBellota from '../Screen/Juegos/QuizBellota';
import Agendita from '../Screen/Agendita';
import QuizMultiple from '../Screen/Juegos/QuizMultiple';
import Juegocalc from '../Screen/Juegos/Juegocalc';
import CompletaFrase from '../Screen/Juegos/CompletaFrase';
import DetectaElError from '../Screen/Juegos/DetectaElError';
import CompararDecide from '../Screen/Juegos/CompararDecide';
import Decision from '../Screen/Juegos/Decision';
import JuegoClassify from '../Screen/Juegos/JuegoClassify';
import NivelArbolFinanciero from '../Screen/NivelArbolFinanciero';

import { AuthContext } from '../api/context/AuthContext';
import { useGame } from '../api/context/GameContext';
import { startRepaso } from '../api/game';
import { LEVELS_CONFIG } from './NavegacionJuegos/levelConfig';
import { USE_DEV_USER, DEV_USER_ID } from '../api/config/env';

export type ScreenType =
    | 'welcome'
    | 'entry'
    | 'login'
    | 'register'
    | 'forgotPassword'
    | 'resetPassword'
    | 'levels'
    | 'settings'
    | 'profile'
    | 'nivelBellota'
    | 'nivelArbolFinanciero'
    | 'quizBellota'
    | 'quizMultiple'
    | 'juegocalc'
    | 'completaFrase'
    | 'detectaError'
    | 'compara'
    | 'decision'
    | 'classify'
    | 'congrats'
    | 'incorrect'
    | 'livesShop'
    | 'agendita'
    | 'repasoIntro';

type QuestionState = {
    session_id: string;
    lives_left: number;
    total_items: number;
    lesson_item_id: string;
    position: number;
    prompt: string;
    options?: McOption[];
    skipIntroVideo: boolean;
};

type McOption = {
    option_id: string;
    text: string;
};

type QuestionStateMc = QuestionState & {
    options: McOption[];
};

type AfterStatus = 'active' | 'finished' | 'failed';

type GameScreenType = Extract<ScreenType, 'quizBellota' | 'quizMultiple' | 'juegocalc' | 'completaFrase' | 'detectaError' | 'compara' | 'decision' | 'classify'>;

type CongratsState = {
    bellotasEarned: number;
    bellotasBalance: number;
    statusAfter: AfterStatus;
    returnScreen: GameScreenType;
    repasoNeeded?: boolean;
    repasoWrongCount?: number;
    sessionId?: string;
};

type RepasoState = {
    wrongCount: number;
    originalSessionId: string;
    returnGameScreen: GameScreenType;
};

type IncorrectState = {
    feedback: string;
    livesLeft: number;
    statusAfter: AfterStatus;
    returnScreen: GameScreenType;
};

const GAME_SCREENS = new Set<string>([
    'quizBellota',
    'quizMultiple',
    'juegocalc',
    'decision',
    'classify',
    'compara',
    'detectaError',
    'completaFrase',
]);

const AppNavigator: React.FC = () => {
    const { session, initializing } = useContext(AuthContext);
    const { setScore, lives, refreshLives, refreshProgress, isLevelUnlocked, isLevelCompleted, isLevelFailed, setIsReviewMode, setRepasoStartData } = useGame();

    const [currentScreen, setCurrentScreen] = useState<ScreenType>('welcome');
    const [resetEmail, setResetEmail] = useState<string>("");
    const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
    const [quizState, setQuizState] = useState<QuestionState | null>(null);
    const [quizMcState, setQuizMcState] = useState<QuestionStateMc | null>(null);
    const [calcState, setCalcState] = useState<QuestionState | null>(null);
    const [completaFraseState, setCompletaFraseState] = useState<QuestionState | null>(null);
    const [detectaErrorState, setDetectaErrorState] = useState<QuestionState | null>(null);
    const [congratsState, setCongratsState] = useState<CongratsState | null>(null);
    const [incorrectState, setIncorrectState] = useState<IncorrectState | null>(null);
    const [repasoState, setRepasoState] = useState<RepasoState | null>(null);
    const [isInRepaso, setIsInRepaso] = useState(false);
    // Ref para capturar el session_id activo desde cualquier pantalla de juego
    const lastSessionIdRef = useRef<string | null>(null);
    // Evitar que el video de intro de classify se reproduzca al volver del IncorrectScreen
    const classifySkipVideoRef = useRef(false);

    // Sync lives when entering the shop due to failure
    useEffect(() => {
        if (currentScreen === 'incorrect' && incorrectState?.statusAfter === 'failed' && (incorrectState?.livesLeft ?? 1) <= 0) {
            void refreshLives();
        }
    }, [currentScreen, incorrectState]);

    useEffect(() => {
        if (!initializing) {
            if (session) {
                setCurrentScreen('levels');
            } else {
                // Clear all game states when logging out
                setSelectedLevelId(null);
                setQuizState(null);
                setQuizMcState(null);
                setCalcState(null);
                setCompletaFraseState(null);
                setDetectaErrorState(null);
                setCongratsState(null);
                setIncorrectState(null);
                setCurrentScreen('welcome');
            }
        }
    }, [initializing, session]);

    const navigateToScreen = (screen: ScreenType) => {
        setCurrentScreen(screen);
    };

    const handleFeedbackNext = (state: CongratsState | IncorrectState | null) => {
        const returnWorld: ScreenType = LEVELS_CONFIG.find(l => l.id === selectedLevelId)?.levelSlug === 'arbol-financiero' ? 'nivelArbolFinanciero' : 'nivelBellota';

        if (!state) {
            setCurrentScreen(returnWorld);
            return;
        }

        // --- SISTEMA DE CONTINUIDAD DINÁMICA ---
        // Si el estado dice 'failed' pero el perfil ya tiene vidas (ej. tras compra en tienda),
        // permitimos al usuario reanudar en lugar de expulsarlo a la tienda.
        if (lives > 0 && state.statusAfter === 'failed') {
            setCurrentScreen(state.returnScreen);
            return;
        }

        if (state.statusAfter === 'active') {
            setCurrentScreen(state.returnScreen);
            return;
        }

        // Repaso: si la sesión terminó con respuestas incorrectas, iniciar repaso
        if (
            state.statusAfter === 'finished' &&
            'repasoNeeded' in state &&
            state.repasoNeeded &&
            state.sessionId &&
            state.repasoWrongCount
        ) {
            const levelConfig = LEVELS_CONFIG.find(l => l.id === selectedLevelId);
            if (true) {
                setRepasoState({
                    wrongCount: state.repasoWrongCount,
                    originalSessionId: state.sessionId,
                    returnGameScreen: state.returnScreen,
                });
                setQuizState(null);
                setQuizMcState(null);
                setCalcState(null);
                setCompletaFraseState(null);
                setDetectaErrorState(null);
                setIsInRepaso(true);
                setCurrentScreen('repasoIntro');
                return;
            }
        }

        // Repaso falló (vidas en 0) → ir al mapa, nivel se muestra en rojo
        if (isInRepaso && state.statusAfter === 'failed') {
            setIsInRepaso(false);
            setRepasoState(null);
            void refreshProgress();
            setCurrentScreen(returnWorld);
            return;
        }

        // Repaso completado exitosamente
        if (isInRepaso) {
            setIsInRepaso(false);
            setRepasoState(null);
        }

        setCurrentScreen(returnWorld);
    };

    const handleBellotaPress = (levelId: string) => {
        const selectedLevel = LEVELS_CONFIG.find((level) => level.id === levelId);

        if (!selectedLevel) {
            setCurrentScreen('nivelBellota');
            return;
        }

        const failed = isLevelFailed(levelId);
        if (!isLevelUnlocked(levelId) && !isLevelCompleted(levelId) && !failed) {
            return;
        }

        const completed = isLevelCompleted(levelId);

        // Gate: sin vidas → llevar a la tienda, excepto si ya está completado (modo repaso)
        if (lives <= 0 && !completed) {
            setCurrentScreen('livesShop');
            return;
        }

        // Modo repaso (voluntary replay): solo aplica para niveles completados, no para los fallidos
        setIsReviewMode(completed && !failed);
        
        // --- Sistema de Continuidad ---
        // Si el nivel cambió, reseteamos todos los estados de juego.
        // Si es el mismo, mantenemos el estado existente para reanudar.
        if (selectedLevelId !== levelId) {
            setSelectedLevelId(levelId);
            setQuizState(null);
            setQuizMcState(null);
            setCalcState(null);
            setCompletaFraseState(null);
            setDetectaErrorState(null);
            classifySkipVideoRef.current = false;
        }

        if (selectedLevel.game === 'quizBellota') {
            setCurrentScreen('quizBellota');
            return;
        }

        if (selectedLevel.game === 'quizMultiple') {
            setCurrentScreen('quizMultiple');
            return;
        }

        if (selectedLevel.game === 'juegocalc') {
            setCurrentScreen('juegocalc');
            return;
        }


        if (selectedLevel.game === 'completaFrase') {
            setCurrentScreen('completaFrase');
            return;
        }

        if (selectedLevel.game === 'detectaError') {
            setCurrentScreen('detectaError');
            return;
        }

        if (selectedLevel.game === 'compara') {
            setCurrentScreen('compara');
            return;
        }

        if (selectedLevel.game === 'decision') {
            setCurrentScreen('decision');
            return;
        }

        if (selectedLevel.game === 'classify') {
            setCurrentScreen('classify');
            return;
        }

        setCurrentScreen('nivelBellota');
    };

    if (initializing) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#0C7E8A" />
            </View>
        );
    }

    const renderScreen = () => {
        const returnWorld: ScreenType = LEVELS_CONFIG.find(l => l.id === selectedLevelId)?.levelSlug === 'arbol-financiero' ? 'nivelArbolFinanciero' : 'nivelBellota';

        switch (currentScreen) {
            case 'welcome':
                return <Welcome onNavigateToEntry={() => navigateToScreen('entry')} />;

            case 'entry':
                return (
                    <EntryScreen
                        onNavigateToLogin={() => navigateToScreen('login')}
                        onNavigateToRegister={() => navigateToScreen('register')}
                    />
                );

            case 'login':
                return (
                    <LoginScreen
                        onNavigateToLevels={() => navigateToScreen('levels')}
                        onNavigateBack={() => navigateToScreen('entry')}
                        onNavigateToForgotPassword={() => navigateToScreen('forgotPassword')}
                    />
                );

            case 'register':
                return (
                    <RegisterScreen
                        onNavigateToLevels={() => navigateToScreen('levels')}
                        onNavigateBack={() => navigateToScreen('entry')}
                    />
                );

            case 'forgotPassword':
                return (
                    <ForgotPasswordScreen
                        onNavigateBack={() => navigateToScreen('login')}
                        onNavigateToReset={(email) => {
                            setResetEmail(email);
                            navigateToScreen('resetPassword');
                        }}
                    />
                );

            case 'resetPassword':
                return (
                    <ResetPasswordScreen
                        email={resetEmail}
                        onNavigateBack={() => navigateToScreen('forgotPassword')}
                        onSuccess={() => navigateToScreen('login')}
                    />
                );

            case 'levels':
                return (
                    <Levels
                        onBackToSettings={() => navigateToScreen('settings')}
                        onGoToProfile={() => navigateToScreen('profile')}
                        onGoToNivelBellota={() => navigateToScreen('nivelBellota')}
                        onGoToArbolFinanciero={() => navigateToScreen('nivelArbolFinanciero')}
                        onGoToAgendita={() => navigateToScreen('agendita')}
                        onGoToLivesShop={() => navigateToScreen('livesShop')}
                    />
                );

            case 'settings':
                return (
                    <Settings
                        onBackToSettings={() => navigateToScreen('settings')}
                        onGoToLevels={() => navigateToScreen('levels')}
                        onGoToProfile={() => navigateToScreen('profile')}
                        onGoToAgendita={() => navigateToScreen('agendita')}
                    />
                );

            case 'profile':
                return (
                    <Profile
                        onBackToSettings={() => navigateToScreen('settings')}
                        onGoToSettings={() => navigateToScreen('settings')}
                        onGoToLevels={() => navigateToScreen('levels')}
                        onGoToAgendita={() => navigateToScreen('agendita')}
                    />
                );

            case 'nivelArbolFinanciero':
                return (
                    <NivelArbolFinanciero
                        onBackToSettings={() => navigateToScreen('settings')}
                        onGoToProfile={() => navigateToScreen('profile')}
                        onGoToLevels={() => navigateToScreen('levels')}
                        onSelectLevel={handleBellotaPress}
                        onGoToAgendita={() => navigateToScreen('agendita')}
                        onGoToLivesShop={() => navigateToScreen('livesShop')}
                    />
                );

            case 'nivelBellota':
                return (
                    <NivelBellota
                        onBackToSettings={() => navigateToScreen('settings')}
                        onGoToProfile={() => navigateToScreen('profile')}
                        onGoToLevels={() => navigateToScreen('levels')}
                        onSelectBellota={handleBellotaPress}
                        onGoToAgendita={() => navigateToScreen('agendita')}
                        onGoToLivesShop={() => navigateToScreen('livesShop')}
                    />
                );

            case 'quizBellota':
                return (
                    <QuizBellota
                        levelId={selectedLevelId}
                        onBackToLevel={() => navigateToScreen(returnWorld)}
                        onNext={() => navigateToScreen(returnWorld)}
                        initialState={quizState}
                        setInitialState={(s) => { setQuizState(s); if (s) lastSessionIdRef.current = s.session_id; }}
                        onShowCongrats={(earned, balance, statusAfter, opts) => {
                            setScore(balance);
                            setIncorrectState(null);
                            setCongratsState({
                                bellotasEarned: earned,
                                bellotasBalance: balance,
                                statusAfter,
                                returnScreen: 'quizBellota',
                                repasoNeeded: opts?.repasoNeeded,
                                repasoWrongCount: opts?.repasoWrongCount,
                                sessionId: opts?.sessionId ?? lastSessionIdRef.current ?? undefined,
                            });
                            navigateToScreen('congrats');
                        }}
                        onShowIncorrect={(feedback, livesLeft, statusAfter) => {
                            setCongratsState(null);
                            setIncorrectState({
                                feedback,
                                livesLeft,
                                statusAfter,
                                returnScreen: 'quizBellota',
                            });
                            navigateToScreen('incorrect');
                        }}
                    />
                );

            case 'quizMultiple':
                return (
                    <QuizMultiple
                        levelId={selectedLevelId}
                        onBackToLevel={() => navigateToScreen(returnWorld)}
                        onNext={() => navigateToScreen(returnWorld)}
                        initialState={quizMcState}
                        setInitialState={(s) => { setQuizMcState(s); if (s) lastSessionIdRef.current = s.session_id; }}
                        onShowCongrats={(earned, balance, statusAfter, opts) => {
                            setScore(balance);
                            setIncorrectState(null);
                            setCongratsState({
                                bellotasEarned: earned,
                                bellotasBalance: balance,
                                statusAfter,
                                returnScreen: 'quizMultiple',
                                repasoNeeded: opts?.repasoNeeded,
                                repasoWrongCount: opts?.repasoWrongCount,
                                sessionId: opts?.sessionId ?? lastSessionIdRef.current ?? undefined,
                            });
                            navigateToScreen('congrats');
                        }}
                        onShowIncorrect={(feedback, livesLeft, statusAfter) => {
                            setCongratsState(null);
                            setIncorrectState({
                                feedback,
                                livesLeft,
                                statusAfter,
                                returnScreen: 'quizMultiple',
                            });
                            navigateToScreen('incorrect');
                        }}
                    />
                );

            case 'juegocalc':
                return (
                    <Juegocalc
                        levelId={selectedLevelId}
                        onBackToLevel={() => navigateToScreen(returnWorld)}
                        onNext={() => navigateToScreen(returnWorld)}
                        initialState={calcState}
                        setInitialState={(s) => { setCalcState(s); if (s) lastSessionIdRef.current = s.session_id; }}
                        onShowCongrats={(earned, balance, statusAfter, opts) => {
                            setScore(balance);
                            setIncorrectState(null);
                            setCongratsState({
                                bellotasEarned: earned,
                                bellotasBalance: balance,
                                statusAfter,
                                returnScreen: 'juegocalc',
                                repasoNeeded: opts?.repasoNeeded,
                                repasoWrongCount: opts?.repasoWrongCount,
                                sessionId: opts?.sessionId ?? lastSessionIdRef.current ?? undefined,
                            });
                            navigateToScreen('congrats');
                        }}
                        onShowIncorrect={(feedback, livesLeft, statusAfter) => {
                            setCongratsState(null);
                            setIncorrectState({
                                feedback,
                                livesLeft,
                                statusAfter,
                                returnScreen: 'juegocalc',
                            });
                            navigateToScreen('incorrect');
                        }}
                    />
                );


            case 'decision':
                return (
                    <Decision
                        levelId={selectedLevelId}
                        onBackToLevel={() => navigateToScreen(returnWorld)}
                        onShowCongrats={(earned, balance, statusAfter, opts) => {
                            setScore(balance);
                            setIncorrectState(null);
                            setCongratsState({
                                bellotasEarned: earned,
                                bellotasBalance: balance,
                                statusAfter,
                                returnScreen: 'decision',
                                repasoNeeded: opts?.repasoNeeded,
                                repasoWrongCount: opts?.repasoWrongCount,
                                sessionId: opts?.sessionId ?? lastSessionIdRef.current ?? undefined,
                            });
                            navigateToScreen('congrats');
                        }}
                        onShowIncorrect={(feedback, livesLeft, statusAfter) => {
                            setCongratsState(null);
                            setIncorrectState({
                                feedback,
                                livesLeft,
                                statusAfter,
                                returnScreen: 'decision',
                            });
                            navigateToScreen('incorrect');
                        }}
                    />
                );

            case 'classify':
                return (
                    <JuegoClassify
                        levelId={selectedLevelId}
                        skipIntroVideo={classifySkipVideoRef.current}
                        onBackToLevel={() => {
                            classifySkipVideoRef.current = false;
                            navigateToScreen(returnWorld);
                        }}
                        onGoToLivesShop={() => navigateToScreen('livesShop')}
                        onShowCongrats={(earned, balance, statusAfter, opts) => {
                            classifySkipVideoRef.current = false;
                            setScore(balance);
                            setIncorrectState(null);
                            setCongratsState({
                                bellotasEarned: earned,
                                bellotasBalance: balance,
                                statusAfter,
                                returnScreen: 'classify',
                                repasoNeeded: opts?.repasoNeeded,
                                repasoWrongCount: opts?.repasoWrongCount,
                                sessionId: opts?.sessionId ?? lastSessionIdRef.current ?? undefined,
                            });
                            navigateToScreen('congrats');
                        }}
                        onShowIncorrect={(feedback, livesLeft, statusAfter) => {
                            classifySkipVideoRef.current = true;
                            setCongratsState(null);
                            setIncorrectState({
                                feedback,
                                livesLeft,
                                statusAfter,
                                returnScreen: 'classify',
                            });
                            navigateToScreen('incorrect');
                        }}
                    />
                );

            case 'compara':
                return (
                    <CompararDecide
                        levelId={selectedLevelId}
                        onBackToLevel={() => navigateToScreen(returnWorld)}
                        onShowCongrats={(earned, balance, statusAfter, opts) => {
                            setScore(balance);
                            setIncorrectState(null);
                            setCongratsState({
                                bellotasEarned: earned,
                                bellotasBalance: balance,
                                statusAfter,
                                returnScreen: 'compara',
                                repasoNeeded: opts?.repasoNeeded,
                                repasoWrongCount: opts?.repasoWrongCount,
                                sessionId: opts?.sessionId ?? lastSessionIdRef.current ?? undefined,
                            });
                            navigateToScreen('congrats');
                        }}
                        onShowIncorrect={(feedback, livesLeft, statusAfter) => {
                            setCongratsState(null);
                            setIncorrectState({
                                feedback,
                                livesLeft,
                                statusAfter,
                                returnScreen: 'compara',
                            });
                            navigateToScreen('incorrect');
                        }}
                    />
                );

            case 'detectaError':
                return (
                    <DetectaElError
                        levelId={selectedLevelId}
                        onBackToLevel={() => navigateToScreen(returnWorld)}
                        onNext={() => navigateToScreen(returnWorld)}
                        initialState={detectaErrorState as any}
                        setInitialState={(s: any) => { setDetectaErrorState(s); if (s) lastSessionIdRef.current = s.session_id; }}
                        onShowCongrats={(earned, balance, statusAfter, opts) => {
                            setScore(balance);
                            setIncorrectState(null);
                            setCongratsState({
                                bellotasEarned: earned,
                                bellotasBalance: balance,
                                statusAfter,
                                returnScreen: 'detectaError',
                                repasoNeeded: opts?.repasoNeeded,
                                repasoWrongCount: opts?.repasoWrongCount,
                                sessionId: opts?.sessionId ?? lastSessionIdRef.current ?? undefined,
                            });
                            navigateToScreen('congrats');
                        }}
                        onShowIncorrect={(feedback, livesLeft, statusAfter) => {
                            setCongratsState(null);
                            setIncorrectState({
                                feedback,
                                livesLeft,
                                statusAfter,
                                returnScreen: 'detectaError',
                            });
                            navigateToScreen('incorrect');
                        }}
                    />
                );

            case 'completaFrase':
                return (
                    <CompletaFrase
                        levelId={selectedLevelId}
                        onBackToLevel={() => navigateToScreen(returnWorld)}
                        onNext={() => navigateToScreen(returnWorld)}
                        initialState={completaFraseState as any}
                        setInitialState={(s: any) => { setCompletaFraseState(s); if (s) lastSessionIdRef.current = s.session_id; }}
                        onShowCongrats={(earned, balance, statusAfter, opts) => {
                            setScore(balance);
                            setIncorrectState(null);
                            setCongratsState({
                                bellotasEarned: earned,
                                bellotasBalance: balance,
                                statusAfter,
                                returnScreen: 'completaFrase',
                                repasoNeeded: opts?.repasoNeeded,
                                repasoWrongCount: opts?.repasoWrongCount,
                                sessionId: opts?.sessionId ?? lastSessionIdRef.current ?? undefined,
                            });
                            navigateToScreen('congrats');
                        }}
                        onShowIncorrect={(feedback, livesLeft, statusAfter) => {
                            setCongratsState(null);
                            setIncorrectState({
                                feedback,
                                livesLeft,
                                statusAfter,
                                returnScreen: 'completaFrase',
                            });
                            navigateToScreen('incorrect');
                        }}
                    />
                );

            case 'congrats':
                return (
                    <CongratulationsScreen
                        onNext={async () => {
                            void refreshLives();
                            // Solo refrescar progreso si no hay repaso pendiente
                            const repasoRequired = congratsState?.statusAfter === 'finished' && congratsState?.repasoNeeded;
                            if (congratsState?.statusAfter === 'finished' && !repasoRequired) {
                                await refreshProgress();
                            }
                            handleFeedbackNext(congratsState);
                            setCongratsState(null);
                        }}
                        bellotasEarned={congratsState?.bellotasEarned ?? 0}
                        bellotasBalance={congratsState?.bellotasBalance ?? 0}
                        statusAfter={congratsState?.statusAfter ?? 'active'}
                    />
                );

            case 'repasoIntro':
                return (
                    <RepasoIntroScreen
                        wrongCount={repasoState?.wrongCount ?? 1}
                        onStart={async () => {
                            if (!repasoState || !selectedLevelId) {
                                const returnWorld: ScreenType = LEVELS_CONFIG.find(l => l.id === selectedLevelId)?.levelSlug === 'arbol-financiero' ? 'nivelArbolFinanciero' : 'nivelBellota';
                                setCurrentScreen(returnWorld);
                                return;
                            }
                            const levelConfig = LEVELS_CONFIG.find(l => l.id === selectedLevelId);
                            if (!levelConfig) return;
                            const userId = USE_DEV_USER ? DEV_USER_ID : session?.user_id;
                            if (!userId) return;
                            try {
                                const res = await startRepaso(
                                    levelConfig.levelSlug,
                                    levelConfig.micro,
                                    userId,
                                    repasoState.originalSessionId,
                                );
                                if (!res.repaso_needed) {
                                    // Sin ítems incorrectos (edge case) → completado
                                    setIsInRepaso(false);
                                    setRepasoState(null);
                                    await refreshProgress();
                                    const returnWorld: ScreenType = LEVELS_CONFIG.find(l => l.id === selectedLevelId)?.levelSlug === 'arbol-financiero' ? 'nivelArbolFinanciero' : 'nivelBellota';
                                    setCurrentScreen(returnWorld);
                                    return;
                                }
                                const gameType = res.game_type as string;
                                const question = res.question as Record<string, unknown>;
                                const sessionId = res.session_id as string;
                                const livesLeft = res.lives_left as number;
                                const totalItems = res.total_items as number;

                                // Hidrata el estado correcto según el tipo de juego
                                if (repasoState.returnGameScreen === 'quizBellota') {
                                    setQuizState({
                                        session_id: sessionId,
                                        lives_left: livesLeft,
                                        total_items: totalItems,
                                        lesson_item_id: question.lesson_item_id as string,
                                        position: question.position as number,
                                        prompt: question.prompt as string,
                                        skipIntroVideo: true,
                                    });
                                } else if (repasoState.returnGameScreen === 'quizMultiple' || repasoState.returnGameScreen === 'completaFrase') {
                                    setQuizMcState({
                                        session_id: sessionId,
                                        lives_left: livesLeft,
                                        total_items: totalItems,
                                        lesson_item_id: question.lesson_item_id as string,
                                        position: question.position as number,
                                        prompt: question.prompt as string,
                                        skipIntroVideo: true,
                                        options: (question.options as McOption[]) ?? [],
                                    });
                                } else if (repasoState.returnGameScreen === 'juegocalc') {
                                    setCalcState({
                                        session_id: sessionId,
                                        lives_left: livesLeft,
                                        total_items: totalItems,
                                        lesson_item_id: question.lesson_item_id as string,
                                        position: question.position as number,
                                        prompt: question.prompt as string,
                                        skipIntroVideo: true,
                                    });
                                } else if (repasoState.returnGameScreen === 'detectaError') {
                                    setDetectaErrorState({
                                        session_id: sessionId,
                                        lives_left: livesLeft,
                                        total_items: totalItems,
                                        lesson_item_id: question.lesson_item_id as string,
                                        position: (question.position as number) ?? 1,
                                        prompt: question.prompt as string,
                                        options: (question.options as McOption[]) ?? [],
                                        skipIntroVideo: true,
                                    });
                                } else {
                                    // compara, decision, classify: pasar via GameContext
                                    setRepasoStartData({
                                        session_id: sessionId,
                                        lives_left: livesLeft,
                                        total_items: totalItems,
                                        game_type: gameType,
                                        question,
                                    });
                                }
                                setCurrentScreen(repasoState.returnGameScreen);
                            } catch (err: any) {
                                setIsInRepaso(false);
                                setRepasoState(null);
                                const returnWorld: ScreenType = LEVELS_CONFIG.find(l => l.id === selectedLevelId)?.levelSlug === 'arbol-financiero' ? 'nivelArbolFinanciero' : 'nivelBellota';
                                setCurrentScreen(returnWorld);
                            }
                        }}
                    />
                );

            case 'incorrect':
                // Sin vidas: ir directo a la tienda, el feedback ya se mostró inline
                if (incorrectState?.statusAfter === 'failed' && (incorrectState?.livesLeft ?? 1) <= 0) {
                    return <LivesShopScreen onBack={() => navigateToScreen('levels')} />;
                }
                return (
                    <IncorrectScreen
                        onNext={() => {
                            void refreshLives();
                            handleFeedbackNext(incorrectState);
                            setIncorrectState(null);
                        }}
                        feedback={incorrectState?.feedback ?? ''}
                        livesLeft={incorrectState?.livesLeft ?? 0}
                        statusAfter={incorrectState?.statusAfter ?? 'active'}
                        onGoToLivesShop={() => navigateToScreen('livesShop')}
                    />
                );

            case 'livesShop':
                return (
                    <LivesShopScreen onBack={() => navigateToScreen('levels')} />
                );

            case 'agendita':
                return (
                    <Agendita
                        onBack={() => navigateToScreen('settings')}
                        onGoToLevels={() => navigateToScreen('levels')}
                        onGoToProfile={() => navigateToScreen('profile')}
                        onGoToSettings={() => navigateToScreen('settings')}
                        onGoToLivesShop={() => navigateToScreen('livesShop')}
                    />
                );

            default:
                return (
                    <EntryScreen
                        onNavigateToLogin={() => navigateToScreen('login')}
                        onNavigateToRegister={() => navigateToScreen('register')}
                    />
                );
        }
    };

    const showBadge = SHOW_GAME_BADGES && GAME_SCREENS.has(currentScreen);

    return (
        <>
            {renderScreen()}
            {showBadge && (
                <GameBadge levelId={selectedLevelId} game={currentScreen} isRepaso={isInRepaso} />
            )}
        </>
    );
};

export default AppNavigator;
