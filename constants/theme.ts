import {CreateThemeOptions} from '@rneui/themed';

const theme: CreateThemeOptions = {
  lightColors: {
    primary: '#008659',
    handleColor: '#D9D9D9',
    lightText: '#00000080',
    bottomSheetBg: '#ECECEC',
    dividerColor: '#E6E6E6',
  },
  darkColors: {
    primary: '#008659',
    handleColor: '#727272',
    lightText: '#FFFFFF80',
    bottomSheetBg: '#35353C',
    dividerColor: '#666673',
    background: '#15181e',
  },
  components: {
    Input: (_, theme) => ({
      placeholderTextColor: theme.colors.greyOutline,
      inputContainerStyle: {
        borderRadius: 8,
        borderBottomWidth: 0,
        backgroundColor: theme.colors.grey5,
        padding: 2,
      },
      inputStyle: {
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
        fontWeight: '400',
      },
      errorStyle: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        fontWeight: '400',
        marginHorizontal: 6,
      },
      errorProps: {tw: 'mt-2'},
    }),
    Button: () => ({
      buttonStyle: {
        borderRadius: 10,
      },
      containerStyle: {borderRadius: 10},
      titleStyle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 18,
      },
      loadingProps: {
        size: 28,
      },
    }),
    Text: (props, theme) => ({
      h1Style: {
        fontSize: 24,
        fontFamily: 'Poppins-SemiBold', // 600
        fontWeight: '600',
        ...(props.lightText && {color: theme.colors.lightText}),
      },
      h2Style: {
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold', // 600
        fontWeight: '600',
        ...(props.lightText && {color: theme.colors.lightText}),
      },
      h3Style: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold', // 600
        fontWeight: '600',
        ...(props.lightText && {color: theme.colors.lightText}),
      },
      h4Style: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold', // 600
        fontWeight: '600',
        ...(props.lightText && {color: theme.colors.lightText}),
      },
    }),
  },
};

export default theme;
