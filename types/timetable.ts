export type TimeTableDetails = {
  subject_id: number;
  subject_id__sub_name: string;
  subject_id__sub_num_code: string;
  subject_id__sub_alpha_code: string;
  section: number;
  section__section: string;
  section__sem_id__sem: number;
  section__sem_id__dept__course_id__value: string;
  section__sem_id__dept__dept__value: string;
  end_time: string;
  start_time: string;
  day: number;
  lec_num: number;
};
