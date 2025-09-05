import {SelectOptions} from '@common/components/Select';
import {ResponseType} from '@kaksha/services/api/request';
import {
  AttendanceTypeValue,
  DepartmentDropdownValue,
  GroupNameDowndownValue,
  SectionDropdownValue,
  SemesterDropdownValue,
  SubjectDowndownValue,
} from '@kaksha/types/dropdown';

type AcademicDropdowns =
  | 'depts'
  | 'sems'
  | 'sections'
  | 'subjects'
  | 'group_names'
  | 'attendance_type';

type GroupType = 'inter' | 'intra';

type AttendanceType = 'group' | 'nonGroup';

type GenericAcademicDropdownStore = {
  [key in Exclude<AcademicDropdowns, 'subjects' | 'group_names'>]: string;
} & {
  subjects: {[key in AttendanceType]: string};
  group_names: {[key in GroupType]: string};
};

const requestTypes: GenericAcademicDropdownStore = {
  depts: 'fac_time_dept',
  sems: 'fac_time_sem',
  sections: 'fac_time_section',
  subjects: {
    group: 'fac_time_group_subject',
    nonGroup: 'fac_time_subject',
  },
  group_names: {
    inter: 'emp_intersection_group',
    intra: 'emp_intrasection_group',
  },
  attendance_type: 'attendance_type',
};

const requestKeys: Omit<GenericAcademicDropdownStore, 'attendance_type'> = {
  depts: 'course',
  sems: 'dept',
  sections: 'sem',
  group_names: {
    inter: 'sem',
    intra: 'section',
  },
  subjects: {
    group: 'group_id',
    nonGroup: 'section',
  },
};

const getDropdownParams = (
  type: AcademicDropdowns,
  value: string,
  isGroup?: boolean,
  groupType?: GroupType,
) => {
  if (type === 'group_names') {
    return {
      request_type: requestTypes[type][groupType ?? 'inter'],
      [requestKeys[type][groupType ?? 'inter']]: Number.parseInt(value),
    };
  } else if (type === 'subjects') {
    return {
      request_type: requestTypes[type][isGroup ? 'group' : 'nonGroup'],
      [requestKeys[type][isGroup ? 'group' : 'nonGroup']]:
        Number.parseInt(value),
    };
  } else if (type === 'attendance_type') {
    return {
      request_type: requestTypes[type],
    };
  }
  return {
    request_type: requestTypes[type],
    [requestKeys[type]]: Number.parseInt(value),
  };
};

const mapDropdownDataToSelect = (
  type: AcademicDropdowns,
  data: ResponseType<unknown[]>,
): SelectOptions[] => {
  if (type === 'depts') {
    return (data as ResponseType<DepartmentDropdownValue[]>).data.map(each => ({
      key: `${each.section__sem_id__dept}`,
      label: each.section__sem_id__dept__dept__value,
      value: `${each.section__sem_id__dept}`,
    }));
  } else if (type === 'sems') {
    return (data as ResponseType<SemesterDropdownValue[]>).data.map(each => ({
      key: `${each.section__sem_id}`,
      label: `${each.section__sem_id__sem}`,
      value: `${each.section__sem_id}`,
    }));
  } else if (type === 'sections') {
    return (data as ResponseType<SectionDropdownValue[]>).data.map(each => ({
      key: `${each.section}`,
      label: each.section__section,
      value: `${each.section}`,
    }));
  } else if (type === 'subjects') {
    return (data as ResponseType<SubjectDowndownValue[]>).data.map(each => ({
      key: `${each.subject_id}`,
      label: `${each.subject_id__sub_name} (${each.subject_id__sub_alpha_code}-${each.subject_id__sub_num_code})`,
      value: `${each.subject_id}`,
    }));
  } else if (type === 'group_names') {
    return (data as ResponseType<GroupNameDowndownValue[]>).data.map(each => ({
      key: `${each.group_id}`,
      label: each.group_id__group_name,
      value: `${each.group_id}`,
    }));
  } else if (type === 'attendance_type') {
    return (data as ResponseType<AttendanceTypeValue[]>).data.reduce<
      SelectOptions[]
    >(
      (prevValue, current) => [
        ...prevValue,
        ...current.data.map<SelectOptions>(each => ({
          key: `${each.sno}`,
          label: each.value,
          value: `${each.sno}`,
        })),
      ],
      [],
    );
  }
  return [];
};

export {getDropdownParams, mapDropdownDataToSelect};
export type {AcademicDropdowns, GroupType};
