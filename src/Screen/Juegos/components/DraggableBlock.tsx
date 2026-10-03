import React, { useRef } from 'react';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Animated, PanResponder, StyleSheet, Text } from 'react-native';
import { Fonts } from '../../../Utils/Fonts';

export type GameItem = {
  id: string;
  label: string;
  correctCategory: string;
};

interface Props {
  item: GameItem;
  disabled?: boolean;
  onDragStart: (id: string) => void;
  onDragMove?: (absoluteX: number, absoluteY: number) => void;
  onDragEnd: (item: GameItem, absoluteX: number, absoluteY: number) => void;
}

export default function DraggableBlock({ item, disabled, onDragStart, onDragMove, onDragEnd }: Props) {
  // Usamos ref para que el PanResponder (creado una sola vez) lea el valor actual
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledRef.current,
      onMoveShouldSetPanResponder: () => !disabledRef.current,

      onPanResponderGrant: () => {
        Animated.parallel([
          Animated.spring(scale, { toValue: 1.12, useNativeDriver: true, speed: 40, bounciness: 6 }),
          Animated.timing(rotate, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start();
        onDragStart(item.id);
      },

      onPanResponderMove: (_, gs) => {
        pan.setValue({ x: gs.dx, y: gs.dy });
        onDragMove?.(gs.moveX, gs.moveY);
      },

      onPanResponderRelease: (_, gs) => {
        _snapBack();
        onDragEnd(item, gs.moveX, gs.moveY);
      },

      onPanResponderTerminate: (_, gs) => {
        _snapBack();
        onDragEnd(item, gs.moveX, gs.moveY);
      },
    })
  ).current;

  function _snapBack() {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 4 }),
      Animated.timing(rotate, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true, speed: 30, bounciness: 4 }),
    ]).start();
  }

  const rotateStr = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-2deg'],
  });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale },
            { rotate: rotateStr },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Text style={styles.label}>{item.label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#00646D',
    borderRadius: scale(22),
    borderWidth: scale(3),
    borderColor: '#32A0A7',
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(56),
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  label: {
    color: '#FFFFFF',
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(15),
    textAlign: 'center',
  },
});
