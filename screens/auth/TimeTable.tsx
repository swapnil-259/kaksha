import {StyledPageView, StyledText, StyledView} from '@common/components';
import PageHeader from '@kaksha/components/PageHeader';
import {RootStackParamList} from '@kaksha/navigator';
import TimeTableCard from '@kaksha/screens/auth/Dashboard/TimeTableCard';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTheme} from '@rneui/themed';
import dayjs from 'dayjs';
import {useState} from 'react';
import {FlatList} from 'react-native';
import {
  Directions,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import {useSharedValue} from 'react-native-reanimated';

type TimeTableProps = NativeStackScreenProps<RootStackParamList, 'timetable'>;

const TimeTable = ({navigation, route}: TimeTableProps) => {
  const [timetable] = useState(route.params);
  const [selectedDay, setSelectedDay] = useState(`${dayjs().day()}`);
  const {theme} = useTheme();
  const gestureData = useSharedValue(0);
  const fling = Gesture.Fling()
    .direction(Directions.LEFT | Directions.RIGHT)
    .runOnJS(true)
    .onBegin(e => {
      gestureData.value = e.absoluteX;
    })
    .onEnd(e => {
      console.log(gestureData.value - e.absoluteX);

      if (gestureData.value - e.absoluteX > 0) {
        console.log('hi');
        setSelectedDay(`${(Number.parseInt(selectedDay) + 1) % 7}`);
      } else {
        const currentDay = Number.parseInt(selectedDay);
        setSelectedDay(`${currentDay - 1 >= 0 ? currentDay - 1 : 6}`);
      }
    });

  return (
    <StyledPageView>
      <PageHeader navigation={navigation} title="Timetable" />
      <StyledView>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={'1234560'.split('')}
          renderItem={({item}) => {
            return (
              <StyledView
                touchable
                onPress={() => setSelectedDay(item)}
                tw={'items-center justify-center mr-2'}
                style={{
                  borderRadius: 50,
                  height: 60,
                  width: 50,
                  backgroundColor:
                    selectedDay === item
                      ? theme.colors.primary
                      : theme.colors.bottomSheetBg,
                }}>
                <StyledText h3 tw="mb-[-5]">
                  {timetable[Number.parseInt(item)].day}
                </StyledText>
              </StyledView>
            );
          }}
        />
      </StyledView>
      <GestureDetector gesture={fling}>
        <StyledView tw={'flex-1 mt-3'}>
          <FlatList
            keyExtractor={(item, i) => `${item.day}-${i}`}
            data={timetable[Number.parseInt(selectedDay)].timetable}
            renderItem={({item}) => {
              return <TimeTableCard vertical {...item} />;
            }}
            ListEmptyComponent={() => {
              return (
                <StyledView
                  tw={'items-center justify-center'}
                  style={{height: 180, width: '100%', borderRadius: 20}}>
                  <StyledText h2 lightText>
                    No Lectures!
                  </StyledText>
                </StyledView>
              );
            }}
          />
        </StyledView>
      </GestureDetector>
    </StyledPageView>
  );
};

export default TimeTable;
