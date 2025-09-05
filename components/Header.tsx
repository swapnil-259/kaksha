import {StyledSkeleton, StyledText, StyledView} from '@common/components';
import VectorIcon from '@common/components/VectorIcon';
import {LeftPanelRoutes} from '@kaksha/routes/auth/type';
import {getAvatarURL, getBaseMediaURL} from '@kaksha/services/api/base';
import {authStore} from '@kaksha/store/auth';
import {getHeaderTitle} from '@kaksha/utils/header';
import {DrawerHeaderProps} from '@react-navigation/drawer';
import {getDefaultHeaderHeight} from '@react-navigation/elements';
import {Image, ThemeConsumer} from '@rneui/themed';
import {Dimensions} from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';

const IMAGE_SIZE = 35;
const Header = ({navigation, route}: DrawerHeaderProps) => {
  const layout = Dimensions.get('screen');
  const title = getHeaderTitle(route.name as keyof LeftPanelRoutes);

  return (
    <SafeAreaInsetsContext.Consumer>
      {insets => {
        const height = getDefaultHeaderHeight(layout, false, insets?.top ?? 0);
        return (
          <ThemeConsumer>
            {({theme}) => (
              <StyledView
                bg
                tw={'items-center justify-between flex-row'}
                style={{
                  paddingTop: insets?.top,
                  height,
                }}>
                <StyledView
                  touchable
                  disableRipple
                  activeOpacity={0.7}
                  tw={'p-3'}
                  onPress={() => navigation.openDrawer()}>
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
                      borderColor: theme.colors.dividerColor,
                      borderWidth: 1,
                    }}
                    PlaceholderContent={
                      <StyledSkeleton
                        width={IMAGE_SIZE}
                        height={IMAGE_SIZE}
                        circle
                      />
                    }
                  />
                </StyledView>

                <StyledText h2>{title}</StyledText>
                <StyledView
                  touchable
                  onPress={() => navigation.navigate('todo')}
                  tw={'relative justify-center items-center m-3'}
                  style={{
                    width: IMAGE_SIZE,
                    height: IMAGE_SIZE,
                    borderRadius: IMAGE_SIZE,
                    borderColor: theme.colors.dividerColor,
                    borderWidth: 1,
                  }}>
                  <VectorIcon name="paperclip" type="Feather" size={20} />
                </StyledView>
              </StyledView>
            )}
          </ThemeConsumer>
        );
      }}
    </SafeAreaInsetsContext.Consumer>
  );
};

export default Header;
