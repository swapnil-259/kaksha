import {
  StyledButton,
  StyledInput,
  StyledPageView,
  StyledText,
  StyledView,
} from '@common/components';
import Checkbox from '@common/components/Checkbox';
import VectorIcon from '@common/components/VectorIcon';
import PageHeader from '@kaksha/components/PageHeader';
import URLS from '@kaksha/constants/urls';
import {RootStackParamList} from '@kaksha/navigator';
import MarkAttendanceCard from '@kaksha/screens/auth/StudentAttendance/MarkAttendanceCard';
import request from '@kaksha/services/api/request';
import {showToast} from '@kaksha/services/toast';
import {StudentDetails} from '@kaksha/types/attendance';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTheme} from '@rneui/themed';
import {FlashList, ListRenderItem} from '@shopify/flash-list';
import dayjs from 'dayjs';
import {useCallback, useEffect, useState} from 'react';

type MarkAttendanceProps = NativeStackScreenProps<
  RootStackParamList,
  'mark_attendance'
>;

const MarkAttendance = ({navigation, route}: MarkAttendanceProps) => {
  const [selected, setSelected] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const {theme} = useTheme();

  const updateSelectAll = (selected: number[]) => {
    setSelectAll(route.params.student_list.length === new Set(selected).size);
  };

  const renderItem = useCallback<ListRenderItem<StudentDetails>>(
    ({item}) => {
      return (
        <MarkAttendanceCard
          selected={selected.includes(item.uniq_id ?? -1)}
          onChange={() => {
            selected.includes(item.uniq_id ?? -1)
              ? setSelected(prev => {
                  prev = prev.filter(each => each !== item.uniq_id);
                  updateSelectAll(prev);
                  return prev;
                })
              : setSelected(prev => {
                  prev = [...prev, item.uniq_id ?? -1];
                  updateSelectAll(prev);
                  return prev;
                });
          }}
          previous_status={
            route.params.type === 'mark'
              ? route.params.previous_status[item.uniq_id?.toString() ?? '']
                  ?.status_list ?? []
              : []
          }
          {...item}
        />
      );
    },
    [selected],
  );

  const updateAllStudents = async (status: boolean) => {
    setSelected(
      status
        ? (route.params.student_list
            .map(each => each.uniq_id)
            .filter(each => each !== null) as number[])
        : [],
    );
  };

  const getFilteredData = () => {
    return route.params.student_list.filter(each => {
      const name = each.uniq_id__name?.toLocaleLowerCase();
      const univ_roll = each.uniq_id__uni_roll_no?.toLocaleLowerCase();
      const class_roll = each.class_roll_no?.toString().toLocaleLowerCase();
      const search = searchText.toLocaleLowerCase();
      return (
        name?.includes(search) ||
        univ_roll?.includes(search) ||
        class_roll?.includes(search)
      );
    });
  };

  const markAttendance = async (present_students: number[]) => {
    setLoading(true);
    let body;
    if (route.params.type === 'mark')
      body = {
        app: 1,
        att_type: route.params.attendance_data.category,
        date: dayjs(route.params.attendance_data.date).format('YYYY-MM-DD'),
        group_id: route.params.attendance_data.group_name,
        isgroup: route.params.attendance_data.type,
        lecture: route.params.attendance_data.lectures,
        section: route.params.attendance_data.section,
        subject_id: route.params.attendance_data.subject,
        topic: route.params.attendance_data.topics,
        present_students,
      };
    else
      body = {
        app: 1,
        att_id: route.params.att_id,
        present_students,
      };

    const {status, HttpStatusCode, data} = await request<{msg: string}>({
      method: route.params.type === 'mark' ? 'POST' : 'PUT',
      url:
        route.params.type === 'mark'
          ? URLS.auth.academics.mark_class_attendance
          : URLS.auth.academics.update_class_attendance,
      data: body,
    });
    if (status === HttpStatusCode.OK && data) {
      showToast({
        type: 'success',
        title: 'Success!',
        description: data.msg,
      });
      navigation.pop();
    }
    setLoading(false);
  };

  const confirmMarkAttendance = () => {
    const present = [...new Set(selected).keys()];
    showToast({
      type: 'warning',
      title: 'Are you sure?',
      description: `Present Count: ${present.length} | Absent Count: ${
        route.params.student_list.length - present.length
      }`,
      customButton: ref => (
        <StyledView tw={'w-full'} style={{gap: 10}}>
          <StyledButton
            title={'Yes'}
            uppercase
            twContainer={'w-full'}
            buttonStyle={{backgroundColor: theme.colors.warning}}
            onPress={() => {
              ref?.current?.dismiss();
              markAttendance(present);
              // navigation.dispatch(e.data.action);
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

  useEffect(() => {
    navigation.addListener('beforeRemove', e => {
      if (['GO_BACK'].includes(e.data.action.type)) {
        e.preventDefault();
        showToast({
          type: 'warning',
          title: 'Are you sure?',
          description: 'The attendance data will be discarded!',
          customButton: ref => (
            <StyledView tw={'w-full'} style={{gap: 10}}>
              <StyledButton
                title={'Yes'}
                uppercase
                twContainer={'w-full'}
                buttonStyle={{backgroundColor: theme.colors.warning}}
                onPress={() => {
                  ref?.current?.dismiss();
                  navigation.dispatch(e.data.action);
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
      }
    });
  }, [navigation]);

  useEffect(() => {
    const markedStudents = route.params.student_list
      .filter(each => each.checked)
      .map(each => each.uniq_id ?? -1);
    setSelected(markedStudents);
  }, []);

  return (
    <StyledPageView loading={loading}>
      <PageHeader
        navigation={navigation}
        title={route.params.title}
        rightContent={
          <Checkbox
            status={selectAll}
            toggleStatus={() => {
              setSelectAll(!selectAll);
              updateAllStudents(!selectAll);
            }}
          />
        }
      />
      <StyledView tw={'flex-row'}>
        <StyledInput
          placeholder="Search Students.."
          value={searchText}
          onChangeText={text => setSearchText(text)}
          leftIcon={<VectorIcon name="search" type="Feather" />}
          rightIcon={
            <StyledView
              tw={'p-1'}
              touchable={searchText !== ''}
              onPress={() => setSearchText('')}
              style={{borderRadius: 20}}>
              <VectorIcon
                size={20}
                color={
                  searchText !== '' ? theme.colors.black : theme.colors.grey5
                }
                name="x"
                type="Feather"
              />
            </StyledView>
          }
          inputContainerStyle={{
            paddingStart: 10,
          }}
          containerStyle={{
            paddingVertical: 0,
            justifyContent: 'center',
          }}
        />
      </StyledView>
      <StyledView tw={'flex-1 overflow-hidden'} style={{borderRadius: 20}}>
        <FlashList
          showsVerticalScrollIndicator={false}
          data={
            searchText !== '' ? getFilteredData() : route.params.student_list
          }
          keyExtractor={item => `${item.uniq_id}`}
          renderItem={renderItem}
          estimatedItemSize={120}
          extraData={selected}
          ListEmptyComponent={() => (
            <StyledView
              tw={'items-center justify-center'}
              style={{height: 120}}>
              <StyledText h2 lightText>
                No Students..
              </StyledText>
            </StyledView>
          )}
        />
      </StyledView>
      <StyledButton
        title={route.params.type === 'mark' ? 'Mark' : 'Update'}
        twContainer="my-4"
        onPress={confirmMarkAttendance}
      />
    </StyledPageView>
  );
};

export default MarkAttendance;
