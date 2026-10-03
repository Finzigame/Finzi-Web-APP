import { Audio } from 'expo-av';

export type SoundName =
    | 'login_success' | 'login_error'
    | 'tap_primary' | 'tap_secondary' | 'swipe' | 'modal_open' | 'modal_close' | 'navigate_map' | 'tab_tap'
    | 'world_locked' | 'world_unlock' | 'level_hover'
    | 'game_loading' | 'question_appear' | 'select_option' | 'correct' | 'incorrect'
    | 'combo_x2' | 'combo_x3' | 'combo_special' | 'combo_broken' | 'sublevel_complete';

const SOUND_FILES: Record<SoundName, any> = {
    login_success:    require('../assets/sounds/login_success.mp3'),
    login_error:      require('../assets/sounds/login_error.mp3'),
    tap_primary:      require('../assets/sounds/tap_primary.mp3'),
    tap_secondary:    require('../assets/sounds/tap_secondary.mp3'),
    swipe:            require('../assets/sounds/swipe.mp3'),
    modal_open:       require('../assets/sounds/modal_open.mp3'),
    modal_close:      require('../assets/sounds/modal_close.mp3'),
    navigate_map:     require('../assets/sounds/navigate_map.mp3'),
    tab_tap:          require('../assets/sounds/tab_tap.mp3'),
    world_locked:     require('../assets/sounds/world_locked.mp3'),
    world_unlock:     require('../assets/sounds/world_unlock.mp3'),
    level_hover:      require('../assets/sounds/level_hover.mp3'),
    game_loading:     require('../assets/sounds/game_loading.mp3'),
    question_appear:  require('../assets/sounds/question_appear.mp3'),
    select_option:    require('../assets/sounds/select_option.mp3'),
    correct:          require('../assets/sounds/correct.mp3'),
    incorrect:        require('../assets/sounds/incorrect.mp3'),
    combo_x2:         require('../assets/sounds/combo_x2.mp3'),
    combo_x3:         require('../assets/sounds/combo_x3.mp3'),
    combo_special:    require('../assets/sounds/combo_special.mp3'),
    combo_broken:     require('../assets/sounds/combo_broken.mp3'),
    sublevel_complete: require('../assets/sounds/sublevel_complete.mp3'),
};

let enabled = true;
const cache: Partial<Record<SoundName, Audio.Sound>> = {};

// Configura el modo de audio una sola vez al importar
Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
}).catch(() => {});

const SoundManager = {
    play: async (name: SoundName): Promise<void> => {
        if (!enabled) return;
        try {
            // Reusar sonido cacheado si existe y no está reproduciendo
            let sound = cache[name];
            if (!sound) {
                const { sound: newSound } = await Audio.Sound.createAsync(SOUND_FILES[name], {
                    shouldPlay: false,
                    volume: 1,
                });
                cache[name] = newSound;
                sound = newSound;
            }
            // Rebobinar y reproducir
            await sound.setPositionAsync(0);
            await sound.playAsync();
        } catch {
            // Silencioso en caso de error (ej. dispositivo sin audio)
        }
    },

    setEnabled: (val: boolean): void => {
        enabled = val;
    },
};

export default SoundManager;
