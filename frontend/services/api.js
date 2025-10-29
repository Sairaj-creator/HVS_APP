import { Alert, Platform } from 'react-native';
import * as mockDb from './mockDb';

// Determine a sensible default backend URL depending on platform.
// - On Android emulators use 10.0.2.2 to reach the host machine.
// - On iOS simulators and web use localhost/127.0.0.1.
// You can still override by editing this line or by wiring an env var when building.
const DEFAULT_BASE_LOCALHOST = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000';

// For quick local development change this if you need to hit a remote machine on your LAN:
// e.g. const BASE_URL = 'http://192.168.1.5:8000';
// Use the platform-aware default (Android emulator -> 10.0.2.2, others -> localhost)
// To override for a physical device set the LAN IP here, e.g.:
// const BASE_URL = 'http://192.168.75.1:8000';
const BASE_URL = 'MOCK';
export const MOCK = BASE_URL === 'MOCK';

/**
 * The main login function.
 * This is called by AuthContext.
 */
export const apiLogin = async (username, password) => {
  console.log('Attempting login with:', username);
  if (MOCK) {
    try {
      const token = await mockDb.signInMock(username, password);
      if (!token) {
        Alert.alert('Login Failed', 'Invalid credentials (mock)');
        return null;
      }
      return token;
    } catch (e) {
      console.error('Mock sign in error', e);
      Alert.alert('Login Failed', e.message || 'Mock login failed');
      return null;
    }
  }

  try {
    const body = new URLSearchParams();
    body.append('username', username);
    body.append('password', password);

    // Calls your friend's: POST /api/v1/login/token
    const response = await fetch(`${BASE_URL}/api/v1/login/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to log in');
    }

    if (data.access_token) {
      return data.access_token; // Return the token on success
    } else {
      throw new Error('Invalid response: No access_token received');
    }
  } catch (error) {
    console.error('Sign in error:', error);
    Alert.alert('Login Failed', error.message);
    return null; // Return null on failure
  }
};

/**
 * Registers a new user (Doctor/Nurse).
 * NOTE: This is likely deprecated based on the Admin flow.
 * Check with backend if this endpoint still exists or is needed.
 */
export const apiRegisterUser = async (userData) => {
  // userData = { username, password, role }
  console.log('Attempting to register new user (Self-Registration):', userData.username);
  if (MOCK) {
    try {
      const user = await mockDb.registerMockUser(userData);
      return user;
    } catch (e) {
      console.error('Mock registration error', e);
      const message = e.message || 'Mock registration failed';
      const err = new Error(message);
      throw err;
    }
  }

  try {
    // Calls your friend's: POST /api/v1/register
    const response = await fetch(`${BASE_URL}/api/v1/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    // Try to parse JSON response (may be validation errors)
    let data = null;
    try {
      data = await response.json();
    } catch (e) {
      // Non-JSON response (rare)
      data = null;
    }

    if (!response.ok) {
      // Pydantic/FastAPI validation errors often come as { detail: [ ... ] }
      let message = 'Failed to register';
      if (data && data.detail) {
        if (Array.isArray(data.detail)) {
          // Turn the array into a readable string
          message = JSON.stringify(data.detail);
        } else if (typeof data.detail === 'string') {
          message = data.detail;
        } else {
          message = JSON.stringify(data.detail);
        }
      }
      throw new Error(message);
    }

    return data; // Return the new user object (parsed JSON)
  } catch (error) {
    console.error('Registration error:', error);
    // Re-throw the error so the screen can catch it
    throw error;
  }
};

/**
 * The main function for making *authenticated* API calls.
 * It automatically adds the JWT (access_token) for us.
 */
const fetchWithToken = async (endpoint, token, options = {}) => {
  if (MOCK) {
    // Delegate to mock DB
    return mockDb.mockFetch(endpoint, token, options);
  }
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    Authorization: `Bearer ${token}`, // <-- This is the JWT keycard!
  };

  try {
    const fullUrl = `${BASE_URL}${endpoint}`;
    console.log(`API: calling ${fullUrl}`);
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Unauthorized! Our token is bad or expired.
      Alert.alert('Error', 'Your session has expired. Please log in again.');
      // Here we should trigger a logout in AuthContext (e.g., call signOut())
      return null;
    }

    if (!response.ok) {
      // Try to parse error details from the backend response
      let errorDetail = `API Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorDetail;
      } catch (e) {
        // If response is not JSON, use the status text
        errorDetail = response.statusText || errorDetail;
      }
      throw new Error(errorDetail);
    }

    // If response is "204 No Content" or other non-JSON success, just return
    if (response.status === 204 || !response.headers.get('content-length') || response.headers.get('content-length') === '0') {
      return { success: true };
    }

    // Otherwise, parse the JSON response
    return response.json();

  } catch (error) {
    // Enhance network error messaging for Expo/native runtime
    console.error(`API call to ${endpoint} failed:`, error);
    if (error && error.message && error.message.includes('Network request failed')) {
      const help = `Network request failed when calling ${BASE_URL}${endpoint}.\n` +
        `If you're running the app on an Android emulator use 10.0.2.2 in BASE_URL.\n` +
        `If you're on a physical device, set BASE_URL to your PC's LAN IP (e.g. http://192.168.1.55:8000) and ensure firewall allows port 8000.`;
      console.error(help);
      // Throw a helpful error so the UI shows it
      throw new Error(help);
    }
    // Re-throw other errors unchanged
    throw error;
  }
};


// --- Patient and Encounter Functions ---

/**
 * Gets the list of patients from the backend.
 * Called from PatientListScreen.
 * ASSUMPTION: This is the correct endpoint, please verify with your friend.
 */
export const getPatients = (token) => {
  return fetchWithToken('/api/v1/patients/', token);
};

/**
 * Registers a new patient (Step 1 of 3).
 * Called from RegisterScreen.
 */
export const registerPatient = (patientData, token) => {
  // Calls your friend's: POST /api/v1/patients/register
  return fetchWithToken('/api/v1/patients/register', token, {
    method: 'POST',
    body: JSON.stringify(patientData),
  });
};

/**
 * Creates a new encounter (Step 2 of 3).
 * Called from RegisterScreen.
 */
export const createEncounter = (encounterData, token) => {
  // Calls your friend's: POST /api/v1/encounters/
  return fetchWithToken('/api/v1/encounters/', token, {
    method: 'POST',
    body: JSON.stringify(encounterData),
  });
};

/**
 * Updates an encounter, e.g., to "admitted" (Step 3 of 3).
 * Called from RegisterScreen.
 */
export const updateEncounter = (encounterId, patchData, token) => {
  // Calls your friend's: PATCH /api/v1/encounters/{encounter_id}
  return fetchWithToken(`/api/v1/encounters/${encounterId}`, token, {
    method: 'PATCH',
    body: JSON.stringify(patchData),
  });
};

// --- Admin Functions ---

/**
 * [ADMIN] Creates a new Doctor/Nurse user.
 * Called from AdminScreen (specifically, the CreateUserForm component).
 */
export const apiAdminCreateUser = (userData, token) => {
  // userData = { username, password, role, full_name } // Verify exact fields with backend
  // Calls your friend's: POST /api/v1/admin/users
  return fetchWithToken('/api/v1/admin/users', token, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

/**
 * [ADMIN] Gets the list of all users.
 * Called from AdminScreen.
 */
export const apiAdminGetUserList = (token) => {
  // Calls your friend's: GET /api/v1/admin/users
  return fetchWithToken('/api/v1/admin/users', token);
};


// --- Audio Recording Service Logic ---

// Streaming implementation (chunked-record-and-send) using expo-av + expo-file-system
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

let _ws = null;
let _recording = null;
let _segmentInterval = null;
let _isStreaming = false;

// Helper: basic base64 check
function isBase64(str) {
  return typeof str === 'string' && str.length > 0;
}

/**
 * Requests microphone permissions from the user and prepares audio mode.
 */
export const requestAudioPermissions = async () => {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    if (status === 'granted') {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      return true;
    }
    Alert.alert('Permission Required', 'Microphone access is needed for handoff recording.');
    return false;
  } catch (err) {
    console.error('Failed to request permissions', err);
    Alert.alert('Error', 'Could not request microphone permissions.');
    return false;
  }
};

/**
 * Start streaming audio by repeatedly recording short segments and sending them as base64 text frames.
 * Works in managed Expo and avoids relying on atob/btoa.
 */
export const startStreamingAudio = async (patientId, token, onMessageReceived = () => {}) => {
  if (_isStreaming) return true;
  try {
    const sessionId = `sess-${Date.now()}`;
    // Use dictation endpoint in backend (ws/dictation)
    const wsUrl = `${BASE_URL.replace('http', 'ws')}/ws/dictation/${sessionId}?encounter_id=${patientId}&token=${token}`;
    console.log('Opening WS:', wsUrl);
    _ws = new WebSocket(wsUrl);

    _ws.onopen = () => console.log('Streaming WS open');
    _ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        onMessageReceived(data);
      } catch (e) {
        // Not JSON (could be binary or plain text) — ignore for now
      }
    };
    _ws.onerror = (e) => console.error('WS error', e.message || e);
    _ws.onclose = () => console.log('WS closed');

    // Start first recording segment
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

    const startSegment = async () => {
      _recording = new Audio.Recording();
      await _recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await _recording.startAsync();
    };

    const stopAndSendSegment = async () => {
      if (!_recording) return;
      try {
        await _recording.stopAndUnloadAsync();
      } catch (e) {
        // ignore
      }
      const uri = _recording.getURI();
      _recording = null;
      if (!uri) return;
      try {
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        // Send as plain base64 text frame. Backend will decode.
        if (_ws && _ws.readyState === 1 && isBase64(base64)) {
          _ws.send(base64);
        }
      } catch (e) {
        console.error('Failed to read/send audio segment', e);
      } finally {
        // cleanup temporary file
        try { await FileSystem.deleteAsync(uri); } catch (e) {}
      }
      // start next segment
      try { await startSegment(); } catch (e) { console.error('Failed to start next segment', e); }
    };

    await startSegment();
    // Send segments every 1800ms (approx 1.6-1.8s per chunk)
    _segmentInterval = setInterval(stopAndSendSegment, 1800);
    _isStreaming = true;
    return true;
  } catch (err) {
    console.error('startStreamingAudio error', err);
    return false;
  }
};

export const stopStreamingAudio = async () => {
  if (!_isStreaming) return;
  if (_segmentInterval) {
    clearInterval(_segmentInterval);
    _segmentInterval = null;
  }
  try {
    if (_recording) {
      try { await _recording.stopAndUnloadAsync(); } catch (e) {}
      const uri = _recording.getURI();
      _recording = null;
      if (uri) {
        try {
          const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
          if (_ws && _ws.readyState === 1 && isBase64(base64)) {
            _ws.send(base64);
          }
        } catch (e) {
          console.error('Failed to send final audio chunk', e);
        }
        try { await FileSystem.deleteAsync(uri); } catch (e) {}
      }
    }
  } catch (err) {
    console.error('Error during stopStreamingAudio', err);
  }
  // Close ws
  try { if (_ws) _ws.close(); } catch (e) {}
  _ws = null;
  _isStreaming = false;
  try { await Audio.setAudioModeAsync({ allowsRecordingIOS: false }); } catch (e) {}
};

/**
 * Upload a recorded audio file (local URI) to the backend REST upload endpoint.
 * fileUri: local file URI returned by expo-av Recording.getURI()
 * encounterId: encounter id integer
 * token: bearer token
 */
export const uploadDictationFile = async (fileUri, encounterId, token) => {
  if (MOCK) {
    // In mock mode we don't have a server endpoint; return a fake response
    return { status: 'ok', transcript: 'Mock transcript (upload)', note_id: null };
  }

  try {
    const url = `${BASE_URL}/api/v1/dictation/upload?encounter_id=${encodeURIComponent(encounterId)}`;
    const form = new FormData();
    // Derive filename and mime type conservatively
    const filename = fileUri.split('/').pop() || 'recording.m4a';
    const fileType = filename.endsWith('.wav') ? 'audio/wav' : 'audio/m4a';
    form.append('file', { uri: fileUri, name: filename, type: fileType });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Note: Do NOT set Content-Type; fetch will set multipart boundary automatically
      },
      body: form,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || JSON.stringify(data));
    return data;
  } catch (err) {
    console.error('uploadDictationFile error', err);
    throw err;
  }
};


// --- Placeholder Functions for Future APIs ---
// These are the APIs we need to ask your friend to build for the Patient Hub tabs.

export const getDashboardTasks = (token) => {
  console.log('TODO: Call GET /api/v1/dashboard/tasks');
  return Promise.resolve([]); // Return empty for now
};

export const getPatientSummary = (patientId, token) => {
  console.log(`TODO: Call GET /api/v1/patients/${patientId}/summary`);
  return Promise.resolve({}); // Return empty for now
};

export const getPatientNotes = (patientId, token) => {
  console.log(`TODO: Call GET /api/v1/patients/${patientId}/notes`);
  return Promise.resolve([]); // Return empty for now
};

export const getPatientTasks = (patientId, token) => {
  console.log(`TODO: Call GET /api/v1/patients/${patientId}/tasks`);
  return Promise.resolve([]); // Return empty for now
};

export const getPatientMeds = (patientId, token) => {
  console.log(`TODO: Call GET /api/v1/patients/${patientId}/meds`);
  return Promise.resolve([]); // Return empty for now
};

export const getPatientHistory = (patientId, token) => {
  console.log(`TODO: Call GET /api/v1/patients/${patientId}/history`);
  return Promise.resolve([]); // Return empty for now
};

