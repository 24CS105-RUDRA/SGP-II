import apiClient from './api';

export const authService = {
  login: async (mobileNumber: string, password: string, role: string) => {
    const response = await apiClient.post('/auth/login', {
      mobileNumber,
      password,
      role,
    });
    return response.data.data;
  },

  register: async (mobileNumber: string, password: string, name: string, email: string, role: string) => {
    const response = await apiClient.post('/auth/register', {
      mobileNumber,
      password,
      name,
      email,
      role,
    });
    return response.data.data;
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await apiClient.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data.data;
  },
};

export const studentService = {
  getAllStudents: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/students', {
      params: { page, limit },
    });
    return response.data.data;
  },

  getStudentById: async (id: string) => {
    const response = await apiClient.get(`/students/${id}`);
    return response.data.data;
  },

  getStudentsByClass: async (standard: string, division: string) => {
    const response = await apiClient.get('/students/by-class', {
      params: { standard, division },
    });
    return response.data.data;
  },

  createStudent: async (studentData: any) => {
    const response = await apiClient.post('/students', studentData);
    return response.data.data;
  },

  updateStudent: async (id: string, studentData: any) => {
    const response = await apiClient.put(`/students/${id}`, studentData);
    return response.data.data;
  },

  deleteStudent: async (id: string) => {
    const response = await apiClient.delete(`/students/${id}`);
    return response.data.data;
  },

  getStudentAttendance: async (id: string, month?: string) => {
    const response = await apiClient.get(`/students/${id}/attendance`, {
      params: { month },
    });
    return response.data.data;
  },
};

export const facultyService = {
  getAllFaculty: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/faculty', {
      params: { page, limit },
    });
    return response.data.data;
  },

  getFacultyById: async (id: string) => {
    const response = await apiClient.get(`/faculty/${id}/details`);
    return response.data.data;
  },

  getFacultyByEmployeeId: async (employeeId: string) => {
    const response = await apiClient.get(`/faculty/employee/${employeeId}`);
    return response.data.data;
  },

  createFaculty: async (facultyData: any) => {
    const response = await apiClient.post('/faculty', facultyData);
    return response.data.data;
  },

  updateFaculty: async (id: string, facultyData: any) => {
    const response = await apiClient.put(`/faculty/${id}`, facultyData);
    return response.data.data;
  },

  deleteFaculty: async (id: string) => {
    const response = await apiClient.delete(`/faculty/${id}`);
    return response.data.data;
  },

  getAssignedClasses: async (id: string) => {
    const response = await apiClient.get(`/faculty/${id}/classes`);
    return response.data.data;
  },

  updateAssignments: async (id: string, assignedClasses: any) => {
    const response = await apiClient.put(`/faculty/${id}/assignments`, {
      assignedClasses,
    });
    return response.data.data;
  },
};

export const attendanceService = {
  markAttendance: async (attendanceData: any) => {
    const response = await apiClient.post('/attendance/mark', attendanceData);
    return response.data.data;
  },

  bulkMarkAttendance: async (attendanceData: any[]) => {
    const response = await apiClient.post('/attendance/bulk-mark', {
      attendanceData,
    });
    return response.data.data;
  },

  getAttendance: async (studentId: string, month?: string, page = 1, limit = 10) => {
    const response = await apiClient.get(`/attendance/${studentId}`, {
      params: { month, page, limit },
    });
    return response.data.data;
  },

  getClassAttendance: async (date?: string, subject?: string) => {
    const response = await apiClient.get('/attendance/class/report', {
      params: { date, subject },
    });
    return response.data.data;
  },

  updateAttendance: async (id: string, status: string, remarks?: string) => {
    const response = await apiClient.put(`/attendance/${id}`, {
      status,
      remarks,
    });
    return response.data.data;
  },

  getAttendanceStats: async (studentId?: string, month?: string) => {
    const response = await apiClient.get('/attendance/stats/summary', {
      params: { studentId, month },
    });
    return response.data.data;
  },
};

export const announcementService = {
  getAllAnnouncements: async (page = 1, limit = 10, type?: string, isPublished?: boolean) => {
    const response = await apiClient.get('/announcements', {
      params: { page, limit, type, isPublished },
    });
    return response.data.data;
  },

  getAnnouncementById: async (id: string) => {
    const response = await apiClient.get(`/announcements/${id}`);
    return response.data.data;
  },

  getAnnouncementsByAudience: async (audience: string) => {
    const response = await apiClient.get(`/announcements/audience/${audience}`);
    return response.data.data;
  },

  createAnnouncement: async (announcementData: any) => {
    const response = await apiClient.post('/announcements', announcementData);
    return response.data.data;
  },

  updateAnnouncement: async (id: string, announcementData: any) => {
    const response = await apiClient.put(`/announcements/${id}`, announcementData);
    return response.data.data;
  },

  publishAnnouncement: async (id: string) => {
    const response = await apiClient.put(`/announcements/${id}/publish`, {});
    return response.data.data;
  },

  deleteAnnouncement: async (id: string) => {
    const response = await apiClient.delete(`/announcements/${id}`);
    return response.data.data;
  },
};

export const homeworkService = {
  getHomework: async (page = 1, limit = 10, standard?: string, division?: string, subject?: string) => {
    const response = await apiClient.get('/homework', {
      params: { page, limit, standard, division, subject },
    });
    return response.data.data;
  },

  getHomeworkById: async (id: string) => {
    const response = await apiClient.get(`/homework/${id}`);
    return response.data.data;
  },

  createHomework: async (homeworkData: any) => {
    const response = await apiClient.post('/homework', homeworkData);
    return response.data.data;
  },

  updateHomework: async (id: string, homeworkData: any) => {
    const response = await apiClient.put(`/homework/${id}`, homeworkData);
    return response.data.data;
  },

  deleteHomework: async (id: string) => {
    const response = await apiClient.delete(`/homework/${id}`);
    return response.data.data;
  },

  submitHomework: async (homeworkId: string) => {
    const response = await apiClient.post('/homework/submit', {
      homeworkId,
    });
    return response.data.data;
  },

  gradeSubmission: async (submissionId: string, grade: number, remarks?: string) => {
    const response = await apiClient.put(`/homework/submit/${submissionId}/grade`, {
      grade,
      remarks,
    });
    return response.data.data;
  },

  getStudentSubmissions: async (studentId: string) => {
    const response = await apiClient.get(`/homework/student/${studentId}/submissions`);
    return response.data.data;
  },

  getHomeworkSubmissions: async (homeworkId: string) => {
    const response = await apiClient.get(`/homework/${homeworkId}/submissions`);
    return response.data.data;
  },
};

export const feeService = {
  getFees: async (page = 1, limit = 10, status?: string, studentId?: string) => {
    const response = await apiClient.get('/fees', {
      params: { page, limit, status, studentId },
    });
    return response.data.data;
  },

  getFeeById: async (id: string) => {
    const response = await apiClient.get(`/fees/${id}`);
    return response.data.data;
  },

  getStudentFees: async (studentId: string) => {
    const response = await apiClient.get(`/fees/student/${studentId}`);
    return response.data.data;
  },

  createFee: async (feeData: any) => {
    const response = await apiClient.post('/fees', feeData);
    return response.data.data;
  },

  updatePayment: async (id: string, amountPaid: number, paymentMethod?: string, remarks?: string) => {
    const response = await apiClient.put(`/fees/${id}/payment`, {
      amountPaid,
      paymentMethod,
      remarks,
    });
    return response.data.data;
  },

  getFeeStats: async () => {
    const response = await apiClient.get('/fees/stats');
    return response.data.data;
  },

  deleteFee: async (id: string) => {
    const response = await apiClient.delete(`/fees/${id}`);
    return response.data.data;
  },
};

export const timetableService = {
  getTimetable: async (standard?: string, division?: string, day?: string) => {
    const response = await apiClient.get('/timetable', {
      params: { standard, division, day },
    });
    return response.data.data;
  },

  getTimetableById: async (id: string) => {
    const response = await apiClient.get(`/timetable/${id}`);
    return response.data.data;
  },

  getFacultyTimetable: async (facultyId: string) => {
    const response = await apiClient.get(`/timetable/faculty/${facultyId}`);
    return response.data.data;
  },

  getClassTimetable: async (standard: string, division: string) => {
    const response = await apiClient.get(`/timetable/class/${standard}/${division}`);
    return response.data.data;
  },

  createTimetable: async (timetableData: any) => {
    const response = await apiClient.post('/timetable', timetableData);
    return response.data.data;
  },

  updateTimetable: async (id: string, timetableData: any) => {
    const response = await apiClient.put(`/timetable/${id}`, timetableData);
    return response.data.data;
  },

  deleteTimetable: async (id: string) => {
    const response = await apiClient.delete(`/timetable/${id}`);
    return response.data.data;
  },

  deleteClassTimetable: async (standard: string, division: string) => {
    const response = await apiClient.delete(`/timetable/class/${standard}/${division}`);
    return response.data.data;
  },
};

export const studyMaterialService = {
  getStudyMaterials: async (page = 1, limit = 10, standard?: string, division?: string, subject?: string) => {
    const response = await apiClient.get('/study-materials', {
      params: { page, limit, standard, division, subject },
    });
    return response.data.data;
  },

  getStudyMaterialById: async (id: string) => {
    const response = await apiClient.get(`/study-materials/${id}`);
    return response.data.data;
  },

  getFacultyMaterials: async (facultyId: string) => {
    const response = await apiClient.get(`/study-materials/faculty/${facultyId}`);
    return response.data.data;
  },

  uploadStudyMaterial: async (materialData: any) => {
    const response = await apiClient.post('/study-materials', materialData);
    return response.data.data;
  },

  updateStudyMaterial: async (id: string, materialData: any) => {
    const response = await apiClient.put(`/study-materials/${id}`, materialData);
    return response.data.data;
  },

  deleteStudyMaterial: async (id: string) => {
    const response = await apiClient.delete(`/study-materials/${id}`);
    return response.data.data;
  },
};

export const galleryService = {
  getGalleryEvents: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/gallery/events', {
      params: { page, limit },
    });
    return response.data.data;
  },

  getGalleryEventById: async (id: string) => {
    const response = await apiClient.get(`/gallery/events/${id}`);
    return response.data.data;
  },

  getEventImages: async (eventId: string) => {
    const response = await apiClient.get(`/gallery/event/${eventId}/images`);
    return response.data.data;
  },

  createGalleryEvent: async (eventData: any) => {
    const response = await apiClient.post('/gallery/events', eventData);
    return response.data.data;
  },

  updateGalleryEvent: async (id: string, eventData: any) => {
    const response = await apiClient.put(`/gallery/events/${id}`, eventData);
    return response.data.data;
  },

  deleteGalleryEvent: async (id: string) => {
    const response = await apiClient.delete(`/gallery/events/${id}`);
    return response.data.data;
  },

  uploadGalleryImage: async (eventId: string, imageUrl: string, caption?: string) => {
    const response = await apiClient.post('/gallery/images/upload', {
      eventId,
      imageUrl,
      caption,
    });
    return response.data.data;
  },

  updateGalleryImage: async (id: string, caption: string) => {
    const response = await apiClient.put(`/gallery/images/${id}`, {
      caption,
    });
    return response.data.data;
  },

  deleteGalleryImage: async (id: string) => {
    const response = await apiClient.delete(`/gallery/images/${id}`);
    return response.data.data;
  },
};
