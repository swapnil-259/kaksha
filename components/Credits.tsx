import {
  StyledText,
  StyledView,
  StyledViewProps,
} from '@common/components/index';
import {useTheme} from '@rneui/themed';

const Credits = (props: StyledViewProps) => {
  const {theme} = useTheme();
  return (
    <StyledView {...props} tw={'w-full items-center justify-center'}>
      <StyledText h4>
        Made with ❤️ By{' '}
        <StyledText h3 h3Style={{color: theme.colors.primary}}>
          Team ERP
        </StyledText>
      </StyledText>
    </StyledView>
  );
};
export default Credits;
