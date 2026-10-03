import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, PanResponder } from 'react-native';

const S = Dimensions.get('window').width / 393;

interface SliderProps {
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (v: number) => void;
}

const CustomSlider: React.FC<SliderProps> = ({ value, min, max, step, onChange }) => {
    const [trackW, setTrackW] = useState(1);
    const trackRef = useRef<View>(null);
    const metrics = useRef({ pageX: 0, width: 1 });

    const measure = useCallback(() => {
        trackRef.current?.measure((_x, _y, w, _h, px) => {
            metrics.current = { pageX: px, width: w };
        });
    }, []);

    // Always keep a ref to the latest fromPageX so the PanResponder
    // (created once with useRef) never uses a stale closure.
    const fromPageXRef = useRef((pageX: number) => pageX);
    fromPageXRef.current = (pageX: number) => {
        const ratio = Math.max(0, Math.min(1, (pageX - metrics.current.pageX) / metrics.current.width));
        return Math.max(min, Math.min(max, Math.round((min + ratio * (max - min)) / step) * step));
    };

    const pan = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => { measure(); onChange(fromPageXRef.current(e.nativeEvent.pageX)); },
        onPanResponderMove: (e) => { onChange(fromPageXRef.current(e.nativeEvent.pageX)); },
    })).current;

    const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
    const THUMB = 28 * S;

    return (
        <View
            ref={trackRef}
            style={styles.track}
            onLayout={(e) => { setTrackW(e.nativeEvent.layout.width); setTimeout(measure, 50); }}
            {...pan.panHandlers}
        >
            <View style={[styles.fill, { width: Math.max(0, ratio * (trackW - THUMB) + THUMB / 2) }]} />
            <View style={[styles.thumb, {
                left: ratio * (trackW - THUMB),
                width: THUMB,
                height: THUMB,
                borderRadius: THUMB / 2,
            }]} />
        </View>
    );
};

export default CustomSlider;

const styles = StyleSheet.create({
    track: {
        height: 26 * S,
        borderRadius: 13 * S,
        backgroundColor: '#BBE4E9',
        borderWidth: 3,
        borderColor: '#A8D7DB',
        justifyContent: 'center',
        overflow: 'visible',
    },
    fill: {
        position: 'absolute',
        left: 0,
        height: '100%',
        borderRadius: 13 * S,
        backgroundColor: '#005F99',
    },
    thumb: {
        position: 'absolute',
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 0,
        elevation: 4,
    },
});
