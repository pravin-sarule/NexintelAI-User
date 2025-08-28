

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
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

const AnalysisPage = () => {
  const location = useLocation();
  const { fileId: paramFileId, sessionId: paramSessionId } = useParams();
  const { setIsSidebarHidden } = useSidebar();
  
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
  const [fileId, setFileId] = useState(paramFileId || null);
  const [sessionId, setSessionId] = useState(paramSessionId || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [currentResponse, setCurrentResponse] = useState(''); // FIXED: Changed to string
  const [animatedResponseContent, setAnimatedResponseContent] = useState('');
  const [isAnimatingResponse, setIsAnimatingResponse] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [showSplitView, setShowSplitView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
 
   // Refs
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const responseRef = useRef(null);

  // API Configuration
  const API_BASE_URL = 'https://nexintelai-user.onrender.com/api';
  
  // Get auth token with comprehensive fallback options
  const getAuthToken = () => {
    const tokenKeys = [
      'authToken', 'token', 'accessToken', 'jwt', 'bearerToken',
      'auth_token', 'access_token', 'api_token', 'userToken'
    ];
    
    for (const key of tokenKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        return token;
      }
    }
    
    return null;
  };

  // API request helper
  const apiRequest = async (url, options = {}) => {
    try {
      const token = getAuthToken();
      const defaultHeaders = {
        'Content-Type': 'application/json',
      };

      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }

      const headers = options.body instanceof FormData 
        ? (token ? { 'Authorization': `Bearer ${token}` } : {})
        : { ...defaultHeaders, ...options.headers };

      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP error! status: ${response.status}` };
        }
        
        switch (response.status) {
          case 401:
            throw new Error('Authentication required. Please log in again.');
          case 403:
            throw new Error('Access denied.');
          case 404:
            throw new Error('Resource not found.');
          case 413:
            throw new Error('File too large.');
          case 415:
            throw new Error('Unsupported file type.');
          case 429:
            throw new Error('Too many requests.');
          default:
            throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
        }
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  // File upload with progress tracking
  const uploadDocument = async (file) => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('file', file);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        };

        xhr.onload = () => {
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
              
              setSuccess('Document uploaded successfully!');
              
              if (data.file_id) {
                startProcessingStatusPolling(data.file_id);
              } else {
                setProcessingStatus({ status: 'processed' });
              }
              
              resolve(data);
            } catch (error) {
              reject(new Error('Failed to parse server response.'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network error occurred during upload.'));
        };

        xhr.ontimeout = () => {
          reject(new Error('Upload timeout.'));
        };

        const token = getAuthToken();
        xhr.open('POST', `${API_BASE_URL}/doc/upload`);
        
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        
        xhr.timeout = 300000;
        xhr.send(formData);
      });
    } catch (error) {
      setError(`Upload failed: ${error.message}`);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Processing status polling
  const getProcessingStatus = async (file_id) => {
    try {
      const data = await apiRequest(`/doc/status/${file_id}`);
      setProcessingStatus(data);
      
      if (data.status === 'processed') {
        setDocumentData(prev => ({
          ...prev,
          status: 'processed',
          content: prev?.content || 'Document processed successfully.'
        }));
      } else if (data.status === 'error') {
        setError('Document processing failed.');
      }
      
      return data;
    } catch (error) {
      return null;
    }
  };

  const startProcessingStatusPolling = (file_id) => {
    let pollCount = 0;
    const maxPolls = 150;

    const pollInterval = setInterval(async () => {
      pollCount++;
      const status = await getProcessingStatus(file_id);
      
      if (status && (status.status === 'processed' || status.status === 'error')) {
        clearInterval(pollInterval);
        if (status.status === 'processed') {
          setSuccess('Document processing completed!');
        } else {
          setError('Document processing failed.');
        }
      } else if (pollCount >= maxPolls) {
        clearInterval(pollInterval);
        setError('Document processing timeout.');
      }
    }, 2000);

    return pollInterval;
  };

  // Format key issues response
  const formatKeyIssuesResponse = (issues) => {
    if (!issues || issues.length === 0) return 'No key issues identified in the document.';
    
    let formatted = 'Key Legal Issues Identified\n\n';
    
    issues.forEach((issue, index) => {
      formatted += `${index + 1}. ${issue.title}\n\n`;
      formatted += `Severity: ${issue.severity.toUpperCase()}\n`;
      formatted += `Category: ${issue.category}\n\n`;
      formatted += `${issue.description}\n\n`;
      if (index < issues.length - 1) formatted += '---\n\n';
    });
    
    return formatted;
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // FIXED: Updated animateResponse function
  const animateResponse = (text) => {
    setAnimatedResponseContent('');
    setIsAnimatingResponse(true);
    setShowSplitView(true);
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setAnimatedResponseContent(prev => prev + text.charAt(i));
        i++;
        
        if (responseRef.current) {
          responseRef.current.scrollTop = responseRef.current.scrollHeight;
        }
      } else {
        clearInterval(interval);
        setIsAnimatingResponse(false);
      }
    }, 20);
    
    return interval;
  };

  // FIXED: Analyze document function
  const analyzeDocument = async (file_id, analysisType = 'summary') => {
    try {
      setIsGeneratingInsights(true);
      setError(null);

      const data = await apiRequest('/doc/analyze', {
        method: 'POST',
        body: JSON.stringify({ file_id: file_id, analysis_type: analysisType }),
      });

      setAnalysisResults(data);
      
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

      // Process additional data
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

      // Add to chat history
      const newChat = {
        id: Date.now(),
        file_id: file_id,
        session_id: sessionId,
        question: `Generate ${analysisType.replace('_', ' ')} analysis`,
        answer: responseContent,
        display_text_left_panel: `AI generating ${analysisType.replace('_', ' ')}...`, // Fixed instruction
        timestamp: new Date().toISOString(),
        confidence: data.confidence || 0.8,
        type: 'analysis'
      };

      setChatHistory(prev => [...prev, newChat]);
      
      // FIXED: Set current response as string
      setCurrentResponse(responseContent);
      setHasResponse(true);
      setSuccess('Analysis completed!');

      // FIXED: Use the proper animation function
      animateResponse(responseContent);

      return data;
    } catch (error) {
      setError(`Analysis failed: ${error.message}`);
      throw error;
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // FIXED: Chat with document function
  const chatWithDocument = async (file_id, question, currentSessionId) => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await apiRequest('/doc/chat', {
        method: 'POST',
        body: JSON.stringify({
          file_id: file_id,
          question: question.trim(),
          session_id: currentSessionId
        }),
      });

      const response = data.answer || data.response || 'No response received';
      const newSessionId = data.session_id || currentSessionId;

      const newChat = {
        id: Date.now(),
        file_id: file_id,
        session_id: newSessionId,
        question: question.trim(),
        answer: response,
        display_text_left_panel: question.trim(), // User's question for chat
        timestamp: new Date().toISOString(),
        used_chunk_ids: data.used_chunk_ids || [],
        confidence: data.confidence || 0.8,
        type: 'chat'
      };

      setChatHistory(prev => [...prev, newChat]);
      setSessionId(newSessionId);
      setChatInput('');
      
      // FIXED: Set current response as string
      setCurrentResponse(response);
      setHasResponse(true);
      setSuccess('Question answered!');

      // FIXED: Use the proper animation function
      animateResponse(response);

      return data;
    } catch (error) {
      setError(`Chat failed: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

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

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 100MB');
      return;
    }

    try {
      await uploadDocument(file);
    } catch (error) {
      // Error already handled
    }

    event.target.value = '';
  };

  // Handle chat submit
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    
    if (!chatInput.trim()) {
      setError('Please enter a question.');
      return;
    }
    
    if (!fileId) {
      setError('Please upload a document first.');
      return;
    }
    
    if (processingStatus?.status === 'processing') {
      setError('Please wait for document processing to complete.');
      return;
    }
    
    try {
      await chatWithDocument(fileId, chatInput, sessionId);
    } catch (error) {
      // Error already handled
    }
  };

  // Handle analysis click
  const handleAnalysisClick = async () => {
    if (!fileId) {
      setError('Please upload a document first.');
      return;
    }

    if (processingStatus?.status === 'processing') {
      setError('Please wait for document processing to complete.');
      return;
    }

    try {
      await analyzeDocument(fileId, activeDropdown.toLowerCase().replace(' ', '_'));
    } catch (error) {
      // Error already handled
    }
  };

  // Handle dropdown selection
  const handleDropdownSelect = (option) => {
    setActiveDropdown(option);
    setShowDropdown(false);
  };

  // Clear all chat data
  const clearAllChatData = () => {
    setChatHistory([]);
    setDocumentData(null);
    setFileId(null);
    setAnalysisResults(null);
    setCaseSummary(null);
    setLegalGrounds([]);
    setCitations([]);
    setKeyIssues([]);
    setCurrentResponse(''); // FIXED: Clear as string
    setHasResponse(false);
    setChatInput('');
    setProcessingStatus(null);
    setError(null);
    setAnimatedResponseContent('');
    setIsAnimatingResponse(false);
    setShowSplitView(false);

    const keysToRemove = [
      'chatHistory', 'currentResponse', 'hasResponse', 'documentData',
      'fileId', 'analysisResults', 'caseSummary', 'legalGrounds',
      'citations', 'keyIssues', 'processingStatus', 'animatedResponseContent', 'sessionId'
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
    localStorage.setItem('sessionId', newSessionId);
    
    setSuccess('New chat session started!');
  };

  // Start new chat
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

  // FIXED: Professional document-style text renderer
  // Helper function to highlight text
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-yellow-200 font-semibold text-black">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const renderText = (text) => {
    if (!text) return '';
    
    const lines = text.split('\n');
    let elements = [];
    let currentTable = null;
    let tableHeaders = [];
    let tableRows = [];
    let currentListLevel = 0;
    let listCounters = [0];
    
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
      
      if (line.includes('|') && line.trim().startsWith('|')) {
        resetListCounters();
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
        
        if (cells.length > 0) {
          if (!currentTable) {
            tableHeaders = cells;
            currentTable = 'active';
          } else {
            if (cells.some(cell => cell.includes('-'))) {
              continue;
            } else {
              tableRows.push(cells);
            }
          }
        }
        continue;
      }
      
      if (currentTable && !line.includes('|')) {
        finishTable();
      }
      
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
      
      if (trimmedLine.startsWith('*') || trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || /^\d+\./.test(trimmedLine)) {
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
        
        if (level > currentListLevel) {
          while (listCounters.length <= level) {
            listCounters.push(0);
          }
        } else if (level < currentListLevel) {
          listCounters = listCounters.slice(0, level + 1);
        }
        
        currentListLevel = level;
        listCounters[level]++;
        
        let numberPrefix;
        if (level === 0) {
          numberPrefix = `${listCounters[level]}.`;
        } else if (level === 1) {
          numberPrefix = `${String.fromCharCode(96 + listCounters[level])}.`;
        } else if (level === 2) {
          numberPrefix = `${listCounters[level]}.`;
        } else {
          numberPrefix = `${String.fromCharCode(96 + listCounters[level])}.`;
        }
        
        const marginClass = level === 0 ? 'ml-0' :
                           level === 1 ? 'ml-6' :
                           level === 2 ? 'ml-12' : 'ml-18';
        
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
      
      if (trimmedLine === '---') {
        resetListCounters();
        elements.push(React.createElement('hr', { key: i, className: 'my-6 border-gray-400' }));
        continue;
      }
      
      if (trimmedLine) {
        resetListCounters();
        elements.push(
          React.createElement('p', { key: i, className: 'mb-4 leading-relaxed text-black text-justify' }, trimmedLine)
        );
      } else {
        elements.push(React.createElement('div', { key: i, className: 'mb-2' }));
      }
    }
    
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

  // FIXED: Save currentResponse as string
  useEffect(() => {
    if (currentResponse) {
      localStorage.setItem('currentResponse', currentResponse);
      localStorage.setItem('animatedResponseContent', animatedResponseContent);
    }
  }, [currentResponse, animatedResponseContent]);

  // Save other state
  useEffect(() => {
    localStorage.setItem('hasResponse', JSON.stringify(hasResponse));
  }, [hasResponse]);

  useEffect(() => {
    if (documentData) {
      localStorage.setItem('documentData', JSON.stringify(documentData));
    }
  }, [documentData]);

  useEffect(() => {
    if (fileId) {
      localStorage.setItem('fileId', fileId);
    }
  }, [fileId]);

  useEffect(() => {
    if (analysisResults) {
      localStorage.setItem('analysisResults', JSON.stringify(analysisResults));
    }
  }, [analysisResults]);

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

  // FIXED: Combined effect for loading/initializing
  useEffect(() => {
    if (location.state?.newChat) {
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
      setCurrentResponse(''); // FIXED: Clear as string
      setHasResponse(false);
      setChatInput('');
      setProcessingStatus(null);
      setError(null);
      setAnimatedResponseContent(''); // Clear animated content
      setIsAnimatingResponse(false);
      setShowSplitView(false);
      setSuccess('New chat session started!');
      
      const keysToRemove = [
        'chatHistory', 'currentResponse', 'hasResponse', 'documentData',
        'fileId', 'analysisResults', 'caseSummary', 'legalGrounds',
        'citations', 'keyIssues', 'processingStatus', 'animatedResponseContent', 'sessionId'
      ];
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      window.history.replaceState({}, document.title);
    } else if (paramFileId && paramSessionId) {
      setFileId(paramFileId);
      setSessionId(paramSessionId);

      const fetchSpecificChatHistory = async () => {
        try {
          const response = await apiRequest(`/chat/${paramFileId}`);
          const filteredChats = response.filter(chat => chat.session_id === paramSessionId);
          setChatHistory(filteredChats || []);
          
          if (filteredChats.length > 0) {
            setDocumentData({
              id: paramFileId,
              title: `Document for Session ${paramSessionId}`,
              originalName: `Document for Session ${paramSessionId}`,
              size: 0,
              type: 'unknown',
              uploadedAt: new Date().toISOString(),
              status: 'processed',
              content: 'Document content will be loaded here if available.'
            });
            setFileId(paramFileId);
            setSessionId(paramSessionId);
            setProcessingStatus({ status: 'processed' });
            setHasResponse(true);
            
            const lastChat = filteredChats[filteredChats.length - 1];
            // FIXED: Set as string
            setCurrentResponse(lastChat.answer);
            setAnimatedResponseContent(lastChat.answer);
            setIsAnimatingResponse(false);
            setShowSplitView(true); // Show split view for loaded chats
          } else {
            setHasResponse(false);
            setError('No chat history found for this session.');
            setProcessingStatus({ status: 'error' });
          }
          setSuccess('Chat history loaded successfully!');
        } catch (err) {
          setError(`Failed to load chat history: ${err.message}`);
        }
      };
      fetchSpecificChatHistory();

    } else {
      try {
        const savedChatHistory = localStorage.getItem('chatHistory');
        if (savedChatHistory) {
          const parsedHistory = JSON.parse(savedChatHistory);
          setChatHistory(parsedHistory);
        }

        const savedSessionId = localStorage.getItem('sessionId');
        if (savedSessionId) {
          setSessionId(savedSessionId);
        } else {
          const newSessionId = `session-${Date.now()}`;
          setSessionId(newSessionId);
          localStorage.setItem('sessionId', newSessionId);
        }

        // FIXED: Load current response as string
        const savedCurrentResponse = localStorage.getItem('currentResponse');
        const savedAnimatedResponseContent = localStorage.getItem('animatedResponseContent');
        if (savedCurrentResponse) {
          setCurrentResponse(savedCurrentResponse); // Direct string assignment
          if (savedAnimatedResponseContent) {
            setAnimatedResponseContent(savedAnimatedResponseContent);
            setShowSplitView(true); // Show split view if there's content
          } else {
            setAnimatedResponseContent(savedCurrentResponse);
          }
          setIsAnimatingResponse(false);
        }

        const savedHasResponse = localStorage.getItem('hasResponse');
        if (savedHasResponse) {
          const parsedHasResponse = JSON.parse(savedHasResponse);
          setHasResponse(parsedHasResponse);
          if (parsedHasResponse) {
            setShowSplitView(true); // Show split view if there's a response
          }
        }

        const savedDocumentData = localStorage.getItem('documentData');
        if (savedDocumentData) {
          const parsedDocumentData = JSON.parse(savedDocumentData);
          setDocumentData(parsedDocumentData);
        }

        const savedFileId = localStorage.getItem('fileId');
        if (savedFileId) {
          setFileId(savedFileId);
        }

        const savedAnalysisResults = localStorage.getItem('analysisResults');
        if (savedAnalysisResults) {
          const parsedResults = JSON.parse(savedAnalysisResults);
          setAnalysisResults(parsedResults);
        }

        const savedCaseSummary = localStorage.getItem('caseSummary');
        if (savedCaseSummary) {
          const parsedSummary = JSON.parse(savedCaseSummary);
          setCaseSummary(parsedSummary);
        }

        const savedLegalGrounds = localStorage.getItem('legalGrounds');
        if (savedLegalGrounds) {
          const parsedGrounds = JSON.parse(savedLegalGrounds);
          setLegalGrounds(parsedGrounds);
        }

        const savedCitations = localStorage.getItem('citations');
        if (savedCitations) {
          const parsedCitations = JSON.parse(savedCitations);
          setCitations(parsedCitations);
        }

        const savedKeyIssues = localStorage.getItem('keyIssues');
        if (savedKeyIssues) {
          const parsedIssues = JSON.parse(savedKeyIssues);
          setKeyIssues(parsedIssues);
        }

        const savedProcessingStatus = localStorage.getItem('processingStatus');
        if (savedProcessingStatus) {
          const parsedStatus = JSON.parse(savedProcessingStatus);
          setProcessingStatus(parsedStatus);
        }

      } catch (error) {
        if (!sessionId) {
          const newSessionId = `session-${Date.now()}`;
          setSessionId(newSessionId);
          localStorage.setItem('sessionId', newSessionId);
        }
      }
    }
  }, [location.state, paramFileId, paramSessionId]);
 
   // Automatically close sidebar when split view is active
  useEffect(() => {
    if (showSplitView) {
      setIsSidebarHidden(true);
    } else {
      setIsSidebarHidden(false);
    }
  }, [showSplitView, setIsSidebarHidden]);

   // Save chat history to localStorage whenever it changes
  useEffect(() => {
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
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm">{error}</p>
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
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
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
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Uploading Document</h3>
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

      {/* Conditional Rendering for Single Page vs Split View */}
      {!hasResponse && !documentData ? (
        // Single Page View: Only chat input area
        <div className="flex flex-col items-center justify-center h-full w-full">
          <div className="text-center max-w-2xl px-6 mb-12">
            <FileText className="h-20 w-20 mx-auto mb-6 text-gray-300" />
            <h3 className="text-3xl font-bold mb-4 text-gray-900">Start a New Legal Document Analysis</h3>
            <p className="text-gray-600 text-xl leading-relaxed">
              Upload a legal document or ask a question to begin your AI-powered analysis.
            </p>
          </div>
          <div className="w-full max-w-4xl px-6">
            <form onSubmit={handleChatSubmit} className="mx-auto">
              <div className="flex items-center space-x-3 bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 focus-within:border-blue-300 focus-within:bg-white focus-within:shadow-sm">
                {/* Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
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

                {/* Analysis Dropdown */}
                <div className="relative flex-shrink-0" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    disabled={!fileId || processingStatus?.status !== 'processed' || isLoading || isGeneratingInsights}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>{activeDropdown}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {showDropdown && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                      {dropdownOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleDropdownSelect(option)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Generate Analysis Button */}
                <button
                  type="button"
                  onClick={handleAnalysisClick}
                  disabled={isGeneratingInsights || !fileId || processingStatus?.status !== 'processed' || isLoading}
                  className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg transition-colors flex-shrink-0"
                  title="Generate Analysis"
                >
                  {isGeneratingInsights ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>

                {/* Chat Input */}
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={fileId ? "Message Legal Assistant..." : "Upload a document to get started"}
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-[15px] font-medium py-2 min-w-0"
                  disabled={isLoading || !fileId || processingStatus?.status !== 'processed' || isGeneratingInsights}
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={isLoading || !chatInput.trim() || !fileId || processingStatus?.status !== 'processed' || isGeneratingInsights}
                  className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors flex-shrink-0"
                  title="Send Message"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              {/* Processing Status */}
              {documentData && processingStatus?.status === 'processing' && (
                <div className="mt-3 text-center">
                  <div className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing document...
                    {processingStatus.processing_progress && (
                      <span className="ml-1">({Math.round(processingStatus.processing_progress)}%)</span>
                    )}
                  </div>
                </div>
              )}

              {/* Document Info */}
              {documentData && !hasResponse && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <FileCheck className="h-5 w-5 text-green-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{documentData.originalName}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(documentData.size)} • {formatDate(documentData.uploadedAt)}
                      </p>
                    </div>
                    {processingStatus && (
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        processingStatus.status === 'processed'
                          ? 'bg-green-100 text-green-800'
                          : processingStatus.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {processingStatus.status.charAt(0).toUpperCase() + processingStatus.status.slice(1)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      ) : (
        // Split View: Left and Right Panels
        <>
          {/* Left Panel - Chat Messages */}
          <div className={`${showSplitView ? 'w-1/2' : 'w-full'} border-r border-gray-200 flex flex-col bg-white`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Conversation</h2>
                <button
                  onClick={startNewChat}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  New Chat
                </button>
              </div>
              {/* Search Input */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chat history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Chat Messages - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="space-y-6">
                {chatHistory
                  .filter(chat =>
                    chat.question.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((chat, index) => (
                    <div key={chat.id || index} className="space-y-4">
                      {/* User Message */}
                      <div className="flex justify-end">
                        <div className="max-w-[85%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5">
                          <p className="text-sm font-medium leading-relaxed">{highlightText(chat.display_text_left_panel || chat.question, searchQuery)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="border-t border-gray-200 p-6 bg-white flex-shrink-0">
              <form onSubmit={handleChatSubmit} className="max-w-4xl mx-auto">
                <div className="flex items-center space-x-3 bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 focus-within:border-blue-300 focus-within:bg-white focus-within:shadow-sm">
                  {/* Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
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

                  {/* Analysis Dropdown */}
                  <div className="relative flex-shrink-0" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowDropdown(!showDropdown)}
                      disabled={!fileId || processingStatus?.status !== 'processed' || isLoading || isGeneratingInsights}
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>{activeDropdown}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>

                    {showDropdown && (
                      <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        {dropdownOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleDropdownSelect(option)}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Generate Analysis Button */}
                  <button
                    type="button"
                    onClick={handleAnalysisClick}
                    disabled={isGeneratingInsights || !fileId || processingStatus?.status !== 'processed' || isLoading}
                    className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg transition-colors flex-shrink-0"
                    title="Generate Analysis"
                  >
                    {isGeneratingInsights ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>

                  {/* Chat Input */}
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={fileId ? "Message Legal Assistant..." : "Upload a document to get started"}
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-[15px] font-medium py-2 min-w-0"
                    disabled={isLoading || !fileId || processingStatus?.status !== 'processed' || isGeneratingInsights}
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !chatInput.trim() || !fileId || processingStatus?.status !== 'processed' || isGeneratingInsights}
                    className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors flex-shrink-0"
                    title="Send Message"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
                
                {/* Processing Status */}
                {documentData && processingStatus?.status === 'processing' && (
                  <div className="mt-3 text-center">
                    <div className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing document...
                      {processingStatus.processing_progress && (
                        <span className="ml-1">({Math.round(processingStatus.processing_progress)}%)</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Document Info */}
                {documentData && !hasResponse && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <FileCheck className="h-5 w-5 text-green-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{documentData.originalName}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(documentData.size)} • {formatDate(documentData.uploadedAt)}
                        </p>
                      </div>
                      {processingStatus && (
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          processingStatus.status === 'processed'
                            ? 'bg-green-100 text-green-800'
                            : processingStatus.status === 'processing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {processingStatus.status.charAt(0).toUpperCase() + processingStatus.status.slice(1)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right Panel - Main Content */}
          <div className={`${showSplitView ? 'w-1/2' : 'w-full'} flex flex-col`}>
            {/* Response Area */}
            <div className="flex-1 overflow-y-auto" ref={responseRef}>
              {showSplitView && (currentResponse || animatedResponseContent) ? (
                <div className="px-6 py-6">
                  <div className="max-w-none">
                    <div className="prose prose-gray max-w-none">
                      {renderText(animatedResponseContent || currentResponse)}
                      {isAnimatingResponse && (
                        <span className="inline-block w-2 h-5 bg-gray-400 animate-pulse ml-1"></span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md px-6">
                    <MessageSquare className="h-16 w-16 mx-auto mb-6 text-gray-300" />
                    <h3 className="text-2xl font-semibold mb-4 text-gray-900">AI Response</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Your AI responses will appear here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalysisPage;