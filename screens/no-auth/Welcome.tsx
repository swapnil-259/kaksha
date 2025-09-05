import {
  StyledButton,
  StyledPageView,
  StyledText,
  StyledView,
} from '@common/components/index';
import Credits from '@kaksha/components/Credits';
import WELCOME_FEATURES from '@kaksha/constants/welcome';
import {RootStackParamList} from '@kaksha/navigator';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTheme} from '@rneui/themed';
import {useEffect, useState} from 'react';
import {Dimensions} from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import FeatherIcon from 'react-native-vector-icons/Feather';

type WelcomeProps = NativeStackScreenProps<RootStackParamList, 'welcome'>;

const AnimatedFeatherIcon = Animated.createAnimatedComponent(FeatherIcon);
const Welcome = ({navigation}: WelcomeProps) => {
  const {theme} = useTheme();
  const [index, setIndex] = useState(0);
  const animation = useSharedValue(0);
  const bounce = useSharedValue(20);
  const colorInputRange = [0, 0.001, 0.5, 0.501, 1];
  const rotateInputRange = [0, 0.5, 1];
  const {height, width} = Dimensions.get('window');

  const handlePress = () => {
    setIndex(prev => {
      animation.value = withTiming(prev === 0 ? 1 : 0, {
        duration: 600,
      });
      return prev === 0 ? 1 : 0;
    });
  };

  const circleAnimatedStyle = useAnimatedStyle(
    () => ({
      backgroundColor: interpolateColor(animation.value, colorInputRange, [
        theme.colors.primary,
        theme.colors.primary,
        theme.colors.primary,
        theme.colors.background,
        theme.colors.background,
      ]),
      // display: animation.value === 1 ? 'none' : 'flex',
      transform: [
        {perspective: 300},
        {
          rotateY: `${interpolate(
            animation.value,
            rotateInputRange,
            [0, -90, -180],
          )}deg`,
        },
        {
          scale: interpolate(animation.value, rotateInputRange, [1, 10, 0]),
        },
        {
          translateY: bounce.value,
        },
      ],
    }),
    [],
  );

  const containerAnimatedStyle = useAnimatedStyle(
    () => ({
      backgroundColor: interpolateColor(animation.value, colorInputRange, [
        theme.colors.background,
        theme.colors.background,
        theme.colors.background,
        theme.colors.primary,
        theme.colors.primary,
      ]),
    }),
    [],
  );
  const iconAnimatedStyle = useAnimatedStyle(
    () => ({
      opacity: interpolate(animation.value, colorInputRange, [1, 0, 0, 0, 1]),
    }),
    [],
  );
  const titleAnimatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          scale: interpolate(animation.value, rotateInputRange, [1.5, 1.3, 1]),
        },
        {
          translateY: interpolate(
            animation.value,
            rotateInputRange,
            [100, 50, 0],
          ),
        },
      ],
    }),
    [],
  );
  const bottomSheetAnimatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateY: interpolate(animation.value, [0.501, 1], [height / 3, 0]),
        },
      ],
      borderTopLeftRadius: interpolate(
        animation.value,
        rotateInputRange,
        [0, 20, 40],
      ),
      borderTopRightRadius: interpolate(
        animation.value,
        rotateInputRange,
        [0, 20, 40],
      ),
      backgroundColor: interpolateColor(animation.value, rotateInputRange, [
        theme.colors.background,
        theme.colors.background,
        theme.colors.white,
      ]),
    }),
    [],
  );

  useEffect(() => {
    bounce.value = withRepeat(
      withTiming(-bounce.value, {duration: 1500}),
      -1,
      true,
    );
  }, []);
  return (
    <StyledPageView
      noPadding
      noInsets
      viewProps={{style: containerAnimatedStyle}}>
      <StyledView tw={'flex-[2] justify-center items-center'}>
        <StyledView style={titleAnimatedStyle}>
          <StyledText
            h1
            h1Style={{
              fontSize: 56,
              fontFamily: 'Poppins-Bold',
            }}>
            kaksha.
          </StyledText>
        </StyledView>
        <StyledView tw={'absolute bottom-[10]'}>
          <StyledView
            tw={'justify-center items-center'}
            touchable
            onPress={handlePress}
            style={[
              circleAnimatedStyle,
              {borderRadius: 60, width: 60, height: 60, zIndex: -1},
            ]}>
            <AnimatedFeatherIcon
              name="chevrons-right"
              color={theme.colors.white}
              size={24}
              style={iconAnimatedStyle}
            />
          </StyledView>
        </StyledView>
      </StyledView>
      <StyledView
        tw={'items-center justify-end flex-1'}
        style={[bottomSheetAnimatedStyle]}>
        <StyledView tw={'flex-1'}>
          <Carousel
            loop
            width={width}
            style={{overflow: 'hidden'}}
            autoPlay={true}
            data={WELCOME_FEATURES}
            scrollAnimationDuration={1500}
            renderItem={({item}) => (
              <StyledView tw="flex-1 items-center justify-center">
                <StyledText h1>{item.title}</StyledText>
                <StyledText h2 lightText>
                  {item.description}
                </StyledText>
              </StyledView>
            )}
          />
        </StyledView>
        <StyledButton
          title={'Get Started'}
          twContainer={'w-[95%] my-6'}
          onPress={() => navigation.navigate('login')}
        />
        <Credits />
      </StyledView>
    </StyledPageView>
  );
};

export default Welcome;
