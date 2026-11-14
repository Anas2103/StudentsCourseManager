import api from './axios'

// ---------- Dashboard ----------
export const dashboardAPI = {
  stats:          () => api.get('/dashboard/stats'),
  recentActivity: () => api.get('/dashboard/recent-activity'),
  charts:         () => api.get('/dashboard/charts'),
}

// ---------- Users ----------
export const usersAPI = {
  list:          (params) => api.get('/users', { params }),
  create:        (data)   => api.post('/users', data),
  show:          (id)     => api.get(`/users/${id}`),
  update:        (id, d)  => api.put(`/users/${id}`, d),
  remove:        (id)     => api.delete(`/users/${id}`),
  toggleStatus:  (id)     => api.put(`/users/${id}/toggle-status`),
  resetPassword: (id, d)  => api.put(`/users/${id}/reset-password`, d),
  assignRole:    (id, d)  => api.put(`/users/${id}/assign-role`, d),
}

// ---------- Students ----------
export const studentsAPI = {
  list:       (params) => api.get('/students', { params }),
  show:       (id)     => api.get(`/students/${id}`),
  update:     (id, d)  => api.put(`/students/${id}`, d),
  remove:     (id)     => api.delete(`/students/${id}`),
  courses:    (id)     => api.get(`/students/${id}/courses`),
  grades:     (id)     => api.get(`/students/${id}/grades`),
  attendance: (id)     => api.get(`/students/${id}/attendance`),
}

// ---------- Teachers ----------
export const teachersAPI = {
  list:    (params) => api.get('/teachers', { params }),
  show:    (id)     => api.get(`/teachers/${id}`),
  update:  (id, d)  => api.put(`/teachers/${id}`, d),
  remove:  (id)     => api.delete(`/teachers/${id}`),
  courses: (id)     => api.get(`/teachers/${id}/courses`),
}

// ---------- Courses ----------
export const coursesAPI = {
  list:           (params) => api.get('/courses', { params }),
  create:         (data)   => api.post('/courses', data),
  show:           (id)     => api.get(`/courses/${id}`),
  update:         (id, d)  => api.put(`/courses/${id}`, d),
  remove:         (id)     => api.delete(`/courses/${id}`),
  assignTeacher:  (id, d)  => api.put(`/courses/${id}/assign-teacher`, d),
  students:       (id)     => api.get(`/courses/${id}/students`),
  assignments:    (id)     => api.get(`/courses/${id}/assignments`),
}

// ---------- Enrollments ----------
export const enrollmentsAPI = {
  list:    (params) => api.get('/enrollments', { params }),
  create:  (data)   => api.post('/enrollments', data),
  show:    (id)     => api.get(`/enrollments/${id}`),
  remove:  (id)     => api.delete(`/enrollments/${id}`),
  approve: (id)     => api.put(`/enrollments/${id}/approve`),
  reject:  (id, d)  => api.put(`/enrollments/${id}/reject`, d),
}

// ---------- Assignments ----------
export const assignmentsAPI = {
  list:        (params) => api.get('/assignments', { params }),
  create:      (data)   => api.post('/assignments', data),
  show:        (id)     => api.get(`/assignments/${id}`),
  update:      (id, d)  => api.put(`/assignments/${id}`, d),
  remove:      (id)     => api.delete(`/assignments/${id}`),
  submissions: (id)     => api.get(`/assignments/${id}/submissions`),
}

// ---------- Search ----------
export const searchAPI = {
  query: (q) => api.get('/search', { params: { q } }),
}

// ---------- Submissions ----------
export const submissionsAPI = {
  list:   (params) => api.get('/submissions', { params }),
  create: (data)   => api.post('/submissions', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  show:   (id)     => api.get(`/submissions/${id}`),
  remove: (id)     => api.delete(`/submissions/${id}`),
  grade:  (id, d)  => api.put(`/submissions/${id}/grade`, d),
}

// ---------- Grades ----------
export const gradesAPI = {
  list:      (params) => api.get('/grades', { params }),
  create:    (data)   => api.post('/grades', data),
  show:      (id)     => api.get(`/grades/${id}`),
  update:    (id, d)  => api.put(`/grades/${id}`, d),
  remove:    (id)     => api.delete(`/grades/${id}`),
  byCourse:  (id)     => api.get(`/grades/course/${id}`),
  byStudent: (id)     => api.get(`/grades/student/${id}`),
}

// ---------- Attendance ----------
export const attendanceAPI = {
  list:      (params) => api.get('/attendance', { params }),
  create:    (data)   => api.post('/attendance', data),
  show:      (id)     => api.get(`/attendance/${id}`),
  update:    (id, d)  => api.put(`/attendance/${id}`, d),
  remove:    (id)     => api.delete(`/attendance/${id}`),
  bulk:      (data)   => api.post('/attendance/bulk', data),
  byCourse:  (id)     => api.get(`/attendance/course/${id}`),
  byStudent: (id)     => api.get(`/attendance/student/${id}`),
}

// ---------- Announcements ----------
export const announcementsAPI = {
  list:   (params) => api.get('/announcements', { params }),
  create: (data)   => api.post('/announcements', data),
  show:   (id)     => api.get(`/announcements/${id}`),
  update: (id, d)  => api.put(`/announcements/${id}`, d),
  remove: (id)     => api.delete(`/announcements/${id}`),
}

// ---------- Schedules ----------
export const schedulesAPI = {
  list:      (params) => api.get('/schedules', { params }),
  create:    (data)   => api.post('/schedules', data),
  show:      (id)     => api.get(`/schedules/${id}`),
  update:    (id, d)  => api.put(`/schedules/${id}`, d),
  remove:    (id)     => api.delete(`/schedules/${id}`),
  byCourse:  (id)     => api.get(`/schedules/course/${id}`),
}

// ---------- Departments ----------
export const departmentsAPI = {
  list:   (params) => api.get('/departments', { params }),
  create: (data)   => api.post('/departments', data),
  show:   (id)     => api.get(`/departments/${id}`),
  update: (id, d)  => api.put(`/departments/${id}`, d),
  remove: (id)     => api.delete(`/departments/${id}`),
}

// ---------- Semesters ----------
export const semestersAPI = {
  list:   ()       => api.get('/semesters'),
  create: (data)   => api.post('/semesters', data),
  update: (id, d)  => api.put(`/semesters/${id}`, d),
  remove: (id)     => api.delete(`/semesters/${id}`),
}

// ---------- Academic Years ----------
export const academicYearsAPI = {
  list:   ()       => api.get('/academic-years'),
  create: (data)   => api.post('/academic-years', data),
  update: (id, d)  => api.put(`/academic-years/${id}`, d),
  remove: (id)     => api.delete(`/academic-years/${id}`),
}

// ---------- Classrooms ----------
export const classroomsAPI = {
  list:   (params) => api.get('/classrooms', { params }),
  create: (data)   => api.post('/classrooms', data),
  update: (id, d)  => api.put(`/classrooms/${id}`, d),
  remove: (id)     => api.delete(`/classrooms/${id}`),
}

// ---------- Auth ----------
export const authAPI = {
  me:             ()       => api.get('/auth/me'),
  updateProfile:  (data)   => api.put('/auth/profile', data),
  changePassword: (data)   => api.post('/auth/change-password', data),
  uploadAvatar:   (form)   => api.post('/auth/upload-avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

// ---------- Notifications ----------
export const notificationsAPI = {
  list: () => api.get('/notifications'),
}

// ---------- Audit Logs ----------
export const auditLogsAPI = {
  list: (params) => api.get('/audit-logs', { params }),
}
