import axios from 'axios';

const CREDENTIAL_API = process.env.REACT_APP_CREDENTIAL_SERVICE_URL || 'http://localhost:3001';
const LMS_API = process.env.REACT_APP_LMS_SERVICE_URL || 'http://localhost:3002';
const WELLBEING_API = process.env.REACT_APP_WELLBEING_SERVICE_URL || 'http://localhost:3003';
const AI_API = process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:3004';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

// Auth
export const login = (email: string, password: string) =>
  axios.post(`${CREDENTIAL_API}/api/v1/auth/login`, { email, password });

export const register = (data: object) =>
  axios.post(`${CREDENTIAL_API}/api/v1/auth/register`, data);

// Credentials
export const issueCredential = (data: object) =>
  axios.post(`${CREDENTIAL_API}/api/v1/credentials/issue`, data, getAuthHeader());

export const verifyCredential = (credentialId: string) =>
  axios.get(`${CREDENTIAL_API}/api/v1/credentials/verify/${credentialId}`);

export const listCredentials = (params?: object) =>
  axios.get(`${CREDENTIAL_API}/api/v1/credentials`, { ...getAuthHeader(), params });

export const revokeCredential = (credentialId: string) =>
  axios.delete(`${CREDENTIAL_API}/api/v1/credentials/${credentialId}`, getAuthHeader());

// LMS
export const listCourses = (params?: object) =>
  axios.get(`${LMS_API}/api/v1/courses`, { params });

export const enroll = (workerId: string, courseId: string) =>
  axios.post(`${LMS_API}/api/v1/enrollments`, { workerId, courseId });

export const updateProgress = (enrollmentId: string, progress: number, score?: number) =>
  axios.put(`${LMS_API}/api/v1/enrollments/${enrollmentId}/progress`, { progress, score });

export const getWorkerEnrollments = (workerId: string) =>
  axios.get(`${LMS_API}/api/v1/enrollments/worker/${workerId}`);

export const uploadMaterial = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(`${LMS_API}/api/v1/uploads/training-material`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Wellbeing
export const listSurveys = () => axios.get(`${WELLBEING_API}/api/v1/surveys`);
export const submitSurveyResponse = (surveyId: string, data: object) =>
  axios.post(`${WELLBEING_API}/api/v1/surveys/${surveyId}/respond`, data);
export const getWellbeingDashboard = () =>
  axios.get(`${WELLBEING_API}/api/v1/surveys/dashboard`);

// AI
export const getTrainingRecommendations = (data: object) =>
  axios.post(`${AI_API}/api/v1/ai/recommend-training`, data);
export const getWellbeingInsights = (data: object) =>
  axios.post(`${AI_API}/api/v1/ai/wellbeing-insights`, data);
export const getComplianceRisk = (data: object) =>
  axios.post(`${AI_API}/api/v1/ai/compliance-risk`, data);
export const chatWithAI = (messages: object[], context?: object) =>
  axios.post(`${AI_API}/api/v1/ai/chat`, { messages, context });