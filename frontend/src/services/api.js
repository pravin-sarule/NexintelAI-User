// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthToken() {
    return localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const config = {
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ========================
  // ✅ Auth APIs (Optional)
  // ========================
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    // Clear token and user data from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Dispatch event to notify other components about user update
    window.dispatchEvent(new Event('userUpdated'));
    // No API call is made as per user's request
    return { message: "Logged out successfully locally" };
  }

  // ========================
  // ✅ Template APIs
  // ========================
  async getTemplates() {
    return this.request('/draft'); // GET /api/draft
  }

  async getUserTemplates() {
    return this.request('/draft/user'); // GET /api/draft/user
  }

  async getTemplateById(id) {
    return this.request(`/draft/${id}`); // GET /api/draft/:id
  }

  async openTemplateForEditing(templateId) {
    return this.request(`/draft/${templateId}/html`); // GET /api/draft/:id/html
  }

  async saveUserDraft(templateId, name, file) {
    const token = this.getAuthToken();
    const formData = new FormData();
    formData.append('templateId', templateId);
    formData.append('name', name);
    formData.append('file', file);

    const url = `${this.baseURL}/draft`; // Corrected URL

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async exportUserDraft(draftId) {
    return this.request(`/draft/${draftId}/export`); // GET /api/draft/:id/export
  }

  async addHtmlTemplate(templateData) {
    return this.request('/draft/admin/html', { // Corrected URL
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  }

  // ========================
  // ✅ Document APIs (Optional)
  // ========================
  async saveDocument(documentData) {
    return this.request('/doc/save', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  }

  async getDocuments() {
    return this.request('/doc');
  }

  async getDocument(documentId) {
    return this.request(`/doc/${documentId}`);
  }

  // ========================
  // ✅ Subscription Plans APIs
  // ========================
  async getPublicPlans() {
    return this.request(`/plans`);
  }

  async startSubscription(plan_id) {
    return this.request('/payments/subscription/start', {
      method: 'POST',
      body: JSON.stringify({ plan_id }),
    });
  }

  async verifySubscription(paymentData) {
    return this.request('/payments/subscription/verify', {
      method: 'POST',
      body: JSON.stringify(paymentData), // Send as JSON
    });
  }

  async getPaymentPlans() {
    return this.request(`/payments/plans`);
  }

  // ========================
  // ✅ Chat APIs
  // ========================
  async fetchFileChatHistory(fileId) {
    return this.request(`/chat/${fileId}`);
  }

  async continueFileChat(fileId, question, sessionId) {
    return this.request(`/doc/chat`, { // Assuming /doc/chat is the endpoint for continuing chat
      method: 'POST',
      body: JSON.stringify({ file_id: fileId, question, session_id: sessionId }),
    });
  }
}

export default new ApiService();
