import {StyledSkeleton, StyledText, StyledView} from '@common/components';
import VectorIcon, {VectorIconProps} from '@common/components/VectorIcon';
import {useTheme} from '@rneui/themed';

type OverViewCardPropsType = {
  title: string;
  value: string;
  loading?: boolean;
  bg?: string;
  color?: string;
  lightColor?: string;
  icon: VectorIconProps;
  onPress?: () => void;
};

const OverViewCard = ({
  value,
  icon,
  loading,
  title,
  bg,
  onPress,
  color,
  lightColor,
}: OverViewCardPropsType) => {
  const {theme} = useTheme();
  return loading ? (
    <StyledSkeleton tw="flex-1" style={{height: 98, borderRadius: 20}} />
  ) : (
    <StyledView
      touchable={onPress ? true : false}
      tw={'flex-1 px-4 py-5'}
      style={{
        backgroundColor: bg ?? theme.colors.bottomSheetBg,
        borderRadius: 20,
      }}
      onPress={onPress ? onPress : undefined}>
      <StyledView tw={'flex-row'}>
        <StyledText
          h2
          tw="flex-1"
          h2Style={{color: color ?? theme.colors.black}}>
          {value}
        </StyledText>
        <VectorIcon {...icon} color={color ?? theme.colors.black} />
      </StyledView>
      <StyledText
        lightText
        h4
        h4Style={{color: lightColor ?? theme.colors.lightText}}>
        {title}
      </StyledText>
    </StyledView>
  );
};

export default OverViewCard;
