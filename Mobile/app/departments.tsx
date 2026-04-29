/**
 * /departments — All 10 legal departments in a clean full-screen grid.
 * Accessed via "See All" on the Home screen.
 */
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { LEGAL_DEPARTMENTS } from '../constants/legalDepartments';
import { getLawyersByCategory, type CategoryLawyer } from '../constants/categoryLawyers';

export default function DepartmentsScreen() {
  const router = useRouter();
  const openLawyersByDepartment = (departmentId: string) => {
    const dept = LEGAL_DEPARTMENTS.find((d) => d.id === departmentId);
    const category = dept?.subcategories[0]?.lawyerCategory;
    router.push({ pathname: '/(tabs)/lawyers', params: category ? { category } : {} });
  };

  const renderMiniLawyer = (item: CategoryLawyer, departmentId: string) => (
    <View style={s.miniLawyerCard}>
      <View style={s.miniAvatar}>
        <Text style={s.miniAvatarTxt}>
          {item.name.split(' ').slice(-2).map((p) => p[0]).join('').toUpperCase()}
        </Text>
      </View>
      <Text style={s.miniName} numberOfLines={1}>{item.name}</Text>
      <View style={s.miniMeta}>
        <MaterialIcons name="star" size={11} color={Colors.gold} />
        <Text style={s.miniMetaTxt}>{item.rating.toFixed(1)}</Text>
        <Text style={s.miniMetaTxt}>₹{item.price}/min</Text>
      </View>
      <TouchableOpacity
        style={s.miniCta}
        onPress={() => openLawyersByDepartment(departmentId)}
        activeOpacity={0.85}
      >
        <Text style={s.miniCtaTxt}>Talk Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Legal Departments</Text>
          <Text style={s.headerSub}>Choose your area of need</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <Text style={s.intro}>
          Select a department that matches your situation. You do not need to know legal terms - just pick the closest topic.
        </Text>

        <View style={s.grid}>
          {LEGAL_DEPARTMENTS.map((dept) => {
            const lawyers = getLawyersByCategory(dept.name);
            return (
              <TouchableOpacity
                key={dept.id}
                style={[s.card, { borderColor: dept.color + '44' }]}
                onPress={() => router.push({ pathname: '/department/[id]', params: { id: dept.id } })}
                activeOpacity={0.9}
              >
                <View style={s.cardTop}>
                  <View style={[s.iconWrap, { backgroundColor: dept.color + '1A' }]}>
                    <MaterialIcons name={dept.icon as any} size={26} color={dept.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.deptName}>{dept.name}</Text>
                    <Text style={s.deptTagline} numberOfLines={2}>{dept.tagline}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={18} color={dept.color} />
                </View>

                <FlatList
                  data={lawyers}
                  horizontal
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => renderMiniLawyer(item, dept.id)}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.miniLawyersRow}
                />

                <View style={s.arrowRow}>
                  <Text style={[s.arrowTxt, { color: dept.color }]}>Explore full department</Text>
                  <MaterialIcons name="arrow-forward" size={13} color={dept.color} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom help card */}
        <View style={s.helpCard}>
          <MaterialIcons name="auto-awesome" size={20} color={Colors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={s.helpTitle}>Not sure which department?</Text>
            <Text style={s.helpSub}>Describe your problem in plain language and NyayaAI will guide you.</Text>
          </View>
          <TouchableOpacity
            style={s.helpBtn}
            onPress={() => router.push('/nyaya')}
            activeOpacity={0.85}
          >
            <Text style={s.helpBtnTxt}>Ask AI</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
  },
  backBtn: { padding: 4, width: 36 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  headerSub: { fontSize: 11, color: Colors.textTertiary, marginTop: 2 },

  content: { paddingHorizontal: 16, paddingTop: 16 },
  intro: {
    fontSize: 13, color: Colors.textSecondary, lineHeight: 21,
    marginBottom: 20, textAlign: 'center',
  },

  grid: { gap: 12 },
  card: {
    width: '100%',
    backgroundColor: Colors.bgSecondary, borderRadius: 20,
    padding: 16, gap: 8, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  deptName:    { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  deptTagline: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  arrowRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  arrowTxt: { fontSize: 12, fontWeight: '700' },
  miniLawyersRow: { paddingTop: 10, paddingBottom: 2, gap: 8 },
  miniLawyerCard: {
    width: 138,
    backgroundColor: Colors.bgElevated,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  miniAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#5B6EF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  miniAvatarTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  miniName: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  miniMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  miniMetaTxt: { fontSize: 11, color: Colors.textSecondary },
  miniCta: {
    marginTop: 8,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySubtle,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  miniCtaTxt: { fontSize: 11, fontWeight: '700', color: Colors.primary },

  helpCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.bgSecondary, borderRadius: 18, padding: 16,
    marginTop: 20, borderWidth: 1, borderColor: Colors.goldSubtle,
  },
  helpTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  helpSub:   { fontSize: 12, color: Colors.textSecondary, marginTop: 3, lineHeight: 18 },
  helpBtn: {
    backgroundColor: Colors.goldSubtle, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.gold + '60',
  },
  helpBtnTxt: { fontSize: 13, fontWeight: '700', color: Colors.gold },
});
