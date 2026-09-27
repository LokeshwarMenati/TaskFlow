import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';
import { SplashScreen } from '../screens/SplashScreen';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

  return (
    <NavigationContainer>
      {!isInitialized ? (
        <SplashScreen />
      ) : isAuthenticated ? (
        <MainNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};
