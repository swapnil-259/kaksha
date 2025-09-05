import {StyledPageView, StyledView} from '@common/components';
import OverViewCard from '@kaksha/components/OverViewCard';
import themeColors from '@kaksha/constants/theme';
import {LeftPanelParamList, RootStackParamList} from '@kaksha/navigator';
import AttendanceRegisterSheet from '@kaksha/screens/auth/StudentAttendance/sheets/AttendanceRegisterSheet';
import DeleteAttendanceSheet from '@kaksha/screens/auth/StudentAttendance/sheets/DeleteAttendanceSheet';
import MarkAttendanceSheet from '@kaksha/screens/auth/StudentAttendance/sheets/MarkAttendanceSheet';
import UpdateAttendanceSheet from '@kaksha/screens/auth/StudentAttendance/sheets/UpdateAttendanceSheet';
import {showToast} from '@kaksha/services/toast';
import {DrawerScreenProps} from '@react-navigation/drawer';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTheme} from '@rneui/themed';

type StudentAttendanceProps = CompositeScreenProps<
  DrawerScreenProps<LeftPanelParamList, 'student_attendance'>,
  NativeStackScreenProps<RootStackParamList>
>;

const StudentAttendance = ({navigation}: StudentAttendanceProps) => {
  const {theme} = useTheme();

  const navigate = (type: 'mark' | 'update' | 'delete' | 'register') => {
    switch (type) {
      case 'mark':
        showToast(
          {
            type: 'custom',
            content: () => <MarkAttendanceSheet navigation={navigation} />,
          },
          ['75%'],
          {
            detached: false,
            bottomInset: 0,
            style: {marginHorizontal: 5},
            enablePanDownToClose: false,
            enableContentPanningGesture: false,
          },
        );
        return;
      case 'update':
        showToast(
          {
            type: 'custom',
            content: () => <UpdateAttendanceSheet navigation={navigation} />,
          },
          ['75%'],
          {
            detached: false,
            bottomInset: 0,
            style: {marginHorizontal: 5},
            enablePanDownToClose: false,
            enableContentPanningGesture: false,
          },
        );
        return;
      case 'delete':
        showToast(
          {
            type: 'custom',
            content: () => <DeleteAttendanceSheet navigation={navigation} />,
          },
          ['75%'],
          {
            detached: false,
            bottomInset: 0,
            style: {marginHorizontal: 5},
            enablePanDownToClose: false,
            enableContentPanningGesture: false,
          },
        );
        return;
      case 'register':
        showToast(
          {
            type: 'custom',
            content: () => <AttendanceRegisterSheet navigation={navigation} />,
          },
          ['75%'],
          {
            detached: false,
            bottomInset: 0,
            style: {marginHorizontal: 5},
            enablePanDownToClose: false,
            enableContentPanningGesture: false,
          },
        );
        return;
    }
  };
  return (
    <StyledPageView noInsets>
      <StyledView tw={'flex-row justify-between mt-4'} style={{gap: 20}}>
        <OverViewCard
          title="Attendance"
          value={'Mark'}
          bg={theme.colors.primary}
          color={theme.mode === 'light' ? theme.colors.white : undefined}
          lightColor={
            theme.mode === 'light'
              ? themeColors.darkColors?.lightText
              : undefined
          }
          icon={{name: 'star', type: 'Feather'}}
          onPress={() => navigate('mark')}
        />
        <OverViewCard
          title="Attendance"
          value={'Update'}
          bg={theme.colors.warning}
          color={theme.mode === 'light' ? theme.colors.white : undefined}
          lightColor={
            theme.mode === 'light'
              ? themeColors.darkColors?.lightText
              : undefined
          }
          icon={{name: 'arrow-up', type: 'Feather'}}
          onPress={() => navigate('update')}
        />
      </StyledView>
      <StyledView tw={'flex-row justify-between mt-4'} style={{gap: 20}}>
        <OverViewCard
          title="Attendance"
          value={'Delete'}
          bg={theme.colors.error}
          color={theme.mode === 'light' ? theme.colors.white : undefined}
          lightColor={
            theme.mode === 'light'
              ? themeColors.darkColors?.lightText
              : undefined
          }
          icon={{name: 'delete', type: 'Feather'}}
          onPress={() => navigate('delete')}
        />
        <OverViewCard
          title="Register"
          value={'Attendance'}
          icon={{name: 'book', type: 'Feather'}}
          onPress={() => navigate('register')}
        />
      </StyledView>
    </StyledPageView>
  );
};

export default StudentAttendance;
