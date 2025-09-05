import {StyledSkeleton, StyledText, StyledView} from '@common/components';
import Checkbox from '@common/components/Checkbox';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {getAvatarURL, getBaseMediaURL} from '@kaksha/services/api/base';
import {showToast} from '@kaksha/services/toast';
import {StudentDetails} from '@kaksha/types/attendance';
import {Image, useTheme} from '@rneui/themed';
import {ReactNode} from 'react';

type MarkAttendanceCardProps = StudentDetails & {
  selected: boolean;
  onChange: () => void;
  previous_status?: string[];
  renderCheckBox?: (selected: boolean) => ReactNode;
};

const IMAGE_SIZE = 60;

const MarkAttendanceCard = ({
  selected,
  onChange,
  previous_status,
  renderCheckBox,
  ...item
}: MarkAttendanceCardProps) => {
  const {theme} = useTheme();

  const showData = () => {
    showToast(
      {
        type: 'custom',
        content: () => (
          <BottomSheetScrollView contentContainerStyle={{gap: 5}}>
            <StyledView tw={'flex-row justify-between'}>
              <StyledView>
                <StyledText h3 lightText>
                  Previous Attendance
                </StyledText>

                <PreviousAttendanceDots
                  previous_status={previous_status ?? []}
                />
              </StyledView>
              <Image
                onPress={showData}
                source={{
                  uri: item.image
                    ? getBaseMediaURL('student_image') + item.image
                    : getAvatarURL(item.uniq_id__name ?? undefined),
                }}
                style={{
                  width: IMAGE_SIZE,
                  height: IMAGE_SIZE,
                  borderRadius: IMAGE_SIZE,
                  borderWidth: 2,
                  borderColor: selected
                    ? theme.colors.primary
                    : theme.colors.error,
                }}
                PlaceholderContent={
                  <StyledSkeleton
                    width={IMAGE_SIZE}
                    height={IMAGE_SIZE}
                    circle
                  />
                }
              />
            </StyledView>

            <StyledView tw={'flex-row justify-between'}>
              <StyledView style={{flex: 3}}>
                <StyledText h3 lightText>
                  Name
                </StyledText>
                <StyledText h2>{item.uniq_id__name}</StyledText>
              </StyledView>
              <StyledView tw={'items-end'}>
                <StyledText h3 lightText>
                  Class Roll No.
                </StyledText>
                <StyledText h2>{item.class_roll_no ?? '-'}</StyledText>
              </StyledView>
            </StyledView>
            <StyledView tw={'flex-row justify-between'}>
              <StyledView style={{flex: 3}}>
                <StyledText h3 lightText>
                  Branch
                </StyledText>
                <StyledText h2>
                  {item.uniq_id__dept_detail__dept__value ?? '-'}
                </StyledText>
              </StyledView>
              <StyledView tw={'items-end'}>
                <StyledText h3 lightText>
                  Section
                </StyledText>
                <StyledText h2>{item.section__section ?? '-'}</StyledText>
              </StyledView>
            </StyledView>
            <StyledView tw={'flex-row justify-between'}>
              <StyledView style={{flex: 3}}>
                <StyledText h3 lightText>
                  University Roll No.
                </StyledText>
                <StyledText h2>{item.uniq_id__uni_roll_no ?? '-'}</StyledText>
              </StyledView>
              <StyledView tw={'items-end'}>
                <StyledText h3 lightText>
                  Year
                </StyledText>
                <StyledText h2>{item.year ?? '-'}</StyledText>
              </StyledView>
            </StyledView>
            {item.registration_status === 0 && (
              <StyledView tw={'flex-row justify-between'}>
                <StyledView style={{flex: 3}}>
                  <StyledText h3 lightText>
                    Mentor
                  </StyledText>
                  <StyledText h2>
                    {item.mentor_name ?? '-'} ({item.mentor_emp_id})
                  </StyledText>
                </StyledView>
                <StyledView tw={'items-end'}>
                  <StyledText h3 lightText>
                    Registration Status
                  </StyledText>
                  <StyledText
                    h2
                    h2Style={{
                      color: theme.colors.error,
                    }}>
                    'N'
                  </StyledText>
                </StyledView>
              </StyledView>
            )}
          </BottomSheetScrollView>
        ),
      },
      true,
      true,
    );
  };

  return (
    <StyledView
      touchable
      onPress={() => onChange()}
      tw={'px-4 py-5 mb-2 flex-row items-center'}
      style={{
        backgroundColor: theme.colors.bottomSheetBg,
        borderRadius: 20,
        gap: 10,
      }}>
      <Image
        onPress={showData}
        source={{
          uri: item.image
            ? getBaseMediaURL('student_image') + item.image
            : getAvatarURL(item.uniq_id__name ?? undefined),
        }}
        style={{
          width: IMAGE_SIZE,
          height: IMAGE_SIZE,
          borderRadius: IMAGE_SIZE,
          borderWidth: 2,
          borderColor: selected ? theme.colors.primary : theme.colors.error,
        }}
        PlaceholderContent={
          <StyledSkeleton width={IMAGE_SIZE} height={IMAGE_SIZE} circle />
        }
      />
      <StyledView tw={'flex-1'}>
        <StyledText h3>{item.uniq_id__name}</StyledText>
        <StyledText h4 lightText>
          {item.uniq_id__uni_roll_no}
        </StyledText>
        {previous_status && (
          <PreviousAttendanceDots previous_status={previous_status} />
        )}
      </StyledView>
      {renderCheckBox ? (
        renderCheckBox(selected)
      ) : (
        <Checkbox status={selected} />
      )}
    </StyledView>
  );
};

type PreviousAttendanceDotsProps = {
  previous_status: string[];
};

const PreviousAttendanceDots = ({
  previous_status,
}: PreviousAttendanceDotsProps) => {
  const {theme} = useTheme();
  return (
    <StyledView style={{gap: 5}} tw={'flex-row mb-2'}>
      {(previous_status.length === 0
        ? [...Array(5).map(_ => 'N')]
        : previous_status
      ).map((status, i) => (
        <StyledView
          key={i}
          tw={'p-2 rounded-full'}
          style={{
            backgroundColor:
              status === 'A'
                ? theme.colors.error
                : status === 'P'
                ? theme.colors.primary
                : theme.colors.dividerColor,
          }}
        />
      ))}
    </StyledView>
  );
};

export {PreviousAttendanceDots};
export default MarkAttendanceCard;
