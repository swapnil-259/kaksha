import {StyledButton, StyledText, StyledView} from '@common/components';
import {SelectOptions} from '@common/components/Select';
import useCustomForm from '@common/utils/useCustomForm';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import URLS from '@kaksha/constants/urls';
import {RootStackParamList} from '@kaksha/navigator';
import {LeftPanelRoutes} from '@kaksha/routes/auth/type';
import request, {ResponseType} from '@kaksha/services/api/request';
import {showToast} from '@kaksha/services/toast';
import toastStore from '@kaksha/store/toast';
import {
  LessonPlanDetails,
  PreviousAttendanceStatus,
  StudentDetails,
} from '@kaksha/types/attendance';
import {
  CourseDropdownValue,
  DropdownValue,
  SubjectDowndownValue,
} from '@kaksha/types/dropdown';
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
import {useTheme} from '@rneui/themed';
import dayjs, {Dayjs} from 'dayjs';
import {useEffect, useMemo, useState} from 'react';
import {useSnapshot} from 'valtio';

type InitialFormDataResponse = {
  sub_attendance_type: DropdownValue[];
  course: CourseDropdownValue[];
  lesson_plan_required: {
    attendance_type: string[];
    subject_type: string[];
  };
} | null;

type AvailLecturesResponse = {
  lectures: {lectures: number};
  locked: boolean;
  msg: string;
};

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

type initialState = {
  [key in Exclude<AcademicDropdowns, 'attendance_type'>]: SelectOptions[];
} & {
  loading:
    | ''
    | Exclude<AcademicDropdowns, 'attendance_type'>
    | 'lesson_plan'
    | 'lectures'
    | 'mark';
  lectures: SelectOptions[];
  lesson_plan_details: LessonPlanDetails[];
};

type initialResponseState = {
  [key in Exclude<AcademicDropdowns, 'attendance_type'>]: any;
};

const initialState: initialState = {
  loading: '',
  depts: [],
  sems: [],
  sections: [],
  subjects: [],
  group_names: [],
  lectures: [],
  lesson_plan_details: [],
};

const initialResponseState: initialResponseState = {
  depts: {},
  sems: {},
  sections: {},
  subjects: {},
  group_names: {},
};

type MarkAttendanceSheetProps = {
  navigation: CompositeNavigationProp<
    DrawerNavigationProp<LeftPanelRoutes, keyof LeftPanelRoutes, undefined>,
    NativeStackNavigationProp<
      RootStackParamList,
      keyof RootStackParamList,
      undefined
    >
  >;
};

const MarkAttendanceSheet = ({navigation}: MarkAttendanceSheetProps) => {
  const [state, setState] = useState(initialState);
  const [responseData, setResponseData] = useState(initialResponseState);
  const toast = useSnapshot(toastStore);
  const {theme} = useTheme();

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

  const type_of_attendance: SelectOptions[] = useMemo(
    () =>
      initialFormData?.sub_attendance_type.map(each => ({
        key: `${each.sno}`,
        label: each.value,
        value: `${each.sno}`,
      })) ?? [],
    [initialFormData],
  );

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
    type: Exclude<AcademicDropdowns, 'attendance_type'>,
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
      setResponseData(prev => ({...prev, [type]: data}));
      setState(prev => ({...prev, [type]: options}));
    }
    setLoading('');
  };

  const isLessonPlanRequired = (subject_id: string, type: string) => {
    const subject = (
      responseData.subjects as ResponseType<SubjectDowndownValue[]>
    )?.data?.find(each => each.subject_id == Number(subject_id));
    if (!initialFormData || !subject) return false;
    console.log(initialFormData.lesson_plan_required.attendance_type, type);

    console.log(
      'called',
      initialFormData.lesson_plan_required.subject_type.includes(
        subject?.subject_id__subject_type__value ?? '',
      ) && initialFormData.lesson_plan_required.attendance_type.includes(type),
    );
    return (
      initialFormData.lesson_plan_required.subject_type.includes(
        subject?.subject_id__subject_type__value ?? '',
      ) && initialFormData.lesson_plan_required.attendance_type.includes(type)
    );
  };

  const getLessonPlans = async () => {
    setLoading('lesson_plan');
    const values = form.getValues();
    const params = {
      att_type: values.category,
      isgroup: values.type,
      request_type: 'get_unit',
      subject_id: values.subject,
      ...(values.type === 'Y'
        ? {group_id: values.group_name}
        : {section: values.section}),
    };
    const {status, HttpStatusCode, data} = await request<LessonPlanDetails[]>({
      method: 'GET',
      url: URLS.auth.academics.lesson_plan,
      params,
    });
    if (status === HttpStatusCode.OK && data) {
      setState(prev => ({...prev, lesson_plan_details: data}));
    }
    setLoading('');
  };

  const getAvailLectures = async (item: Dayjs) => {
    setLoading('lectures');
    const values = form.getValues();
    const params = {
      att_type: values.category,
      date: item.format('YYYY-MM-DD'),
      isgroup: values.type,
      request_type: 'filtered_lectures',
      sem_id: values.semester,
      ...(values.type === 'Y'
        ? {group_id: values.group_name}
        : {section: values.section}),
    };
    const {status, HttpStatusCode, data} = await request<
      ResponseType<AvailLecturesResponse>
    >({
      method: 'GET',
      url: URLS.auth.academics.getComponents,
      params,
    });
    if (status === HttpStatusCode.ACCEPTED && data) {
      if (data.data.locked) {
        showToast({
          type: 'error',
          title: 'Portal is Locked!',
          description: data.data.msg,
          index: 1,
        });
      }
    }
    if (status === HttpStatusCode.OK && data) {
      const lectures: SelectOptions[] = [
        ...Array(data.data.lectures.lectures),
      ].map((_, i) => ({
        key: `${i + 1}`,
        label: `${i + 1}`,
        value: `${i + 1}`,
      }));
      setState(prev => ({...prev, lectures}));
    }
    setLoading('');
  };

  const handleSubmit = async (values: typeof defaultValues) => {
    setLoading('mark');
    const params = {
      att_type: values.category,
      date: dayjs(values.date).format('YYYY-MM-DD'),
      isgroup: values.type,
      request_type: 'check_attendance',
      sem_id: values.semester,
      lecture: values.lectures?.join(','),
      ...(values.type === 'Y'
        ? {group_id: values.group_name}
        : {section: values.section}),
    };
    const {status, HttpStatusCode, data} = await request<
      ResponseType<{error: boolean; msg: string}>
    >({
      method: 'GET',
      url: URLS.auth.academics.getComponents,
      params,
    });
    if (
      (status === HttpStatusCode.OK || status === HttpStatusCode.ACCEPTED) &&
      data
    ) {
      if (data.data.error) {
        showToast({
          type: 'error',
          title: 'Ops!',
          description: data.data.msg,
          index: 1,
        });
      }
    }
    if (status === HttpStatusCode.OK && data) {
      if (!data.data.error) {
        const getDetailsParams = {
          request_type:
            values.type === 'Y' ? 'att_group_students' : 'att_section_students',
          ...(values.type === 'Y'
            ? {group_id: values.group_name}
            : {section: values.section}),
        };
        const {status, HttpStatusCode, data} = await request<
          ResponseType<StudentDetails[][]>
        >({
          method: 'GET',
          url: URLS.auth.academics.getComponents,
          params: getDetailsParams,
        });
        if (status === HttpStatusCode.OK && data) {
          const uniq_id = data.data[0].map(each => each.uniq_id);
          const {
            status,
            HttpStatusCode,
            data: prev_data,
          } = await request<PreviousAttendanceStatus>({
            method: 'POST',
            url: URLS.auth.academics.prev_attendance,
            params: {
              app: 'kaksha',
            },
            data: {
              uniq_id,
              subject_id: values.subject,
            },
          });
          if (status === HttpStatusCode.OK && prev_data) {
            toast.ref[0]?.current?.dismiss();
            navigation.navigate('mark_attendance', {
              title: 'Mark Attendance',
              attendance_data: {
                ...values,
                date: (values.date as any as Dayjs)?.format(),
              },
              student_list: data.data[0] ?? [],
              previous_status: prev_data,
              type: 'mark',
            });
          }
        }
      }
    }
    setLoading('');
  };

  const {Form, form, defaultValues, resetFields} = useCustomForm(
    {
      category: '',
      type: '',
      course: '',
      department: '',
      semester: '',
      group_type: '',
      section: '',
      group_name: '',
      subject: '',
      units: [],
      topics: [],
      date: null,
      lectures: [],
    },
    get => ({
      category: {
        type: 'select',
        options: type_of_attendance,
        selectProps: {
          search: true,
          multiple: false,
          loading: initialFormDataLoading,
          setSelected: item => {
            if (!item) resetFields({exclude: []});
          },
        },
        rules: {required: true},
        placeholder: 'Type of Attendance',
      },
      type: {
        type: 'select',
        options: TYPES,
        selectProps: {
          search: true,
          disabled: get('category') === '',
          multiple: false,
          setSelected: item => {
            if (!item) resetFields({exclude: ['category']});
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
            if (item) getDropdownData('depts', item);
            else resetFields({exclude: ['category', 'type']});
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
            else resetFields({exclude: ['category', 'type', 'course']});
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
                exclude: ['category', 'type', 'course', 'department'],
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
                exclude: [
                  'category',
                  'type',
                  'course',
                  'department',
                  'semester',
                ],
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
                include: ['lectures', 'subject', 'date'],
              });
              getDropdownData('subjects', item, get('type') === 'Y');
            } else
              resetFields({
                exclude: [
                  'category',
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
          setSelected: item => {
            if (item) getLessonPlans();
            else
              resetFields({
                include: ['date'],
              });
          },
        },
        rules: {required: true},
        placeholder: 'Subjects',
      },
      units: {
        type: 'select',
        options: state.lesson_plan_details.map(each => ({
          key: each.unit,
          label: each.unit,
          value: each.unit,
        })),
        selectProps: {
          search: true,
          loading: state.loading === 'lesson_plan',
          disabled: get('subject') === '',
          multiple: true,
          setSelected: item => {
            if (!item)
              resetFields({
                include: ['topics'],
              });
          },
        },
        rules: {required: true},
        placeholder: 'Units',
        isRendered: isLessonPlanRequired(
          get('subject') as string,
          get('category') as string,
        ),
      },
      topics: {
        type: 'select',
        options:
          state.lesson_plan_details
            .filter(each => get('units')?.includes(each.unit as never))
            .map(each => each.topic)
            .flat()
            .map(each => ({
              key: `${each.propose_topic__id}`,
              value: `${each.propose_topic__id}`,
              label: each.propose_topic__topic_name,
            })) ?? [],
        selectProps: {
          search: true,
          loading: state.loading === 'subjects',
          disabled: get('units')?.length === 0,
          multiple: true,
        },
        rules: {required: true},
        placeholder: 'Topics',
        isRendered: isLessonPlanRequired(
          get('subject') as string,
          get('category') as string,
        ),
      },
      date: {
        type: 'datetime',
        rules: {required: true},
        dateTimeProps: {
          disabled: get('subject') === '',
          onDateChange: item => {
            if (item) getAvailLectures(item);
          },
          maximumDate: new Date(),
        },
        mode: 'date',
        placeholder: 'Lecture Date',
      },
      lectures: {
        type: 'select',
        rules: {required: true},
        options: state.lectures,
        selectProps: {
          search: true,
          multiple: true,
          disabled: get('date') === null,
          loading: state.loading === 'lectures',
        },
        placeholder: 'Lectures',
      },
    }),
    [type_of_attendance, courses, initialFormDataLoading, state],
    // ['type', 'semester', 'group_type'],[]
    true,
    [],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      getInitialFormData();
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
        Mark Attendance
      </StyledText>
      <BottomSheetScrollView style={{flex: 1}}>
        <Form loading={state.loading === 'mark'} />
      </BottomSheetScrollView>
      <StyledButton
        title={'Mark'}
        loading={state.loading === 'mark'}
        disabled={state.loading === 'mark'}
        onPress={form.handleSubmit(handleSubmit)}
      />
    </StyledView>
  );
};

export default MarkAttendanceSheet;
