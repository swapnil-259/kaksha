const URLS = {
  auth: {
    dashboard: {
      view_profile: 'dashboard/view_profile/',
      getModules: 'dashboard/getModules/',
    },
    attendance: 'attendance/singlepersonatt/',
    academics: {
      getComponents: 'StudentAcademics/getComponents/',
      mark_class_attendance: 'StudentAcademics/mark_class_attendance/',
      update_class_attendance: 'StudentAcademics/update_class_attendance/',
      prev_attendance: 'StudentAcademics/student_prev_status/',
      attendance_register: 'StudentAcademics/AttendanceRegister/',
      lesson_plan: 'LessonPlan/complete_lesson_plan_dropdown/',
    },
    digital_directory: 'StudentAcademics/emp_details/',
    todo: 'dashboard/todo_view/',
    logout: 'logout/',
    musterroll: {
      update_employee: {
        info: 'musterroll/update_employee/info',
      },
    },
    change_session: 'change_session/',
  },
  no_auth: {
    login: 'validate/',
  },
};

const MEDIA_URLS = {
  employee_image: 'Musterroll/Employee_images',
  student_image: 'StudentMusterroll/Student_images',
};

export default URLS;
export {MEDIA_URLS};
