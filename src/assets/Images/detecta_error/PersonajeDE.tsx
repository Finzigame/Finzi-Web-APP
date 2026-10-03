import React from 'react';
import Svg, { Circle, Ellipse, Rect, Path } from 'react-native-svg';

type Props = {
    width?: number;
    height?: number;
};

export default function PersonajeDE({ width = 94, height = 140 }: Props) {
    return (
        <Svg width={width} height={height} viewBox="0 0 94 140" fill="none">
            {/* Hair */}
            <Path d="M30 20 Q30 3 47 4 Q64 3 64 20 Q60 8 47 9 Q34 8 30 20Z" fill="#3D2000" />
            {/* Head */}
            <Circle cx="47" cy="23" r="17" fill="#F5C5A0" />
            {/* Ear left */}
            <Ellipse cx="30" cy="25" rx="3.5" ry="4" fill="#F5C5A0" />
            {/* Ear right */}
            <Ellipse cx="64" cy="25" rx="3.5" ry="4" fill="#F5C5A0" />
            {/* Hair top overlay */}
            <Path d="M30 18 Q30 5 47 6 Q64 5 64 18 Q60 11 47 12 Q34 11 30 18Z" fill="#3D2000" />
            {/* Eyebrow left */}
            <Path d="M38 18 Q41.5 16 45 18" stroke="#3D2000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* Eyebrow right */}
            <Path d="M49 18 Q52.5 16 56 18" stroke="#3D2000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* Eye left */}
            <Circle cx="41.5" cy="23" r="2.5" fill="#2D1A00" />
            <Circle cx="42.3" cy="22.2" r="1" fill="white" />
            {/* Eye right */}
            <Circle cx="52.5" cy="23" r="2.5" fill="#2D1A00" />
            <Circle cx="53.3" cy="22.2" r="1" fill="white" />
            {/* Smile */}
            <Path d="M42 31 Q47 35.5 52 31" stroke="#C4856A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            {/* Neck */}
            <Rect x="42" y="39" width="10" height="8" rx="2" fill="#F5C5A0" />
            {/* Suit body */}
            <Path d="M12 56 Q20 49 31 48 L47 55 L63 48 Q74 49 82 56 L82 108 L12 108 Z" fill="#00675D" />
            {/* White shirt strip */}
            <Path d="M43 48 L47 55 L51 48 L51 100 L43 100 Z" fill="#FFFFFF" />
            {/* Tie */}
            <Path d="M44.5 54 L47 51 L49.5 54 L48 79 L47 81 L46 79 Z" fill="#FEC20A" />
            {/* Left lapel */}
            <Path d="M31 48 L43 48 L40 65 Z" fill="#005A51" />
            {/* Right lapel */}
            <Path d="M63 48 L51 48 L54 65 Z" fill="#005A51" />
            {/* Left arm */}
            <Path d="M12 56 L7 90 L20 94 L25 60 Z" fill="#00675D" />
            {/* Left hand */}
            <Ellipse cx="12" cy="92" rx="7" ry="5" fill="#F5C5A0" />
            {/* Right arm */}
            <Path d="M82 56 L87 78 L75 83 L70 60 Z" fill="#00675D" />
            {/* Right hand */}
            <Ellipse cx="82" cy="81" rx="6" ry="5" fill="#F5C5A0" />
            {/* Briefcase body */}
            <Rect x="71" y="79" width="21" height="15" rx="4" fill="#7A5C14" />
            {/* Briefcase handle */}
            <Rect x="77" y="74" width="9" height="7" rx="3" fill="none" stroke="#7A5C14" strokeWidth="2" />
            {/* Briefcase center line */}
            <Rect x="71" y="87" width="21" height="2" fill="#5A4010" />
            {/* Briefcase clasp */}
            <Rect x="80" y="81" width="2" height="10" fill="#5A4010" />
            {/* Pants left */}
            <Rect x="24" y="108" width="18" height="26" rx="7" fill="#004D45" />
            {/* Pants right */}
            <Rect x="52" y="108" width="18" height="26" rx="7" fill="#004D45" />
            {/* Shoe left */}
            <Ellipse cx="33" cy="135" rx="13" ry="4" fill="#1A0D00" />
            {/* Shoe right */}
            <Ellipse cx="61" cy="135" rx="13" ry="4" fill="#1A0D00" />
        </Svg>
    );
}
