import {
  StyledInput,
  StyledPageView,
  StyledSkeleton,
  StyledText,
  StyledView,
} from '@common/components';
import VectorIcon from '@common/components/VectorIcon';
import URLS from '@kaksha/constants/urls';
import {LeftPanelParamList, RootStackParamList} from '@kaksha/navigator';
import {getAvatarURL, getBaseMediaURL} from '@kaksha/services/api/base';
import {FacultyData} from '@kaksha/types/digital_directory';
import useRequest from '@kaksha/utils/useRequest';
import Clipboard from '@react-native-clipboard/clipboard';
import {DrawerScreenProps} from '@react-navigation/drawer';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Image, useTheme} from '@rneui/themed';
import {FlashList, ListRenderItem} from '@shopify/flash-list';
import {useCallback, useEffect, useState} from 'react';
import {Linking, RefreshControl, ToastAndroid} from 'react-native';

type DigitalDirectoryProps = CompositeScreenProps<
  DrawerScreenProps<LeftPanelParamList, 'digital_directory'>,
  NativeStackScreenProps<RootStackParamList>
>;

const IMAGE_SIZE = 50;
const PILL_SIZE = 50;

const DigitalDirectoryCard = (item: FacultyData) => {
  const {theme} = useTheme();
  return (
    <StyledView
      tw={'pl-4 mb-2 flex-row items-center overflow-hidden'}
      style={{
        backgroundColor: theme.colors.bottomSheetBg,
        borderRadius: 20,
        gap: 10,
      }}>
      <Image
        source={{
          uri: item.image
            ? getBaseMediaURL('employee_image') + item.image
            : getAvatarURL(item.name ?? undefined),
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
      <StyledView tw={'flex-1 py-3'}>
        <StyledText h3>{item.name}</StyledText>
        <StyledText h4 lightText>
          {item.dept__value}({item.desg__value})
        </StyledText>
        <StyledText h4 lightText>
          {item.emp_id}
        </StyledText>
      </StyledView>
      <StyledView style={{width: PILL_SIZE}}>
        <StyledView
          touchable
          onLongPress={() => {
            if (item.mob) {
              Clipboard.setString(item.mob);
              ToastAndroid.show('Phone Number Copied', ToastAndroid.SHORT);
            }
          }}
          onPress={() => {
            Linking.openURL(`tel:${item.mob}`);
          }}
          tw="flex-1 items-center justify-center"
          style={{backgroundColor: theme.colors.warning}}>
          <StyledText tw="text-white mb-[-5]" h2>
            <VectorIcon name="phone" type="Feather" className="text-white" />
          </StyledText>
        </StyledView>
        <StyledView
          touchable
          onLongPress={() => {
            if (item.email) {
              Clipboard.setString(item.email);
              ToastAndroid.show('Email Copied', ToastAndroid.SHORT);
            }
          }}
          onPress={() => {
            Linking.openURL(`mailto:${item.email}`);
          }}
          tw="flex-1 items-center justify-center"
          style={{backgroundColor: theme.colors.primary}}>
          <StyledText tw="text-white" h2>
            <VectorIcon name="mail" type="Feather" className="text-white" />
          </StyledText>
        </StyledView>
      </StyledView>
    </StyledView>
  );
};

const DigitalDirectory = (_: DigitalDirectoryProps) => {
  const [searchText, setSearchText] = useState('');
  const {theme} = useTheme();

  const {
    getResponse: getData,
    data: facultyData,
    loading: loading,
  } = useRequest<FacultyData[]>({
    requestParams: {
      method: 'GET',
      url: URLS.auth.digital_directory,
    },
    initialState: [],
  });

  const searchArray = (value: (string | undefined)[], search: string[]) =>
    search.map(
      searchText =>
        typeof value?.find(each =>
          each?.includes(searchText.trim().toLocaleLowerCase()),
        ) === 'string',
    );

  const getFilteredData = () => {
    return facultyData.filter(each => {
      const name = each.name?.toLocaleLowerCase();
      const emp_id = each.emp_id?.toLocaleLowerCase();
      const mobile = each.mob?.toLocaleLowerCase();
      const email = each.email?.toLocaleLowerCase();
      const department = each.dept__value?.toLocaleLowerCase();
      const designation = each.desg__value?.toLocaleLowerCase();
      const search = searchText.split(',');

      return (
        typeof searchArray(
          [name, emp_id, mobile, email, department, designation],
          search,
        ).find(each => !each) === 'undefined'
      );
    });
  };

  const renderItem = useCallback<ListRenderItem<FacultyData>>(({item}) => {
    return <DigitalDirectoryCard {...item} />;
  }, []);

  useEffect(() => {
    getData();
  }, []);

  return (
    <StyledPageView noInsets>
      <StyledView tw={'flex-row mt-2'}>
        <StyledInput
          placeholder="Search Faculty..."
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
          refreshControl={
            <RefreshControl onRefresh={getData} refreshing={false} />
          }
          showsVerticalScrollIndicator={false}
          data={searchText !== '' ? getFilteredData() : facultyData}
          keyExtractor={item => `${item.emp_id}`}
          renderItem={renderItem}
          estimatedItemSize={100}
          ListEmptyComponent={() =>
            loading ? (
              [...Array(4)].map((_, i) => (
                <StyledSkeleton
                  key={i}
                  tw="mb-2"
                  height={100}
                  style={{borderRadius: 20}}
                />
              ))
            ) : (
              <StyledView
                tw={'items-center justify-center'}
                style={{height: 120}}>
                <StyledText h2 lightText>
                  No Faculty..
                </StyledText>
              </StyledView>
            )
          }
        />
      </StyledView>
    </StyledPageView>
  );
};

export default DigitalDirectory;
