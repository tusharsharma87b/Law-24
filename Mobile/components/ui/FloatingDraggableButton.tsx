import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { AppIcon } from './AppIcon';

const SIZE = 64;
const RIGHT_OFFSET = 20;
const BOTTOM_OFFSET = 100;
const TOP_LIMIT = 90;

export function FloatingDraggableButton() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const minX = 0;
  const maxX = Math.max(0, width - SIZE - RIGHT_OFFSET);
  const minY = TOP_LIMIT;
  const maxY = Math.max(TOP_LIMIT, height - SIZE - (BOTTOM_OFFSET + insets.bottom));

  const translateX = useSharedValue(maxX);
  const translateY = useSharedValue(maxY);
  const startX = useSharedValue(maxX);
  const startY = useSharedValue(maxY);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          startX.value = translateX.value;
          startY.value = translateY.value;
        })
        .onUpdate((event) => {
          const nextX = startX.value + event.translationX;
          const nextY = startY.value + event.translationY;
          translateX.value = Math.min(Math.max(nextX, minX), maxX);
          translateY.value = Math.min(Math.max(nextY, minY), maxY);
        })
        .onEnd(() => {
          const snapX = translateX.value > maxX / 2 ? maxX : minX;
          translateX.value = withSpring(snapX, { damping: 18, stiffness: 180 });
          translateY.value = withSpring(Math.min(Math.max(translateY.value, minY), maxY), {
            damping: 18,
            stiffness: 180,
          });
        }),
    [maxX, maxY, minX, minY, startX, startY, translateX, translateY],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View pointerEvents="box-none" style={[styles.floatingButton, animatedStyle]}>
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => router.push('/nyaya')}
          style={styles.touch}
        >
          <AppIcon name="sparkles" size={22} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: '#5B6EF5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 20,
    shadowColor: '#5B6EF5',
    shadowOpacity: 0.5,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 12 },
  },
  touch: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

