import {StyledText, StyledView} from '@common/components';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import MarkAttendanceCard from '@kaksha/screens/auth/StudentAttendance/MarkAttendanceCard';
import {showToast} from '@kaksha/services/toast';
import {AttendanceData} from '@kaksha/types/attendance';
import {useTheme} from '@rneui/themed';
import {useCallback} from 'react';
import {ListRenderItem} from 'react-native';

type SelectAttedanceCardProps = AttendanceData & {
  onPress: (item: AttendanceData) => void;
};

const LECTURE_NUM_SIZE = 40;
const COUNT_PILL_SIZE = 50;

const SelectAttedanceCard = ({...item}: SelectAttedanceCardProps) => {
  const {theme} = useTheme();

  const renderStudentCard = useCallback<
    ListRenderItem<NonNullable<AttendanceData['student_status']>[0][0]>
  >(({item}) => {
    return (
      <MarkAttendanceCard
        selected={item.checked}
        onChange={() => {}}
        renderCheckBox={selected => {
          return (
            <StyledText
              h2
              h2Style={{
                color: selected ? theme.colors.primary : theme.colors.error,
              }}>
              {selected ? 'P' : 'A'}
            </StyledText>
          );
        }}
        {...item}
      />
    );
  }, []);

  const showStudentList = (type: 'P' | 'A') => {
    const students = item.student_status
      ?.flat()
      .filter(each => each.checked === (type === 'P'));
    showToast(
      {
        type: 'custom',
        content: ref => {
          return (
            <>
              <StyledText tw="text-center" h1>
                {type === 'P' ? 'Present Students' : 'Absent Students'}
              </StyledText>
              <BottomSheetFlatList
                data={students}
                showsVerticalScrollIndicator={false}
                renderItem={renderStudentCard}
              />
            </>
          );
        },
        index: 1,
      },
      ['65%'],
      {
        enableContentPanningGesture: false,
      },
    );
  };

  return (
    <StyledView
      touchable
      onPress={() => item.onPress(item)}
      tw={'my-2 pl-2 flex-row items-center overflow-hidden'}
      style={{
        backgroundColor: theme.colors.bottomSheetBg,
        borderRadius: 20,
        gap: 10,
      }}>
      <StyledView
        tw="items-center justify-center"
        style={{
          backgroundColor: theme.colors.primary,
          borderRadius: LECTURE_NUM_SIZE,
          width: LECTURE_NUM_SIZE,
          height: LECTURE_NUM_SIZE,
        }}>
        <StyledText h1 h1Style={{color: '#fff'}} tw="mb-[-5]">
          {item.lecture}
        </StyledText>
      </StyledView>
      <StyledView tw={'flex-1 py-2'}>
        <StyledText h2>
          {item.subject_id__sub_name} ({item.subject_id__sub_alpha_code}-
          {item.subject_id__sub_num_code})
        </StyledText>
        <StyledText h3 lightText>
          {item.normal_remedial}
        </StyledText>
        <StyledText h3 lightText>
          {item.section__sem_id__sem}-{item.section__section}
        </StyledText>
        {item.isgroup === 'Y' && <></>}
      </StyledView>
      <StyledView style={{width: COUNT_PILL_SIZE}}>
        <StyledView
          touchable
          onPress={() => showStudentList('P')}
          tw="flex-1 items-center justify-center"
          style={{backgroundColor: theme.colors.primary}}>
          <StyledText tw="text-white mb-[-5]" h2>
            {item.present_count}
          </StyledText>
        </StyledView>
        <StyledView
          touchable
          onPress={() => showStudentList('A')}
          tw="flex-1 items-center justify-center"
          style={{backgroundColor: theme.colors.error}}>
          <StyledText tw="text-white mb-[-5]" h2>
            {item.absent_count}
          </StyledText>
        </StyledView>
      </StyledView>
    </StyledView>
  );
};

export default SelectAttedanceCard;
