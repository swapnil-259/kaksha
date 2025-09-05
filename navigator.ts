import AuthRoutes, {LeftPanelRoutes} from '@kaksha/routes/auth/type';
import CommonRoutes from '@kaksha/routes/common/type';
import NoAuthRoutes from '@kaksha/routes/no-auth/type';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

type RootStackParamList = NoAuthRoutes & CommonRoutes & AuthRoutes;
type RootStackType = typeof RootStack;

type LeftPanelParamList = LeftPanelRoutes;
type LeftPanelType = typeof LeftPanel;

const RootStack = createNativeStackNavigator<RootStackParamList>();
const LeftPanel = createDrawerNavigator<LeftPanelParamList>();

export {LeftPanel, RootStack};
export type {
  LeftPanelParamList,
  LeftPanelType,
  RootStackParamList,
  RootStackType,
};
