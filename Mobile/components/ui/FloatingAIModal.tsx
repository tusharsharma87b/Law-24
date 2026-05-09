import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Platform, Modal as RNModal } from 'react-native';
import { Colors } from '../../constants/colors';
import { BASE_URL } from '../../src/config/api';

const { width, height } = Dimensions.get('window');

type FloatingAIModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function FloatingAIModal({ visible, onClose }: FloatingAIModalProps) {
  const router = useRouter();
  const IS_WEB = Platform.OS === 'web';

  const handleAction = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 100);
  };

  const [aiLoading, setAiLoading] = useState(false);

  const handleAIConsult = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/ai-consult`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ issue: 'legal consultation' }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      Alert.alert('AI Consult Summary', data.summary || 'No summary provided.');
    } catch (error) {
      console.error('AI consult failed:', error);
      Alert.alert('Error', 'Failed to get AI consult. Please try again later.');
    } finally {
      setAiLoading(false);
      onClose();
    }
  };

  const ModalContent = () => (
    <View style={styles.content}>
      <View style={styles.handle} />
      
      <Text style={styles.title}>How can we help today?</Text>
      <Text style={styles.subtitle}>Our AI and Legal Experts are ready to assist you.</Text>

      <View style={styles.options}>
        <TouchableOpacity
          style={[styles.option, styles.primaryOption]}
          onPress={handleAIConsult}
          activeOpacity={0.8}
          disabled={aiLoading}
        >
          <View style={styles.iconWrap}>
            <MaterialIcons name="auto-awesome" size={24} color={Colors.gold} />
          </View>
          <View style={styles.optionTextWrap}>
            {aiLoading ? (
              <ActivityIndicator size="small" color={Colors.gold} />
            ) : (
              <>
                <Text style={styles.optionTitle}>Chat with Nyaya AI</Text>
                <Text style={styles.optionSub}>Instant answers to legal queries</Text>
              </>
            )}
          </View>
          {!aiLoading && (
            <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.3)" />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option} 
          onPress={() => handleAction('/(tabs)/lawyers')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(79,110,247,0.1)' }]}>
            <MaterialIcons name="people" size={24} color={Colors.primary} />
          </View>
          <View style={styles.optionTextWrap}>
            <Text style={styles.optionTitle}>Talk to a Lawyer</Text>
            <Text style={styles.optionSub}>Emergency call or scheduled session</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.3)" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
        <Text style={styles.cancelTxt}>Close</Text>
      </TouchableOpacity>
    </View>
  );

  if (IS_WEB) {
    if (!visible) return null;
    return (
      <View style={styles.webOverlay}>
        <TouchableOpacity style={styles.webBackdrop} onPress={onClose} activeOpacity={1} />
        <ModalContent />
      </View>
    );
  }

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver={false}
      hideModalContentWhileAnimating
    >
      <ModalContent />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#0D1117',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
    width: width,
    maxWidth: 430,
    alignSelf: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 28,
    textAlign: 'center',
  },
  options: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161D2E',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  primaryOption: {
    borderColor: 'rgba(245,166,35,0.2)',
    backgroundColor: 'rgba(245,166,35,0.05)',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(245,166,35,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  optionSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cancelBtn: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  cancelTxt: {
    color: Colors.textTertiary,
    fontSize: 15,
    fontWeight: '600',
  },
  webOverlay: {
    position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 1000,
  },
  webBackdrop: {
    position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});
