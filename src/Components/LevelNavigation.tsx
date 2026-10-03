import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface LevelNavigationProps {
    style?: StyleProp<ViewStyle>;
}

const LevelNavigation: React.FC<LevelNavigationProps> = ({ style }) => {
    console.log("Usando LevelNavigation");
    return (
        <View style={[styles.container, style]}>
            <Svg width={612} height={180} style={styles.svg}>
                <Path
                    d="M-92 183.076C-92 183.076 -84.3433 150.221 -52.4497 112.211C-20.5561 74.2012 16.9693 51.1878 62.1211 41.2154C107.273 31.243 151.99 25.9003 199.269 26.0014C246.039 26.1015 293.602 26.6426 336.124 41.2154C374.712 54.44 414.636 74.6428 445.725 112.211C467.415 138.42 548.523 214.647 510 205"
                    stroke="#10A1B1"
                    strokeWidth="120"
                    fill="none"
                    opacity="0.9"
                />
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: 500,
        height: 200,
        left: -100,
        top: 50,
    },
    svg: {
        position: 'absolute',
        left: 100,
        right: 100,
        top: -50,
        width: 1000,
        height: 500,
    },
});

export default LevelNavigation;
