import { NavigatorScreenParams } from '@react-navigation/native';
import { Task } from './task.types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  TaskList: undefined;
  AddEditTask: { task?: Task; isEditing?: boolean };
  TaskDetail: { taskId: string };
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};
