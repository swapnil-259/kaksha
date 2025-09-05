import {
  StyledInput,
  StyledPageView,
  StyledText,
  StyledView,
} from '@common/components';
import VectorIcon from '@common/components/VectorIcon';
import PageHeader from '@kaksha/components/PageHeader';
import {RootStackParamList} from '@kaksha/navigator';
import AttendanceRegisterCard from '@kaksha/screens/auth/StudentAttendance/AttendanceRegisterCard';
import {AttendanceRegisterStudentData} from '@kaksha/types/attendance';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTheme} from '@rneui/themed';
import {FlashList, ListRenderItem} from '@shopify/flash-list';
import {useCallback, useState} from 'react';

type AttendanceRegisterProps = NativeStackScreenProps<
  RootStackParamList,
  'attendance_register'
>;

const AttendanceRegister = ({navigation, route}: AttendanceRegisterProps) => {
  const [searchText, setSearchText] = useState('');
  const {theme} = useTheme();
  const getFilteredData = () => {
    return route.params.data.filter(each => {
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
  const renderItem = useCallback<ListRenderItem<AttendanceRegisterStudentData>>(
    ({item}) => {
      return <AttendanceRegisterCard {...item} />;
    },
    [],
  );
  return (
    <StyledPageView>
      <PageHeader navigation={navigation} title="Attendance Register" />
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
          data={searchText !== '' ? getFilteredData() : route.params.data}
          keyExtractor={item => `${item.uniq_id}`}
          renderItem={renderItem}
          estimatedItemSize={120}
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
    </StyledPageView>
  );
};

export default AttendanceRegister;
