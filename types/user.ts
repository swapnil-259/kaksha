export type UserI = {
  linked_in_url: string;
  gender__value: string;
  nationality__value: string;
  fname: string;
  mname: string;
  marital_status__value: string;
  religion__value: string;
  bg__value: string;
  caste__value: string;
  emp_id__name: string;
  emp_id__email: string;
  emp_id__desg__value: string;
  emp_id__dept__value: string;
  emp_id__current_pos__value: string;
  emp_id__mob: string;
  image_path: string;
};

export type SessionValue = {
  uid: number;
  session: string;
  session_name: string;
};
