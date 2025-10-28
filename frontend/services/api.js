import { Alert } from 'react-native';

//
// --- THIS IS THE ONLY LINE YOU WILL EVER CHANGE ---
//
// FOR YOUR "SYNC TEST" (running your friend's backend on your laptop):
const BASE_URL = 'http://127.0.0.1:8000'; // 127.0.0.1 means "this machine"

// FOR DEVELOPMENT (testing with your friend over Wi-Fi):
// Ask him for his Local IP:
// const BASE_URL = 'http://192.168.1.5:8000';
//
// ----------------------------------------------------

/**
 * The main login function.
 * This is called by AuthContext.
 */
export const apiLogin = async (username, password) => {
  console.log('Attempting login with:', username);

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

  try {
    // Calls your friend's: POST /api/v1/register
    const response = await fetch(`${BASE_URL}/api/v1/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to register');
    }

    return data; // Return the new user object
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
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    Authorization: `Bearer ${token}`, // <-- This is the JWT keycard!
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
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
    console.error(`API call to ${endpoint} failed:`, error);
    // Re-throw the error so the calling screen can handle it
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

import { Audio } from 'expo-av';

let recording = null; // Variable to hold the recording object

/**
 * Requests microphone permissions from the user.
 * Returns true if granted, false otherwise.
 */
export const requestAudioPermissions = async () => {
  console.log('Requesting microphone permissions...');
  try {
    const { status } = await Audio.requestPermissionsAsync();
    if (status === 'granted') {
      console.log('Permission granted!');
      // Set audio mode for iOS (important for recording)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true, // Optional, depending on needs
      });
      return true;
    } else {
      console.log('Permission denied!');
      Alert.alert(
        'Permission Required',
        'Microphone access is needed for handoff recording.'
      );
      return false;
    }
  } catch (err) {
    console.error('Failed to request permissions', err);
    Alert.alert('Error', 'Could not request microphone permissions.');
    return false;
  }
};

/**
 * Starts the audio recording and WebSocket connection (Placeholder).
 * Returns true if successful, false otherwise.
 * 'onMessageReceived' is a callback function from RecordingScreen
 * to handle messages from the WebSocket.
 */
export const startStreamingAudio = async (patientId, token, onMessageReceived) => {
  if (recording) {
    console.log('Recording already in progress.');
    return false;
  }

  console.log(`Starting audio stream for patient ${patientId}...`);
  try {
    // --- 1. Prepare Audio Recording ---
    await Audio.setAudioModeAsync({ // Ensure recording is allowed
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
    });

    recording = new Audio.Recording();

    // !! IMPORTANT !!
    // We NEED the correct settings from the backend here.
    // These are common defaults, but might be wrong.
    // Ask your friend for: sampleRate, numberOfChannels, bitRate, encoding.
    await recording.prepareToRecordAsync(
       Audio.RecordingOptionsPresets.LOW_QUALITY // Placeholder preset
       // Or specify detailed settings:
       /* {
            android: {
                extension: '.wav', // Or '.m4a', '.amr_wb' etc.
                outputFormat: Audio.AndroidOutputFormat.DEFAULT, // Confirm format
                audioEncoder: Audio.AndroidAudioEncoder.DEFAULT, // Confirm encoder
                sampleRate: 16000, // Example: 16kHz - CONFIRM
                numberOfChannels: 1, // Mono - CONFIRM
                bitRate: 128000, // CONFIRM
            },
            ios: {
                extension: '.wav', // Or '.m4a', '.caf' etc.
                outputFormat: Audio.IOSOutputFormat.LINEARPCM, // Confirm format
                audioQuality: Audio.IOSAudioQuality.LOW, // Placeholder
                sampleRate: 16000, // CONFIRM
                numberOfChannels: 1, // CONFIRM
                bitRate: 128000, // CONFIRM
                linearPCMBitDepth: 16, // Example: 16-bit PCM - CONFIRM
                linearPCMIsBigEndian: false, // CONFIRM
                linearPCMIsFloat: false, // CONFIRM
            },
            web: {} // Add web config if needed
       } */
    );

    // --- 2. Connect to WebSocket (Placeholder) ---
    // Ask your friend for the EXACT WebSocket URL format
    const websocketUrl = `${BASE_URL.replace('http', 'ws')}/ws/handoff/${patientId}`; // Guessing the WS URL
    console.log('Connecting to WebSocket:', websocketUrl);
    // let ws = new WebSocket(websocketUrl); // We'll uncomment and use this later

    // ws.onopen = () => {
    //   console.log('WebSocket Connected!');
    //   // Ask friend: How should I authenticate? Send token immediately?
    //   // ws.send(JSON.stringify({ type: 'auth', token: token }));
    // };

    // ws.onmessage = (event) => {
    //   console.log('Message from server:', event.data);
    //   try {
    //      const message = JSON.parse(event.data);
    //      // Pass the parsed message back to the RecordingScreen's callback
    //      onMessageReceived(message);
    //   } catch (e) {
    //      console.error("Failed to parse WebSocket message:", e);
    //   }
    // };

    // ws.onerror = (e) => console.error('WebSocket Error:', e.message);
    // ws.onclose = (e) => console.log('WebSocket Closed!', e.code, e.reason);

    // --- 3. Start Recording & Streaming (Placeholder) ---
    // This part requires careful setup based on backend requirements.
    // We might need to use recording.setOnRecordingStatusUpdate to get audio chunks
    // or potentially use a different library if expo-av doesn't provide easy streaming.
    await recording.startAsync();
    console.log('Recording started! (Streaming logic still needs implementation)');

    // Placeholder: Send audio chunks
    /* recording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording) {
            // How to get the raw audio data chunk from 'status'?
            // This is the missing piece for expo-av streaming.
            // If we get 'chunk':
            // if (ws && ws.readyState === WebSocket.OPEN) {
            //    ws.send(chunk); // Send raw binary data
            // }
        }
    }); */

    return true; // Indicate success (for now)

  } catch (err) {
    console.error('Failed to start recording', err);
    Alert.alert('Error', `Could not start recording: ${err.message}`);
    recording = null; // Reset recording object
    return false;
  }
};

/**
 * Stops the audio recording and closes the WebSocket (Placeholder).
 */
export const stopStreamingAudio = async () => {
  if (!recording) {
    console.log('No recording in progress.');
    return;
  }

  console.log('Stopping audio stream...');
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('Recording stopped. File saved (temporarily) at:', uri);
    // Note: For streaming, we might not need the final file URI.

    // --- Close WebSocket (Placeholder) ---
    // Ask friend: How should I signal the end of the stream?
    // if (ws) {
    //   ws.send(JSON.stringify({ type: 'END_STREAM_CMD' })); // Example end signal
    //   ws.close();
    // }

  } catch (err) {
    console.error('Failed to stop recording', err);
    // Handle error appropriately
  } finally {
    recording = null; // Clear the recording object
    // ws = null; // Clear WebSocket object
    // Reset audio mode to allow playback etc.
    await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
    });
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

