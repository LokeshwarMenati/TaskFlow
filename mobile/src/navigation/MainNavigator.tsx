import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types/navigation.types';
import { TaskListScreen } from '../screens/tasks/TaskListScreen';
import { AddEditTaskScreen } from '../screens/tasks/AddEditTaskScreen';
import { TaskDetailScreen } from '../screens/tasks/TaskDetailScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="TaskList"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '700',
          color: '#0F172A',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="TaskList"
        component={TaskListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddEditTask"
        component={AddEditTaskScreen}
        options={({ route }) => ({
          title: route.params?.isEditing ? 'Edit Task' : 'New Task',
        })}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{ title: 'Task Details' }}
      />
    </Stack.Navigator>
  );
};
