import {
  StyledButton,
  StyledPageView,
  StyledSkeleton,
  StyledText,
  StyledView,
} from '@common/components';
import Divider from '@common/components/Divider';
import Select from '@common/components/Select';
import VectorIcon, {VectorIconProps} from '@common/components/VectorIcon';
import {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import Credits from '@kaksha/components/Credits';
import SessionChangeSheet from '@kaksha/components/SessionChangeSheet';
import {LeftPanelParamList} from '@kaksha/navigator';
import {getAvatarURL, getBaseMediaURL} from '@kaksha/services/api/base';
import {showToast} from '@kaksha/services/toast';
import {authStore} from '@kaksha/store/auth';
import {setTheme, themeStore} from '@kaksha/store/theme';
import {parseSessionName} from '@kaksha/utils';
import {initiateLogout} from '@kaksha/utils/auth';
import {DrawerContentComponentProps} from '@react-navigation/drawer';
import {ButtonGroup, Image, ThemeConsumer} from '@rneui/themed';
import {FlatList} from 'react-native';

const IMAGE_SIZE = 60;

const LEFT_PANEL_ITEMS: {
  label: string;
  icon: VectorIconProps;
  route: keyof LeftPanelParamList;
}[] = [
  {
    label: 'Dashboard',
    icon: {
      name: 'coffee',
      type: 'Feather',
    },
    route: 'dashboard',
  },
  {
    label: 'Student Attendance',
    icon: {
      name: 'users',
      type: 'Feather',
    },
    route: 'student_attendance',
  },
  {
    label: 'Digital Directory',
    icon: {
      name: 'phone',
      type: 'Feather',
    },
    route: 'digital_directory',
  },
];

const LeftPanelContent = ({navigation, state}: DrawerContentComponentProps) => {
  const changeSession = async (session: string) => {
    if (!session) return;
    navigation.closeDrawer();
    showToast(
      {
        type: 'custom',
        content: ref => (
          <SessionChangeSheet
            bottomSheetRef={ref}
            session={Number.parseInt(session)}
          />
        ),
        index: 2,
      },
      ['35%'],
      {
        enablePanDownToClose: false,
        backdropComponent: props => (
          <BottomSheetBackdrop
            {...props}
            pressBehavior={'none'}
            enableTouchThrough={false}
            disappearsOnIndex={-1}
          />
        ),
      },
    );
  };

  return (
    <ThemeConsumer>
      {({theme}) => {
        const showConfirmLogout = () => {
          showToast({
            type: 'warning',
            title: 'Are you sure?',
            description: 'All the data stored on this device will be lost!',
            customButton: ref => (
              <StyledView tw={'w-full'} style={{gap: 10}}>
                <StyledButton
                  title={'Yes'}
                  uppercase
                  twContainer={'w-full'}
                  buttonStyle={{backgroundColor: theme.colors.warning}}
                  onPress={() => {
                    ref?.current?.dismiss();
                    initiateLogout();
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
        return (
          <StyledPageView noPadding>
            <StyledView tw={'flex-row items-center px-3'}>
              <Image
                source={{
                  uri: authStore.userData?.image_path
                    ? getBaseMediaURL('employee_image') +
                      authStore.userData?.image_path
                    : getAvatarURL(authStore.userData?.emp_id__name),
                }}
                style={{
                  width: IMAGE_SIZE,
                  height: IMAGE_SIZE,
                  borderRadius: IMAGE_SIZE,
                }}
                PlaceholderContent={
                  <StyledSkeleton
                    width={IMAGE_SIZE}
                    height={IMAGE_SIZE}
                    circle
                  />
                }
              />
              <StyledView tw={'justify-center pl-4 flex-1'}>
                <StyledText h1>Hello,</StyledText>
                <StyledText h2 lightText tw="mt-[-10]">
                  {authStore.userData?.emp_id__name}
                </StyledText>
              </StyledView>
              <StyledView
                touchable
                disableRipple
                activeOpacity={0.7}
                tw={'p-3 h-full'}
                onPress={() => navigation.closeDrawer()}>
                <VectorIcon name="x" type="Feather" size={30} />
              </StyledView>
            </StyledView>
            <Divider
              height={1}
              heading={`${authStore.userData?.emp_id__desg__value}@${authStore.userData?.emp_id__dept__value}`}
              tw="my-3"
            />
            <Select
              placeholder="Change Session"
              containerStyle={{paddingHorizontal: 10}}
              multiple={false}
              showCloseIcon={false}
              options={
                authStore.session?.session
                  .map(each => ({
                    key: `${each.uid}`,
                    label: parseSessionName(each.session_name),
                    value: `${each.uid}`,
                  }))
                  .slice(authStore.session?.session.length - 2) ?? []
              }
              selected={`${authStore.session?.current_session}`}
              setSelected={changeSession}
            />
            <ButtonGroup
              selectedButtonStyle={{
                backgroundColor: theme.colors.bottomSheetBg,
                borderRadius: 10,
              }}
              innerBorderStyle={{width: 0}}
              containerStyle={{
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.dividerColor,
                borderRadius: 10,
              }}
              buttons={[
                <StyledView tw={'flex-row items-center justify-center'}>
                  <VectorIcon name="sun" type="Feather" />
                  <StyledText tw="m-2">Light</StyledText>
                </StyledView>,
                <StyledView tw={'flex-row items-center justify-center'}>
                  <VectorIcon name="moon" type="Feather" />
                  <StyledText tw="m-2">Dark</StyledText>
                </StyledView>,
              ]}
              selectedIndex={themeStore.activeTheme === 'light' ? 0 : 1}
              onPress={i => setTheme(i === 0 ? 'light' : 'dark')}
            />
            <StyledView tw={'flex-1 px-3 py-3'}>
              <FlatList
                data={LEFT_PANEL_ITEMS}
                ItemSeparatorComponent={() => <StyledView tw={'p-2'} />}
                renderItem={({item}) => {
                  const isFocused =
                    state.routes[state.index].name === item.route;
                  return (
                    <StyledView
                      tw={'flex-row items-center px-4 py-4'}
                      touchable
                      style={{
                        borderRadius: 20,
                        backgroundColor: isFocused
                          ? theme.colors.bottomSheetBg
                          : theme.colors.background,
                        borderColor: theme.colors.dividerColor,
                        borderWidth: isFocused ? 0 : 1,
                      }}
                      onPress={() => navigation.navigate(item.route)}>
                      <VectorIcon {...item.icon} />
                      <StyledText tw="mb-[-5] ml-4" h2>
                        {item.label}
                      </StyledText>
                    </StyledView>
                  );
                }}
              />
            </StyledView>
            <StyledView
              tw={'flex-row items-center px-4 py-4'}
              touchable
              onPress={showConfirmLogout}>
              <VectorIcon name="log-out" type="Feather" />
              <StyledText tw="mb-[-5] ml-4" h2>
                LogOut
              </StyledText>
            </StyledView>
            <StyledView tw={'mb-3'}>
              <Credits />
            </StyledView>
          </StyledPageView>
        );
      }}
    </ThemeConsumer>
  );
};

export default LeftPanelContent;
