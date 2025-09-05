import {StyledSkeleton, StyledText, StyledView} from '@common/components';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import {BottomSheetModalMethods} from '@gorhom/bottom-sheet/lib/typescript/types';
import {getAvatarURL, getBaseMediaURL} from '@kaksha/services/api/base';
import {showToast} from '@kaksha/services/toast';
import {AttendanceRegisterStudentData} from '@kaksha/types/attendance';
import {useBackHandler} from '@react-native-community/hooks';
import {Image, useTheme} from '@rneui/themed';
import dayjs from 'dayjs';
import {useEffect, useState} from 'react';
import {Dimensions} from 'react-native';
import Svg from 'react-native-svg';
import {VictoryLabel, VictoryPie} from 'victory-native';

const IMAGE_SIZE = 60;
const COUNT_PILL_SIZE = 50;
const DEFAULT_CHART_DATA = [
  {
    x: ' ',
    y: 0,
  },
  {
    x: ' ',
    y: 0,
  },
];
const DEFAULT_LABEL_STYLE = {
  fontFamily: 'Poppins-SemiBold',
  fontWeight: '600',
};
const DATE_PARSE_FORMAT = 'YYYY-MM-DD';
const DATE_FORMAT = 'dddd MMM DD, YYYY';

const AttendanceRegisterSheetData = ({
  item,
  sheetRef,
}: {
  item: AttendanceRegisterStudentData;
  sheetRef: React.RefObject<BottomSheetModalMethods> | null;
}) => {
  const {theme} = useTheme();
  const {width} = Dimensions.get('screen');
  const [chartData, setChartData] = useState(DEFAULT_CHART_DATA);
  const [endAngle, setEndAngle] = useState(0);
  const presentPrec =
    item.net_data.total !== 0
      ? item.net_data.present_count / item.net_data.total
      : 0;
  const absentPerc =
    item.net_data.total !== 0
      ? item.net_data.absent_count / item.net_data.total
      : 0;
  const showEmptyTrack = presentPrec === 0 && absentPerc === 0;
  const percentage = item.net_data.present_count / item.net_data.total;
  const colors = [
    theme.colors.primary,
    theme.colors.error,
    theme.colors.dividerColor,
  ];

  const getAttColor = (
    status: AttendanceRegisterStudentData['att_data'][0]['att_status'],
  ) => {
    switch (status) {
      case 'A':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  useBackHandler(() => {
    sheetRef?.current?.dismiss();
    return true;
  });

  useEffect(() => {
    // Cannot directly use the value, we need to change state.
    // Ref:
    // https://github.com/FormidableLabs/victory/issues/531
    // https://www.appsloveworld.com/react-native/100/72/victory-native-pie-chart-animation

    setChartData([
      {
        x: presentPrec > 0 ? `Present (${item.net_data.present_count})` : ' ',
        y: presentPrec,
      },
      {
        x: absentPerc > 0 ? `Absent (${item.net_data.absent_count})` : ' ',
        y: absentPerc,
      },
      {
        x: ' ',
        y: showEmptyTrack ? 1 : 0,
      },
    ]);
    setEndAngle(360);
  }, []);

  return (
    <StyledView tw={'h-full'}>
      <StyledView tw={'flex-row justify-between'}>
        <StyledView style={{flex: 3}}>
          <StyledText h3 lightText>
            Name
          </StyledText>
          <StyledText h2>{item.uniq_id__name}</StyledText>
        </StyledView>
        <StyledView tw={'items-end'}>
          <Image
            source={{
              uri: item.image
                ? getBaseMediaURL('student_image') + item.image
                : getAvatarURL(item.uniq_id__name ?? undefined),
            }}
            style={{
              width: IMAGE_SIZE,
              height: IMAGE_SIZE,
              borderRadius: IMAGE_SIZE,
            }}
            PlaceholderContent={
              <StyledSkeleton width={IMAGE_SIZE} height={IMAGE_SIZE} circle />
            }
          />
        </StyledView>
      </StyledView>
      <StyledView tw={'flex-row justify-between mt-1'}>
        <StyledView style={{flex: 3}}>
          <StyledText h3 lightText>
            University Roll No.
          </StyledText>
          <StyledText h2>{item.uniq_id__uni_roll_no ?? '-'}</StyledText>
        </StyledView>
        <StyledView tw={'items-end'}>
          <StyledText h3 lightText>
            Class Roll No.
          </StyledText>
          <StyledText h2>{item.class_roll_no ?? '-'}</StyledText>
        </StyledView>
      </StyledView>

      <Svg height={240} width={width}>
        <VictoryPie
          standalone={false}
          height={240}
          cornerRadius={5}
          labelPosition="centroid"
          animate={{easing: 'exp', duration: 600}}
          innerRadius={40}
          colorScale={colors}
          endAngle={endAngle}
          data={chartData}
          style={{
            labels: {
              fill: theme.colors.lightText,
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
                    return props.style.fill === colors[props.index]
                      ? null
                      : {
                          text: chartData[props.index]?.x
                            ? chartData[props.index]?.x
                            : '',
                          style: {
                            fill: colors[props.index]
                              ? colors[props.index]
                              : '#000',
                            fontSize: 16,
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
          x={width / 2}
          y={120}
          text={
            Number.isInteger(Math.min(Math.round(percentage * 100), 100))
              ? (percentage * 100).toFixed(1) + '%'
              : 0 + '%'
          }
          style={{
            fontSize: 24,
            fill:
              percentage * 100 < 60
                ? theme.colors.error
                : percentage * 100 < 75
                ? theme.colors.warning
                : theme.colors.primary,
            fontWeight: 'bold',
          }}
        />
      </Svg>

      <StyledView tw={'flex-1'}>
        <BottomSheetFlatList
          data={item.att_data}
          renderItem={({item}) => {
            return (
              <StyledView
                tw={'px-4 py-5 flex-row justify-between'}
                style={{
                  backgroundColor: theme.colors.grey5,
                  borderRadius: 20,
                }}>
                <StyledView>
                  <StyledText
                    h2
                    h2Style={{color: getAttColor(item.att_status)}}>
                    {item.att_status}
                  </StyledText>
                  <StyledText h3 lightText>
                    {dayjs(item.date, DATE_PARSE_FORMAT).format(DATE_FORMAT)}
                  </StyledText>
                </StyledView>
                <StyledView tw={'items-end'}>
                  <StyledText h2>{item.lecture}</StyledText>
                  <StyledText h3 lightText>
                    Lec Num
                  </StyledText>
                </StyledView>
              </StyledView>
            );
          }}
          ItemSeparatorComponent={() => <StyledView tw={'p-2'} />}
        />
      </StyledView>
    </StyledView>
  );
};

type AttendanceRegisterCardProps = AttendanceRegisterStudentData;

const AttendanceRegisterCard = (item: AttendanceRegisterCardProps) => {
  const {theme} = useTheme();

  const showData = () => {
    showToast(
      {
        type: 'custom',
        content: ref => {
          return <AttendanceRegisterSheetData item={item} sheetRef={ref} />;
        },
      },
      ['85%'],
      {
        detached: false,
        bottomInset: 0,
        style: {marginHorizontal: 5},
        enableContentPanningGesture: false,
      },
    );
  };

  return (
    <StyledView
      touchable
      onPress={showData}
      tw={'my-2 pl-4 flex-row items-center overflow-hidden'}
      style={{
        backgroundColor: theme.colors.bottomSheetBg,
        borderRadius: 20,
        gap: 10,
      }}>
      <Image
        source={{
          uri: item.image
            ? getBaseMediaURL('student_image') + item.image
            : getAvatarURL(item.uniq_id__name ?? undefined),
        }}
        style={{
          width: IMAGE_SIZE,
          height: IMAGE_SIZE,
          borderRadius: IMAGE_SIZE,
        }}
        PlaceholderContent={
          <StyledSkeleton width={IMAGE_SIZE} height={IMAGE_SIZE} circle />
        }
      />
      <StyledView tw={'flex-1 py-5'}>
        <StyledText h3>{item.uniq_id__name}</StyledText>
        <StyledText h4 lightText>
          {item.uniq_id__uni_roll_no}
        </StyledText>
      </StyledView>
      <StyledView style={{width: COUNT_PILL_SIZE}}>
        <StyledView
          touchable
          //   onPress={() => showStudentList('P')}
          tw="flex-1 items-center justify-center"
          style={{backgroundColor: theme.colors.primary}}>
          <StyledText tw="text-white mb-[-5]" h2>
            {item.net_data.present_count}
          </StyledText>
        </StyledView>
        <StyledView
          touchable
          //   onPress={() => showStudentList('A')}
          tw="flex-1 items-center justify-center"
          style={{backgroundColor: theme.colors.error}}>
          <StyledText tw="text-white mb-[-5]" h2>
            {item.net_data.absent_count}
          </StyledText>
        </StyledView>
      </StyledView>
    </StyledView>
  );
};

export default AttendanceRegisterCard;
