import React from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import Modal from 'react-native-modal';

type BottomSheetWrapperProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  heightPercent?: number;
  enableScroll?: boolean;
  contentContainerStyle?: object;
  dragHint?: string;
};

const { height, width } = Dimensions.get('window');

export function BottomSheetWrapper({
  visible,
  onClose,
  children,
  heightPercent = 0.85,
  dragHint = 'swipe down to close',
}: BottomSheetWrapperProps) {
  
  const sheetHeight = Math.round(height * heightPercent);

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      propagateSwipe={true}
      style={styles.modal}
      backdropOpacity={0.6}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriverForBackdrop
      statusBarTranslucent
    >
      <View 
        style={[
          styles.sheet, 
          { 
            height: sheetHeight,
            width: Platform.OS === 'web' ? Math.min(width, 430) : '100%',
          }
        ]}
      >
        <View style={styles.handleZone}>
          <View style={styles.handle} />
          {dragHint ? <Text style={styles.hint}>{dragHint}</Text> : null}
        </View>
        
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheet: {
    backgroundColor: '#0D1117',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handleZone: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#0D1117',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 6,
  },
  hint: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
  },
});
