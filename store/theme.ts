import {syncThemeToStorage} from '@kaksha/utils/theme';
import {ColorSchemeName} from 'react-native';
import {proxy} from 'valtio';

interface ThemeStoreI {
  activeTheme: NonNullable<ColorSchemeName>;
}

const themeStore = proxy<ThemeStoreI>({
  activeTheme: 'dark',
});

const setTheme = (newTheme: NonNullable<ColorSchemeName>) => {
  themeStore.activeTheme = newTheme;
  syncThemeToStorage(newTheme);
};

const toggleTheme = () => {
  const newTheme = themeStore.activeTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
};

export {setTheme, themeStore, toggleTheme};
export type {ThemeStoreI};
