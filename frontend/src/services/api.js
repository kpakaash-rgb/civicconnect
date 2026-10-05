let activeBaseUrl =
  import.meta.env.VITE_API_URL || 'http://localhost:8001';

/**
 * Helper to execute JSON fetch requests with error handling and automatic port fallback
 */
async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Build candidate backend URLs
  const candidateUrls = [
    activeBaseUrl,
    'http://localhost:8001',
    'http://127.0.0.1:8001',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
  ];
  const uniqueBases = Array.from(new Set(candidateUrls.filter(Boolean)));

  let lastError = null;

  for (const baseUrl of uniqueBases) {
    const url = `${baseUrl}${endpoint}`;
    try {
      const res = await fetch(url, config);
      if (!res.ok) {
        let errorMsg = `Server error (${res.status})`;
        try {
          const errJson = await res.json();
          if (Array.isArray(errJson.detail)) {
            errorMsg = errJson.detail.map((d) => `${d.loc?.slice(-1)[0] || 'field'}: ${d.msg}`).join(', ');
          } else {
            errorMsg = errJson.detail || errJson.message || errorMsg;
          }
        } catch {}
        throw new Error(errorMsg);
      }
      // Remember the working base URL
      activeBaseUrl = baseUrl;
      return await res.json();
    } catch (err) {
      lastError = err;
      // If server actually responded with HTTP error (e.g. 400, 404, 422), don't hop ports
      if (err.message.startsWith('Server error') || err.message.includes('not found') || err.message.includes('valid')) {
        throw err;
      }
      // Otherwise connection refused on this port, try next candidate
    }
  }

  throw lastError || new Error('Unable to connect to CivicConnect API server');
}

/**
 * Retrieve all civic issues with optional filters
 */
export async function getIssues(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
  if (filters.priority && filters.priority !== 'ALL') params.append('priority', filters.priority);
  if (filters.category && filters.category !== 'all' && filters.category !== 'ALL') params.append('category', filters.category);
  if (filters.ward && filters.ward !== 'ALL') params.append('ward', filters.ward);
  if (filters.search && filters.search.trim()) params.append('search', filters.search.trim());

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return await request(`/api/issues${queryString}`);
}

/**
 * Retrieve a single civic issue by its ID
 */
export async function getIssue(id) {
  return await request(`/api/issues/${id}`);
}

/**
 * Submit a new citizen issue report
 */
export async function createIssue(data) {
  return await request('/api/issues', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update workflow status of an issue (Authority action)
 */
export async function updateIssueStatus(id, status, remarks = '') {
  return await request(`/api/issues/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({
      status,
      remarks,
      updated_by: 'Municipal Authority',
    }),
  });
}

/**
 * Retrieve all reports submitted by a specific citizen
 */
export async function getUserIssues(userId) {
  return await request(`/api/users/${userId}/issues`);
}

/**
 * Simple demo login endpoint
 */
export async function login(email, password = '') {
  return await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Register a new citizen account
 */
export async function register(userData) {
  return await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

/**
 * Retrieve public user profile by ID
 */
export async function getUserProfile(userId) {
  return await request(`/api/users/${userId}`);
}

