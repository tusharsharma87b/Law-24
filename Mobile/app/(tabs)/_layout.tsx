import React from 'react';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';

export default function TabsLayout() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={styles.root}>
      <View style={styles.appShell}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: '#3B5BDB',
            tabBarInactiveTintColor: '#4D5563',
            tabBarLabelStyle: styles.tabLabel,
            tabBarItemStyle: styles.tabItem,
            tabBarIconStyle: styles.tabIcon,
            tabBarButton: (props: BottomTabBarButtonProps) => {
              const selected = props.accessibilityState?.selected;
              const { style: tabStyle, children, ref: tabRef, ...pressableRest } = props;
              return (
                <Pressable
                  {...pressableRest}
                  ref={tabRef as React.Ref<View>}
                  style={({ pressed }) => [
                    // tabStyle carries flex:1 + default tab item sizing from React Navigation
                    tabStyle as object,
                    styles.tabButton,
                    selected && styles.tabButtonActive,
                    pressed && styles.tabButtonPressed,
                  ]}
                >
                  {children}
                </Pressable>
              );
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={21} color={color} />,
            }}
          />
          <Tabs.Screen
            name="lawyers"
            options={{
              title: 'Lawyers',
              tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={21} color={color} />,
            }}
          />
          <Tabs.Screen
            name="cases"
            options={{
              title: 'Cases',
              tabBarIcon: ({ color }) => <Ionicons name="briefcase-outline" size={21} color={color} />,
            }}
          />
          <Tabs.Screen
            name="documents"
            options={{
              title: 'Documents',
              tabBarIcon: ({ color }) => <Ionicons name="folder-open-outline" size={21} color={color} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={21} color={color} />,
            }}
          />
          <Tabs.Screen name="layout" options={{ href: null }} />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary },
  appShell: { flex: 1, width: '100%' },
  tabBar: {
    backgroundColor: '#0A0D16',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    height: 68,
    paddingBottom: 8,
    paddingTop: 6,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabIcon: { marginBottom: 0 },
  tabLabel: { fontSize: 10, fontWeight: '600', marginTop: 3 },
  tabButton: {
    marginHorizontal: 4,
    marginVertical: 3,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(59,91,219,0.12)',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tabButtonPressed: { transform: [{ scale: 0.93 }], opacity: 0.8 },
});
