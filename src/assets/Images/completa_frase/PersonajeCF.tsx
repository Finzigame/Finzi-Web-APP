import React from 'react';
import { View, type ViewStyle } from 'react-native';
import Empleado from '../quizbellota/empleado';

interface Props {
    width?: number;
    height?: number;
    style?: ViewStyle;
}

/**
 * Personaje del minijuego "Completa la Frase".
 * Usa el mismo personaje empresario del QuizBellota, centralizado
 * en la carpeta de assets de este minijuego.
 */
const PersonajeCF: React.FC<Props> = ({ width = 102, height = 153, style }) => (
    <View style={style}>
        <Empleado width={width} height={height} />
    </View>
);

export default PersonajeCF;
