import Header from '@kaksha/components/Header';
import LeftPanelContent from '@kaksha/components/LeftPanelContent';
import {LeftPanel, RootStack} from '@kaksha/navigator';
import Attendance from '@kaksha/screens/auth/Attendance';
import Dashboard from '@kaksha/screens/auth/Dashboard';
import DigitalDirectory from '@kaksha/screens/auth/DigitalDirectory';
import StudentAttendance from '@kaksha/screens/auth/StudentAttendance';
import AttendanceRegister from '@kaksha/screens/auth/StudentAttendance/AttendanceRegister';
import MarkAttendance from '@kaksha/screens/auth/StudentAttendance/MarkAttendance';
import SelectAttendance from '@kaksha/screens/auth/StudentAttendance/SelectAttedance';

import TimeTable from '@kaksha/screens/auth/TimeTable';
import Todo from '@kaksha/screens/auth/Todo';
import {useTheme} from '@rneui/themed';
import {Dimensions} from 'react-native';

const RenderLeftPanel = () => {
  const {width} = Dimensions.get('window');
  const {theme} = useTheme();

  return (
    <LeftPanel.Navigator
      initialRouteName="dashboard"
      screenOptions={{
        drawerType: 'slide',
        drawerStyle: {width, backgroundColor: theme.colors.background},
        header: Header,
        swipeEnabled: true,
        swipeEdgeWidth: width / 2,
      }}
      drawerContent={LeftPanelContent}>
      <LeftPanel.Screen name="dashboard" component={Dashboard} />
      <LeftPanel.Screen
        name="student_attendance"
        component={StudentAttendance}
      />
      <LeftPanel.Screen name="digital_directory" component={DigitalDirectory} />
    </LeftPanel.Navigator>
  );
};

const renderAuthRoutes = () => {
  return (
    <>
      <RootStack.Screen name="left_panel" component={RenderLeftPanel} />
      <RootStack.Screen name="timetable" component={TimeTable} />
      <RootStack.Screen name="attendance" component={Attendance} />
      <RootStack.Screen name="mark_attendance" component={MarkAttendance} />
      <RootStack.Screen name="select_attendance" component={SelectAttendance} />
      <RootStack.Screen
        name="attendance_register"
        component={AttendanceRegister}
      />
      <RootStack.Screen name="todo" component={Todo} />
    </>
  );
};

export default renderAuthRoutes;
