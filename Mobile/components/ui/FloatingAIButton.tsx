/**
 * FloatingAIButton — draggable global NyayaAI entry point.
 */
import React, { useRef, useState, useEffect } from 'react';
import {
  Animated,
  PanResponder,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, usePathname, useSegments } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import FloatingAIModal from './FloatingAIModal';

const BTN_SIZE = 60;
const MARGIN = 16;

export default function FloatingAIButton() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [modalVisible, setModalVisible] = React.useState(false);

  const { width: W, height: H } = Dimensions.get('window');

  // Starting position: bottom right
  const defaultX = W - BTN_SIZE - MARGIN;
  const defaultY = H - BTN_SIZE - MARGIN - 80;

  const pan = useRef(new Animated.ValueXY({ x: defaultX, y: defaultY })).current;
  const posRef = useRef({ x: defaultX, y: defaultY });
  
  useEffect(() => {
    const listenerId = pan.addListener((v) => {
      posRef.current = v;
    });
    return () => pan.removeListener(listenerId);
  }, []);

  const [isDragging, setIsDragging] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 2 || Math.abs(gs.dy) > 2,
      
      onPanResponderGrant: () => {
        pan.setOffset({ x: posRef.current.x, y: posRef.current.y });
        pan.setValue({ x: 0, y: 0 });
        setIsDragging(false);
      },

      onPanResponderMove: (_, gs) => {
        if (!isDragging && (Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5)) {
          setIsDragging(true);
        }
        
        const nextX = posRef.current.x + gs.dx;
        const nextY = posRef.current.y + gs.dy;
        
        const boundedX = Math.max(0, Math.min(W - BTN_SIZE, nextX));
        const boundedY = Math.max(40, Math.min(H - BTN_SIZE - 40, nextY));

        pan.setValue({ 
          x: boundedX - (posRef.current.x - gs.dx), 
          y: boundedY - (posRef.current.y - gs.dy) 
        });
      },

      onPanResponderRelease: (_, gs) => {
        pan.flattenOffset();
        
        const finalX = posRef.current.x;
        const finalY = posRef.current.y;
        const snapX = finalX < W / 2 ? MARGIN : W - BTN_SIZE - MARGIN;
        
        Animated.spring(pan, {
          toValue: { x: snapX, y: finalY },
          useNativeDriver: false,
          tension: 40,
          friction: 7,
        }).start();

        setTimeout(() => setIsDragging(false), 100);
      },
    })
  ).current;

  // Hiding logic
  const inAuth = segments[0] === '(auth)';
  const inNyaya = pathname === '/nyaya';
  const shouldHide = !isHydrated || !isLoggedIn || inAuth || inNyaya;

  if (shouldHide) return null;

  const handlePress = () => {
    if (isDragging) return;
    setModalVisible(true);
  };

  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.container,
          { transform: pan.getTranslateTransform() }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={handlePress}
          style={styles.touch}
        >
          <LinearGradient
            colors={['#7C6CF8', '#4A6CF7']}
            style={styles.btn}
          >
            <MaterialIcons name="auto-awesome" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <FloatingAIModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  container: {
    position: 'absolute',
    width: BTN_SIZE,
    height: BTN_SIZE,
  },
  touch: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    shadowColor: '#4A6CF7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  btn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
