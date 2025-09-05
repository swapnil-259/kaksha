import {Nullable} from '@common/types';

export type FacultyData = Nullable<{
  name: string;
  dept__value: string;
  mob: string;
  email: string;
  emp_id: string;
  emp_type__value: string;
  desg__value: string;
  image: string;
}>;
