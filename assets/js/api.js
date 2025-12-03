const API_BASE = window.API_BASE || `${window.location.origin.replace(/\/$/, '')}/api`;

const handleResponse = async (response) => {
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Request failed');
  }
  return json;
};

window.AdaptAPI = {
  signupUser: async (payload) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  loginUser: async (payload) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  fetchCourses: async () => {
    const res = await fetch(`${API_BASE}/courses`, { credentials: 'include' });
    return handleResponse(res);
  },

  fetchLessons: async (courseId) => {
    const res = await fetch(`${API_BASE}/lessons/${courseId}`, { credentials: 'include' });
    return handleResponse(res);
  },

  fetchQuiz: async (lessonId) => {
    const res = await fetch(`${API_BASE}/quiz/${lessonId}`, { credentials: 'include' });
    return handleResponse(res);
  },

  submitQuiz: async (lessonId, answers) => {
    const res = await fetch(`${API_BASE}/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ lessonId: Number(lessonId), answers }),
    });
    return handleResponse(res);
  },

  fetchCertificates: async () => {
    const res = await fetch(`${API_BASE}/user/certificates`, { credentials: 'include' });
    return handleResponse(res);
  },

  generateCertificate: async (courseId) => {
    const res = await fetch(`${API_BASE}/certificate/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ courseId: Number(courseId) }),
    });
    return handleResponse(res);
  },

  fetchDashboardProfile: async () => {
    const res = await fetch(`${API_BASE}/user/profile`, { credentials: 'include' });
    return handleResponse(res);
  },

  fetchProgress: async () => {
    const res = await fetch(`${API_BASE}/user/progress`, { credentials: 'include' });
    return handleResponse(res);
  },

  fetchActivity: async () => {
    const res = await fetch(`${API_BASE}/user/activity`, { credentials: 'include' });
    return handleResponse(res);
  },

  fetchLightningToolsData: async () => {
    const res = await fetch(`${API_BASE}/tools/lightning`, { credentials: 'include' });
    if (res.status === 404) return { success: true, data: [] };
    return handleResponse(res);
  },
};
