import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { Card, ScreenShell } from './_shared';

export default function AboutUsScreen() {
  return (
    <ScreenShell title="About Law24">
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Card>
          <Text style={s.h}>What is Law24</Text>
          <Text style={s.p}>
            Law24 is a legal-tech platform that helps you understand your matter, find the right lawyer, and stay organised
            through hearings and documentation — built for Indian courts and everyday legal problems.
          </Text>

          <Text style={s.h}>Mission</Text>
          <Text style={s.p}>
            We believe quality legal guidance should be accessible, transparent, and respectful of your time. Nyaya AI offers
            instant orientation; human lawyers handle strategy and representation.
          </Text>

          <Text style={s.h}>How it works</Text>
          <Text style={s.p}>
            1) Describe your issue or browse lawyers{'\n'}
            2) Book a consultation and pay securely{'\n'}
            3) Chat with your lawyer and track case milestones{'\n'}
            4) Use Nyaya AI for quick research within your daily question allowance or purchased credits
          </Text>

          <Text style={s.h}>Legal disclaimer</Text>
          <Text style={s.p}>
            Nyaya AI provides general information only and is not legal advice. No attorney–client relationship is formed with
            the AI. Always consult a qualified advocate for advice on your specific facts.
          </Text>

          <Text style={s.h}>Contact</Text>
          <Text style={s.p}>Law24 Technologies Pvt. Ltd.{'\n'}Bengaluru, India</Text>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:hello@law24.in')} activeOpacity={0.85}>
            <Text style={s.link}>hello@law24.in</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('tel:+919999999999')} activeOpacity={0.85} style={{ marginTop: 8 }}>
            <Text style={s.link}>+91 99999 99999</Text>
          </TouchableOpacity>
        </Card>
        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenShell>
  );
}

const s = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  h: { color: Colors.textPrimary, fontSize: 15, fontWeight: '800', marginTop: 14, marginBottom: 6 },
  p: { color: Colors.textSecondary, fontSize: 13, lineHeight: 21 },
  link: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
});
