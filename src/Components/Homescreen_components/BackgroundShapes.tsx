import React from "react";
import Svg, { Circle, Polygon, Rect } from "react-native-svg";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const BackgroundShapes = () => {
    return (
        <Svg
            width={width}
            height={height}
            style={{ position: "absolute", top: 0, left: 0 }}
        >
            {/* 🔹 Fondo principal azul turquesa */}
            <Rect
                x="0"
                y="0"
                width={width}
                height={height}
                fill="#6de0ff"
            />

            {/* 🔹 Estrellas y círculos blancos */}
            <Polygon
                points="10 0, 12.9 6.5, 20 7.5, 14.5 12, 16 19, 10 15, 4 19, 5.5 12, 0 7.5, 7.1 6.5"
                fill="rgba(255,255,255,0.35)"
                x={width * 0.2}
                y={height * 0.3}
                scale={1}
            />

            <Polygon
                points="10 0, 12.9 6.5, 20 7.5, 14.5 12, 16 19, 10 15, 4 19, 5.5 12, 0 7.5, 7.1 6.5"
                fill="rgba(255,255,255,0.35)"
                x={width * 0.45}
                y={height * 0.2}
                scale={1.3}
            />

            <Polygon
                points="10 0, 12.9 6.5, 20 7.5, 14.5 12, 16 19, 10 15, 4 19, 5.5 12, 0 7.5, 7.1 6.5"
                fill="rgba(255,255,255,0.25)"
                x={width * 0.75}
                y={height * 0.6}
                scale={1.5}


            />

            <Polygon
                points="10 0, 12.9 6.5, 20 7.5, 14.5 12, 16 19, 10 15, 4 19, 5.5 12, 0 7.5, 7.1 6.5"
                fill="rgba(255,255,255,0.25)"
                x={width * Math.random()}
                y={height * Math.random()}
                scale={1.3}


            />
            <Polygon
                points="10 0, 12.9 6.5, 20 7.5, 14.5 12, 16 19, 10 15, 4 19, 5.5 12, 0 7.5, 7.1 6.5"
                fill="rgba(255,255,255,0.25)"
                x={width * Math.random()}
                y={height * Math.random()}
                scale={1}


            />
            <Polygon
                points="10 0, 12.9 6.5, 20 7.5, 14.5 12, 16 19, 10 15, 4 19, 5.5 12, 0 7.5, 7.1 6.5"
                fill="rgba(255,255,255,0.25)"
                x={width * 0.35}
                y={height * 0.5}
                scale={1.3}


            />

            <Polygon
                points="10,0 0,20 20,20"
                x={width * 0.4}
                y={height * 0.5}
                scale={25}
                fill="#59efff"
                opacity={.33}
            />

            <Polygon
                points="10,0 0,20 20,20"
                x={width * -.01}
                y={height * -.2}
                scale={15}
                fill="#59efff"
                opacity={.33}
                rotation={45}

            />

            <Circle cx={width * 0.3} cy={height * 0.7} r={4} fill="rgba(255,255,255,0.25)" />
            <Circle cx={width * 0.6} cy={height * 0.2} r={3} fill="rgba(255,255,255,0.3)" />
            <Circle cx={width * -0.04} cy={height * 0.7} r={150} fill="#59efff" opacity={.33} />
            <Circle cx={width * 0.8} cy={height * 0.4} r={3} fill="rgba(255,255,255,0.2)" />
            <Circle cx={width * 0.3} cy={height * 0.7} r={4} fill="rgba(255,255,255,0.25)" />
        </Svg>
    );
};

export default BackgroundShapes;
