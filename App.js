import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import TrendingScreen from './src/screens/TrendingScreen';
import PostScreen from './src/screens/PostScreen';
import CommentsScreen from './src/screens/CommentsScreen';
import AdminLoginScreen from './src/screens/AdminLoginScreen';
import AdminPanelScreen from './src/screens/AdminPanelScreen';
import { COLORS } from './src/constants/theme';
import { ConfessionsProvider } from './src/context/ConfessionsContext';
import { AdminProvider } from './src/context/AdminContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    card: '#111111',
    text: COLORS.textPrimary,
    border: 'rgba(255,255,255,0.08)',
    primary: COLORS.purple,
  },
};

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F0F0F',
          borderTopColor: 'rgba(255,255,255,0.07)',
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 12,
          paddingTop: 10,
        },
        tabBarActiveTintColor: COLORS.purple,
        tabBarInactiveTintColor: '#4B5563',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Trending') {
            iconName = focused ? 'flame' : 'flame-outline';
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Trending" component={TrendingScreen} options={{ tabBarLabel: 'Trending' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AdminProvider>
          <ConfessionsProvider>
            <NavigationContainer theme={MyTheme}>
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                  cardStyle: { backgroundColor: COLORS.background },
                  gestureEnabled: true,
                }}
              >
                {/* ── Normal screens ── */}
                <Stack.Screen name="Main" component={HomeTabs} />
                <Stack.Screen
                  name="Comments"
                  component={CommentsScreen}
                  options={{ presentation: 'card', animationEnabled: true }}
                />
                <Stack.Screen
                  name="Post"
                  component={PostScreen}
                  options={{ presentation: 'modal', animationEnabled: true }}
                />

                {/* ── Hidden admin screens ── */}
                <Stack.Screen
                  name="AdminLogin"
                  component={AdminLoginScreen}
                  options={{
                    presentation: 'modal',
                    animationEnabled: true,
                    gestureEnabled: false, // prevent swipe-dismiss before PIN
                  }}
                />
                <Stack.Screen
                  name="AdminPanel"
                  component={AdminPanelScreen}
                  options={{ presentation: 'card', animationEnabled: true }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </ConfessionsProvider>
        </AdminProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
});
