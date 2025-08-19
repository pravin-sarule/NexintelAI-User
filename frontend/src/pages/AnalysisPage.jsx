
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom'; // Import useLocation and useParams
import {
  Search,
  Send,
  FileText,
  Edit3,
  Layers,
  Minus,
  Plus,
  Trash2,
  RotateCcw,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Clock,
  Scale,
  Loader2,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  Eye,
  Quote,
  BookOpen,
  Gavel,
  ChevronDown,
  Paperclip,
  MessageSquare,
  FileCheck
} from 'lucide-react';

const AnalysisPage = () => {
  const location = useLocation(); // Initialize useLocation
  const { fileId: paramFileId, sessionId: paramSessionId } = useParams(); // Get fileId and sessionId from URL
  
  // State Management
  const [activeDropdown, setActiveDropdown] = useState('Summary');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasResponse, setHasResponse] = useState(false);
  
  // Document and Analysis Data
  const [documentData, setDocumentData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [caseSummary, setCaseSummary] = useState(null);
  const [legalGrounds, setLegalGrounds] = useState([]);
  const [citations, setCitations] = useState([]);
  const [keyIssues, setKeyIssues] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [fileId, setFileId] = useState(paramFileId || null); // Initialize with paramFileId
  const [sessionId, setSessionId] = useState(paramSessionId || null); // Initialize with paramSessionId
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [currentResponse, setCurrentResponse] = useState(null);
  const [animatedResponseContent, setAnimatedResponseContent] = useState('');
  const [isAnimatingResponse, setIsAnimatingResponse] = useState(false);
  const [chatInput, setChatInput] = useState(''); // New state for chat input

  // Refs
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // API Configuration
  const API_BASE_URL = 'https://nexintelai-user.onrender.com/api';
  
  // Get auth token with comprehensive fallback options
  const getAuthToken = () => {
    const tokenKeys = [
      'authToken', 'token', 'accessToken', 'jwt', 'bearerToken',
      'auth_token', 'access_token', 'api_token', 'userToken'
    ];
    
    // Check localStorage first
    for (const key of tokenKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        console.log(`Token found in localStorage with key: ${key}`);
        return token;
      }
    }
    
    console.log('No authentication token found');
    return null;
  };

  // API request helper with comprehensive error handling
  const apiRequest = async (url, options = {}) => {
    try {
      const token = getAuthToken();
      const defaultHeaders = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token exists
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }

      // Don't set Content-Type for FormData
      const headers = options.body instanceof FormData 
        ? (token ? { 'Authorization': `Bearer ${token}` } : {})
        : { ...defaultHeaders, ...options.headers };

      console.log(`Making API request to: ${API_BASE_URL}${url}`);
      console.log('Request headers:', headers);

      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('Error response data:', errorData);
        } catch {
          errorData = { error: `HTTP error! status: ${response.status}` };
        }
        
        // Handle specific HTTP status codes
        switch (response.status) {
          case 401:
            throw new Error('Authentication required. Please log in again.');
          case 403:
            throw new Error('Access denied. You don\'t have permission to perform this action.');
          case 404:
            throw new Error('Resource not found. The requested endpoint may not exist.');
          case 413:
            throw new Error('File too large. Please upload a smaller file.');
          case 415:
            throw new Error('Unsupported file type. Please upload a PDF, DOC, DOCX, or TXT file.');
          case 429:
            throw new Error('Too many requests. Please wait a moment and try again.');
          case 500:
          case 502:
          case 503:
          case 504:
            throw new Error('Server error. Please try again later.');
          default:
            throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
        }
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Response data:', data);
        return data;
      }
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };

  // File upload API call with progress tracking
  const uploadDocument = async (file) => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

      // Create XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
            console.log(`Upload progress: ${progress}%`);
          }
        };

        xhr.onload = () => {
          console.log('Upload response status:', xhr.status);
          console.log('Upload response:', xhr.responseText);
          
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              const documentId = data.file_id || data.document_id || data.id;
              
              if (!documentId) {
                throw new Error('No document ID returned from server');
              }

              setFileId(documentId);
              setDocumentData({
                id: documentId,
                title: file.name,
                originalName: file.name,
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString(),
                status: 'uploaded',
                content: data.html_content || data.content || 'Document uploaded. Processing...'
              });
              
              if (data.html_content || data.content) {
                setEditedContent(data.html_content || data.content);
              }
              
              setSuccess('Document uploaded successfully! Processing started...');
              
              // Start polling for processing status if the API supports it
              if (data.file_id) {
                startProcessingStatusPolling(data.file_id);
              } else {
                // If no processing status polling, mark as processed
                setProcessingStatus({ status: 'processed' });
              }
              
              resolve(data);
            } catch (error) {
              console.error('Failed to parse server response:', error);
              reject(new Error('Failed to parse server response. Please try again.'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              console.error('Upload error response:', errorData);
              reject(new Error(errorData.error || errorData.message || `Upload failed with status ${xhr.status}`));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}. Please check your connection and try again.`));
            }
          }
        };

        xhr.onerror = () => {
          console.error('Network error during upload');
          reject(new Error('Network error occurred during upload. Please check your internet connection.'));
        };

        xhr.ontimeout = () => {
          console.error('Upload timeout');
          reject(new Error('Upload timeout. The file may be too large or connection is slow.'));
        };

        const token = getAuthToken();
        console.log('Using API endpoint:', `${API_BASE_URL}/doc/upload`);
        console.log('Token available:', !!token);
        
        xhr.open('POST', `${API_BASE_URL}/doc/upload`);
        
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        } else {
          console.warn('No authentication token found - proceeding without auth');
        }
        
        xhr.timeout = 300000; // 5 minute timeout
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Upload error:', error);
      setError(`Upload failed: ${error.message}`);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Get processing status with better error handling
  const getProcessingStatus = async (file_id) => {
    try {
      const data = await apiRequest(`/doc/status/${file_id}`);
      setProcessingStatus(data);
      
      // Update document data with status
      if (data.status === 'processed') {
        setDocumentData(prev => ({
          ...prev,
          status: 'processed',
          content: prev.content || 'Document processed successfully. Generate AI insights to view detailed analysis.'
        }));
      } else if (data.status === 'error') {
        setError('Document processing failed. Please try uploading again.');
      }
      
      return data;
    } catch (error) {
      console.error('Failed to get processing status:', error);
      // Don't show error for status polling failures
      return null;
    }
  };

  // Start polling for processing status
  const startProcessingStatusPolling = (file_id) => {
    let pollCount = 0;
    const maxPolls = 150; // 5 minutes at 2-second intervals

    const pollInterval = setInterval(async () => {
      pollCount++;
      console.log(`Polling attempt ${pollCount}/${maxPolls}`);

      const status = await getProcessingStatus(file_id);
      
      if (status && (status.status === 'processed' || status.status === 'error')) {
        clearInterval(pollInterval);
        if (status.status === 'processed') {
          setSuccess('Document processing completed! You can now analyze and chat with the document.');
        } else {
          setError('Document processing failed. Please try uploading again.');
        }
      } else if (pollCount >= maxPolls) {
        clearInterval(pollInterval);
        setError('Document processing is taking longer than expected. You can try refreshing or re-uploading.');
      }
    }, 2000); // Poll every 2 seconds

    return pollInterval;
  };

  // Format key issues response
  const formatKeyIssuesResponse = (issues) => {
    if (!issues || issues.length === 0) return 'No key issues identified in the document.';
    
    let formatted = '# Key Legal Issues Identified\n\n';
    
    issues.forEach((issue, index) => {
      formatted += `## ${index + 1}. ${issue.title}\n\n`;
      formatted += `**Severity:** ${issue.severity.toUpperCase()}\n`;
      formatted += `**Category:** ${issue.category}\n\n`;
      formatted += `${issue.description}\n\n`;
      formatted += '---\n\n';
    });
    
    return formatted;
  };

  // Analyze document API call with better error handling
  const analyzeDocument = async (file_id, analysisType = 'summary') => {
    try {
      setIsGeneratingInsights(true);
      setError(null);

      console.log('Analyzing document with ID:', file_id, 'Type:', analysisType);

      const data = await apiRequest('/doc/analyze', {
        method: 'POST',
        body: JSON.stringify({ file_id: file_id, analysis_type: analysisType }),
      });

      console.log('Analysis response:', data);

      // Process the AI analysis response
      setAnalysisResults(data);
      
      // Set current response based on analysis type
      let responseContent = '';
      
      switch (analysisType) {
        case 'summary':
          if (data.summary) {
            setCaseSummary({
              summary: data.summary,
              confidence: data.confidence || 0.9,
              generatedAt: new Date().toISOString()
            });
            responseContent = data.summary;
          }
          break;
        case 'timeline':
          if (data.timeline) {
            responseContent = data.timeline;
          }
          break;
        case 'key_issues':
          if (data.key_issues) {
            const processedIssues = Array.isArray(data.key_issues) 
              ? data.key_issues.map((issue, index) => ({
                  id: index + 1,
                  title: issue.title || issue.issue || issue.name || `Issue ${index + 1}`,
                  description: issue.description || issue.details || 'Analysis pending',
                  severity: issue.severity || issue.priority || 'medium',
                  category: issue.category || 'general'
                }))
              : [];
            setKeyIssues(processedIssues);
            responseContent = formatKeyIssuesResponse(processedIssues);
          }
          break;
      }

      // Extract and set legal grounds
      if (data.legal_grounds) {
        const processedGrounds = Array.isArray(data.legal_grounds) 
          ? data.legal_grounds.map((ground, index) => ({
              id: index + 1,
              ground: typeof ground === 'string' ? ground : ground.ground || ground.text || ground.description,
              relevance: ground.relevance || 'medium',
              type: ground.type || 'general'
            }))
          : [];
        setLegalGrounds(processedGrounds);
      }

      // Extract and set citations
      if (data.citations) {
        const processedCitations = Array.isArray(data.citations) 
          ? data.citations.map((citation, index) => ({
              id: index + 1,
              page: citation.page || 1,
              para: citation.paragraph || citation.para || index + 1,
              text: citation.text || citation.citation || citation.content || citation,
              type: citation.type || 'general',
              confidence: citation.confidence || 0.8
            }))
          : [];
        setCitations(processedCitations);
      }

      // Set the current response
      const currentResp = {
        type: analysisType,
        content: responseContent,
        timestamp: new Date().toISOString(),
        data: data
      };
      
      setCurrentResponse(currentResp);
      setHasResponse(true);
      setShowSidebar(false);
      setSuccess('Analysis completed successfully!');
      
      // Start animation
      setAnimatedResponseContent('');
      setIsAnimatingResponse(true);
      animateText(responseContent, setAnimatedResponseContent, setIsAnimatingResponse);

      return data;
    } catch (error) {
      console.error('Analysis error:', error);
      setError(`Analysis failed: ${error.message}`);
      throw error;
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // Chat with document API call with better error handling
  const chatWithDocument = async (file_id, question, currentSessionId) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Sending chat request:', { file_id, question, currentSessionId });

      const data = await apiRequest('/doc/chat', {
        method: 'POST',
        body: JSON.stringify({
          file_id: file_id,
          question: question.trim(),
          session_id: currentSessionId // Pass sessionId to backend
        }),
      });

      console.log('Chat response:', data);

      const response = data.answer || data.response || 'No response received';
      const newSessionId = data.session_id || currentSessionId; // Use new session ID if provided

      // Create new chat entry
      const newChat = {
        id: Date.now(), // Unique ID for React key
        file_id: file_id,
        session_id: newSessionId, // Use the new or existing session ID
        question: question.trim(),
        answer: response,
        timestamp: new Date().toISOString(),
        used_chunk_ids: data.used_chunk_ids || [],
        confidence: data.confidence || 0.8
      };

      // Update chat history
      setChatHistory(prev => {
        const updated = [...prev, newChat];
        console.log('Updated chat history:', updated);
        return updated;
      });
      
      // Update the sessionId state with the new or existing session ID
      setSessionId(newSessionId);

      // Set current response
      const currentResp = {
        type: 'chat',
        content: response,
        question: question.trim(),
        timestamp: new Date().toISOString(),
        confidence: data.confidence || 0.8
      };
      
      setCurrentResponse(currentResp);
      setHasResponse(true);
      setShowSidebar(false);
      setChatInput(''); // Clear chat input
      setSuccess('Question answered successfully!');
      
      // Start animation
      setAnimatedResponseContent('');
      setIsAnimatingResponse(true);
      animateText(response, setAnimatedResponseContent, setIsAnimatingResponse);

      return data;
    } catch (error) {
      console.error('Chat error:', error);
      setError(`Chat failed: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload with validation
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid document (PDF, DOC, DOCX, or TXT)');
      return;
    }

    // Validate file size (10MB limit)
    // const maxSize = 10 * 1024 * 1024; // 10MB
    // if (file.size > maxSize) {
    //   setError('File size must be less than 10MB');
    //   return;
    // }
    const maxSize = 100 * 1024 * 1024; // 100MB
if (file.size > maxSize) {
  setError('File size must be less than 100MB');
  return;
}


    try {
      await uploadDocument(file);
    } catch (error) {
      // Error already handled in uploadDocument
      console.error('File upload failed:', error);
    }

    // Clear the input
    event.target.value = '';
  };

  // Handle search/chat with validation
  // Handle search/chat with validation
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    
    if (!chatInput.trim()) {
      setError('Please enter a question to chat.');
      return;
    }
    
    if (!fileId) {
      setError('No document selected. Please upload a document or navigate from chat history.');
      return;
    }
    
    // Check if document is processed before allowing chat
    if (processingStatus?.status === 'processing') {
      setError('Please wait for document processing to complete before asking questions.');
      return;
    }
    
    if (processingStatus?.status === 'error') {
      setError('Document processing failed. Please upload the document again.');
      return;
    }
    
    try {
      await chatWithDocument(fileId, chatInput, sessionId);
    } catch (error) {
      console.error('Chat submission failed:', error);
    }
  };

  // Handle analysis button click
  const handleAnalysisClick = async () => {
    if (!fileId) {
      setError('No document selected. Please upload a document or navigate from chat history.');
      return;
    }

    if (processingStatus?.status === 'processing') {
      setError('Please wait for document processing to complete before generating insights.');
      return;
    }
    
    if (processingStatus?.status === 'error') {
      setError('Document processing failed. Please upload the document again.');
      return;
    }

    try {
      await analyzeDocument(fileId, activeDropdown.toLowerCase().replace(' ', '_'));
    } catch (error) {
      console.error('Analysis generation failed:', error);
    }
  };

  // Handle dropdown selection
  const handleDropdownSelect = (option) => {
    setActiveDropdown(option);
    setShowDropdown(false);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Add a function to clear all chat data (call this when starting a new chat)
  const clearAllChatData = () => {
    console.log('Clearing all chat data...');
    
    // Clear state
    setChatHistory([]);
    setDocumentData(null);
    setFileId(null);
    setAnalysisResults(null);
    setCaseSummary(null);
    setLegalGrounds([]);
    setCitations([]);
    setKeyIssues([]);
    setCurrentResponse(null);
    setHasResponse(false);
    setSearchQuery('');
    setProcessingStatus(null);
    setError(null);
    setAnimatedResponseContent(''); // Clear animated content
    setIsAnimatingResponse(false); // Stop animation
    
    // Clear localStorage
    const keysToRemove = [
      'chatHistory', 'currentResponse', 'hasResponse', 'documentData',
      'fileId', 'analysisResults', 'caseSummary', 'legalGrounds',
      'citations', 'keyIssues', 'processingStatus', 'animatedResponseContent', 'sessionId' // Add animated content and sessionId to clear
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Generate new session ID
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
    localStorage.setItem('sessionId', newSessionId);
    
    setSuccess('New chat session started!');
  };

  // Add this function to manually trigger a new chat (you can call this from a button)
  const startNewChat = () => {
    clearAllChatData();
  };

  // Utility functions
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  // Professional document-style text renderer with proper numbering
  const renderText = (text) => {
    if (!text) return '';
    
    const lines = text.split('\n');
    let elements = [];
    let currentTable = null;
    let tableHeaders = [];
    let tableRows = [];
    let currentListLevel = 0;
    let listCounters = [0]; // Track numbering for nested lists
    
    const finishTable = () => {
      if (tableHeaders.length > 0 && tableRows.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto my-6">
            <table className="min-w-full border-collapse border border-gray-400">
              <thead className="bg-gray-100">
                <tr>
                  {tableHeaders.map((header, i) => (
                    <th key={i} className="border border-gray-400 px-4 py-3 text-left font-bold text-black">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, i) => (
                  <tr key={i} className="bg-white">
                    {row.map((cell, j) => (
                      <td key={j} className="border border-gray-400 px-4 py-3 text-black">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      tableHeaders = [];
      tableRows = [];
      currentTable = null;
    };
    
    const resetListCounters = () => {
      currentListLevel = 0;
      listCounters = [0];
    };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Handle table rows
      if (line.includes('|') && line.trim().startsWith('|')) {
        resetListCounters();
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
        
        if (cells.length > 0) {
          if (!currentTable) {
            // First row becomes headers
            tableHeaders = cells;
            currentTable = 'active';
          } else {
            // Check if it's a separator row (contains dashes)
            if (cells.some(cell => cell.includes('-'))) {
              // Skip separator row
              continue;
            } else {
              // Add data row
              tableRows.push(cells);
            }
          }
        }
        continue;
      }
      
      // If we hit a non-table line and have a table in progress, finish it
      if (currentTable && !line.includes('|')) {
        finishTable();
      }
      
      // Handle headers
      if (trimmedLine.startsWith('#')) {
        resetListCounters();
        const level = trimmedLine.match(/^#+/)[0].length;
        const content = trimmedLine.replace(/^#+\s*/, '');
        const className = level === 1 ? 'text-2xl font-bold mb-6 mt-8 text-black border-b-2 border-gray-300 pb-2' : 
                         level === 2 ? 'text-xl font-bold mb-4 mt-6 text-black' : 
                         level === 3 ? 'text-lg font-bold mb-3 mt-4 text-black' :
                         'text-base font-bold mb-2 mt-3 text-black';
        elements.push(React.createElement(`h${Math.min(level, 6)}`, { key: i, className }, content));
        continue;
      }
      
      // Handle bullet points with automatic numbering - improved detection
      if (trimmedLine.startsWith('*') || trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || /^\d+\./.test(trimmedLine)) {
        // Extract content after bullet marker
        let content = trimmedLine;
        if (trimmedLine.startsWith('*')) {
          content = trimmedLine.replace(/^\*+\s*/, '');
        } else if (trimmedLine.startsWith('-')) {
          content = trimmedLine.replace(/^\-+\s*/, '');
        } else if (trimmedLine.startsWith('•')) {
          content = trimmedLine.replace(/^•+\s*/, '');
        } else if (/^\d+\./.test(trimmedLine)) {
          content = trimmedLine.replace(/^\d+\.\s*/, '');
        }
        
        const indent = line.length - trimmedLine.length;
        const level = Math.floor(indent / 2);
        
        // Adjust list counters for current level
        if (level > currentListLevel) {
          // Going deeper - add new counter
          while (listCounters.length <= level) {
            listCounters.push(0);
          }
        } else if (level < currentListLevel) {
          // Going back up - reset deeper counters
          listCounters = listCounters.slice(0, level + 1);
        }
        
        currentListLevel = level;
        listCounters[level]++;
        
        // Create numbering based on level
        let numberPrefix;
        if (level === 0) {
          numberPrefix = `${listCounters[level]}.`;
        } else if (level === 1) {
          numberPrefix = `${String.fromCharCode(96 + listCounters[level])}.`; // a, b, c...
        } else if (level === 2) {
          numberPrefix = `${listCounters[level]}.`;
        } else {
          numberPrefix = `${String.fromCharCode(96 + listCounters[level])}.`;
        }
        
        const marginClass = level === 0 ? 'ml-0' : 
                           level === 1 ? 'ml-6' : 
                           level === 2 ? 'ml-12' : 'ml-18';
        
        // Process content for bold text
        let processedContent;
        if (content.includes('**')) {
          const parts = content.split(/(\*\*.*?\*\*)/);
          processedContent = parts.map((part, j) => 
            part.startsWith('**') && part.endsWith('**') ? 
              React.createElement('strong', { key: j, className: 'font-bold text-black' }, part.slice(2, -2)) : 
              part
          );
        } else {
          processedContent = content;
        }
        
        elements.push(
          <div key={i} className={`flex mb-3 ${marginClass}`}>
            <span className="font-bold text-black mr-4 min-w-[2.5rem] flex-shrink-0">{numberPrefix}</span>
            <span className="text-black leading-relaxed flex-1">{processedContent}</span>
          </div>
        );
        continue;
      }
      
      // Handle bold text
      if (trimmedLine.includes('**')) {
        resetListCounters();
        const parts = trimmedLine.split(/(\*\*.*?\*\*)/);
        elements.push(
          React.createElement('p', { key: i, className: 'mb-4 leading-relaxed text-black' }, 
            parts.map((part, j) => 
              part.startsWith('**') && part.endsWith('**') ? 
                React.createElement('strong', { key: j, className: 'font-bold text-black' }, part.slice(2, -2)) : 
                part
            )
          )
        );
        continue;
      }
      
      // Handle horizontal rules
      if (trimmedLine === '---') {
        resetListCounters();
        elements.push(React.createElement('hr', { key: i, className: 'my-6 border-gray-400' }));
        continue;
      }
      
      // Handle regular paragraphs
      if (trimmedLine) {
        resetListCounters();
        elements.push(
          React.createElement('p', { key: i, className: 'mb-4 leading-relaxed text-black text-justify' }, trimmedLine)
        );
      } else {
        // Empty line - add some spacing
        elements.push(React.createElement('div', { key: i, className: 'mb-2' }));
      }
    }
    
    // Finish any remaining table
    if (currentTable) {
      finishTable();
    }
    
    return elements;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Save currentResponse to localStorage whenever it changes
  useEffect(() => {
    if (currentResponse) {
      console.log('Current response changed, saving to localStorage:', currentResponse);
      localStorage.setItem('currentResponse', JSON.stringify(currentResponse));
      localStorage.setItem('animatedResponseContent', animatedResponseContent); // Save animated content
    }
  }, [currentResponse, animatedResponseContent]);

  // Save hasResponse state
  useEffect(() => {
    localStorage.setItem('hasResponse', JSON.stringify(hasResponse));
  }, [hasResponse]);

  // Save documentData
  useEffect(() => {
    if (documentData) {
      console.log('Document data changed, saving to localStorage:', documentData);
      localStorage.setItem('documentData', JSON.stringify(documentData));
    }
  }, [documentData]);

  // Save fileId
  useEffect(() => {
    if (fileId) {
      localStorage.setItem('fileId', fileId);
    }
  }, [fileId]);

  // Save analysis results
  useEffect(() => {
    if (analysisResults) {
      localStorage.setItem('analysisResults', JSON.stringify(analysisResults));
    }
  }, [analysisResults]);

  // Save other analysis data
  useEffect(() => {
    if (caseSummary) {
      localStorage.setItem('caseSummary', JSON.stringify(caseSummary));
    }
  }, [caseSummary]);

  useEffect(() => {
    if (legalGrounds.length > 0) {
      localStorage.setItem('legalGrounds', JSON.stringify(legalGrounds));
    }
  }, [legalGrounds]);

  useEffect(() => {
    if (citations.length > 0) {
      localStorage.setItem('citations', JSON.stringify(citations));
    }
  }, [citations]);

  useEffect(() => {
    if (keyIssues.length > 0) {
      localStorage.setItem('keyIssues', JSON.stringify(keyIssues));
    }
  }, [keyIssues]);

  useEffect(() => {
    if (processingStatus) {
      localStorage.setItem('processingStatus', JSON.stringify(processingStatus));
    }
  }, [processingStatus]);

  // Combined effect for loading/initializing chat and handling new chat navigation
  useEffect(() => {
    console.log('AnalysisPage useEffect triggered. location.state:', location.state);

    if (location.state?.newChat) {
      console.log('Detected newChat state. Starting new chat session...');
      const newSessionId = `session-${Date.now()}`;
      setSessionId(newSessionId);
      localStorage.setItem('sessionId', newSessionId);
      
      // Clear all data for new session
      setChatHistory([]);
      setDocumentData(null);
      setFileId(null);
      setAnalysisResults(null);
      setCaseSummary(null);
      setLegalGrounds([]);
      setCitations([]);
      setKeyIssues([]);
      setCurrentResponse(null);
      setHasResponse(false);
      setChatInput(''); // Clear chat input
      setProcessingStatus(null);
      setError(null);
      setSuccess('New chat session started!');
      
      // Clear localStorage for new session
      const keysToRemove = [
        'chatHistory', 'currentResponse', 'hasResponse', 'documentData',
        'fileId', 'analysisResults', 'caseSummary', 'legalGrounds',
        'citations', 'keyIssues', 'processingStatus', 'animatedResponseContent', 'sessionId'
      ];
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear the state so it doesn't trigger on subsequent renders
      window.history.replaceState({}, document.title);
    } else if (paramFileId && paramSessionId) {
      // If navigated from chat history, load specific chat session
      console.log(`Navigated with fileId: ${paramFileId} and sessionId: ${paramSessionId}. Fetching chat history...`);
      setFileId(paramFileId);
      setSessionId(paramSessionId);

      const fetchSpecificChatHistory = async () => {
        try {
          // Assuming an API endpoint to fetch chat history for a specific file and session
          // Fetch all chats for the specific file
          const response = await apiRequest(`/chat/${paramFileId}`);
          const filteredChats = response.filter(chat => chat.session_id === paramSessionId);
          setChatHistory(filteredChats || []);
          // Assuming documentData needs to be fetched separately or is part of the chat history response
          // For now, we'll assume the first chat in the filtered history can provide file_id for documentData
          if (filteredChats.length > 0) {
            // You might need a separate API call to get full document details if not returned with chat history
            // For now, setting a placeholder documentData
            setDocumentData({
              id: paramFileId,
              title: `Document for Session ${paramSessionId}`,
              originalName: `Document for Session ${paramSessionId}`,
              size: 0, // Placeholder
              type: 'unknown', // Placeholder
              uploadedAt: new Date().toISOString(), // Placeholder
              status: 'processed', // Assume processed for existing chats
              content: 'Document content will be loaded here if available.' // Placeholder
            });
            setFileId(paramFileId);
            setSessionId(paramSessionId);
            setProcessingStatus({ status: 'processed' }); // Explicitly set status to processed
            setHasResponse(true);
            const lastChat = filteredChats[filteredChats.length - 1];
            setCurrentResponse({
              type: 'chat',
              content: lastChat.answer,
              question: lastChat.question,
              timestamp: lastChat.created_at, // Use created_at from API
              confidence: lastChat.confidence || 0.8
            });
            setAnimatedResponseContent(lastChat.answer);
            setIsAnimatingResponse(false);
          } else {
            setHasResponse(false);
            setError('No chat history found for this session.');
            setProcessingStatus({ status: 'error' }); // Set status to error if no history found
          }
          setSuccess('Chat history loaded successfully!');
        } catch (err) {
          console.error('Error fetching specific chat history:', err);
          setError(`Failed to load chat history: ${err.message}`);
        }
      };
      fetchSpecificChatHistory();

    } else {
      // If not a new chat or specific chat, try to load from localStorage
      console.log('No newChat state or URL params. Attempting to load from localStorage...');
      
      try {
        // Load chat history
        const savedChatHistory = localStorage.getItem('chatHistory');
        if (savedChatHistory) {
          const parsedHistory = JSON.parse(savedChatHistory);
          setChatHistory(parsedHistory);
          console.log('Chat history loaded:', parsedHistory);
        }

        // Load current session ID
        const savedSessionId = localStorage.getItem('sessionId');
        if (savedSessionId) {
          setSessionId(savedSessionId);
          console.log('Current session ID loaded:', savedSessionId);
        } else {
          // Initialize a new chat session if none exists
          const newSessionId = `session-${Date.now()}`;
          setSessionId(newSessionId);
          localStorage.setItem('sessionId', newSessionId);
          console.log('New session ID generated and saved:', newSessionId);
        }

        // Load current response
        const savedCurrentResponse = localStorage.getItem('currentResponse');
        const savedAnimatedResponseContent = localStorage.getItem('animatedResponseContent');
        if (savedCurrentResponse) {
          const parsedResponse = JSON.parse(savedCurrentResponse);
          setCurrentResponse(parsedResponse);
          console.log('Current response loaded:', parsedResponse);
          if (savedAnimatedResponseContent) {
            setAnimatedResponseContent(savedAnimatedResponseContent);
            setIsAnimatingResponse(false); // No animation needed on load
          } else {
            setAnimatedResponseContent(parsedResponse.content); // Fallback to full content
          }
        }

        // Load hasResponse state
        const savedHasResponse = localStorage.getItem('hasResponse');
        if (savedHasResponse) {
          const parsedHasResponse = JSON.parse(savedHasResponse);
          setHasResponse(parsedHasResponse);
          console.log('HasResponse state loaded:', parsedHasResponse);
        }

        // Load document data
        const savedDocumentData = localStorage.getItem('documentData');
        if (savedDocumentData) {
          const parsedDocumentData = JSON.parse(savedDocumentData);
          setDocumentData(parsedDocumentData);
          console.log('Document data loaded:', parsedDocumentData);
        }

        // Load file ID
        const savedFileId = localStorage.getItem('fileId');
        if (savedFileId) {
          setFileId(savedFileId);
          console.log('File ID loaded:', savedFileId);
        }

        // Load analysis results
        const savedAnalysisResults = localStorage.getItem('analysisResults');
        if (savedAnalysisResults) {
          const parsedResults = JSON.parse(savedAnalysisResults);
          setAnalysisResults(parsedResults);
          console.log('Analysis results loaded:', parsedResults);
        }

        // Load case summary
        const savedCaseSummary = localStorage.getItem('caseSummary');
        if (savedCaseSummary) {
          const parsedSummary = JSON.parse(savedCaseSummary);
          setCaseSummary(parsedSummary);
          console.log('Case summary loaded:', parsedSummary);
        }

        // Load legal grounds
        const savedLegalGrounds = localStorage.getItem('legalGrounds');
        if (savedLegalGrounds) {
          const parsedGrounds = JSON.parse(savedLegalGrounds);
          setLegalGrounds(parsedGrounds);
          console.log('Legal grounds loaded:', parsedGrounds);
        }

        // Load citations
        const savedCitations = localStorage.getItem('citations');
        if (savedCitations) {
          const parsedCitations = JSON.parse(savedCitations);
          setCitations(parsedCitations);
          console.log('Citations loaded:', parsedCitations);
        }

        // Load key issues
        const savedKeyIssues = localStorage.getItem('keyIssues');
        if (savedKeyIssues) {
          const parsedIssues = JSON.parse(savedKeyIssues);
          setKeyIssues(parsedIssues);
          console.log('Key issues loaded:', parsedIssues);
        }

        // Load processing status
        const savedProcessingStatus = localStorage.getItem('processingStatus');
        if (savedProcessingStatus) {
          const parsedStatus = JSON.parse(savedProcessingStatus);
          setProcessingStatus(parsedStatus);
          console.log('Processing status loaded:', parsedStatus);
        }

      } catch (error) {
        console.error('Error loading data from localStorage:', error);
        // If there's an error loading, start fresh but don't clear existing data
        if (!sessionId) {
          const newSessionId = `session-${Date.now()}`;
          setSessionId(newSessionId);
          localStorage.setItem('sessionId', newSessionId);
        }
      }
    }
  }, [location.state, paramFileId, paramSessionId]); // Add paramFileId and paramSessionId to dependencies

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    console.log('Chat history changed, saving to localStorage:', chatHistory);
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Clear success messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Clear error messages after 8 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const dropdownOptions = ['Summary', 'Timeline', 'Key Issues'];

  return (
    <div className="flex h-screen bg-white">
      {/* Error Messages */}
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Error</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Success Messages */}
      {success && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress Modal */}
      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">Uploading Document</h3>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{uploadProgress}% complete</p>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-gray-200 bg-gray-50 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Document Analysis</h2>
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
          
          {/* Document Info */}
          {documentData && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <FileCheck className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-medium text-gray-900 truncate">{documentData.originalName}</h3>
                  <p className="text-sm text-gray-500">{formatFileSize(documentData.size)}</p>
                </div>
              </div>
              
              {processingStatus && (
                <div className="mb-3">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    processingStatus.status === 'processed' 
                      ? 'bg-green-100 text-green-800'
                      : processingStatus.status === 'processing'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {processingStatus.status === 'processing' && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                    {processingStatus.status.charAt(0).toUpperCase() + processingStatus.status.slice(1)}
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-500 space-y-1">
                <p>Uploaded: {formatDate(documentData.uploadedAt)}</p>
                <p>Type: {documentData.type}</p>
                <p>ID: {documentData.id}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Chat History */}
          {chatHistory.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Recent Conversations</h3>
              <div className="space-y-3">
                {chatHistory.filter(chat => chat.session_id === sessionId).slice(-5).map((chat) => (
                  <div key={chat.id} className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-sm text-gray-700 mb-2">{chat.question}</p>
                    <p className="text-xs text-gray-500 truncate">{chat.answer.substring(0, 100)}...</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(chat.timestamp)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            {!showSidebar && (
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-xl font-semibold text-gray-900">Legal Document Analysis</h1>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Right Panel - Response */}
          <div className="w-full overflow-y-auto">
            <div className="p-6">
              {chatHistory.length > 0 || currentResponse ? (
                <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm flex flex-col h-full">
                  <h2 className="text-xl font-bold text-black mb-6 border-b border-gray-200 pb-4">Conversation History</h2>
                  <div className="flex-1 overflow-y-auto pr-4 -mr-4"> {/* Added pr-4 and -mr-4 for scrollbar */}
                    {chatHistory.map((chat, index) => (
                      <div key={chat.id || index} className="mb-8">
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm font-bold text-black mb-2">You:</p>
                          <p className="text-black leading-relaxed">{chat.question}</p>
                        </div>
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm font-bold text-black mb-2">AI:</p>
                          <div className="prose max-w-none text-black leading-relaxed">
                            {renderText(chat.answer)}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Display current response if it's not already part of chatHistory */}
                    {currentResponse && (
                      <div className="mb-8">
                        {currentResponse.type === 'chat' && currentResponse.question && (
                          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm font-bold text-black mb-2">You:</p>
                            <p className="text-black leading-relaxed">{currentResponse.question}</p>
                          </div>
                        )}
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm font-bold text-black mb-2">AI:</p>
                          <div className="prose max-w-none text-black leading-relaxed">
                            {isAnimatingResponse ? renderText(animatedResponseContent) : renderText(currentResponse.content)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {currentResponse && currentResponse.confidence && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm text-black mb-3">
                        <span className="font-bold">Confidence Level</span>
                        <span className="font-bold text-lg">{Math.round(currentResponse.confidence * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 border border-gray-300">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${currentResponse.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-16">
                  {!documentData ? (
                    <div className="bg-white rounded-lg p-12 border border-gray-200 shadow-sm">
                      <FileText className="h-20 w-20 mx-auto mb-6 text-gray-400" />
                      <h3 className="text-2xl font-bold mb-4 text-black">Welcome to Legal Document Analysis</h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                        Upload a legal document to get started with AI-powered analysis, summaries, and insights.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-12 border border-gray-200 shadow-sm">
                      <MessageSquare className="h-20 w-20 mx-auto mb-6 text-gray-400" />
                      <h3 className="text-2xl font-bold mb-4 text-black">Ready for Analysis</h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                        Select an analysis type from the dropdown or ask a specific question about your document.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={handleChatSubmit} className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg border border-gray-300 p-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              {/* Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                title="Upload Document"
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Paperclip className="h-5 w-5" />
                )}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                disabled={isUploading}
              />

              {/* Dropdown for Analysis Type */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  disabled={!fileId || processingStatus?.status !== 'processed'}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{activeDropdown}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showDropdown && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {dropdownOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleDropdownSelect(option)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Analysis Button */}
              <button
                type="button"
                onClick={handleAnalysisClick}
                disabled={isGeneratingInsights || !fileId || processingStatus?.status !== 'processed'}
                className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                title="Generate Analysis"
              >
                {isGeneratingInsights ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <BookOpen className="h-5 w-5" />
                )}
              </button>

              {/* Chat Input */}
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={fileId ? "Ask questions about the document..." : "Upload a document or select a chat to get started"}
                className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-sm"
                disabled={isLoading || !fileId || processingStatus?.status !== 'processed'}
              />

              {/* Send Chat Button */}
              <button
                type="submit"
                disabled={isLoading || !chatInput.trim() || !fileId || processingStatus?.status !== 'processed'}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                title="Send Message"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            
            {/* Status Info */}
            {documentData && processingStatus?.status === 'processing' && (
              <div className="mt-2 text-center">
                <p className="text-sm text-blue-600">
                  Processing document...
                  {processingStatus.processing_progress && (
                    <span className="ml-1">({Math.round(processingStatus.processing_progress)}%)</span>
                  )}
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

// Animated text rendering utility
const animateText = (text, setter, isAnimatingSetter, delay = 10) => {
  let i = 0;
  setter(''); // Clear previous content
  isAnimatingSetter(true);
  const interval = setInterval(() => {
    if (i < text.length) {
      setter(prev => prev + text.charAt(i));
      i++;
    } else {
      clearInterval(interval);
      isAnimatingSetter(false);
    }
  }, delay);
};

export default AnalysisPage;



