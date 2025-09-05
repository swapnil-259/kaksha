import {
  StyledButton,
  StyledPageView,
  StyledText,
  StyledView,
} from '@common/components';
import useUpdateEffect from '@common/utils/useUpdateEffect';
import PageHeader from '@kaksha/components/PageHeader';
import URLS from '@kaksha/constants/urls';
import {RootStackParamList} from '@kaksha/navigator';
import SelectAttedanceCard from '@kaksha/screens/auth/StudentAttendance/SelectAttendanceCard';
import request, {ResponseType} from '@kaksha/services/api/request';
import {showToast} from '@kaksha/services/toast';
import {AttendanceData} from '@kaksha/types/attendance';
import {useRefresh} from '@react-native-community/hooks';
import {useIsFocused} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTheme} from '@rneui/themed';
import dayjs from 'dayjs';
import {useCallback, useMemo, useState} from 'react';
import {
  SectionList,
  SectionListData,
  SectionListRenderItem,
} from 'react-native';

type SelectAttedanceProps = NativeStackScreenProps<
  RootStackParamList,
  'select_attendance'
>;

const DATE_PARSE_FORMAT = 'YYYY-MM-DD';
const DATE_FORMAT = 'MMMM DD, YYYY';

const SelectAttendance = ({navigation, route}: SelectAttedanceProps) => {
  const {theme} = useTheme();
  const {isRefreshing, onRefresh} = useRefresh(() => handleRefresh());
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();

  const handleRefresh = async () => {
    const params = {
      isgroup: route.params.form_data.type,
      request_type: 'get_attendance',
      sem_id: route.params.form_data.semester,
      sub_id: route.params.form_data.subject,
      ...(route.params.form_data.type === 'Y'
        ? {group_id: route.params.form_data.group_name}
        : {section: route.params.form_data.section}),
      ...(route.params.form_data.group_type !== 'inter' && {
        section: route.params.form_data.section,
      }),
    };
    const {status, HttpStatusCode, data} = await request<
      ResponseType<AttendanceData[]>
    >({
      method: 'GET',
      url: URLS.auth.academics.getComponents,
      params,
    });
    if (status === HttpStatusCode.OK && data) {
      navigation.setParams({data: data.data});
    }
  };

  const deleteAttendance = async (att_id: number) => {
    setLoading(true);

    const body = {
      app: 1,
      att_id,
    };

    const {status, HttpStatusCode, data} = await request<{msg: string}>({
      method: 'DELETE',
      url: URLS.auth.academics.update_class_attendance,
      data: body,
    });
    if (status === HttpStatusCode.OK && data) {
      showToast({
        type: 'success',
        title: 'Success!',
        description: data.msg,
      });
      onRefresh();
    }
    setLoading(false);
  };

  const confirmDeleteAttendance = (item: AttendanceData) => {
    showToast({
      type: 'warning',
      title: 'Are you sure?',
      description: 'Are you sure you want to delete this attendance?',
      customButton: ref => (
        <StyledView tw={'w-full'} style={{gap: 10}}>
          <StyledButton
            title={'Yes'}
            uppercase
            twContainer={'w-full'}
            buttonStyle={{backgroundColor: theme.colors.warning}}
            onPress={() => {
              ref?.current?.dismiss();
              deleteAttendance(item.id ?? 0);
            }}
          />
          <StyledButton
            title={'No'}
            uppercase
            twContainer={'w-full'}
            buttonStyle={{
              backgroundColor: 'transparent',
              borderColor: theme.colors.warning,
            }}
            titleStyle={{color: theme.colors.warning}}
            type="outline"
            onPress={() => {
              ref?.current?.dismiss();
            }}
          />
        </StyledView>
      ),
    });
  };
  const handlePress = (item: AttendanceData) => {
    if (route.params.type === 'update')
      navigation.navigate('mark_attendance', {
        type: 'update',
        student_list: item.student_status ? item.student_status[0] : [],
        title: 'Update Attendance',
        att_id: item.id ?? 0,
      });
    else confirmDeleteAttendance(item);
  };

  const renderItem = useCallback<SectionListRenderItem<AttendanceData>>(
    ({item}) => {
      return <SelectAttedanceCard onPress={handlePress} {...item} />;
    },
    [],
  );

  const renderSectionHeader = useCallback<
    (info: {
      section: SectionListData<AttendanceData, {title: string}>;
    }) => React.ReactElement | null
  >(({section: {title}}) => {
    return (
      <StyledView>
        <StyledText h4 lightText>
          {dayjs(title, DATE_PARSE_FORMAT).format(DATE_FORMAT)}
        </StyledText>
      </StyledView>
    );
  }, []);

  const sections = useMemo(() => {
    const dates: Record<string, AttendanceData[]> = {};
    route.params.data.forEach(each => {
      if (Object.keys(dates).includes(each.date ?? '')) {
        dates[each.date ?? '']?.push(each);
      } else {
        dates[each.date ?? ''] = [each];
      }
    });
    return Object.keys(dates).map(date => ({title: date, data: dates[date]}));
  }, [route.params]);

  useUpdateEffect(() => {
    onRefresh();
  });

  return (
    <StyledPageView loading={loading}>
      <PageHeader
        navigation={navigation}
        title={
          route.params.type === 'update'
            ? 'Update Attendance'
            : 'Delete Attendance'
        }
      />
      <StyledView tw={'flex-1'}>
        <SectionList
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          sections={sections}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          ListEmptyComponent={() => (
            <StyledView
              tw={'items-center justify-center'}
              style={{height: 120}}>
              <StyledText h2 lightText>
                No Attendance..
              </StyledText>
            </StyledView>
          )}
        />
      </StyledView>
    </StyledPageView>
  );
};

export default SelectAttendance;
