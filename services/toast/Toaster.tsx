import {StyledButton, StyledText, StyledView} from '@common/components';
import StyledBottomSheet from '@common/components/BottomSheet';
import VectorIcon from '@common/components/VectorIcon';
import {BottomSheetModal, BottomSheetModalProps} from '@gorhom/bottom-sheet';
import {ToasterModalData} from '@kaksha/services/toast';
import toastStore, {NUM_OF_SHEETS, setRef} from '@kaksha/store/toast';
import {useTheme} from '@rneui/themed';
import {createRef, useEffect, useMemo} from 'react';
import {useSnapshot} from 'valtio';

const renderBottomSheet = (props: ToasterModalData | undefined) => {
  if (props) return <ToastMessage {...props.data} />;
  return <></>;
};

interface ToastConfig {
  text: string;
  color: string;
  name: string;
}

const ToastMessage: React.FC<ToasterModalData['data']> = props => {
  const toast = useSnapshot(toastStore);
  const {theme} = useTheme();

  const {text, color, name} = useMemo<ToastConfig>(() => {
    switch (props.type) {
      case 'success':
        return {text: 'Done', color: theme.colors.primary, name: 'check'};
      case 'error':
        return {text: 'Close', color: theme.colors.error, name: 'x'};
      case 'warning':
        return {
          text: 'Close',
          color: theme.colors.warning,
          name: 'alert-circle',
        };
      default:
        return {text: 'Close', color: theme.colors.primary, name: 'check'};
    }
  }, []);

  if (props.type === 'custom')
    return props.content(toast.ref[props.index ?? 0]);
  return (
    <StyledView tw={'items-center justify-evenly h-full'}>
      <StyledView
        tw="items-center justify-center"
        style={{
          width: 80,
          height: 80,
          borderRadius: 80,
          backgroundColor: color,
        }}>
        <VectorIcon
          type="Feather"
          name={name}
          color={theme.colors.bottomSheetBg}
          size={60}
        />
      </StyledView>
      <StyledView tw={'items-center'}>
        <StyledText h1>{props.title}</StyledText>
        <StyledText tw="text-center" h3 lightText>
          {props.description}
        </StyledText>
      </StyledView>
      {props.customButton ? (
        props.customButton(toast.ref[props.index ?? 0])
      ) : (
        <StyledButton
          title={text}
          uppercase
          twContainer={'w-full'}
          buttonStyle={{
            backgroundColor: color,
          }}
          onPress={() => {
            toast.ref[props.index ?? 0]?.current?.dismiss();
          }}
        />
      )}
    </StyledView>
  );
};

const Toaster = () => {
  const toast = useSnapshot(toastStore);
  const refs = useMemo(
    () =>
      Array.from({length: NUM_OF_SHEETS}, _ => createRef<BottomSheetModal>()),
    [],
  );

  useEffect(() => {
    refs.forEach((ref, i) => setRef(ref, i));
  }, []);

  return (
    <>
      {[...Array(NUM_OF_SHEETS)].map((_, i) => {
        return (
          <StyledBottomSheet
            index={0}
            key={i}
            // add bottom inset to elevate the sheet
            bottomInset={15}
            // set `detached` to true
            detached={true}
            bottomSheetRef={refs[i]}
            style={{
              marginHorizontal: 15,
            }}
            {...(toast.props[i] as BottomSheetModalProps)}
            snapPoints={toast.snapPoints[i]}>
            {renderBottomSheet}
          </StyledBottomSheet>
        );
      })}
    </>
  );
};

export default Toaster;
