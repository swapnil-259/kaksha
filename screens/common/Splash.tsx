import {StyledText, StyledView} from '@common/components';
import Credits from '@kaksha/components/Credits';
import {setTheme} from '@kaksha/store/theme';
import {checkStoredCookie, initiateLogin} from '@kaksha/utils/auth';
import {
  checkStoredTheme,
  getDeafultTheme,
  syncThemeToStorage,
} from '@kaksha/utils/theme';
import {useTheme} from '@rneui/themed';
import {useEffect} from 'react';
import {StatusBar, View} from 'react-native';

type SplashProps = {
  setSplashLoading: React.Dispatch<boolean>;
};

const Splash = ({setSplashLoading}: SplashProps) => {
  const {theme} = useTheme();
  useEffect(() => {
    (async () => {
      let theme = await checkStoredTheme();
      console.log('theme', theme);

      if (!theme) {
        theme = await getDeafultTheme();
        await syncThemeToStorage(theme);
      }
      setTheme(theme);
      const cookie = await checkStoredCookie();
      console.log('cookie', cookie);

      if (cookie) {
        await initiateLogin(cookie);
      }
      setSplashLoading(false);
    })();
  }, []);

  return (
    <View style={{flex: 1}}>
      <StatusBar
        translucent
        backgroundColor={'transparent'}
        barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'}
      />
      <StyledView tw={'flex-1 justify-center items-center'}>
        <StyledText h1 h1Style={{fontSize: 48}}>
          kaksha.
        </StyledText>
      </StyledView>
      <Credits style={{position: 'absolute', bottom: 0}} />
    </View>
  );
};

export default Splash;
