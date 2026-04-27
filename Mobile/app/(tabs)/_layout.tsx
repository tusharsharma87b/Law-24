import React from 'react';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Colors } from '../../constants/colors';
import { AppIcon } from '../../components/ui/AppIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Auth redirects are handled by AuthGuard in app/_layout.tsx — NOT here.
// Having <Redirect> in this layout caused the "auto-logout on tab click" bug
// on web because it fired during every re-render triggered by tab navigation.
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const extraBottom = Platform.OS === 'android' ? 10 : 0;
  const tabBarHeight = 60 + insets.bottom + extraBottom;
  const tabBarBottom = insets.bottom > 0 ? 6 : 12;

  return (
    <View style={styles.root}>
      <View style={styles.appShell}>
        <Tabs
          detachInactiveScreens={false}
          screenOptions={{
            ...( { unmountOnBlur: false } as any ),
            headerShown: false,
            lazy: false,
            freezeOnBlur: false,
            sceneStyle: { paddingBottom: tabBarHeight + 10, backgroundColor: Colors.bgPrimary },
            tabBarHideOnKeyboard: false,
            tabBarStyle: [
              styles.tabBar,
              {
                height: tabBarHeight,
                paddingBottom: insets.bottom + extraBottom,
                bottom: tabBarBottom,
              },
            ],
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
              href: '/(tabs)' as any,
              tabBarIcon: ({ color }) => <AppIcon name="home" size={24} color={color} boxed />,
            }}
          />
          <Tabs.Screen
            name="lawyers"
            options={{
              title: 'Lawyers',
              tabBarIcon: ({ color }) => <AppIcon name="lawyers" size={24} color={color} boxed />,
            }}
          />
          <Tabs.Screen
            name="cases"
            options={{
              title: 'Cases',
              tabBarIcon: ({ color }) => <AppIcon name="cases" size={24} color={color} boxed />,
            }}
          />
          <Tabs.Screen
            name="documents"
            options={{
              title: 'Documents',
              tabBarIcon: ({ color }) => <AppIcon name="documents" size={24} color={color} boxed />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => <AppIcon name="profile" size={24} color={color} boxed />,
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary },
  appShell: { flex: 1, width: '100%' },
  tabBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    backgroundColor: Colors.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    borderRadius: 16,
    paddingBottom: 8,
    paddingTop: 6,
    elevation: 24,
    zIndex: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
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
