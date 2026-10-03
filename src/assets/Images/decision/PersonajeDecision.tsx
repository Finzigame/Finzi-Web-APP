import React from 'react';
import { View, type ViewStyle } from 'react-native';
import Empleado from '../quizbellota/empleado';

interface Props {
    width?: number;
    height?: number;
    style?: ViewStyle;
}

const PersonajeDecision: React.FC<Props> = ({ width = 128, height = 128, style }) => (
    <View style={style}>
        <Empleado width={width} height={height} />
    </View>
);

export default PersonajeDecision;
