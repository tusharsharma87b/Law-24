import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  KeyboardTypeOptions,
} from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  prefix?: string;
  secureTextEntry?: boolean;
  maxLength?: number;
  style?: ViewStyle;
  autoFocus?: boolean;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

export const Input: React.FC<Props> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = 'default',
  prefix,
  secureTextEntry = false,
  maxLength,
  style,
  autoFocus = false,
  editable = true,
  multiline = false,
  numberOfLines = 1,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          focused && styles.focused,
          !!error && styles.error,
          !editable && styles.disabled,
        ]}
      >
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput
          style={[styles.input, multiline && { height: numberOfLines * 24 }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          autoFocus={autoFocus}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgTertiary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 56,
  },
  focused: {
    borderColor: Colors.borderActive,
  },
  error: {
    borderColor: Colors.danger,
  },
  disabled: {
    opacity: 0.5,
  },
  prefix: {
    color: Colors.textSecondary,
    marginRight: 8,
    fontSize: 15,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '400',
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 2,
  },
});
