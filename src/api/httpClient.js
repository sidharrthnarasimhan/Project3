/**
 * HTTP Client for Startup OS Backend API
 * Replaces the mock localStorage-based client
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Get auth token from Clerk
 * This should be replaced with actual Clerk integration
 */
async function getAuthToken() {
  // TODO: Integrate with Clerk to get real token
  // For now, return placeholder for development
  const token = localStorage.getItem('dev_auth_token');
  return token;
}

/**
 * Make HTTP request with authentication
 */
async function request(endpoint, options = {}) {
  const token = await getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Handle errors
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText
    }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  const data = await response.json();
  return data.data || data; // Extract data from success response
}

/**
 * Generic Entity class for HTTP-based CRUD operations
 */
class HttpEntity {
  constructor(entityName, orgIdRequired = true) {
    this.entityName = entityName;
    this.orgIdRequired = orgIdRequired;
  }

  getOrgId() {
    // Get current organization ID from localStorage or context
    const orgId = localStorage.getItem('current_org_id');
    if (this.orgIdRequired && !orgId) {
      throw new Error('Organization context required');
    }
    return orgId;
  }

  getBasePath() {
    if (this.orgIdRequired) {
      const orgId = this.getOrgId();
      return `/orgs/${orgId}/${this.entityName}`;
    }
    return `/${this.entityName}`;
  }

  async list(sortBy = '-created_at') {
    const params = new URLSearchParams({ sortBy });
    return request(`${this.getBasePath()}?${params}`);
  }

  async get(id) {
    return request(`${this.getBasePath()}/${id}`);
  }

  async create(data) {
    return request(this.getBasePath(), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id, data) {
    return request(`${this.getBasePath()}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id) {
    return request(`${this.getBasePath()}/${id}`, {
      method: 'DELETE',
    });
  }
}

/**
 * Auth methods
 */
const auth = {
  async me() {
    // TODO: Implement with Clerk
    // For now, return mock user from localStorage
    const user = JSON.parse(localStorage.getItem('current_user') || 'null');
    if (!user) {
      throw new Error('Not authenticated');
    }
    return user;
  },

  async logout() {
    // Clear local storage and reload
    localStorage.removeItem('current_user');
    localStorage.removeItem('current_org_id');
    localStorage.removeItem('dev_auth_token');
    window.location.reload();
  },

  hasPageAccess(pageName) {
    // TODO: Implement with real permissions
    return true;
  },

  async updatePagePermissions(pageName, allowedRoles) {
    // TODO: Implement
    return { success: true };
  },

  async getPagePermissions() {
    // TODO: Implement
    return {};
  },
};

/**
 * Create entity instances
 */
const Task = new HttpEntity('tasks');
const Decision = new HttpEntity('decisions');
const Announcement = new HttpEntity('announcements');
const LeaveRequest = new HttpEntity('leave-requests');
const Comment = new HttpEntity('comments');
const UserEntity = new HttpEntity('users', false);
const Holiday = new HttpEntity('holidays');
const TimeEntry = new HttpEntity('time-entries');
const BillingTool = new HttpEntity('billing-tools');
const Milestone = new HttpEntity('milestones');
const Space = new HttpEntity('spaces');

/**
 * Organizations - special handling
 */
const Organization = {
  async list() {
    return request('/orgs');
  },

  async get(orgId) {
    return request(`/orgs/${orgId}`);
  },

  async create(data) {
    return request('/orgs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(orgId, data) {
    return request(`/orgs/${orgId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getMembers(orgId) {
    return request(`/orgs/${orgId}/members`);
  },

  async updateMemberRole(orgId, userId, role) {
    return request(`/orgs/${orgId}/members/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },
};

/**
 * Mock integrations (for compatibility)
 */
const integrations = {
  Core: {
    InvokeLLM: () => Promise.resolve({ text: 'Mock LLM response' }),
    SendEmail: (data) => {
      console.log('Mock email sent:', data);
      return Promise.resolve({ success: true });
    },
    UploadFile: () => Promise.resolve({ url: 'mock-file-url' }),
    GenerateImage: () => Promise.resolve({ url: 'mock-image-url' }),
    ExtractDataFromUploadedFile: () => Promise.resolve({ data: {} }),
    CreateFileSignedUrl: () => Promise.resolve({ url: 'mock-signed-url' }),
    UploadPrivateFile: () => Promise.resolve({ url: 'mock-private-file-url' }),
  },
};

/**
 * Export HTTP client
 */
export const httpClient = {
  auth,
  entities: {
    Task,
    Decision,
    Announcement,
    LeaveRequest,
    Comment,
    User: UserEntity,
    Holiday,
    TimeEntry,
    BillingTool,
    Milestone,
    Space,
    Organization,
  },
  integrations,
};
