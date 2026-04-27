import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  type PanResponderInstance,
} from 'react-native';

type BottomSheetWrapperProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  heightPercent?: number;
  enableScroll?: boolean;
  contentContainerStyle?: object;
  dragHint?: string;
};

export function BottomSheetWrapper({
  visible,
  onClose,
  children,
  heightPercent = 0.88,
  enableScroll = true,
  contentContainerStyle,
  dragHint = 'drag down to close',
}: BottomSheetWrapperProps) {
  const { height, width } = Dimensions.get('window');
  const translateY = useRef(new Animated.Value(999)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);
  const sheetHeight = useMemo(() => Math.round(height * heightPercent), [height, heightPercent]);
  const closingRef = useRef(false);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      closingRef.current = false;
      dragY.setValue(0);
      translateY.setValue(sheetHeight);
      backdrop.setValue(0);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          speed: 22,
          bounciness: 0,
        }),
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }
    if (!mounted || closingRef.current) return;
    closingRef.current = true;
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: sheetHeight,
        duration: 210,
        useNativeDriver: true,
      }),
      Animated.timing(backdrop, {
        toValue: 0,
        duration: 170,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        dragY.setValue(0);
        setMounted(false);
      }
    });
  }, [visible, mounted, sheetHeight, backdrop, translateY, dragY]);

  const panResponder = useRef<PanResponderInstance>(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, { dy, dx }) => dy > 5 && Math.abs(dy) > Math.abs(dx),
      onMoveShouldSetPanResponderCapture: (_, { dy, dx }) => dy > 2 && Math.abs(dy) > Math.abs(dx),
      onPanResponderMove: (_, { dy }) => dragY.setValue(Math.max(0, dy)),
      onPanResponderRelease: (_, { dy, vy }) => {
        const shouldClose = dy > 150 || vy > 0.6;
        if (shouldClose) onClose();
        else {
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
            speed: 20,
            bounciness: 6,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(dragY, {
          toValue: 0,
          useNativeDriver: true,
          speed: 20,
          bounciness: 6,
        }).start();
      },
    }),
  ).current;

  if (!mounted) return null;

  return (
    <Modal transparent visible={mounted} animationType="none" onRequestClose={onClose}>
      <View style={styles.root} pointerEvents="box-none">
        <Animated.View style={[StyleSheet.absoluteFillObject, styles.overlay, { opacity: backdrop }]} />
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            styles.sheet,
            {
              width: Platform.OS === 'web' ? Math.min(width, 420) : '100%',
              maxHeight: height * 0.85,
              height: Platform.OS === 'web' ? 'auto' : `${Math.round(heightPercent * 100)}%`,
              transform: [{ translateY: Animated.add(translateY, dragY) }],
            },
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.handleZone} {...panResponder.panHandlers}>
            <View style={styles.handle} />
            <Text style={styles.hint}>{dragHint}</Text>
          </View>
          {enableScroll ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.noScroll, contentContainerStyle]}>{children}</View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  overlay: { backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    alignSelf: 'center',
    backgroundColor: '#111827',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
    elevation: 10,
  },
  handleZone: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, gap: 4 },
  handle: { width: 60, height: 5, borderRadius: 10, backgroundColor: '#555' },
  hint: { fontSize: 10, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', letterSpacing: 0.4 },
  noScroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 120 },
});
