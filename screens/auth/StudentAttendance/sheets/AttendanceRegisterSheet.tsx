import {StyledButton, StyledText, StyledView} from '@common/components';
import {SelectOptions} from '@common/components/Select';
import useCustomForm from '@common/utils/useCustomForm';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import URLS from '@kaksha/constants/urls';
import {RootStackParamList} from '@kaksha/navigator';
import {LeftPanelRoutes} from '@kaksha/routes/auth/type';
import request, {ResponseType} from '@kaksha/services/api/request';
import toastStore from '@kaksha/store/toast';
import {AttendanceRegisterStudentData} from '@kaksha/types/attendance';
import {CourseDropdownValue, DropdownValue} from '@kaksha/types/dropdown';
import {
  AcademicDropdowns,
  GroupType,
  getDropdownParams,
  mapDropdownDataToSelect,
} from '@kaksha/utils/dropdown';
import useRequest from '@kaksha/utils/useRequest';
import {useBackHandler} from '@react-native-community/hooks';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {CompositeNavigationProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import {useEffect, useMemo, useState} from 'react';
import {useSnapshot} from 'valtio';

type InitialFormDataResponse = {
  sub_attendance_type: DropdownValue[];
  course: CourseDropdownValue[];
} | null;

type SemCommenceMentResponse = ResponseType<{
  commencement_date: string;
  session__sem_end: string;
}> | null;

const TYPES: SelectOptions[] = [
  {
    key: 'N',
    label: 'NON GROUP',
    value: 'N',
  },
  {
    key: 'Y',
    label: 'GROUP',
    value: 'Y',
  },
];

const GROUP_TYPES: SelectOptions[] = [
  {
    key: 'inter',
    label: 'INTER SECTION',
    value: 'inter',
  },
  {
    key: 'intra',
    label: 'INTRA SECTION',
    value: 'intra',
  },
];

const DATE_PARSE_FORMAT = 'YYYY-MM-DD';

type initialState = {
  [key in AcademicDropdowns]: SelectOptions[];
} & {
  loading: '' | AcademicDropdowns | 'lectures' | 'get_data';
};

const initialState: initialState = {
  loading: '',
  depts: [],
  sems: [],
  sections: [],
  subjects: [],
  group_names: [],
  attendance_type: [],
};

type AttendanceRegisterSheetProps = {
  navigation: CompositeNavigationProp<
    DrawerNavigationProp<LeftPanelRoutes, keyof LeftPanelRoutes, undefined>,
    NativeStackNavigationProp<
      RootStackParamList,
      keyof RootStackParamList,
      undefined
    >
  >;
};

const AttendanceRegisterSheet = ({
  navigation,
}: AttendanceRegisterSheetProps) => {
  const [state, setState] = useState(initialState);
  const toast = useSnapshot(toastStore);

  const {
    getResponse: getInitialFormData,
    data: initialFormData,
    loading: initialFormDataLoading,
  } = useRequest<InitialFormDataResponse>({
    requestParams: {
      method: 'GET',
      url: URLS.auth.academics.mark_class_attendance,
      params: {
        request_type: 'form_data',
      },
    },
    initialState: null,
  });

  const {
    getResponse: getSemCommencement,
    data: semCommenceMentData,

    loading: semCommenceMentLoading,
  } = useRequest<SemCommenceMentResponse>({
    requestParams: {
      method: 'GET',
      url: URLS.auth.academics.getComponents,
      params: {
        request_type: 'sem_commencement',
      },
    },
    initialState: null,
  });

  const courses: SelectOptions[] = useMemo(
    () =>
      initialFormData?.course.map(each => ({
        key: `${each.section__sem_id__dept__course_id}`,
        label: each.section__sem_id__dept__course_id__value,
        value: `${each.section__sem_id__dept__course_id}`,
      })) ?? [],
    [initialFormData],
  );

  const setLoading = (loading: initialState['loading']) => {
    setState(prev => ({...prev, loading}));
  };

  const getDropdownData = async (
    type: AcademicDropdowns,
    value: string,
    isGroup?: boolean,
    groupType?: GroupType,
  ) => {
    setLoading(type);
    const {status, data, HttpStatusCode} = await request<
      ResponseType<unknown[]>
    >({
      method: 'GET',
      url: URLS.auth.academics.getComponents,
      params: getDropdownParams(type, value, isGroup, groupType),
    });
    if (status === HttpStatusCode.OK && data) {
      const options = mapDropdownDataToSelect(type, data);
      setState(prev => ({...prev, [type]: options}));
    }
    setLoading('');
  };

  const handleSubmit = async (values: typeof defaultValues) => {
    setLoading('get_data');
    const params = {
      request_type: 'att_register_data',
      att_type: values.attendance_type
        ?.filter(each => each !== 'ALL')
        .join(','),
      subject: values.subject,
      ...(values.type === 'Y'
        ? {group_id: values.group_name}
        : {section: values.section}),
      ...(values.group_type !== 'inter' && {section: values.section}),
      from_date: dayjs(values.from_date).format('YYYY-MM-DD'),
      to_date: dayjs(values.to_date).format('YYYY-MM-DD'),
    };
    const {status, HttpStatusCode, data} = await request<
      ResponseType<AttendanceRegisterStudentData[]>
    >({
      method: 'GET',
      url: URLS.auth.academics.attendance_register,
      params,
    });
    if (status === HttpStatusCode.OK && data) {
      navigation.navigate('attendance_register', {
        data: data.data,
      });
      toast.ref[0]?.current?.dismiss();
    }
    setLoading('');
  };

  const {Form, form, defaultValues, resetFields} = useCustomForm(
    {
      type: '',
      course: '',
      department: '',
      semester: '',
      group_type: '',
      section: '',
      group_name: '',
      subject: '',
      attendance_type: [],
      from_date: null,
      to_date: null,
    },
    (get, set) => ({
      type: {
        type: 'select',
        options: TYPES,
        selectProps: {
          search: true,
          multiple: false,
          setSelected: item => {
            console.log(item === '');
            if (!item) resetFields({exclude: []});
          },
        },
        rules: {required: true},
        placeholder: 'GROUP/NON-GROUP',
      },
      course: {
        type: 'select',
        options: courses,
        selectProps: {
          search: true,
          multiple: false,
          disabled: get('type') === '',
          setSelected: item => {
            if (item) {
              getDropdownData('depts', item);
              getSemCommencement({params: {course: item}}).then(({data}) => {
                if (data) {
                  set(
                    'from_date',
                    dayjs(
                      data.data.commencement_date,
                      DATE_PARSE_FORMAT,
                    ) as any,
                  );
                  set('to_date', dayjs() as any);
                }
              });
            } else resetFields({exclude: ['type']});
          },
        },
        rules: {required: true},
        placeholder: 'Course',
      },
      department: {
        type: 'select',
        options: state.depts,
        selectProps: {
          search: true,
          loading: state.loading === 'depts',
          multiple: false,
          disabled: get('course') === '',
          setSelected: item => {
            if (item) getDropdownData('sems', item);
            else resetFields({exclude: ['type', 'course']});
          },
        },
        rules: {required: true},
        placeholder: 'Department',
      },
      semester: {
        type: 'select',
        options: state.sems,
        selectProps: {
          search: true,
          loading: state.loading === 'sems',
          multiple: false,
          disabled: get('department') === '',
          setSelected: item => {
            if (item) getDropdownData('sections', item);
            else
              resetFields({
                exclude: ['type', 'course', 'department'],
              });
          },
        },
        rules: {required: true},
        placeholder: 'Semester',
      },
      group_type: {
        type: 'select',
        options: GROUP_TYPES,
        selectProps: {
          search: true,
          multiple: false,
          disabled: get('semester') === '',
          setSelected: item => {
            if (item === 'inter')
              getDropdownData(
                'group_names',
                get('semester') as string,
                get('type') === 'Y',
                item as GroupType,
              );
            if (!item)
              resetFields({
                exclude: ['type', 'course', 'department', 'semester'],
              });
          },
        },
        rules: {required: true},
        placeholder: 'Group Type',
        isRendered: get('type') === 'Y',
      },
      group_name: {
        type: 'select',
        options: state.group_names,
        selectProps: {
          search: true,
          loading: state.loading === 'group_names',
          multiple: false,
          disabled:
            get('group_type') === 'intra'
              ? get('section') === ''
              : get('group_type') === '',
          setSelected: item => {
            if (item) {
              resetFields({
                include: ['subject'],
              });
              getDropdownData('subjects', item, get('type') === 'Y');
            } else
              resetFields({
                exclude: [
                  'type',
                  'course',
                  'department',
                  'semester',
                  'group_type',
                  'section',
                ],
              });
          },
        },
        rules: {required: true},
        placeholder: 'Group Name',
        isRendered: get('type') === 'Y',
      },
      section: {
        type: 'select',
        options: state.sections,
        selectProps: {
          search: true,
          multiple: false,
          loading: state.loading === 'sections',
          disabled:
            get('type') === 'Y'
              ? get('group_type') === ''
              : get('semester') === '',
          setSelected: item => {
            if (item) {
              if (get('group_type') === 'intra') {
                getDropdownData(
                  'group_names',
                  item,
                  get('type') === 'Y',
                  'intra',
                );
              } else {
                getDropdownData('subjects', item, get('type') === 'Y');
              }
            } else {
              if (get('group_type') === 'intra') {
                resetFields({
                  include: ['group_name', 'section'],
                });
              } else {
                resetFields({
                  include: ['subject'],
                });
              }
            }
          },
        },
        rules: {required: true},
        placeholder: 'Section',
        isRendered: get('type') === 'N' || get('group_type') === 'intra',
      },
      subject: {
        type: 'select',
        options: state.subjects,
        selectProps: {
          search: true,
          loading: state.loading === 'subjects',
          disabled:
            get('group_type') === 'intra'
              ? get('group_name') === ''
              : get('section') === '',
          multiple: false,
        },
        rules: {required: true},
        placeholder: 'Subjects',
      },
      attendance_type: {
        type: 'select',
        options: state.attendance_type,
        selectProps: {
          search: true,
          loading: state.loading === 'attendance_type',
          multiple: true,
          showAll: true,
        },
        rules: {required: true},
        placeholder: 'Attendance Type',
      },
      from_date: {
        type: 'datetime',
        rules: {required: true},
        dateTimeProps: {
          loading: semCommenceMentLoading,
          disabled: get('course') === '',
          minimumDate: semCommenceMentData
            ? dayjs(
                semCommenceMentData.data.commencement_date,
                DATE_PARSE_FORMAT,
              ).toDate()
            : undefined,
          maximumDate:
            typeof get('to_date') === 'string'
              ? dayjs(get('to_date') as string).toDate()
              : undefined,
          onDateChange: item => {
            if (!item) resetFields({include: ['to_date', 'from_date']});
          },
        },
        mode: 'date',
        placeholder: 'From Date',
      },
      to_date: {
        type: 'datetime',
        rules: {required: true},
        dateTimeProps: {
          disabled: get('from_date') === null,
          minimumDate: dayjs((get('from_date') as string) ?? '').toDate(),
          maximumDate: semCommenceMentData
            ? dayjs(
                semCommenceMentData.data.session__sem_end,
                DATE_PARSE_FORMAT,
              ).toDate()
            : undefined,
        },
        mode: 'date',
        placeholder: 'To Date',
      },
    }),
    [courses, initialFormDataLoading, state, semCommenceMentData],
    // ['type', 'semester', 'group_type'],[]
    true,
    [],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      getInitialFormData();
      getDropdownData('attendance_type', '');
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  useBackHandler(() => {
    toast.ref[0]?.current?.dismiss();
    return true;
  });

  return (
    <StyledView tw={'h-full py-2 pb-4'} style={{gap: 10}}>
      <StyledText tw="text-center" h1>
        Attendance Register
      </StyledText>
      <BottomSheetScrollView style={{flex: 1}}>
        <Form loading={state.loading === 'get_data'} />
      </BottomSheetScrollView>
      <StyledButton
        title={'Show'}
        loading={state.loading === 'get_data'}
        disabled={state.loading === 'get_data'}
        onPress={form.handleSubmit(handleSubmit)}
      />
    </StyledView>
  );
};

export default AttendanceRegisterSheet;
