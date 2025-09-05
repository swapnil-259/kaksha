import VectorIcon from '@common/components/VectorIcon';
import {
  StyledButton,
  StyledPageView,
  StyledText,
  StyledView,
} from '@common/components/index';
import useCustomForm from '@common/utils/useCustomForm';
import Credits from '@kaksha/components/Credits';
import URLS from '@kaksha/constants/urls';
import {RootStackParamList} from '@kaksha/navigator';
import request from '@kaksha/services/api/request';
import {showToast} from '@kaksha/services/toast';
import {initiateLogin, parseCookie} from '@kaksha/utils/auth';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTheme} from '@rneui/themed';
import {encode} from 'js-base64';
import {useState} from 'react';
import {TouchableOpacity} from 'react-native';

type LoginProps = NativeStackScreenProps<RootStackParamList, 'login'>;

interface initialStateI {
  loading: boolean;
  passwordVisible: boolean;
}

interface LoginI {
  msg: 'active' | 'inactive';
  user_id: string;
  type: 'Employee';
  approval_role: boolean;
}

const initialState: initialStateI = {
  loading: false,
  passwordVisible: false,
};

const Login = ({navigation}: LoginProps) => {
  const [state, setState] = useState(initialState);
  const {theme} = useTheme();
  const {Form, form, defaultValues} = useCustomForm(
    {
      emp_id: '',
      password: '',
    },
    {
      emp_id: {
        rules: {required: true},
        type: 'numeric',
        inputProps: {
          leftIcon: (
            <VectorIcon
              type="Feather"
              name="user"
              size={24}
              color={theme.colors.black}
            />
          ),
        },
        placeholder: 'Employee ID',
      },
      password: {
        rules: {required: true},
        inputProps: {
          secureTextEntry: !state.passwordVisible,
          leftIcon: <VectorIcon type="Feather" name="lock" />,
          rightIcon: (
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() =>
                setState(prev => ({
                  ...prev,
                  passwordVisible: !prev.passwordVisible,
                }))
              }>
              <VectorIcon
                type="Feather"
                name={state.passwordVisible ? 'eye-off' : 'eye'}
              />
            </TouchableOpacity>
          ),
        },
        placeholder: 'Password',
      },
    },
    [state.passwordVisible],
  );

  const login = async (formData: typeof defaultValues) => {
    setState(prev => ({...prev, loading: true}));
    const credentials = encode(
      formData.emp_id?.trim() + ':' + formData.password?.trim(),
    );
    const {data, status, HttpStatusCode, response} = await request<LoginI>({
      url: URLS.no_auth.login,
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
      },
      showError: false,
    });
    if (status === HttpStatusCode.OK && data) {
      const cookie = parseCookie(response.headers);
      if (cookie) {
        const success = await initiateLogin(cookie, true);
        if (success) {
          showToast({
            type: 'success',
            title: 'Login Successfull',
            description: `Welcome ${data.user_id}!`,
          });
          navigation.navigate('left_panel', {
            screen: 'dashboard',
          });
        }
      }
    } else if (status === HttpStatusCode.BAD_REQUEST) {
      showToast({
        type: 'error',
        title: 'Invalid Credentails',
        description: 'Invalid employee id or password!',
      });
    }
    setState(prev => ({...prev, loading: false}));
  };
  return (
    <StyledPageView twView="items-center">
      <StyledText
        h1
        h1Style={{
          fontSize: 48,
          fontFamily: 'Poppins-Bold',
          color: theme.colors.primary,
        }}>
        kaksha.
      </StyledText>
      <StyledView tw={'flex-1 justify-center'} style={{gap: 20}}>
        <StyledView>
          <StyledText h1 h1Style={{fontSize: 36, color: theme.colors.primary}}>
            Welcome
          </StyledText>
          <StyledText h1 h1Style={{fontSize: 36, marginTop: -20}}>
            back!
          </StyledText>
        </StyledView>
        <StyledText h2 lightText>
          Sign in to access your account and get real-time updates.
        </StyledText>
        <Form loading={state.loading} />
        <StyledButton
          title={'Login'}
          onPress={form.handleSubmit(login)}
          loading={state.loading}
          disabled={state.loading}
        />
        {/* <Divider heading="Or" tw="my-4" /> */}
        {/* <StyledButton
          raised
          twButton={'bg-white'}
          title={
            <StyledView tw="items-center justify-center flex-row gap-2">
              <GoogleSVG height={24} width={24} />
              <StyledText h2 tw="text-black">
                Login with Google
              </StyledText>
            </StyledView>
          }
        /> */}
      </StyledView>
      <Credits />
    </StyledPageView>
  );
};

export default Login;
