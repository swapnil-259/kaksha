import {StyledText, StyledView} from '@common/components';
import {showToast} from '@kaksha/services/toast';
import {TimeTableDetails} from '@kaksha/types/timetable';
import {limitText} from '@kaksha/utils';
import {LinearProgress, useTheme} from '@rneui/themed';
import dayjs from 'dayjs';
import {useMemo} from 'react';

const TIME_FORMAT = 'hh:mm A';
const TIME_PARSE_FORMAT = 'hh:mm:ss';
type TimeTableCardProps = TimeTableDetails & {
  vertical?: boolean;
};

const TimeTableCard = ({vertical, ...data}: TimeTableCardProps) => {
  const {theme} = useTheme();
  const startTime = dayjs(data.start_time, TIME_PARSE_FORMAT);
  const endTime = dayjs(data.end_time, TIME_PARSE_FORMAT);
  const lectureProgress = useMemo(() => {
    const total = endTime.diff(startTime, 'm');
    const elapsed = dayjs().diff(startTime, 'm');
    const progress = elapsed / total;
    return {
      started: elapsed > 0,
      completed: progress > 1,
      inProgress: elapsed > 0 && !(progress > 1 || progress < 0),
      progress,
    };
  }, [data]);

  const showBottomSheet = () => {
    showToast({
      type: 'custom',
      content: () => (
        <StyledView>
          <StyledView tw={'flex-row justify-between'}>
            <StyledView style={{flex: 3}}>
              <StyledText h3 lightText>
                Subject Name
              </StyledText>
              <StyledText h2>{data.subject_id__sub_name}</StyledText>
            </StyledView>
            <StyledView tw={'flex-1 items-center'}>
              <StyledText h3 lightText>
                Lecture
              </StyledText>
              <StyledText h2>{data.lec_num}</StyledText>
            </StyledView>
          </StyledView>

          <StyledView tw={'flex-row justify-between'}>
            <StyledView>
              <StyledText h3 lightText>
                Subject Code
              </StyledText>
              <StyledText h2>
                {data.subject_id__sub_alpha_code}-
                {data.subject_id__sub_num_code}
              </StyledText>
            </StyledView>
            <StyledView tw={'items-end'}>
              <StyledText h3 lightText>
                Department
              </StyledText>
              <StyledText h2>
                {data.section__sem_id__dept__dept__value}(
                {data.section__sem_id__dept__course_id__value})
              </StyledText>
            </StyledView>
          </StyledView>
          <StyledView tw={'flex-row justify-between'}>
            <StyledView>
              <StyledText h3 lightText>
                Section
              </StyledText>
              <StyledText h2>
                {data.section__sem_id__sem}-{data.section__section}
              </StyledText>
            </StyledView>
            <StyledView tw={'items-center'}>
              <StyledText h3 lightText>
                Start
              </StyledText>
              <StyledText h2>{startTime.format(TIME_FORMAT)}</StyledText>
            </StyledView>
            <StyledView tw={'items-end'}>
              <StyledText h3 lightText>
                End
              </StyledText>
              <StyledText h2>{endTime.format(TIME_FORMAT)}</StyledText>
            </StyledView>
          </StyledView>
          <StyledText h3 lightText>
            Lecture Progress
          </StyledText>
          {lectureProgress.inProgress ? (
            <>
              <LinearProgress
                value={lectureProgress.progress}
                color={theme.colors.primary}
                variant="determinate"
              />
              <StyledView tw={'flex-row justify-between'}>
                <StyledText h4 lightText h4Style={{fontSize: 10}}>
                  {(lectureProgress.progress * 100).toFixed(0)}%
                </StyledText>
                <StyledText h4 lightText h4Style={{fontSize: 10}}>
                  100%
                </StyledText>
              </StyledView>
            </>
          ) : (
            <StyledText
              h4
              lightText
              h4Style={{
                color: lectureProgress.completed
                  ? theme.colors.primary
                  : theme.colors.warning,
              }}>
              {lectureProgress.completed ? 'Completed' : 'Not Started'}
            </StyledText>
          )}
        </StyledView>
      ),
    });
  };
  return (
    <StyledView
      touchable={!vertical}
      onPress={showBottomSheet}
      tw={`mr-4 px-4 py-5 ${vertical && 'w-full mr-0 mb-4'}`}
      style={{
        backgroundColor: theme.colors.bottomSheetBg,
        borderRadius: 20,
        minWidth: 308,
      }}>
      <StyledText h2>
        {limitText(data.subject_id__sub_name, vertical ? 35 : 15)} (
        {data.subject_id__sub_alpha_code}-{data.subject_id__sub_num_code})
      </StyledText>
      <StyledView tw={'flex-row'} style={{gap: 10}}>
        <StyledView>
          <StyledText h3 lightText>
            {data.section__sem_id__dept__dept__value}(
            {data.section__sem_id__dept__course_id__value})
          </StyledText>
          <StyledText h3 lightText>
            {startTime.format(TIME_FORMAT)} - {endTime.format(TIME_FORMAT)}
          </StyledText>
          <StyledText h3 lightText>
            {data.section__sem_id__sem}-{data.section__section}
          </StyledText>
          {!vertical && (
            <StyledView style={{width: 150}}>
              {lectureProgress.inProgress ? (
                <>
                  <LinearProgress
                    value={lectureProgress.progress}
                    color={theme.colors.primary}
                    variant="determinate"
                  />
                  <StyledView tw={'flex-row justify-between'}>
                    <StyledText h4 lightText h4Style={{fontSize: 10}}>
                      {(lectureProgress.progress * 100).toFixed(0)}%
                    </StyledText>
                    <StyledText h4 lightText h4Style={{fontSize: 10}}>
                      100%
                    </StyledText>
                  </StyledView>
                </>
              ) : (
                <StyledText
                  h4
                  lightText
                  h4Style={{
                    color: lectureProgress.completed
                      ? theme.colors.primary
                      : theme.colors.warning,
                  }}>
                  {lectureProgress.completed ? 'Completed' : 'Not Started'}
                </StyledText>
              )}
            </StyledView>
          )}
        </StyledView>
        <StyledView
          tw={`justify-center ${
            vertical ? 'items-end' : 'items-center'
          } flex-1`}>
          <StyledView
            tw={'justify-center items-center'}
            style={{
              borderColor: theme.colors.dividerColor,
              borderWidth: 1,
              height: 50,
              width: 50,
              borderRadius: 50,
            }}>
            <StyledText h1 tw="mb-[-5]">
              {data.lec_num}
            </StyledText>
          </StyledView>
        </StyledView>
      </StyledView>
    </StyledView>
  );
};

export default TimeTableCard;
