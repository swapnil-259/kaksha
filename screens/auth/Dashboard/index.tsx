import {
  StyledPageView,
  StyledScrollView,
  StyledSkeleton,
  StyledText,
  StyledView,
} from '@common/components';
import OverViewCard from '@kaksha/components/OverViewCard';
import URLS from '@kaksha/constants/urls';
import {LeftPanelParamList, RootStackParamList} from '@kaksha/navigator';
import AttendanceCard from '@kaksha/screens/auth/Dashboard/AttendanceCard';
import TimeTableCard from '@kaksha/screens/auth/Dashboard/TimeTableCard';
import {ResponseType} from '@kaksha/services/api/request';
import {showToast} from '@kaksha/services/toast';
import {authStore} from '@kaksha/store/auth';
import {AttendanceDetails, AttendanceSummary} from '@kaksha/types/attendance';
import {TimeTableDetails} from '@kaksha/types/timetable';
import {capatalize, parseTimeTable} from '@kaksha/utils';
import useRequest from '@kaksha/utils/useRequest';
import {DrawerScreenProps} from '@react-navigation/drawer';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTheme} from '@rneui/themed';
import dayjs from 'dayjs';
import {useEffect, useMemo, useState} from 'react';
import {Dimensions, RefreshControl} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import Svg from 'react-native-svg';
import {useSnapshot} from 'valtio';
import {VictoryLabel, VictoryPie} from 'victory-native';

type AttendanceResponseData = ResponseType<{
  s: AttendanceDetails[];
  summary: AttendanceSummary[];
  overall_summary: AttendanceSummary[];
}> | null;

type TimeTableResponseData = ResponseType<TimeTableDetails[][]> | null;

const TIME_FORMAT = 'hh:mm A';
const TIME_PARSE_FORMAT = 'hh:mm:ss';
const DEFAULT_LABEL_STYLE = {
  fontFamily: 'Poppins-SemiBold',
  fontWeight: '600',
};

const AttendanceChartData = ({
  chartData,
  chartColor,
  totalAttended,
}: {
  chartData: {
    x: string;
    y: number;
  }[];
  chartColor: string[];
  totalAttended: string;
}) => {
  const {theme} = useTheme();
  const [endAngle, setEndAngle] = useState(0);
  const width = Dimensions.get('window').width;
  const presentPercentage = useMemo(() => {
    if (totalAttended != '-') {
      return (
        Number(totalAttended.split('/')[0]) /
        Number(totalAttended.split('/')[1])
      );
    }
    return 0;
  }, []);

  useEffect(() => {
    setEndAngle(360);
  }, []);

  return (
    <StyledView>
      <Svg height={240} width={width}>
        <VictoryPie
          standalone={false}
          height={240}
          cornerRadius={3}
          width={width - 60}
          labelPosition="centroid"
          animate={{duration: 600, easing: 'exp'}}
          innerRadius={40}
          colorScale={chartColor}
          endAngle={endAngle}
          data={chartData}
          style={{
            labels: {
              fill: theme.colors.lightText,
              fontSize: 11,
              ...DEFAULT_LABEL_STYLE,
            },
          }}
          events={[
            {
              target: 'data',
              eventHandlers: {
                onPressOut: () => ({
                  target: 'data',
                  mutation: props => {
                    return props.slice.data.xName.trim()
                      ? props.innerRadius == 35
                        ? null
                        : {
                            innerRadius: 35,
                            radius: 75,
                            style: {
                              fill: props.style.fill,
                            },
                          }
                      : null;
                  },
                }),
                onPressIn: () => ({
                  target: 'labels',
                  mutation: props => {
                    return props.style.fill === chartColor[props.index]
                      ? null
                      : {
                          text: chartData[props.index]?.x
                            ? chartData[props.index]?.x
                            : '',
                          style: {
                            fill: chartColor[props.index]
                              ? chartColor[props.index]
                              : '#000',
                            fontSize: 11,
                            ...DEFAULT_LABEL_STYLE,
                          },
                        };
                  },
                }),
              },
            },
          ]}
        />
        <VictoryLabel
          textAnchor="middle"
          verticalAnchor="middle"
          x={width / 2 - 30}
          y={125}
          text={
            Number.isInteger(Math.min(Math.round(presentPercentage * 100), 100))
              ? (presentPercentage * 100).toFixed(1) + '%'
              : 0 + '%'
          }
          style={{
            fontSize: 20,
            fill:
              presentPercentage * 100 < 60
                ? theme.colors.error
                : presentPercentage * 100 < 75
                ? theme.colors.warning
                : theme.colors.primary,
            fontWeight: 'bold',
          }}
        />
      </Svg>
    </StyledView>
  );
};

type DashboardProps = CompositeScreenProps<
  DrawerScreenProps<LeftPanelParamList, 'dashboard'>,
  NativeStackScreenProps<RootStackParamList>
>;

const Dashboard = ({navigation}: DashboardProps) => {
  const {theme} = useTheme();
  const auth = useSnapshot(authStore);
  const session = useSnapshot(authStore);
  const {width, height} = Dimensions.get('screen');
  const hasAcademicRights = auth.modules.includes('ACAD');
  const {
    getResponse: getUserAttendance,
    data: attendanceData,
    loading: attendanceLoading,
  } = useRequest<AttendanceResponseData>({
    requestParams: {
      method: 'GET',
      url: URLS.auth.attendance,
      params: {
        fdate: dayjs().subtract(7, 'days').format('YYYY-MM-DD'),
        request_type: 'employee',
        tdate: dayjs().format('YYYY-MM-DD'),
      },
    },
    initialState: null,
  });

  const {
    getResponse: getUserTimetable,
    data: timetableResponse,
    loading: timetableLoading,
  } = useRequest<TimeTableResponseData>({
    requestParams: {
      method: 'GET',
      url: URLS.auth.academics.getComponents,
      params: {
        request_type: 'employee_time_table',
      },
    },
    initialState: null,
  });

  const todayAttendance = useMemo(() => {
    if (attendanceData) {
      const details = attendanceData.data.s.find(
        each => each.att_date === dayjs().format('DD-MM-YYYY'),
      );
      if (details) {
        return details;
      }
    }
    return null;
  }, [attendanceData]);

  const totalAttended = useMemo(() => {
    if (attendanceData) {
      let totalCount = 0;
      let present = 0;
      attendanceData.data.overall_summary?.forEach(each => {
        if (each.label !== 'Holiday') totalCount += each.data;
        if (each.label === 'Present') present = each.data;
      });
      return `${present}/${totalCount}`;
    }
    return '-';
  }, [attendanceData]);

  const monthlyAttDetails = useMemo(() => {
    if (attendanceData)
      return attendanceData.data.overall_summary.map(each => ({
        x: `${each.label}(${each.data})`,
        y: each.data,
      }));

    return [];
  }, [attendanceData]);

  const monthlyColorDetails = useMemo(() => {
    if (attendanceData) {
      return attendanceData.data.overall_summary.map(each => each.color);
    }
    return [];
  }, [attendanceData]);

  const timetableData = useMemo(
    () => parseTimeTable(timetableResponse?.data),
    [timetableResponse],
  );

  const checkInTime = todayAttendance
    ? ['P', 'P/A', 'P/I', 'P/II'].includes(todayAttendance.emp_status)
      ? dayjs(todayAttendance.emp_intime, TIME_PARSE_FORMAT).format(TIME_FORMAT)
      : 'Not Yet'
    : 'N/A';

  const checkOutTime = todayAttendance
    ? ['P', 'P/I', 'P/II'].includes(todayAttendance.emp_status)
      ? dayjs(todayAttendance.emp_outtime, TIME_PARSE_FORMAT).format(
          TIME_FORMAT,
        )
      : 'Not Yet'
    : 'N/A';
  const getAttColor = (status: AttendanceDetails['emp_status']) => {
    switch (status) {
      case 'A':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const showTodayAttendance = () => {
    showToast({
      type: 'custom',
      content: () => (
        <StyledView>
          <StyledText h3 lightText>
            Today
          </StyledText>
          <StyledText h2>{dayjs().format('dddd MMM DD, YYYY')}</StyledText>
          <StyledView tw={'flex-row justify-between'}>
            <StyledView style={{flex: 3}}>
              <StyledText h3 lightText>
                Checked In
              </StyledText>
              <StyledText h2>{checkInTime}</StyledText>
            </StyledView>
            <StyledView tw={'items-center'}>
              <StyledText h3 lightText>
                Checked Out
              </StyledText>
              <StyledText h2>{checkOutTime}</StyledText>
            </StyledView>
          </StyledView>
          <StyledText h3 lightText>
            Status
          </StyledText>
          <StyledText
            h2
            h2Style={{
              color: todayAttendance
                ? getAttColor(todayAttendance.emp_status)
                : theme.colors.black,
            }}>
            {todayAttendance?.emp_status}
          </StyledText>
        </StyledView>
      ),
    });
  };

  const showAttendanceChart = () => {
    showToast({
      type: 'custom',
      content: () => (
        <AttendanceChartData
          totalAttended={totalAttended}
          chartData={monthlyAttDetails}
          chartColor={monthlyColorDetails}
        />
      ),
    });
  };

  const getData = () => {
    getUserAttendance();
    if (hasAcademicRights) getUserTimetable();
  };

  useEffect(() => {
    getData();
  }, [session.session?.current_session]);
  return (
    <StyledPageView
      isScrollable
      noInsets
      scrollViewProps={{
        // contentContainerStyle: {
        //   flexGrow: 1,
        //   justifyContent: 'space-between',
        //   height,
        // },
        refreshControl: (
          <RefreshControl refreshing={false} onRefresh={getData} />
        ),
      }}>
      <StyledText h2>Hi {capatalize(auth.userData?.emp_id__name)}!</StyledText>
      <StyledView style={{gap: 20}}>
        <StyledView tw={'flex-row justify-between'} style={{gap: 20}}>
          <OverViewCard
            title="Checked In"
            onPress={showTodayAttendance}
            value={checkInTime}
            icon={{name: 'terminal', type: 'Feather'}}
            loading={attendanceLoading}
          />
          <OverViewCard
            title="Checked Out"
            onPress={showTodayAttendance}
            value={checkOutTime}
            icon={{name: 'external-link', type: 'Feather'}}
            loading={attendanceLoading}
          />
        </StyledView>
        <StyledView tw={'flex-row justify-between'} style={{gap: 20}}>
          <OverViewCard
            color={todayAttendance ? '#ffffff' : undefined}
            title="Status"
            lightColor={todayAttendance ? '#ffffff' : undefined}
            onPress={showTodayAttendance}
            bg={
              todayAttendance
                ? getAttColor(todayAttendance.emp_status)
                : undefined
            }
            value={todayAttendance ? todayAttendance.emp_status : 'N/A'}
            icon={{name: 'activity', type: 'Feather'}}
            loading={attendanceLoading}
          />
          <OverViewCard
            title="Total Attended"
            onPress={showAttendanceChart}
            value={totalAttended}
            icon={{name: 'bar-chart', type: 'Feather'}}
            loading={attendanceLoading}
          />
        </StyledView>
      </StyledView>
      {hasAcademicRights && (
        <>
          <StyledView tw={'flex-row justify-between items-center'}>
            <StyledText h2 tw="my-2">
              Today's Timetable
            </StyledText>
            <StyledText
              h3
              lightText
              tw="p-3"
              onPress={() => navigation.navigate('timetable', timetableData)}
              h3Style={{color: theme.colors.primary}}>
              View All
            </StyledText>
          </StyledView>
          <StyledView>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, i) => `${item.day}-${i}`}
              data={timetableData[dayjs().day()].timetable}
              renderItem={({item}) => {
                return <TimeTableCard {...item} />;
              }}
              ListEmptyComponent={() => {
                return timetableLoading ? (
                  <StyledSkeleton
                    height={180}
                    width={308}
                    style={{borderRadius: 20}}
                  />
                ) : (
                  <StyledView
                    tw={'items-center justify-center'}
                    style={{height: 180, width: width - 30, borderRadius: 20}}>
                    <StyledText h2 lightText>
                      No Lectures Today!
                    </StyledText>
                  </StyledView>
                );
              }}
            />
          </StyledView>
        </>
      )}
      <StyledView tw={'flex-row justify-between items-center'}>
        <StyledText h2 tw="my-2">
          Your Attendances
        </StyledText>
        <StyledText
          h3
          lightText
          tw="p-3"
          onPress={() => navigation.navigate('attendance')}
          h3Style={{color: theme.colors.primary}}>
          View All
        </StyledText>
      </StyledView>
      <StyledView
        style={{
          height: hasAcademicRights ? 300 : height / 2,
          width: '100%',
          borderRadius: 20,
          overflow: 'hidden',
          // flexGrow: 1,
        }}>
        <StyledScrollView
          horizontal
          contentContainerStyle={{
            width: '100%',
            borderRadius: 20,
            overflow: 'hidden',
            // flexGrow: 1,
          }}>
          <FlatList
            data={[...(attendanceData?.data.s ?? [])].reverse()}
            renderItem={({item}) => <AttendanceCard {...item} />}
            ListEmptyComponent={() => {
              return attendanceLoading ? (
                <StyledSkeleton height={100} style={{borderRadius: 20}} />
              ) : (
                <StyledView
                  tw={'items-center justify-center'}
                  style={{height: 100, borderRadius: 20}}>
                  <StyledText h2 lightText>
                    No Previous Attendance!
                  </StyledText>
                </StyledView>
              );
            }}
          />
        </StyledScrollView>
      </StyledView>
    </StyledPageView>
  );
};

export default Dashboard;
