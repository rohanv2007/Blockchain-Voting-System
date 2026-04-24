/**
 * API utility — Axios instance configured for the FastAPI backend.
 * All API calls to the backend are centralized here.
 */
import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Accept': 'application/json',
  },
});

// Attach JWT token to requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Admin API ──────────────────────────────────────────────────────

export const adminLogin = async (password) => {
  const formData = new FormData();
  formData.append('password', password);
  const res = await API.post('/admin/login', formData);
  return res.data;
};

export const addCandidate = async (name, party, imageFile) => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('party', party);
  if (imageFile) {
    formData.append('image', imageFile);
  }
  const res = await API.post('/admin/candidate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getCandidates = async () => {
  const res = await API.get('/admin/candidates');
  return res.data;
};

export const startElection = async (name, duration) => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('duration', duration);
  const res = await API.post('/admin/election/start', formData);
  return res.data;
};

export const endElection = async () => {
  const res = await API.post('/admin/election/end');
  return res.data;
};

export const getElectionStatus = async () => {
  const res = await API.get('/admin/election/status');
  return res.data;
};

export const getVoters = async () => {
  const res = await API.get('/admin/voters');
  return res.data;
};

// ─── Voter API ──────────────────────────────────────────────────────

export const registerVoter = async (fullName, voterId, facePhotoBlob) => {
  const formData = new FormData();
  formData.append('full_name', fullName);
  formData.append('voter_id', voterId);
  formData.append('face_photo', facePhotoBlob, 'face.jpg');
  const res = await API.post('/voter/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const verifyFace = async (voterId, facePhotoBlob) => {
  const formData = new FormData();
  formData.append('voter_id', voterId);
  formData.append('face_photo', facePhotoBlob, 'face.jpg');
  const res = await API.post('/voter/verify-face', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const castVote = async (voterId, candidateId) => {
  const formData = new FormData();
  formData.append('voter_id', voterId);
  formData.append('candidate_id', candidateId);
  const res = await API.post('/voter/cast-vote', formData);
  return res.data;
};

// ─── Results API ────────────────────────────────────────────────────

export const getLiveResults = async () => {
  const res = await API.get('/results/live');
  return res.data;
};

export const getWinner = async () => {
  const res = await API.get('/results/winner');
  return res.data;
};

export const getAuditTrail = async (candidateId = null) => {
  const params = candidateId ? { candidate_id: candidateId } : {};
  const res = await API.get('/results/audit', { params });
  return res.data;
};

export const exportAuditCSV = async () => {
  const res = await API.get('/results/audit/export', {
    responseType: 'blob',
  });
  // Trigger download
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'audit_trail.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// ─── Health API ─────────────────────────────────────────────────────

export const checkHealth = async () => {
  const res = await API.get('/health');
  return res.data;
};

export default API;
