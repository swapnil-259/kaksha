import {StyledText, StyledView} from '@common/components';
import {showToast} from '@kaksha/services/toast';
import {AttendanceDetails} from '@kaksha/types/attendance';
import {limitText} from '@kaksha/utils';
import {useTheme} from '@rneui/themed';
import dayjs from 'dayjs';

const DATE_PARSE_FORMAT = 'DD-MM-YYYY';
const DATE_FORMAT = 'dddd MMM DD, YYYY';
const TIME_FORMAT = 'hh:mm A';
const TIME_PARSE_FORMAT = 'hh:mm:ss';

const AttendanceCard = (data: AttendanceDetails) => {
  const {theme} = useTheme();
  const date = dayjs(data.att_date, DATE_PARSE_FORMAT).utc(true);

  const workHours = ['P', 'P/I', 'P/II'].includes(data.emp_status)
    ? dayjs(data.work_hours, TIME_PARSE_FORMAT).format('h [hrs] m [mins]')
    : '-';
  const checkInTime = ['P', 'P/A', 'P/I', 'P/II'].includes(data.emp_status)
    ? dayjs(data.emp_intime, TIME_PARSE_FORMAT).format(TIME_FORMAT)
    : 'Not Yet';
  const checkOutTime = ['P', 'P/I', 'P/II'].includes(data.emp_status)
    ? dayjs(data.emp_outtime, TIME_PARSE_FORMAT).format(TIME_FORMAT)
    : 'Not Yet';

  const getAttColor = (status: AttendanceDetails['emp_status']) => {
    switch (status) {
      case 'A':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };
  const showAttendance = () => {
    showToast({
      type: 'custom',
      content: () => (
        <StyledView>
          <StyledText h3 lightText>
            Date
          </StyledText>
          <StyledText h2>{date.format('dddd MMM DD, YYYY')}</StyledText>
          <StyledView tw={'flex-row justify-between'}>
            <StyledView style={{flex: 3}}>
              <StyledText h3 lightText>
                Checked In
              </StyledText>
              <StyledText h2>{checkInTime}</StyledText>
            </StyledView>
            <StyledView tw={'items-center'}>
              <StyledText h3 lightText>
                Checked Out
              </StyledText>
              <StyledText h2>{checkOutTime}</StyledText>
            </StyledView>
          </StyledView>
          <StyledText h3 lightText>
            Status
          </StyledText>
          <StyledText
            h2
            h2Style={{
              color: getAttColor(data.emp_status),
            }}>
            {data?.emp_status}
          </StyledText>
        </StyledView>
      ),
    });
  };
  return (
    <StyledView
      touchable
      onPress={showAttendance}
      tw={'mb-4 px-4 py-5 flex-row justify-between'}
      style={{
        backgroundColor: theme.colors.bottomSheetBg,
        borderRadius: 20,
      }}>
      <StyledView>
        <StyledText h2 h2Style={{color: getAttColor(data.emp_status)}}>
          {limitText(data.emp_status, 15)}
        </StyledText>
        <StyledText h3 lightText>
          {date.format(DATE_FORMAT)}
        </StyledText>
      </StyledView>
      <StyledView tw={'items-end'}>
        <StyledText h2>{workHours}</StyledText>
        <StyledText h3 lightText>
          Work Hours
        </StyledText>
      </StyledView>
    </StyledView>
  );
};

export default AttendanceCard;
