import {StyledButton, StyledText, StyledView} from '@common/components';
import VectorIcon from '@common/components/VectorIcon';
import {BottomSheetModalMethods} from '@gorhom/bottom-sheet/lib/typescript/types';
import URLS from '@kaksha/constants/urls';
import request from '@kaksha/services/api/request';
import {setSession} from '@kaksha/store/auth';
import {useBackHandler} from '@react-native-community/hooks';
import {useTheme} from '@rneui/themed';
import {useEffect, useState} from 'react';

type SessionChangeSheetProps = {
  bottomSheetRef: React.RefObject<BottomSheetModalMethods> | null;
  session: number;
};

const SessionChangeSheet = ({
  session,
  bottomSheetRef,
}: SessionChangeSheetProps) => {
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const {theme} = useTheme();

  useBackHandler(() => loading);

  useEffect(() => {
    (async () => {
      const {status, HttpStatusCode, data} = await request({
        method: 'POST',
        url: URLS.auth.change_session,
        data: {
          session_id: session,
        },
      });
      if (status === HttpStatusCode.OK && data) {
        setTitle('Success');
        setDesc('Session Changed Successfully!');
        setSession(session);
      } else {
        bottomSheetRef?.current?.dismiss();
      }
      setLoading(false);
    })();
  }, []);

  return (
    <StyledView tw={'items-center justify-evenly h-full'}>
      <StyledView
        tw="items-center justify-center"
        style={{
          width: 80,
          height: 80,
          borderRadius: 80,
          backgroundColor: theme.colors.primary,
        }}>
        {loading ? (
          <StyledButton
            loading
            twButton={'bg-transparent p-0'}
            loadingProps={{size: 60}}
          />
        ) : (
          <VectorIcon
            type="Feather"
            name="check"
            color={theme.colors.bottomSheetBg}
            size={60}
          />
        )}
      </StyledView>
      <StyledView tw={'items-center'}>
        <StyledText h1>{loading ? 'Changing Session' : title}</StyledText>
        <StyledText h3 lightText>
          {loading ? 'Please Wait..' : desc}
        </StyledText>
      </StyledView>

      <StyledButton
        title={'Close'}
        uppercase
        style={{marginTop: 0}}
        twContainer={'w-full m-0'}
        buttonStyle={{
          backgroundColor: theme.colors.primary,
        }}
        disabled={loading}
        onPress={() => bottomSheetRef?.current?.dismiss()}
      />
      {/* )} */}
    </StyledView>
  );
};

export default SessionChangeSheet;
