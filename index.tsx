import SelectSheet from '@common/utils/Select/SelectSheet';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import themeConfig from '@kaksha/constants/theme';
import {RootStack, RootStackParamList} from '@kaksha/navigator';
import renderAuthRoutes from '@kaksha/routes/auth';
import renderCommonRoutes from '@kaksha/routes/common';
import renderNoAuthRoutes from '@kaksha/routes/no-auth';
import Splash from '@kaksha/screens/common/Splash';
import Toaster from '@kaksha/services/toast/Toaster';
import {authStore} from '@kaksha/store/auth';
import {themeStore} from '@kaksha/store/theme';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import {ThemeConsumer, ThemeProvider, createTheme} from '@rneui/themed';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import {useEffect, useState} from 'react';
import {Platform} from 'react-native';
import 'react-native-gesture-handler';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useSnapshot} from 'valtio';

const KIETKaksha = () => {
  const auth = useSnapshot(authStore);
  const theme = useSnapshot(themeStore);
  const [splashLoading, setSplashLoading] = useState(true);
  const navigationRef = createNavigationContainerRef<RootStackParamList>();

  useEffect(() => {
    dayjs.extend(utc);
    dayjs.extend(customParseFormat);
  }, []);

  useEffect(() => {
    if (!splashLoading) {
      if (auth.authenticated) {
        navigationRef.navigate('left_panel', {
          screen: 'dashboard',
        });
      } else {
        navigationRef.navigate('welcome');
      }
    }
  }, [auth.authenticated, splashLoading]);

  return (
    <ThemeProvider
      theme={createTheme({
        ...themeConfig,
        mode: theme.activeTheme,
      })}>
      <ThemeConsumer>
        {({theme}) => (
          <GestureHandlerRootView
            style={{
              flex: 1,
              backgroundColor: theme.colors.background,
            }}>
            <BottomSheetModalProvider>
              {splashLoading ? (
                <Splash setSplashLoading={setSplashLoading} />
              ) : (
                <NavigationContainer ref={navigationRef}>
                  <RootStack.Navigator
                    screenOptions={{
                      headerShown: false,
                      ...(Platform.OS === 'android'
                        ? {
                            statusBarStyle:
                              theme.mode === 'light' ? 'dark' : 'light',
                            statusBarColor: 'transparent',
                            statusBarTranslucent: true,
                          }
                        : {}),
                    }}>
                    {renderCommonRoutes()}
                    {auth.authenticated
                      ? renderAuthRoutes()
                      : renderNoAuthRoutes()}
                  </RootStack.Navigator>
                </NavigationContainer>
              )}
              <SelectSheet />
              <Toaster />
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        )}
      </ThemeConsumer>
    </ThemeProvider>
  );
};

export default KIETKaksha;
