export type DropdownValue = {
  sno: number;
  value: string;
};

export type CourseDropdownValue = {
  section__sem_id__dept__course_id: number;
  section__sem_id__dept__course_id__value: string;
  session__sem_start: string;
};

export type DepartmentDropdownValue = {
  section__sem_id__dept: number;
  section__sem_id__dept__dept__value: string;
};

export type SemesterDropdownValue = {
  section__sem_id: number;
  section__sem_id__sem: number;
  session__sem_start: string;
  session__sem_end: string;
};

export type SectionDropdownValue = {section: number; section__section: string};

export type SubjectDowndownValue = {
  subject_id: number;
  subject_id__sub_name: string;
  subject_id__sub_alpha_code: string;
  subject_id__sub_num_code: string;
  section__sem_id__sem: number;
  section__sem_id__dept__dept__value: string;
  subject_id__subject_type__value: string;
  subject_id__subject_type: number;
};

export type GroupNameDowndownValue = {
  group_id: number;
  group_id__group_name: string;
};

export type AttendanceTypeValue = {
  id: number;
  value: string;
  data: DropdownValue[];
};
