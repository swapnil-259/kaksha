import {LeftPanelParamList} from '@kaksha/navigator';
import {
  AttendanceData,
  AttendanceRegisterStudentData,
  PreviousAttendanceStatus,
  StudentDetails,
} from '@kaksha/types/attendance';
import {TimeTableDetails} from '@kaksha/types/timetable';
import {NavigatorScreenParams} from '@react-navigation/native';

type AuthRoutes = {
  left_panel: NavigatorScreenParams<LeftPanelParamList>;
  timetable: {
    [x: number]: {
      day: string;
      timetable: TimeTableDetails[];
    };
  };
  attendance: undefined;
  mark_attendance:
    | {
        title: string;
        attendance_data: {
          category?: string;
          type?: string;
          course?: string;
          department?: string;
          semester?: string;
          group_type?: string;
          section?: string;
          group_name?: string;
          subject?: string;
          date?: string | null;
          lectures?: any[];
          topics?: any[];
        };
        student_list: (NonNullable<StudentDetails> & {checked?: boolean})[];
        previous_status: PreviousAttendanceStatus;
        type: 'mark';
      }
    | {
        type: 'update';
        title: string;
        student_list: NonNullable<AttendanceData['student_status']>[0];
        att_id: number;
      };
  select_attendance: {
    data: AttendanceData[];
    type: 'update' | 'delete';
    form_data: {
      type?: string;
      course?: string;
      department?: string;
      semester?: string;
      group_type?: string;
      section?: string;
      group_name?: string;
      subject?: string;
    };
  };
  attendance_register: {
    data: AttendanceRegisterStudentData[];
  };
  todo: undefined;
};

type LeftPanelRoutes = {
  dashboard: undefined;
  student_attendance: undefined;
  digital_directory: undefined;
};

export default AuthRoutes;
export type {LeftPanelRoutes};
