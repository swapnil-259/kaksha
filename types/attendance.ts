import {Nullable} from '@common/types';

export type AttendanceDetails = {
  att_date: string;
  emp_status: 'P' | 'A' | 'P/A' | 'P/I' | 'P/II';
  emp_intime: string;
  emp_outtime: string;
  leave: string;
  earlyexit: string;
  latein: string;
  extra: string;
  colstatus: string;
  work_hours: string;
  remark: string;
  category: string;
  subtype: string;
};

export type AttendanceSummary = {
  label: string;
  data: number;
  color: string;
};

export type StudentDetails = Nullable<{
  uniq_id: number;
  uniq_id__name: string;
  uniq_id__email_id: string;
  section__sem_id__sem: number;
  section__sem_id: number;
  section__section: string;
  year: number;
  section__sem_id__dept__dept__value: string;
  class_roll_no: number;
  uniq_id__uni_roll_no: string;
  mob: number;
  registration_status: number;
  reg_form_status: string;
  reg_date_time: string;
  fee_status: string;
  att_start_date: string;
  uniq_id__dept_detail__dept__value: string;
  uniq_id__lib_id: string;
  uniq_id__gender: number;
  uniq_id__gender__value: string;
  session__sem_start: string;
  sem__sem: number;
  section: number;
  mentor_name: string;
  mentor_emp_id: string;
  fname: string;
  mname: string;
  nationality: string;
  aadhar_num: number;
  religion: string;
  caste_name: string;
  dob: string;
  physically_disabled: string;
  father_mob: number;
  mother_mob: number;
  g_email: string;
  father_city: string;
  father_email: string;
  mother_email: string;
  image: string;
}>;

export type AttendanceData = Nullable<{
  date: string;
  lecture: number;
  section: number;
  section__section: string;
  section__sem_id: number;
  section__sem_id__sem: number;
  subject_id__sub_name: string;
  subject_id__sub_alpha_code: string;
  subject_id__sub_num_code: string;
  emp_id: number;
  emp_id__name: string;
  isgroup: string;
  group_id: number;
  group_id__group_name: string;
  group_id__group_type: string;
  id: number;
  normal_remedial: string;
  student_status: (StudentDetails & {checked: boolean})[][];
  present_count: number;
  absent_count: number;
  total: number;
}>;

export type PreviousAttendanceStatus = {
  [key in string]: {
    status_list: ('P' | 'A')[];
  };
};

export type AttendanceRegisterStudentData = StudentDetails & {
  att_data: {
    date: string;
    lecture: number;
    att_status: 'N/A' | 'P' | 'A';
    attendance_type: '';
    count: number | 'N/A';
  }[];
  net_data: {
    present_count: number;
    absent_count: number;
    total: number;
    percentage: number;
  };
};

export type LessonPlanTopicDetails = {
  propose_topic__topic_name: string;
  propose_topic__id: number;
  propose_topic__unit: string;
};

export type LessonPlanDetails = {
  unit: string;
  topic: LessonPlanTopicDetails[];
};
