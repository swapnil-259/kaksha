import {StyledText, StyledView} from '@common/components';
import VectorIcon from '@common/components/VectorIcon';
import {RootStackParamList} from '@kaksha/navigator';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ReactNode} from 'react';

type PageHeaderProps = {
  navigation: NativeStackScreenProps<
    RootStackParamList,
    keyof RootStackParamList
  >['navigation'];
  title?: string;
  rightContent?: ReactNode;
};

const PageHeader = ({title, navigation, rightContent}: PageHeaderProps) => {
  return (
    <StyledView tw={'py-3 flex-row justify-center items-center'}>
      <StyledView
        touchable
        tw={'absolute left-0'}
        onPress={() => navigation.goBack()}>
        <VectorIcon name="arrow-left" type="Feather" size={28} />
      </StyledView>
      <StyledText h2>{title}</StyledText>
      <StyledView tw={'absolute right-0'}>{rightContent}</StyledView>
    </StyledView>
  );
};

export default PageHeader;
