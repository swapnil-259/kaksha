import KEYS from '@kaksha/constants/keys';
import {ThemeStoreI} from '@kaksha/store/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Appearance} from 'react-native';

const getDeafultTheme = async () => {
  return Appearance.getColorScheme() ?? 'light';
};

const checkStoredTheme = async () => {
  try {
    return (await AsyncStorage.getItem(KEYS.theme)) as
      | ThemeStoreI['activeTheme']
      | null;
  } catch (e) {
    console.log(e);
    return null;
  }
};

const syncThemeToStorage = async (theme: ThemeStoreI['activeTheme']) => {
  try {
    await AsyncStorage.setItem(KEYS.theme, theme);
  } catch (e) {
    console.log(e);
  }
};

export {checkStoredTheme, getDeafultTheme, syncThemeToStorage};
