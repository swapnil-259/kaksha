import {StyledPageView, StyledText, StyledView} from '@common/components';
import VectorIcon from '@common/components/VectorIcon';
import OverViewCard from '@kaksha/components/OverViewCard';
import PageHeader from '@kaksha/components/PageHeader';
import URLS from '@kaksha/constants/urls';
import {RootStackParamList} from '@kaksha/navigator';
import {ResponseType} from '@kaksha/services/api/request';
import {AttendanceDetails, AttendanceSummary} from '@kaksha/types/attendance';
import useRequest from '@kaksha/utils/useRequest';
import {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Skeleton, useTheme} from '@rneui/themed';
import dayjs, {Dayjs} from 'dayjs';
import {useEffect, useMemo, useRef, useState} from 'react';
import {FlatList, Platform, RefreshControl} from 'react-native';
import {} from 'react-native-gesture-handler';

type AttendanceResponseData = ResponseType<{
  s: AttendanceDetails[];
  summary: AttendanceSummary[];
}> | null;

type AttendanceProps = NativeStackScreenProps<RootStackParamList, 'attendance'>;

const TIME_FORMAT = 'hh:mm A';
const TIME_PARSE_FORMAT = 'hh:mm:ss';
const DATE_FORMAT = 'YYYY-MM-DD';

const initialCalendarData = {
  value: new Date(),
  visible: false,
};

const Attendance = ({navigation}: AttendanceProps) => {
  const [dates, setDates] = useState<Dayjs[]>([dayjs()]);
  const [selectedDate, setSelectedDate] = useState(0);
  const [dateLoading, setDateLoading] = useState(true);
  const [calendarData, setCalendarData] = useState(initialCalendarData);
  const flatListRef = useRef<FlatList>(null);
  const {theme} = useTheme();

  const {
    getResponse: getUserAttendance,
    data: attendanceData,
    loading: attendanceLoading,
  } = useRequest<AttendanceResponseData>({
    requestParams: {
      method: 'GET',
      url: URLS.auth.attendance,
      params: {
        fdate: dates[selectedDate]?.format('YYYY-MM-DD'),
        request_type: 'employee',
        tdate: dates[selectedDate]?.format('YYYY-MM-DD'),
      },
    },
    initialState: null,
  });

  const selectedAttendance = useMemo(() => {
    const currentDate = dates[selectedDate];
    if (attendanceData && currentDate) {
      const details = attendanceData.data.s.find(
        each => each.att_date === currentDate.format('DD-MM-YYYY'),
      );
      if (details) {
        return details;
      }
    }
    return null;
  }, [attendanceData]);

  const checkInTime = selectedAttendance
    ? ['P', 'P/A', 'P/I', 'P/II'].includes(selectedAttendance.emp_status)
      ? dayjs(selectedAttendance.emp_intime, TIME_PARSE_FORMAT).format(
          TIME_FORMAT,
        )
      : 'Not Yet'
    : 'N/A';

  const checkOutTime = selectedAttendance
    ? ['P', 'P/I', 'P/II'].includes(selectedAttendance.emp_status)
      ? dayjs(selectedAttendance.emp_outtime, TIME_PARSE_FORMAT).format(
          TIME_FORMAT,
        )
      : 'Not Yet'
    : 'N/A';
  const workHours = selectedAttendance
    ? ['P', 'P/I', 'P/II'].includes(selectedAttendance.emp_status)
      ? dayjs(selectedAttendance.work_hours, TIME_PARSE_FORMAT).format(
          'h [hrs] m [mins]',
        )
      : '-'
    : 'N/A';

  const getAttColor = (status: AttendanceDetails['emp_status']) => {
    switch (status) {
      case 'A':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const getDates = (start: Dayjs, end: Dayjs) => {
    setDateLoading(true);
    const dates = [];
    while (!start.isAfter(end)) {
      dates.push(start);
      start = start.add(1, 'day');
    }
    setDateLoading(false);
    return dates.reverse();
  };

  const handleOnChange = (_: DateTimePickerEvent, date?: Date) => {
    setCalendarData(prev => ({...prev, visible: false}));
    if (date) {
      setCalendarData(prev => ({...prev, value: date}));
      const newDate = dayjs(date).utc(true);
      if (newDate >= dates[dates.length - 1] && newDate <= dates[0]) {
        const idx = dates.findIndex(
          each => each.format(DATE_FORMAT) === newDate.format(DATE_FORMAT),
        );
        if (idx !== -1) setSelectedDate(idx);
      } else {
        const newDates = getDates(dayjs(date).subtract(10, 'days'), dayjs());
        setDates(newDates);
        const idx = newDates.findIndex(
          each => each.format(DATE_FORMAT) === newDate.format(DATE_FORMAT),
        );
        if (idx !== -1) setSelectedDate(idx);
      }
    }
  };

  const handleCalendar = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        mode: 'date',
        value: calendarData.value,
        onChange: handleOnChange,
        maximumDate: dayjs().toDate(),
      });
    }
  };

  useEffect(() => {
    setDates(getDates(dayjs().subtract(10, 'days'), dayjs()));
  }, []);

  useEffect(() => {
    getUserAttendance().then(() => {
      flatListRef.current?.scrollToIndex({
        animated: true,
        index: selectedDate,
        viewPosition: 0.5,
      });
    });
  }, [selectedDate]);
  return (
    <StyledPageView
      isScrollable
      scrollViewProps={{
        refreshControl: (
          <RefreshControl
            refreshing={false}
            onRefresh={() => getUserAttendance()}
          />
        ),
      }}>
      <PageHeader
        navigation={navigation}
        title="My Attendance"
        rightContent={
          <StyledView touchable onPress={handleCalendar}>
            <VectorIcon name="calendar" type="Feather" />
          </StyledView>
        }
      />
      <StyledView>
        <FlatList
          horizontal
          ref={flatListRef}
          showsHorizontalScrollIndicator={false}
          inverted
          data={dates}
          onEndReached={() => {
            setDates(
              getDates(dates[dates.length - 1].subtract(5, 'days'), dates[0]),
            );
          }}
          keyExtractor={(_, i) => `${i}`}
          ListFooterComponent={
            <Skeleton height={60} width={60} style={{borderRadius: 60}} />
          }
          onScrollToIndexFailed={error => {
            flatListRef.current?.scrollToOffset({
              offset: error.averageItemLength * error.index,
              animated: true,
            });
            setTimeout(() => {
              if (dates.length > error.index) {
                flatListRef.current?.scrollToIndex({
                  index: error.index,
                  animated: true,
                });
              }
            }, 100);
          }}
          renderItem={({item, index}) => {
            return (
              <StyledView tw={'items-center ml-2'}>
                <StyledView
                  touchable={!attendanceLoading}
                  onPress={() => {
                    setSelectedDate(index);
                    setCalendarData(prev => ({
                      ...prev,
                      value: dates[index].toDate(),
                    }));
                  }}
                  tw={'items-center justify-center p-3'}
                  style={{
                    borderRadius: 50,
                    backgroundColor:
                      selectedDate === index
                        ? theme.colors.primary
                        : theme.colors.bottomSheetBg,
                  }}>
                  <StyledText h3 tw="mb-[-5]">
                    {item.format(selectedDate === index ? 'MMM D' : 'DD')}
                  </StyledText>
                </StyledView>
                <StyledText h4 lightText>
                  {item.format('ddd')}
                </StyledText>
              </StyledView>
            );
          }}
        />
      </StyledView>
      <StyledView tw={'flex-row justify-between mt-4'} style={{gap: 20}}>
        <OverViewCard
          title="Checked In"
          value={checkInTime}
          icon={{name: 'terminal', type: 'Feather'}}
          loading={attendanceLoading || dateLoading}
        />
        <OverViewCard
          title="Checked Out"
          value={checkOutTime}
          icon={{name: 'external-link', type: 'Feather'}}
          loading={attendanceLoading || dateLoading}
        />
      </StyledView>
      <StyledView tw={'flex-row justify-between mt-4'} style={{gap: 20}}>
        <OverViewCard
          title="Status"
          bg={
            selectedAttendance
              ? getAttColor(selectedAttendance.emp_status)
              : undefined
          }
          value={selectedAttendance ? selectedAttendance.emp_status : 'N/A'}
          icon={{name: 'activity', type: 'Feather'}}
          loading={attendanceLoading || dateLoading}
        />
      </StyledView>
      <StyledView tw={'flex-row justify-between mt-4'} style={{gap: 20}}>
        <OverViewCard
          title="Work Hours"
          value={workHours}
          icon={{name: 'bar-chart', type: 'Feather'}}
          loading={attendanceLoading || dateLoading}
        />
      </StyledView>
    </StyledPageView>
  );
};

export default Attendance;
