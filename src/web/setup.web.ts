// Ajustes que solo aplican en la version web. Se importa antes que todo en index.ts
// para que corra antes de que cualquier pantalla lea Dimensions.
import { Alert, Dimensions } from 'react-native';
import type { ScaledSize } from 'react-native';
import { PHONE_MAX_WIDTH, PHONE_MAX_HEIGHT } from './phoneFrame';
import { pushAlert } from './alertStore';

// 1) Dimensions: la app escala todo con size-matters / responsive-dimensions segun el
//    tamaño de la ventana. En una computadora eso deja todo gigante, asi que reportamos
//    el tamaño del "celular" (WebShell) en vez del de la ventana.
const clamp = (d: ScaledSize): ScaledSize => ({
    ...d,
    width: Math.min(d.width, PHONE_MAX_WIDTH),
    height: Math.min(d.height, PHONE_MAX_HEIGHT),
});

const originalGet = Dimensions.get.bind(Dimensions);
Dimensions.get = ((dim: 'window' | 'screen') => clamp(originalGet(dim))) as typeof Dimensions.get;

const originalAddListener = Dimensions.addEventListener.bind(Dimensions);
Dimensions.addEventListener = ((type, handler) =>
    originalAddListener(type, ({ window, screen }) =>
        handler({ window: clamp(window), screen: clamp(screen) })
    )) as typeof Dimensions.addEventListener;

// 2) Alert: en react-native-web Alert.alert no hace nada (ni muestra el mensaje ni
//    ejecuta los botones). Lo redirigimos a un modal propio (AlertHost).
Alert.alert = ((title, message, buttons) => pushAlert(title, message, buttons)) as typeof Alert.alert;
