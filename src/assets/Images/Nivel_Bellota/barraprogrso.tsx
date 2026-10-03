import React, { useEffect, useRef } from "react";
import Svg, { Rect, SvgProps } from "react-native-svg";
import { Animated } from "react-native";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface Props extends SvgProps {
    current?: number;
    total?: number;
}

const BarraProgreso = ({ current = 1, total = 5, ...props }: Props) => {
    // Definimos el ancho máximo de la barra de progreso
    const MAX_WIDTH = 276;

    // Valor animado para el ancho
    const animatedWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Calcular porcentaje (0 a 1)
        let percentage = current / total;
        if (percentage < 0) percentage = 0;
        if (percentage > 1) percentage = 1;

        // Calcular ancho objetivo
        const targetWidth = MAX_WIDTH * percentage;

        // Animar
        Animated.timing(animatedWidth, {
            toValue: targetWidth,
            duration: 500, // 500ms de duración
            useNativeDriver: false, // width no soporta native driver en SVG
        }).start();
    }, [current, total]);

    return (
        <Svg
            width={276}
            height={23}
            viewBox="0 0 276 23"
            fill="none"
            {...props}
        >
            {/* Fondo gris */}
            <Rect y={1} width={276} height={21} rx={10.5} fill="#989898" />

            {/* Barra amarilla animada */}
            <AnimatedRect
                x={0}
                y={0.5}
                width={animatedWidth}
                height={22}
                rx={11}
                fill="#FEC20A"
                stroke="black"
            />
        </Svg>
    );
};

export default BarraProgreso;
