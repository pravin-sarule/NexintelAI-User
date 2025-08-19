import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Templates from './Templates'; // Import the Templates component

const TemplateSelector = ({ onSelectTemplate, selectedTemplateId, showToast }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = 'https://nexintelai-user.onrender.com/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const apiCall = async (url, options = {}) => {
    try {
      const defaultOptions = {
        credentials: 'include',
        headers: getAuthHeaders(),
        ...options
      };

      if (options.body instanceof FormData) {
        const { 'Content-Type': _, ...headersWithoutContentType } = defaultOptions.headers;
        defaultOptions.headers = headersWithoutContentType;
      }

      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      throw error;
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await apiCall(`${API_BASE}/draft`);
      setTemplates(Array.isArray(data) ? data : []);
      showToast('Templates loaded successfully', 'success');
    } catch (error) {
      console.error('API Error fetching templates:', error);
      showToast(error.message || 'Error loading templates', 'error');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-800 mb-3">Available Templates</h3>
      {loading ? (
        <div className="flex items-center justify-center py-4 col-span-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        </div>
      ) : templates.length > 0 ? (
        <Templates templates={templates} onSelectTemplate={onSelectTemplate} selectedTemplateId={selectedTemplateId} />
      ) : (
        <p className="text-sm text-gray-500 text-center py-4 col-span-2">
          No templates available
        </p>
      )}
    </div>
  );
};

export default TemplateSelector;