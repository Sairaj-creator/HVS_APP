import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'HVS_MOCK_DB_v1';

const defaultDb = {
  nextIds: {
    user: 2,
    patient: 1,
    encounter: 1,
    task: 1,
  },
  users: [
    {
      id: 1,
      username: 'admin@hospital.com',
      password: 'adminpass',
      role: 'admin',
      full_name: 'Local Admin',
    },
  ],
  patients: [],
  encounters: [],
  tasks: [],
};

async function readDb() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDb));
    return JSON.parse(JSON.stringify(defaultDb));
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    // If corrupted, reset
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDb));
    return JSON.parse(JSON.stringify(defaultDb));
  }
}

async function writeDb(db) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function makeTokenForUser(user) {
  return `mock-token-${user.id}`;
}

function userIdFromToken(token) {
  if (!token || typeof token !== 'string') return null;
  const m = token.match(/^mock-token-(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}

export async function initMockDb() {
  await readDb();
}

export async function signInMock(username, password) {
  const db = await readDb();
  const user = db.users.find((u) => u.username === username && u.password === password);
  if (!user) return null;
  return makeTokenForUser(user);
}

export async function getUserFromToken(token) {
  const db = await readDb();
  const id = userIdFromToken(token);
  if (!id) return null;
  const user = db.users.find((u) => u.id === id);
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

/**
 * Seed the mock DB with sample patients, encounters and tasks for UI testing.
 * Returns the updated DB.
 */
export async function seedSampleData() {
  const db = await readDb();

  // Add sample patients if none exist
  if (db.patients.length === 0) {
    const p1 = { id: db.nextIds.patient++, name: 'John Doe', age: 45, mrn: 'MRN001', notes: 'Diabetic' };
    const p2 = { id: db.nextIds.patient++, name: 'Jane Smith', age: 32, mrn: 'MRN002', notes: 'Asthma' };
    db.patients.push(p1, p2);
  }

  // Add sample encounters if none exist
  if (db.encounters.length === 0) {
    const e1 = { id: db.nextIds.encounter++, patient_id: db.patients[0].id, status: 'admitted', reason: 'Chest pain' };
    const e2 = { id: db.nextIds.encounter++, patient_id: db.patients[1].id, status: 'discharged', reason: 'Routine follow-up' };
    db.encounters.push(e1, e2);
  }

  // Add a sample task
  if (db.tasks.length === 0) {
    const t1 = { id: db.nextIds.task++, patient_id: db.patients[0].id, title: 'Check blood sugar', completed: false };
    db.tasks.push(t1);
  }

  await writeDb(db);
  return db;
}

/**
 * Reset mock DB to the default seeded state (removes any created data).
 */
export async function resetMockDb() {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDb));
  return JSON.parse(JSON.stringify(defaultDb));
}

export async function registerMockUser(userData) {
  const db = await readDb();
  // Ensure unique username
  if (db.users.some((u) => u.username === userData.username)) {
    const err = new Error('User already exists');
    err.status = 400;
    throw err;
  }

  const id = db.nextIds.user++;
  const newUser = {
    id,
    username: userData.username,
    password: userData.password || 'changeme',
    role: userData.role || 'doctor',
    full_name: userData.full_name || userData.username,
  };
  db.users.push(newUser);
  await writeDb(db);
  return newUser;
}

export async function adminCreateUserMock(userData, token) {
  const db = await readDb();
  const userId = userIdFromToken(token);
  const admin = db.users.find((u) => u.id === userId && u.role === 'admin');
  if (!admin) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  // Reuse register logic (ensures unique username)
  return registerMockUser(userData);
}

export async function adminListUsersMock(token) {
  const db = await readDb();
  const userId = userIdFromToken(token);
  const admin = db.users.find((u) => u.id === userId && u.role === 'admin');
  if (!admin) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  // Return users without passwords
  return db.users.map(({ password, ...rest }) => rest);
}

export async function getPatientsMock(token) {
  const db = await readDb();
  return db.patients;
}

export async function registerPatientMock(patientData, token) {
  const db = await readDb();
  const id = db.nextIds.patient++;
  const patient = { id, ...patientData };
  db.patients.push(patient);
  await writeDb(db);
  return patient;
}

export async function createEncounterMock(encounterData, token) {
  const db = await readDb();
  const id = db.nextIds.encounter++;
  const encounter = { id, ...encounterData };
  db.encounters.push(encounter);
  await writeDb(db);
  return encounter;
}

export async function updateEncounterMock(encounterId, patchData, token) {
  const db = await readDb();
  const idx = db.encounters.findIndex((e) => `${e.id}` === `${encounterId}`);
  if (idx === -1) {
    const err = new Error('Not found');
    err.status = 404;
    throw err;
  }
  db.encounters[idx] = { ...db.encounters[idx], ...patchData };
  await writeDb(db);
  return db.encounters[idx];
}

// A general-purpose mock fetch that mirrors the API endpoints used by the app.
export async function mockFetch(endpoint, token, options = {}) {
  // Normalize endpoint (strip trailing slash)
  const path = endpoint.replace(/\/+$/, '');
  const method = (options.method || 'GET').toUpperCase();

  // Simple routing based on path
  if (path === '/api/v1/patients' && method === 'GET') {
    return getPatientsMock(token);
  }

  if (path === '/api/v1/patients/register' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body) : {};
    return registerPatientMock(body, token);
  }

  if (path === '/api/v1/encounters' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body) : {};
    return createEncounterMock(body, token);
  }

  if (path.startsWith('/api/v1/encounters/') && method === 'PATCH') {
    const parts = path.split('/');
    const encounterId = parts[parts.length - 1];
    const body = options.body ? JSON.parse(options.body) : {};
    return updateEncounterMock(encounterId, body, token);
  }

  if (path === '/api/v1/admin/users' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body) : {};
    return adminCreateUserMock(body, token);
  }

  if (path === '/api/v1/admin/users' && method === 'GET') {
    return adminListUsersMock(token);
  }

  // Auth endpoints
  if (path === '/api/v1/login/token' && method === 'POST') {
    // options.body may be urlencoded string
    const raw = options.body || '';
    const params = new URLSearchParams(raw);
    const username = params.get('username');
    const password = params.get('password');
    const token = await signInMock(username, password);
    if (!token) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }
    return { access_token: token, token_type: 'bearer' };
  }

  if (path === '/api/v1/register' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body) : {};
    return registerMockUser(body);
  }

  // Dashboard / other endpoints: return sensible defaults
  if (path === '/api/v1/dashboard/tasks' && method === 'GET') {
    const db = await readDb();
    return db.tasks;
  }

  // If unknown, throw a 404-like error
  const err = new Error(`Mock: endpoint not implemented: ${method} ${path}`);
  err.status = 404;
  throw err;
}

export default {
  initMockDb,
  signInMock,
  registerMockUser,
  adminCreateUserMock,
  adminListUsersMock,
  getPatientsMock,
  registerPatientMock,
  createEncounterMock,
  updateEncounterMock,
  mockFetch,
};
