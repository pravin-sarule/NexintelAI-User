// // import React, { useEffect, useMemo, useRef, useState } from "react";
// // import { Search, Download, Printer, Upload, ArrowLeft } from "lucide-react";
// // import RichTextEditor from "../components/RichTextEditor";

// // import Templates from "../components/Templates"; // Using Templates component for selection

// // // Simple toolbar button component
// // const TB = ({ title, onClick, children }) => (
// //   <button
// //     type="button"
// //     title={title}
// //     onClick={onClick}
// //     className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 hover:bg-gray-50 active:scale-[.98]"
// //   >
// //     {children}
// //   </button>
// // );

// // // Helper: trigger downloads
// // function downloadBlob(filename, blob) {
// //   const url = URL.createObjectURL(blob);
// //   const a = document.createElement("a");
// //   a.href = url;
// //   a.download = filename;
// //   document.body.appendChild(a);
// //   a.click();
// //   a.remove();
// //   URL.revokeObjectURL(url);
// // }

// // // Optional DOCX export via html-docx-js if the package exists


// // const DraftingPage = () => {
// //   const [selectedTemplate, setSelectedTemplate] = useState(null);
  
// //   // Get user ID from localStorage for user-specific content
// //   const userIdentifier = useMemo(() => {
// //     // Prioritize 'authToken', then 'token', then 'user' object's 'id', fallback to 'guest'
// //     const authToken = localStorage.getItem('authToken');
// //     if (authToken) return authToken;

// //     const token = localStorage.getItem('token');
// //     if (token) return token;

// //     try {
// //       const userData = localStorage.getItem('user');
// //       return userData ? JSON.parse(userData).id : 'guest';
// //     } catch (e) {
// //       console.error("Failed to parse user data from localStorage", e);
// //       return 'guest';
// //     }
// //   }, []);

// //   const localStorageKey = `draftingEditorContent_${userIdentifier}_${selectedTemplate ? selectedTemplate.id : 'no-template'}`;


// //   const [editorContent, setEditorContent] = useState(() => {
// //     // Initialize from localStorage or an empty string
// //     return localStorage.getItem(localStorageKey) || '';
// //   });
// //   const [fileName, setFileName] = useState("document");
// //   const [searchQ, setSearchQ] = useState("");

// //   useEffect(() => {
// //     // Only set content from template if editor is currently empty (e.g., on initial load or after clearing)
// //     // This prevents template selection from overwriting user's unsaved work after a refresh
// //     // Only set content from template if editor is currently empty for this specific template and user
// //     // This prevents template selection from overwriting user's unsaved work after a refresh
// //     if (selectedTemplate && !localStorage.getItem(localStorageKey)) {
// //       setEditorContent(selectedTemplate.content || "");
// //       setFileName((selectedTemplate.name || "document").toLowerCase().replace(/\s+/g, "-"));
// //     }
// //   }, [selectedTemplate]);

// //   // Save content to localStorage whenever it changes
// //   useEffect(() => {
// //     localStorage.setItem(localStorageKey, editorContent);
// //   }, [editorContent]);

// //   const handleEditorChange = (content) => {
// //     setEditorContent(content);
// //   };

// //   const importHTML = async (file) => {
// //     const text = await file.text();
// //     setEditorContent(text);
// //     setFileName(file.name.replace(/\.[^.]+$/, ""));
// //   };

// //   const exportHTML = () => {
// //     const html = iframeRef.current?.contentDocument?.documentElement.outerHTML || "";
// //     downloadBlob(`${fileName || "document"}.html`, new Blob([html], { type: "text/html;charset=utf-8" }));
// //   };


// //   const exportPDF = () => {
// //     const printWindow = window.open('', '_blank');
// //     const contentToPrint = editorContent;

// //     const printHtml = `
// //       <!DOCTYPE html>
// //       <html>
// //         <head>
// //           <title>Document</title>
// //           <style>
// //             body { font-family: Arial, sans-serif; margin: 20px; background-color: white; }
// //             @page {
// //               margin: 0; /* Remove default margins */
// //               size: auto; /* Auto size to content */
// //             }
// //             @media print {
// //               /* Hide headers/footers that browsers might add */
// //               @page {
// //                 @top-left { content: ""; }
// //                 @top-center { content: ""; }
// //                 @top-right { content: ""; }
// //                 @bottom-left { content: ""; }
// //                 @bottom-center { content: ""; }
// //                 @bottom-right { content: ""; }
// //               }
// //               body {
// //                 margin: 0; /* Ensure no extra margin on print */
// //               }
// //               /* Ensure prose styles are applied for printing */
// //               .prose {
// //                 max-width: none !important;
// //                 margin: 0 !important;
// //                 padding: 0 !important;
// //                 min-height: auto !important;
// //               }
// //               /* Ensure images and other media fit within print area */
// //               img, video {
// //                 max-width: 100% !important;
// //                 height: auto !important;
// //               }
// //             }
// //           </style>
// //         </head>
// //         <body>
// //           ${contentToPrint}
// //         </body>
// //       </html>
// //     `;

// //     printWindow.document.write(printHtml);
// //     printWindow.document.close();
// //     printWindow.onload = () => {
// //       printWindow.focus();
// //       printWindow.print();
// //       printWindow.close();
// //     };
// //   };

// //   return (
// //     <div className="flex h-[calc(100vh-2rem)] gap-4 p-4">
// //       {!selectedTemplate ? (
// //         // Template selection view
// //         <aside className="w-full shrink-0 rounded-2xl border border-gray-200 bg-white p-4">
// //           <div className="mb-3 text-sm font-medium">Templates</div>
// //           <div className="mb-4 flex items-center gap-2">
// //             <Search className="h-4 w-4 text-gray-500" />
// //             <input
// //               value={searchQ}
// //               onChange={(e) => setSearchQ(e.target.value)}
// //               placeholder="Search templates..."
// //               className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
// //             />
// //           </div>
// //           <div className="overflow-auto pr-1 h-full">
// //             <Templates onSelectTemplate={(item) => setSelectedTemplate(item)} query={searchQ} />
// //           </div>
// //         </aside>
// //       ) : (
// //         // Editor view
// //         <section className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
// //           <div className="mb-3 flex flex-wrap items-center gap-2">
// //             <button
// //               onClick={() => setSelectedTemplate(null)}
// //               className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 hover:bg-gray-50 active:scale-[.98]"
// //               title="Back to Templates"
// //             >
// //               <ArrowLeft className="h-4 w-4" />
// //               <span className="text-sm">Back</span>
// //             </button>
// //             <input
// //               value={fileName}
// //               onChange={(e) => setFileName(e.target.value)}
// //               className="w-56 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
// //               placeholder="File name"
// //             />

// //             <div className="mx-2 hidden h-6 w-px bg-gray-200 sm:block" />

// //             <div className="ml-auto flex items-center gap-2">
// //               <button onClick={exportPDF} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 hover:bg-gray-50">
// //                 <Printer className="h-4 w-4" /> <span className="text-sm">Download PDF</span>
// //               </button>
// //             </div>
// //           </div>

// //           {/* Rich Text Editor */}
// //           <div className="h-[calc(100%-72px)] overflow-hidden rounded-xl border border-gray-200">
// //             <RichTextEditor value={editorContent} onChange={handleEditorChange} />
// //           </div>
// //         </section>
// //       )}
// //     </div>
// //   );
// // };

// // export default DraftingPage;

// import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
// import { 
//   Search, Download, Printer, ArrowLeft, Save, Share2, 
//   Settings, MoreVertical, Clock, Users, FileText,
//   ChevronDown, Bell, User, Loader
// } from "lucide-react";
// import RichTextEditor from "../components/RichTextEditor";
// import Templates from "../components/Templates";
// import ApiService from "../services/api";

// // Utility function to generate unique user ID
// const generateUserId = () => {
//   const stored = localStorage.getItem('documentEditorUserId');
//   if (stored) return stored;
  
//   const newId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
//   localStorage.setItem('documentEditorUserId', newId);
//   return newId;
// };

// // Helper function to create user-specific storage keys
// const createStorageKey = (userId, templateId, suffix = '') => {
//   return `docEditor_${userId}_${templateId || 'blank'}${suffix ? '_' + suffix : ''}`;
// };

// // Helper function to trigger downloads
// const downloadBlob = (filename, blob) => {
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = filename;
//   document.body.appendChild(a);
//   a.click();
//   a.remove();
//   URL.revokeObjectURL(url);
// };

// // Auto-save hook with backend integration
// const useAutoSave = (content, storageKey, templateId, delay = 5000) => {
//   const timeoutRef = useRef(null);
//   const [isSaving, setIsSaving] = useState(false);
//   const [lastSaved, setLastSaved] = useState(null);

//   useEffect(() => {
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//     }

//     timeoutRef.current = setTimeout(async () => {
//       if (content) {
//         setIsSaving(true);
//         try {
//           // Save to localStorage immediately
//           localStorage.setItem(storageKey, content);
//           localStorage.setItem(storageKey + '_lastSaved', new Date().toISOString());
          
//           // Save to backend if template ID exists
//           if (typeof templateId === 'string' && !templateId.includes('-')) {
//             const blob = new Blob([content], { type: 'text/html' });
//             const file = new File([blob], 'document.html', { type: 'text/html' });
            
//             await ApiService.saveUserDraft(templateId, 'Auto-saved Document', file);
//           }
          
//           setLastSaved(new Date());
//         } catch (error) {
//           console.error('Auto-save failed:', error);
//         } finally {
//           setIsSaving(false);
//         }
//       }
//     }, delay);

//     return () => {
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
//     };
//   }, [content, storageKey, templateId, delay]);

//   return { isSaving, lastSaved };
// };

// const DraftingPage = () => {
//   // User identification - each user gets unique ID
//   const userId = useMemo(() => generateUserId(), []);
  
//   // State management
//   const [selectedTemplate, setSelectedTemplate] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [fileName, setFileName] = useState("Untitled Document");
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [documentList, setDocumentList] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Get templateId and editUrl from URL parameters
//   const location = window.location;
//   const queryParams = new URLSearchParams(location.search);
//   const templateIdFromUrl = queryParams.get('templateId');
//   const editUrlFromUrl = queryParams.get('editUrl');

//   console.log('DraftingPage: Initializing with URL Params:', { templateIdFromUrl, editUrlFromUrl });

//   // Effect to load template based on URL params
//   useEffect(() => {
//     const loadTemplateFromUrl = async () => {
//       if (templateIdFromUrl) {
//         try {
//           setIsLoading(true);
//           setError(null);
//           let templateToLoad = null;

//           if (editUrlFromUrl && editUrlFromUrl.toLowerCase().endsWith('.docx')) {
//             // If it's a DOCX URL, create a dummy template object with editUrl
//             templateToLoad = {
//               id: templateIdFromUrl,
//               name: 'Document from Upload',
//               editUrl: editUrlFromUrl,
//               isBackendTemplate: false, // Treat as non-backend for direct URL handling
//             };
//             setEditorContent(editUrlFromUrl); // Pass URL to RichTextEditor
//             setFileName(templateToLoad.name);
//           } else {
//             // Otherwise, fetch template from backend
//             const fetchedTemplate = await ApiService.getTemplateById(templateIdFromUrl);
//             templateToLoad = {
//               ...fetchedTemplate,
//               content: fetchedTemplate.html || '', // Assuming backend returns HTML
//               isBackendTemplate: true,
//             };
//             setEditorContent(templateToLoad.content);
//             setFileName(templateToLoad.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'document');
//           }
//           setSelectedTemplate(templateToLoad);
//         } catch (err) {
//           console.error('Error loading template from URL:', err);
//           setError(`Failed to load document: ${err.message}`);
//           setSelectedTemplate(null);
//           setEditorContent('');
//           setFileName('Untitled Document');
//         } finally {
//           setIsLoading(false);
//         }
//       }
//     };
//     loadTemplateFromUrl();
//   }, [templateIdFromUrl, editUrlFromUrl]); // Depend on URL params

//   // Create user-specific storage key for current document
//   const currentStorageKey = useMemo(() => 
//     createStorageKey(userId, selectedTemplate?.id, 'content'), 
//     [userId, selectedTemplate?.id]
//   );

//   const fileNameStorageKey = useMemo(() => 
//     createStorageKey(userId, selectedTemplate?.id, 'fileName'), 
//     [userId, selectedTemplate?.id]
//   );

//   // Initialize editor content from localStorage or template
//   const [editorContent, setEditorContent] = useState(() => {
//     // First check if we have saved content for this user and template
//     const savedContent = localStorage.getItem(currentStorageKey);
//     if (savedContent) {
//       return savedContent;
//     }
    
//     // If no saved content and we have a template, use template content
//     if (selectedTemplate?.content) {
//       return selectedTemplate.content;
//     }
    
//     return '';
//   });

//   // Auto-save functionality with backend integration
//   const { isSaving, lastSaved } = useAutoSave(editorContent, currentStorageKey, selectedTemplate?.id);

//   // Load saved filename
//   useEffect(() => {
//     const savedFileName = localStorage.getItem(fileNameStorageKey);
//     if (savedFileName) {
//       setFileName(savedFileName);
//     } else if (selectedTemplate) {
//       setFileName(selectedTemplate.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'document');
//     }
//   }, [selectedTemplate, fileNameStorageKey]);

//   // Save filename when it changes
//   useEffect(() => {
//     if (fileName && fileName !== "Untitled Document") {
//       localStorage.setItem(fileNameStorageKey, fileName);
//     }
//   }, [fileName, fileNameStorageKey]);

//   // Load document list for current user
//   useEffect(() => {
//     const loadDocumentList = () => {
//       const allKeys = Object.keys(localStorage);
//       const userDocs = allKeys
//         .filter(key => key.startsWith(`docEditor_${userId}_`) && key.endsWith('_content'))
//         .map(key => {
//           const parts = key.split('_');
//           const templateId = parts[2];
//           const content = localStorage.getItem(key);
//           const lastSavedKey = key + '_lastSaved';
//           const lastSaved = localStorage.getItem(lastSavedKey);
//           const fileNameKey = key.replace('_content', '_fileName');
//           const fileName = localStorage.getItem(fileNameKey) || 'Untitled Document';
          
//           return {
//             id: key,
//             templateId,
//             fileName,
//             content,
//             lastSaved: lastSaved ? new Date(lastSaved) : new Date(),
//             wordCount: content ? content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length : 0
//           };
//         })
//         .sort((a, b) => new Date(b.lastSaved) - new Date(a.lastSaved));
      
//       setDocumentList(userDocs);
//     };

//     loadDocumentList();
//   }, [userId, editorContent]);

//   // Handle template selection with backend integration
//   const handleTemplateSelection = useCallback(async (template) => {
//     try {
//       setIsLoading(true);
//       setError(null);
      
//       // Save current work if any
//       if (editorContent && selectedTemplate) {
//         localStorage.setItem(currentStorageKey, editorContent);
//       }

//       setSelectedTemplate(template);
      
//       // Check if it's a DOCX file from editUrl
//       if (template.editUrl && typeof template.editUrl === 'string' && template.editUrl.toLowerCase().endsWith('.docx')) {
//         // Pass the editUrl directly to RichTextEditor, it will handle conversion
//         setEditorContent(template.editUrl);
//         setFileName(template.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'document');
//       } else if (template.isBackendTemplate) {
//         // For other backend templates (e.g., HTML templates), fetch HTML content
//         try {
//           const htmlContent = await ApiService.openTemplateForEditing(template.id);
//           setEditorContent(htmlContent);
//           setFileName(template.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'document');
//         } catch (err) {
//           console.error('Error opening backend template:', err);
//           setError('Failed to open backend template. Please try again.');
//           setEditorContent(template.content || ''); // Fallback
//           setFileName(template.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'document');
//         }
//       } else {
//         // Handle static templates
//         const newStorageKey = createStorageKey(userId, template.id, 'content');
//         const newFileNameKey = createStorageKey(userId, template.id, 'fileName');
        
//         // Check if we have saved content for this template
//         const savedContent = localStorage.getItem(newStorageKey);
//         const savedFileName = localStorage.getItem(newFileNameKey);
        
//         if (savedContent) {
//           // User has worked on this template before
//           setEditorContent(savedContent);
//           setFileName(savedFileName || template.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'document');
//         } else {
//           // Fresh template
//           setEditorContent(template.content || '');
//           setFileName(template.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'document');
//         }
//       }
      
//     } catch (error) {
//       console.error('Error selecting template:', error);
//       setError('Failed to load template. Please try again.');
//       // Fallback to basic template setup
//       setSelectedTemplate(template);
//       setEditorContent(template.content || '');
//       setFileName(template.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'document');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [editorContent, selectedTemplate, currentStorageKey, userId]);

//   // Handle content changes
//   const handleEditorChange = useCallback((content) => {
//     setEditorContent(content);
//     // Auto-save is handled by the useAutoSave hook
//   }, []);

//   // Export functions with backend integration
//   const exportToPDF = useCallback(() => {
//     const printWindow = window.open('', '_blank');
//     const contentToPrint = editorContent;

//     const printHtml = `
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <title>${fileName}</title>
//           <style>
//             body { 
//               font-family: 'Times New Roman', serif; 
//               margin: 0; 
//               padding: 40px; 
//               background-color: white; 
//               line-height: 1.6;
//               color: #1a1a1a;
//             }
//             @page {
//               margin: 1in;
//               size: letter;
//             }
//             @media print {
//               body { margin: 0; padding: 0; }
//               .no-print { display: none; }
//             }
//             h1, h2, h3, h4, h5, h6 { 
//               margin-top: 1.5em; 
//               margin-bottom: 0.5em; 
//               page-break-after: avoid; 
//             }
//             p { margin-bottom: 1em; }
//             table { 
//               border-collapse: collapse; 
//               width: 100%; 
//               margin: 1em 0; 
//             }
//             th, td { 
//               border: 1px solid #ccc; 
//               padding: 8px; 
//               text-align: left; 
//             }
//             th { background-color: #f5f5f5; }
//             img { max-width: 100%; height: auto; }
//             .page-break { page-break-before: always; }
//           </style>
//         </head>
//         <body>
//           ${contentToPrint}
//         </body>
//       </html>
//     `;

//     printWindow.document.write(printHtml);
//     printWindow.document.close();
//     printWindow.onload = () => {
//       printWindow.focus();
//       printWindow.print();
//       printWindow.close();
//     };
//   }, [editorContent, fileName]);

//   const exportToHTML = useCallback(() => {
//     const htmlContent = `
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <meta charset="UTF-8">
//           <title>${fileName}</title>
//           <style>
//             body { 
//               font-family: 'Times New Roman', serif; 
//               max-width: 800px; 
//               margin: 0 auto; 
//               padding: 40px; 
//               line-height: 1.6; 
//               color: #1a1a1a; 
//             }
//             h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
//             p { margin-bottom: 1em; }
//             table { border-collapse: collapse; width: 100%; margin: 1em 0; }
//             th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
//             th { background-color: #f5f5f5; }
//             img { max-width: 100%; height: auto; }
//           </style>
//         </head>
//         <body>
//           ${editorContent}
//         </body>
//       </html>
//     `;
    
//     downloadBlob(`${fileName}.html`, new Blob([htmlContent], { type: "text/html;charset=utf-8" }));
//   }, [editorContent, fileName]);

//   const exportToText = useCallback(() => {
//     // Strip HTML tags and convert to plain text
//     const tempDiv = document.createElement('div');
//     tempDiv.innerHTML = editorContent;
//     const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
//     downloadBlob(`${fileName}.txt`, new Blob([textContent], { type: "text/plain;charset=utf-8" }));
//   }, [editorContent, fileName]);

//   // Go back to templates
//   const handleBackToTemplates = useCallback(async () => {
//     try {
//       // Save current work
//       if (editorContent && selectedTemplate) {
//         localStorage.setItem(currentStorageKey, editorContent);
//         localStorage.setItem(currentStorageKey + '_lastSaved', new Date().toISOString());
        
//         // Save to backend if it's a backend template
//         if (selectedTemplate.id && typeof selectedTemplate.id === 'string' && !selectedTemplate.id.includes('-')) {
//           const blob = new Blob([editorContent], { type: 'text/html' });
//           const file = new File([blob], fileName + '.html', { type: 'text/html' });
          
//           await ApiService.saveUserDraft(selectedTemplate.id, fileName, file);
//         }
//       }
//     } catch (error) {
//       console.error('Error saving before exit:', error);
//     }
    
//     setSelectedTemplate(null);
//     setEditorContent('');
//     setFileName('Untitled Document');
//     setError(null);
//   }, [editorContent, selectedTemplate, currentStorageKey, fileName]);

//   // Manual save function with backend integration
//   const handleManualSave = useCallback(async () => {
//     try {
//       setIsLoading(true);
      
//       // Save to localStorage
//       localStorage.setItem(currentStorageKey, editorContent);
//       localStorage.setItem(currentStorageKey + '_lastSaved', new Date().toISOString());
      
//       // Save to backend if it's a backend template
//       if (selectedTemplate?.id && typeof selectedTemplate.id === 'string' && !selectedTemplate.id.includes('-')) {
//         const blob = new Blob([editorContent], { type: 'text/html' });
//         const file = new File([blob], fileName + '.html', { type: 'text/html' });
          
//         await ApiService.saveUserDraft(selectedTemplate.id, fileName, file);
//       }
      
//       // Show success message briefly
//       setError(null);
      
//     } catch (error) {
//       console.error('Manual save failed:', error);
//       setError('Failed to save document. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [editorContent, currentStorageKey, selectedTemplate, fileName]);

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {!selectedTemplate ? (
//         // Template Selection View
//         <div className="flex-1 flex flex-col">
//           {/* Header */}
//           <header className="bg-white border-b border-gray-200 px-6 py-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">Document Templates</h1>
//                 <p className="text-sm text-gray-600 mt-1">Choose a template to start creating your document</p>
//               </div>
//               <div className="flex items-center space-x-4">
//                 <div className="flex items-center space-x-2 text-sm text-gray-600">
//                   <User className="w-4 h-4" />
//                   <span>User: {userId.slice(-8)}</span>
//                 </div>
//                 {documentList.length > 0 && (
//                   <div className="relative">
//                     <button
//                       onClick={() => setIsMenuOpen(!isMenuOpen)}
//                       className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
//                     >
//                       <FileText className="w-4 h-4" />
//                       <span>Recent Documents ({documentList.length})</span>
//                       <ChevronDown className="w-4 h-4" />
//                     </button>
                    
//                     {isMenuOpen && (
//                       <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
//                         <div className="p-4 border-b border-gray-100">
//                           <h3 className="font-semibold text-gray-900">Recent Documents</h3>
//                         </div>
//                         <div className="max-h-64 overflow-y-auto">
//                           {documentList.slice(0, 10).map((doc) => (
//                             <button
//                               key={doc.id}
//                               onClick={() => {
//                                 const template = { id: doc.templateId, content: doc.content };
//                                 handleTemplateSelection(template);
//                                 setIsMenuOpen(false);
//                               }}
//                               className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
//                             >
//                               <div className="flex justify-between items-start">
//                                 <div className="flex-1 min-w-0">
//                                   <p className="font-medium text-gray-900 truncate">{doc.fileName}</p>
//                                   <p className="text-sm text-gray-600">{doc.wordCount} words</p>
//                                 </div>
//                                 <div className="text-xs text-gray-500 ml-2">
//                                   {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
//                                     Math.floor((doc.lastSaved - new Date()) / (1000 * 60 * 60 * 24)),
//                                     'day'
//                                   )}
//                                 </div>
//                               </div>
//                             </button>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </header>

//           {/* Search */}
//           <div className="bg-white border-b border-gray-200 px-6 py-4">
//             <div className="max-w-md">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <input
//                   type="text"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   placeholder="Search templates..."
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Error message */}
//           {error && (
//             <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
//               <div className="flex">
//                 <div className="ml-3">
//                   <p className="text-sm text-red-700">{error}</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Templates */}
//           <div className="flex-1 overflow-hidden px-6 py-6">
//             <Templates onSelectTemplate={handleTemplateSelection} query={searchQuery} />
//           </div>
//         </div>
//       ) : (
//         // Document Editor View
//         <div className="flex-1 flex flex-col">
//           {/* Header */}
//           <header className="bg-white border-b border-gray-200 px-6 py-3">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-4">
//                 <button
//                   onClick={handleBackToTemplates}
//                   disabled={isLoading}
//                   className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
//                   title="Back to Templates"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                   <span className="text-sm font-medium">Templates</span>
//                 </button>
                
//                 <div className="h-6 w-px bg-gray-300"></div>
                
//                 <div className="flex items-center space-x-3">
//                   <input
//                     type="text"
//                     value={fileName}
//                     onChange={(e) => setFileName(e.target.value)}
//                     className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 min-w-0 w-64"
//                     placeholder="Document name"
//                     disabled={isLoading}
//                   />
                  
//                   {/* Save status indicator */}
//                   <div className="flex items-center space-x-2 text-xs text-gray-500">
//                     {isSaving ? (
//                       <>
//                         <Loader className="w-3 h-3 animate-spin" />
//                         <span>Saving...</span>
//                       </>
//                     ) : lastSaved ? (
//                       <>
//                         <Clock className="w-3 h-3" />
//                         <span>
//                           Saved {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
//                             Math.floor((lastSaved - new Date()) / (1000 * 60)),
//                             'minute'
//                           )}
//                         </span>
//                       </>
//                     ) : null}
//                   </div>
//                 </div>
//               </div>

//               {/* Actions */}
//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={handleManualSave}
//                   disabled={isLoading || isSaving}
//                   className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
//                   title="Save Document"
//                 >
//                   {isLoading ? (
//                     <Loader className="h-4 w-4 animate-spin" />
//                   ) : (
//                     <Save className="h-4 w-4" />
//                   )}
//                   <span className="text-sm">Save</span>
//                 </button>

//                 <div className="relative">
//                   <button
//                     onClick={() => setIsMenuOpen(!isMenuOpen)}
//                     disabled={isLoading}
//                     className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
//                   >
//                     <Download className="h-4 w-4" />
//                     <span className="text-sm">Export</span>
//                     <ChevronDown className="h-4 w-4" />
//                   </button>
                  
//                   {isMenuOpen && (
//                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
//                       <div className="py-1">
//                         <button
//                           onClick={() => {
//                             exportToPDF();
//                             setIsMenuOpen(false);
//                           }}
//                           className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                         >
//                           <Printer className="w-4 h-4" />
//                           <span>Export as PDF</span>
//                         </button>
//                         <button
//                           onClick={() => {
//                             exportToHTML();
//                             setIsMenuOpen(false);
//                           }}
//                           className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                         >
//                           <FileText className="w-4 h-4" />
//                           <span>Export as HTML</span>
//                         </button>
//                         <button
//                           onClick={() => {
//                             exportToText();
//                             setIsMenuOpen(false);
//                           }}
//                           className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                         >
//                           <FileText className="w-4 h-4" />
//                           <span>Export as Text</span>
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
//                   <User className="w-4 h-4" />
//                   <span>User: {userId.slice(-8)}</span>
//                 </div>
//               </div>
//             </div>

//             {/* Error message in editor */}
//             {error && (
//               <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
//                 {error}
//               </div>
//             )}
//           </header>

//           {/* Editor */}
//           <div className="flex-1 overflow-hidden">
//             <RichTextEditor
//               value={editorContent}
//               onChange={handleEditorChange}
//               placeholder={`Start editing your ${selectedTemplate.name || 'document'}...`}
//               userId={userId}
//             />
//           </div>
//         </div>
//       )}

//       {/* Click outside to close menus */}
//       {isMenuOpen && (
//         <div
//           className="fixed inset-0 z-0"
//           onClick={() => setIsMenuOpen(false)}
//         />
//       )}

//       {/* Loading overlay */}
//       {isLoading && (
//         <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-3">
//             <Loader className="h-5 w-5 animate-spin text-blue-600" />
//             <span>Loading...</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DraftingPage;
// import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
// import { 
//   Search, Download, Printer, ArrowLeft, Save, Share2, 
//   Settings, MoreVertical, Clock, Users, FileText,
//   ChevronDown, Bell, User, Loader
// } from "lucide-react";
// import RichTextEditor from "../components/RichTextEditor";
// import Templates from "../components/Templates";
// import ApiService from "../services/api";

// // Utility function to generate unique user ID
// const generateUserId = () => {
//   const stored = localStorage.getItem('documentEditorUserId') || localStorage.getItem('userId');
//   if (stored) return stored;
  
//   const newId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
//   localStorage.setItem('documentEditorUserId', newId);
//   return newId;
// };

// // Helper function to create user-specific storage keys
// const createStorageKey = (userId, templateId, suffix = '') => {
//   return `docEditor_${userId}_${templateId || 'blank'}${suffix ? '_' + suffix : ''}`;
// };

// // Helper function to trigger downloads
// const downloadBlob = (filename, blob) => {
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = filename;
//   document.body.appendChild(a);
//   a.click();
//   a.remove();
//   URL.revokeObjectURL(url);
// };

// // Auto-save hook with backend integration
// const useAutoSave = (content, storageKey, templateId, delay = 5000) => {
//   const timeoutRef = useRef(null);
//   const [isSaving, setIsSaving] = useState(false);
//   const [lastSaved, setLastSaved] = useState(null);

//   useEffect(() => {
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//     }

//     timeoutRef.current = setTimeout(async () => {
//       if (content && typeof content === 'string') {
//         setIsSaving(true);
//         try {
//           // Save to localStorage immediately
//           localStorage.setItem(storageKey, content);
//           localStorage.setItem(storageKey + '_lastSaved', new Date().toISOString());
          
//           // Save to backend if template ID exists
//           if (typeof templateId === 'string' && !templateId.includes('-')) {
//             const blob = new Blob([content], { type: 'text/html' });
//             const file = new File([blob], 'document.html', { type: 'text/html' });
            
//             await ApiService.saveUserDraft(templateId, 'Auto-saved Document', file);
//           }
          
//           setLastSaved(new Date());
//         } catch (error) {
//           console.error('Auto-save failed:', error);
//         } finally {
//           setIsSaving(false);
//         }
//       }
//     }, delay);

//     return () => {
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
//     };
//   }, [content, storageKey, templateId, delay]);

//   return { isSaving, lastSaved };
// };

// const DraftingPage = () => {
//   // User identification - each user gets unique ID
//   const userId = useMemo(() => generateUserId(), []);
  
//   // State management
//   const [selectedTemplate, setSelectedTemplate] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [fileName, setFileName] = useState("Untitled Document");
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [documentList, setDocumentList] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [saveMessage, setSaveMessage] = useState(null); // New state for save messages

//   // Get templateId and editUrl from URL parameters
//   const location = window.location;
//   const queryParams = new URLSearchParams(location.search);
//   const templateIdFromUrl = queryParams.get('templateId');
//   const editUrlFromUrl = queryParams.get('editUrl');

//   // Initialize editor content from localStorage for the current user and selected template, or a blank document
//   const [editorContent, setEditorContent] = useState(() => {
//     const initialTemplateId = templateIdFromUrl || 'blank'; // Use 'blank' for no specific template
//     const initialStorageKey = createStorageKey(userId, initialTemplateId, 'content');
//     const savedContent = localStorage.getItem(initialStorageKey);
//     return savedContent || '';
//   });


//   console.log('DraftingPage: Initializing with URL Params:', { templateIdFromUrl, editUrlFromUrl });

//   // Create user-specific storage key for current document
//   const currentStorageKey = useMemo(() => 
//     createStorageKey(userId, selectedTemplate?.id, 'content'), 
//     [userId, selectedTemplate?.id]
//   );

//   const fileNameStorageKey = useMemo(() => 
//     createStorageKey(userId, selectedTemplate?.id, 'fileName'), 
//     [userId, selectedTemplate?.id]
//   );

//   // Auto-save functionality with backend integration
//   const { isSaving, lastSaved } = useAutoSave(editorContent, currentStorageKey, selectedTemplate?.id);

//   // Effect to load template based on URL params
//   useEffect(() => {
//     const loadTemplateFromUrl = async () => {
//       if (templateIdFromUrl) {
//         try {
//           setIsLoading(true);
//           setError(null);
//           let templateToLoad = null;

//           if (editUrlFromUrl && editUrlFromUrl.toLowerCase().endsWith('.docx')) {
//             // If it's a DOCX URL, create a dummy template object with editUrl
//             templateToLoad = {
//               id: templateIdFromUrl,
//               name: 'Document from Upload',
//               editUrl: editUrlFromUrl,
//               isBackendTemplate: false,
//             };
//             // For DOCX files, let RichTextEditor handle the conversion
//             setEditorContent(editUrlFromUrl);
//             setFileName(templateToLoad.name);
//           } else {
//             // Otherwise, fetch template from backend
//             const result = await ApiService.openTemplateForEditing(templateIdFromUrl);
//             const htmlContent = result?.html || result || '';
            
//             templateToLoad = {
//               id: templateIdFromUrl,
//               name: result?.name || 'Document from Backend',
//               content: htmlContent,
//               isBackendTemplate: true,
//             };
            
//             // Ensure we're setting a string value
//             setEditorContent(typeof htmlContent === 'string' ? htmlContent : '');
//             setFileName(templateToLoad.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'document');
//           }
//           setSelectedTemplate(templateToLoad);
//         } catch (err) {
//           console.error('Error loading template from URL:', err);
//           setError(`Failed to load document: ${err.message}`);
//           setSelectedTemplate(null);
//           setEditorContent('');
//           setFileName('Untitled Document');
//         } finally {
//           setIsLoading(false);
//         }
//       }
//     };
//     loadTemplateFromUrl();
//   }, [templateIdFromUrl, editUrlFromUrl]);

//   // Load saved filename
//   useEffect(() => {
//     const savedFileName = localStorage.getItem(fileNameStorageKey);
//     if (savedFileName) {
//       setFileName(savedFileName);
//     } else if (selectedTemplate) {
//       setFileName(selectedTemplate.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'document');
//     }
//   }, [selectedTemplate, fileNameStorageKey]);

//   // Save filename when it changes
//   useEffect(() => {
//     if (fileName && fileName !== "Untitled Document") {
//       localStorage.setItem(fileNameStorageKey, fileName);
//     }
//   }, [fileName, fileNameStorageKey]);

//   // Load document list for current user
//   useEffect(() => {
//     const loadDocumentList = () => {
//       const allKeys = Object.keys(localStorage);
//       const userDocs = allKeys
//         .filter(key => key.startsWith(`docEditor_${userId}_`) && key.endsWith('_content'))
//         .map(key => {
//           const parts = key.split('_');
//           const templateId = parts[2];
//           const content = localStorage.getItem(key);
//           const lastSavedKey = key + '_lastSaved';
//           const lastSaved = localStorage.getItem(lastSavedKey);
//           const fileNameKey = key.replace('_content', '_fileName');
//           const fileName = localStorage.getItem(fileNameKey) || 'Untitled Document';
          
//           return {
//             id: key,
//             templateId,
//             fileName,
//             content,
//             lastSaved: lastSaved ? new Date(lastSaved) : new Date(),
//             wordCount: content ? content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length : 0
//           };
//         })
//         .sort((a, b) => new Date(b.lastSaved) - new Date(a.lastSaved));
      
//       setDocumentList(userDocs);
//     };

//     loadDocumentList();
//   }, [userId, editorContent]);

//   // Handle template selection with backend integration - FIXED VERSION
//   const handleTemplateSelection = useCallback(async (template) => {
//     try {
//       setIsLoading(true);
//       setError(null);
      
//       console.log('Template selected:', template);
      
//       // Save current work if any, before switching to a new template
//       if (editorContent && selectedTemplate) {
//         localStorage.setItem(currentStorageKey, editorContent);
//         localStorage.setItem(fileNameStorageKey, fileName); // Also save the current filename
//       }

//       // Determine the storage key for the newly selected template
//       const newTemplateStorageKey = createStorageKey(userId, template.id, 'content');
//       const newTemplateFileNameKey = createStorageKey(userId, template.id, 'fileName');
//       const savedContentForNewTemplate = localStorage.getItem(newTemplateStorageKey);
//       const savedFileNameForNewTemplate = localStorage.getItem(newTemplateFileNameKey);

//       if (savedContentForNewTemplate) {
//         // If content is saved for this template, load it
//         setSelectedTemplate(template);
//         setEditorContent(savedContentForNewTemplate);
//         setFileName(savedFileNameForNewTemplate || template.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'document');
//       } else if (template.editUrl && typeof template.editUrl === 'string' && template.editUrl.toLowerCase().endsWith('.docx')) {
//         // If it's a DOCX URL and no saved content, pass the editUrl directly to RichTextEditor for conversion
//         setSelectedTemplate({
//           ...template,
//           content: template.editUrl,
//         });
//         setEditorContent(template.editUrl);
//         setFileName(template.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'document');
//       } else if (template.isBackendTemplate) {
//         // For backend templates, fetch the HTML content if no local save exists
//         try {
//           const result = await ApiService.openTemplateForEditing(template.id);
//           console.log('Backend template result:', result);
          
//           let htmlContent = '';
//           if (typeof result === 'string') {
//             htmlContent = result;
//           } else if (result && typeof result === 'object') {
//             htmlContent = result.html || result.content || '';
//           }
//           htmlContent = typeof htmlContent === 'string' ? htmlContent : '';
          
//           setSelectedTemplate({
//             ...template,
//             content: htmlContent,
//             isBackendTemplate: true,
//           });
//           setEditorContent(htmlContent);
//           setFileName(template.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'document');
          
//         } catch (err) {
//           console.error('Error opening backend template:', err);
//           setError('Failed to open backend template. Please try again.');
          
//           const fallbackContent = template.content || '';
//           setSelectedTemplate({
//             ...template,
//             content: fallbackContent,
//           });
//           setEditorContent(typeof fallbackContent === 'string' ? fallbackContent : '');
//           setFileName(template.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'document');
//         }
//       } else {
//         // For static templates with no saved content
//         setSelectedTemplate(template);
//         setEditorContent(template.content || '');
//         setFileName(template.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'document');
//       }
      
//     } catch (error) {
//       console.error('Error selecting template:', error);
//       setError('Failed to load template. Please try again.');
      
//       const fallbackContent = template.content || '';
//       setSelectedTemplate({
//         ...template,
//         content: fallbackContent,
//       });
//       setEditorContent(typeof fallbackContent === 'string' ? fallbackContent : '');
//       setFileName(template.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'document');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [editorContent, selectedTemplate, currentStorageKey, fileNameStorageKey, userId]); // Added back dependencies

//   // Handle content changes - FIXED VERSION
//   const handleEditorChange = useCallback((content) => {
//     // Ensure content is always a string
//     const stringContent = typeof content === 'string' ? content : '';
//     setEditorContent(stringContent);
//     console.log('Editor content changed:', typeof stringContent, stringContent.substring(0, 100));
//   }, []);

//   // Export functions with backend integration
//   const exportToPDF = useCallback(() => {
//     const printWindow = window.open('', '_blank');
//     const contentToPrint = typeof editorContent === 'string' ? editorContent : '';

//     const printHtml = `
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <title>${fileName}</title>
//           <style>
//             body { 
//               font-family: 'Times New Roman', serif; 
//               margin: 0; 
//               padding: 40px; 
//               background-color: white; 
//               line-height: 1.6;
//               color: #1a1a1a;
//             }
//             @page {
//               margin: 1in;
//               size: letter;
//             }
//             @media print {
//               body { margin: 0; padding: 0; }
//               .no-print { display: none; }
//             }
//             h1, h2, h3, h4, h5, h6 { 
//               margin-top: 1.5em; 
//               margin-bottom: 0.5em; 
//               page-break-after: avoid; 
//             }
//             p { margin-bottom: 1em; }
//             table { 
//               border-collapse: collapse; 
//               width: 100%; 
//               margin: 1em 0; 
//             }
//             th, td { 
//               border: 1px solid #ccc; 
//               padding: 8px; 
//               text-align: left; 
//             }
//             th { background-color: #f5f5f5; }
//             img { max-width: 100%; height: auto; }
//             .page-break { page-break-before: always; }
//           </style>
//         </head>
//         <body>
//           ${contentToPrint}
//         </body>
//       </html>
//     `;

//     printWindow.document.write(printHtml);
//     printWindow.document.close();
//     printWindow.onload = () => {
//       printWindow.focus();
//       printWindow.print();
//       printWindow.close();
//     };
//   }, [editorContent, fileName]);

//   const exportToHTML = useCallback(() => {
//     const contentToExport = typeof editorContent === 'string' ? editorContent : '';
//     const htmlContent = `
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <meta charset="UTF-8">
//           <title>${fileName}</title>
//           <style>
//             body { 
//               font-family: 'Times New Roman', serif; 
//               max-width: 800px; 
//               margin: 0 auto; 
//               padding: 40px; 
//               line-height: 1.6; 
//               color: #1a1a1a; 
//             }
//             h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
//             p { margin-bottom: 1em; }
//             table { border-collapse: collapse; width: 100%; margin: 1em 0; }
//             th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
//             th { background-color: #f5f5f5; }
//             img { max-width: 100%; height: auto; }
//           </style>
//         </head>
//         <body>
//           ${contentToExport}
//         </body>
//       </html>
//     `;
    
//     downloadBlob(`${fileName}.html`, new Blob([htmlContent], { type: "text/html;charset=utf-8" }));
//   }, [editorContent, fileName]);

//   const exportToText = useCallback(() => {
//     const contentToExport = typeof editorContent === 'string' ? editorContent : '';
//     // Strip HTML tags and convert to plain text
//     const tempDiv = document.createElement('div');
//     tempDiv.innerHTML = contentToExport;
//     const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
//     downloadBlob(`${fileName}.txt`, new Blob([textContent], { type: "text/plain;charset=utf-8" }));
//   }, [editorContent, fileName]);

//   // Go back to templates
//   const handleBackToTemplates = useCallback(async () => {
//     try {
//       // Save current work
//       if (editorContent && selectedTemplate) {
//         localStorage.setItem(currentStorageKey, editorContent);
//         localStorage.setItem(currentStorageKey + '_lastSaved', new Date().toISOString());
        
//         // Save to backend if it's a backend template
//         if (selectedTemplate.id && typeof selectedTemplate.id === 'string' && !selectedTemplate.id.includes('-')) {
//           const blob = new Blob([editorContent], { type: 'text/html' });
//           const file = new File([blob], fileName + '.html', { type: 'text/html' });
          
//           await ApiService.saveUserDraft(selectedTemplate.id, fileName, file);
//         }
//       }
//     } catch (error) {
//       console.error('Error saving before exit:', error);
//     }
    
//     setSelectedTemplate(null);
//     setEditorContent('');
//     setFileName('Untitled Document');
//     setError(null);
//   }, [editorContent, selectedTemplate, currentStorageKey, fileName]);

//   // Manual save function with backend integration
//   const handleManualSave = useCallback(async () => {
//     try {
//       setIsLoading(true);
      
//       // Save to localStorage
//       localStorage.setItem(currentStorageKey, editorContent);
//       localStorage.setItem(currentStorageKey + '_lastSaved', new Date().toISOString());
      
//       // Save to backend if it's a backend template
//       if (selectedTemplate?.id && typeof selectedTemplate.id === 'string' && !selectedTemplate.id.includes('-')) {
//         const blob = new Blob([editorContent], { type: 'text/html' });
//         const file = new File([blob], fileName + '.html', { type: 'text/html' });
          
//         await ApiService.saveUserDraft(selectedTemplate.id, fileName, file);
//       }
      
//       // Show success message briefly
//       setSaveMessage('Document saved successfully!');
//       setError(null);
//       setTimeout(() => setSaveMessage(null), 3000); // Clear message after 3 seconds
      
//     } catch (error) {
//       console.error('Manual save failed:', error);
//       setError('Failed to save document. Please try again.');
//       setSaveMessage(null); // Clear any success message on error
//     } finally {
//       setIsLoading(false);
//     }
//   }, [editorContent, currentStorageKey, selectedTemplate, fileName]);

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {!selectedTemplate ? (
//         // Template Selection View
//         <div className="flex-1 flex flex-col">
//           {/* Header */}
//           <header className="bg-white border-b border-gray-200 px-6 py-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">Document Templates</h1>
//                 <p className="text-sm text-gray-600 mt-1">Choose a template to start creating your document</p>
//               </div>
//               <div className="flex items-center space-x-4">
//                 <div className="flex items-center space-x-2 text-sm text-gray-600">
//                   <User className="w-4 h-4" />
//                   <span>User: {userId.slice(-8)}</span>
//                 </div>
//                 {documentList.length > 0 && (
//                   <div className="relative">
//                     <button
//                       onClick={() => setIsMenuOpen(!isMenuOpen)}
//                       className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
//                     >
//                       <FileText className="w-4 h-4" />
//                       <span>Recent Documents ({documentList.length})</span>
//                       <ChevronDown className="w-4 h-4" />
//                     </button>
                    
//                     {isMenuOpen && (
//                       <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
//                         <div className="p-4 border-b border-gray-100">
//                           <h3 className="font-semibold text-gray-900">Recent Documents</h3>
//                         </div>
//                         <div className="max-h-64 overflow-y-auto">
//                           {documentList.slice(0, 10).map((doc) => (
//                             <button
//                               key={doc.id}
//                               onClick={() => {
//                                 const template = { id: doc.templateId, content: doc.content };
//                                 handleTemplateSelection(template);
//                                 setIsMenuOpen(false);
//                               }}
//                               className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
//                             >
//                               <div className="flex justify-between items-start">
//                                 <div className="flex-1 min-w-0">
//                                   <p className="font-medium text-gray-900 truncate">{doc.fileName}</p>
//                                   <p className="text-sm text-gray-600">{doc.wordCount} words</p>
//                                 </div>
//                                 <div className="text-xs text-gray-500 ml-2">
//                                   {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
//                                     Math.floor((doc.lastSaved - new Date()) / (1000 * 60 * 60 * 24)),
//                                     'day'
//                                   )}
//                                 </div>
//                               </div>
//                             </button>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </header>

//           {/* Search */}
//           <div className="bg-white border-b border-gray-200 px-6 py-4">
//             <div className="max-w-md">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <input
//                   type="text"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   placeholder="Search templates..."
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Error message */}
//           {error && (
//             <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
//               <div className="flex">
//                 <div className="ml-3">
//                   <p className="text-sm text-red-700">{error}</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Templates */}
//           <div className="flex-1 overflow-hidden px-6 py-6">
//             <Templates onSelectTemplate={handleTemplateSelection} query={searchQuery} />
//           </div>
//         </div>
//       ) : (
//         // Document Editor View
//         <div className="flex-1 flex flex-col">
//           {/* Header */}
//           <header className="bg-white border-b border-gray-200 px-6 py-3">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-4">
//                 <button
//                   onClick={handleBackToTemplates}
//                   disabled={isLoading}
//                   className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
//                   title="Back to Templates"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                   <span className="text-sm font-medium">Templates</span>
//                 </button>
                
//                 <div className="h-6 w-px bg-gray-300"></div>
                
//                 <div className="flex items-center space-x-3">
//                   <input
//                     type="text"
//                     value={fileName}
//                     onChange={(e) => setFileName(e.target.value)}
//                     className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 min-w-0 w-64"
//                     placeholder="Document name"
//                     disabled={isLoading}
//                   />
                  
//                   {/* Save status indicator */}
//                   <div className="flex items-center space-x-2 text-xs text-gray-500">
//                     {isSaving ? (
//                       <>
//                         <Loader className="w-3 h-3 animate-spin" />
//                         <span>Saving...</span>
//                       </>
//                     ) : lastSaved ? (
//                       <>
//                         <Clock className="w-3 h-3" />
//                         <span>
//                           Saved {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
//                             Math.floor((lastSaved - new Date()) / (1000 * 60)),
//                             'minute'
//                           )}
//                         </span>
//                       </>
//                     ) : null}
//                   </div>
//                 </div>
//               </div>

//               {/* Actions */}
//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={handleManualSave}
//                   disabled={isLoading || isSaving}
//                   className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
//                   title="Save Document"
//                 >
//                   {isLoading ? (
//                     <Loader className="h-4 w-4 animate-spin" />
//                   ) : (
//                     <Save className="h-4 w-4" />
//                   )}
//                   <span className="text-sm">Save</span>
//                 </button>

//                 <div className="relative">
//                   <button
//                     onClick={() => setIsMenuOpen(!isMenuOpen)}
//                     disabled={isLoading}
//                     className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
//                   >
//                     <Download className="h-4 w-4" />
//                     <span className="text-sm">Export</span>
//                     <ChevronDown className="h-4 w-4" />
//                   </button>
                  
//                   {isMenuOpen && (
//                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
//                       <div className="py-1">
//                         <button
//                           onClick={() => {
//                             exportToPDF();
//                             setIsMenuOpen(false);
//                           }}
//                           className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                         >
//                           <Printer className="w-4 h-4" />
//                           <span>Export as PDF</span>
//                         </button>
//                         <button
//                           onClick={() => {
//                             exportToHTML();
//                             setIsMenuOpen(false);
//                           }}
//                           className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                         >
//                           <FileText className="w-4 h-4" />
//                           <span>Export as HTML</span>
//                         </button>
//                         <button
//                           onClick={() => {
//                             exportToText();
//                             setIsMenuOpen(false);
//                           }}
//                           className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                         >
//                           <FileText className="w-4 h-4" />
//                           <span>Export as Text</span>
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
//                   <User className="w-4 h-4" />
//                   <span>User: {userId.slice(-8)}</span>
//                 </div>
//               </div>
//             </div>

//             {/* Error or Save message in editor */}
//             {error && (
//               <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
//                 {error}
//               </div>
//             )}
//             {saveMessage && (
//               <div className="mt-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded">
//                 {saveMessage}
//               </div>
//             )}
//           </header>

//           {/* Editor */}
//           <div className="flex-1 overflow-hidden">
//             <RichTextEditor
//               value={typeof editorContent === 'string' ? editorContent : ''}
//               onChange={handleEditorChange}
//               placeholder={`Start editing your ${selectedTemplate?.name || 'document'}...`}
//               userId={userId}
//             />
//           </div>
//         </div>
//       )}

//       {/* Click outside to close menus */}
//       {isMenuOpen && (
//         <div
//           className="fixed inset-0 z-0"
//           onClick={() => setIsMenuOpen(false)}
//         />
//       )}

//       {/* Loading overlay */}
//       {isLoading && (
//         <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-3">
//             <Loader className="h-5 w-5 animate-spin text-blue-600" />
//             <span>Loading...</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DraftingPage;

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { 
  Search, Download, Printer, ArrowLeft, Save, Share2, 
  Settings, MoreVertical, Clock, Users, FileText,
  ChevronDown, Bell, User, Loader, X
} from "lucide-react";
import RichTextEditor from "../components/RichTextEditor";
import Templates from "../components/Templates";
import ApiService from "../services/api";

// Utility function to generate unique user ID
const generateUserId = () => {
  const stored = localStorage.getItem('documentEditorUserId') || localStorage.getItem('userId');
  if (stored) return stored;
  
  const newId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  localStorage.setItem('documentEditorUserId', newId);
  return newId;
};

// Helper function to create user-specific storage keys
const createStorageKey = (userId, templateId, suffix = '') => {
  return `docEditor_${userId}_${templateId || 'blank'}${suffix ? '_' + suffix : ''}`;
};

// Helper function to trigger downloads
const downloadBlob = (filename, blob) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

// Auto-save hook with backend integration
const useAutoSave = (content, storageKey, templateId, delay = 3000) => {
  const timeoutRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (content && typeof content === 'string') {
        setIsSaving(true);
        try {
          // Save to localStorage immediately
          localStorage.setItem(storageKey, content);
          localStorage.setItem(storageKey + '_lastSaved', new Date().toISOString());
          
          // Save to backend if template ID exists
          if (typeof templateId === 'string' && !templateId.includes('-')) {
            const blob = new Blob([content], { type: 'text/html' });
            const file = new File([blob], 'document.html', { type: 'text/html' });
            
            await ApiService.saveUserDraft(templateId, 'Auto-saved Document', file);
          }
          
          setLastSaved(new Date());
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsSaving(false);
        }
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, storageKey, templateId, delay]);

  return { isSaving, lastSaved };
};

const DraftingPage = () => {
  // User identification - each user gets unique ID
  const userId = useMemo(() => generateUserId(), []);
  
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [documentList, setDocumentList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  // Current session storage keys
  const currentSessionKey = 'drafting_current_session';
  const currentSessionData = JSON.parse(localStorage.getItem(currentSessionKey) || 'null');

  // Initialize state from localStorage or URL params
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    // Check if we have a current session
    if (currentSessionData && currentSessionData.selectedTemplate) {
      return currentSessionData.selectedTemplate;
    }
    return null;
  });

  const [fileName, setFileName] = useState(() => {
    if (currentSessionData && currentSessionData.fileName) {
      return currentSessionData.fileName;
    }
    return "Untitled Document";
  });

  const [editorContent, setEditorContent] = useState(() => {
    if (currentSessionData && currentSessionData.editorContent) {
      return currentSessionData.editorContent;
    }
    return '';
  });

  // Get templateId and editUrl from URL parameters
  const location = window.location;
  const queryParams = new URLSearchParams(location.search);
  const templateIdFromUrl = queryParams.get('templateId');
  const editUrlFromUrl = queryParams.get('editUrl');

  console.log('DraftingPage: Initializing with URL Params:', { templateIdFromUrl, editUrlFromUrl });
  console.log('DraftingPage: Current session data:', currentSessionData);

  // Create user-specific storage key for current document
  const currentStorageKey = useMemo(() => 
    createStorageKey(userId, selectedTemplate?.id, 'content'), 
    [userId, selectedTemplate?.id]
  );

  const fileNameStorageKey = useMemo(() => 
    createStorageKey(userId, selectedTemplate?.id, 'fileName'), 
    [userId, selectedTemplate?.id]
  );

  // Auto-save functionality with backend integration
  const { isSaving, lastSaved } = useAutoSave(editorContent, currentStorageKey, selectedTemplate?.id);

  // Save current session data whenever state changes
  useEffect(() => {
    const sessionData = {
      selectedTemplate,
      fileName,
      editorContent,
      lastModified: new Date().toISOString()
    };
    localStorage.setItem(currentSessionKey, JSON.stringify(sessionData));
  }, [selectedTemplate, fileName, editorContent, currentSessionKey]);

  // Effect to load template based on URL params (only if no current session)
  useEffect(() => {
    const loadTemplateFromUrl = async () => {
      // Only load from URL if we don't have a current session
      if (templateIdFromUrl && !currentSessionData) {
        try {
          setIsLoading(true);
          setError(null);
          let templateToLoad = null;

          if (editUrlFromUrl && editUrlFromUrl.toLowerCase().endsWith('.docx')) {
            // If it's a DOCX URL, create a dummy template object with editUrl
            templateToLoad = {
              id: templateIdFromUrl,
              name: 'Document from Upload',
              editUrl: editUrlFromUrl,
              isBackendTemplate: false,
            };
            // For DOCX files, let RichTextEditor handle the conversion
            setEditorContent(editUrlFromUrl);
            setFileName(templateToLoad.name);
          } else {
            // Otherwise, fetch template from backend
            const result = await ApiService.openTemplateForEditing(templateIdFromUrl);
            const htmlContent = result?.html || result || '';
            
            templateToLoad = {
              id: templateIdFromUrl,
              name: result?.name || 'Document from Backend',
              content: htmlContent,
              isBackendTemplate: true,
            };
            
            // Ensure we're setting a string value
            setEditorContent(typeof htmlContent === 'string' ? htmlContent : '');
            setFileName(templateToLoad.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'document');
          }
          setSelectedTemplate(templateToLoad);
        } catch (err) {
          console.error('Error loading template from URL:', err);
          setError(`Failed to load document: ${err.message}`);
          setSelectedTemplate(null);
          setEditorContent('');
          setFileName('Untitled Document');
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadTemplateFromUrl();
  }, [templateIdFromUrl, editUrlFromUrl, currentSessionData]);

  // Load saved filename and content from localStorage for the current template
  useEffect(() => {
    if (selectedTemplate && selectedTemplate.id) {
      const savedContent = localStorage.getItem(currentStorageKey);
      const savedFileName = localStorage.getItem(fileNameStorageKey);
      
      // Only load from localStorage if we don't already have content from session
      if (!currentSessionData || !currentSessionData.editorContent) {
        if (savedContent) {
          setEditorContent(savedContent);
        }
      }
      
      if (!currentSessionData || !currentSessionData.fileName) {
        if (savedFileName) {
          setFileName(savedFileName);
        }
      }
    }
  }, [selectedTemplate, currentStorageKey, fileNameStorageKey, currentSessionData]);

  // Save individual items to localStorage when they change
  useEffect(() => {
    if (selectedTemplate && selectedTemplate.id && editorContent) {
      localStorage.setItem(currentStorageKey, editorContent);
    }
  }, [editorContent, currentStorageKey, selectedTemplate]);

  useEffect(() => {
    if (selectedTemplate && selectedTemplate.id && fileName && fileName !== "Untitled Document") {
      localStorage.setItem(fileNameStorageKey, fileName);
    }
  }, [fileName, fileNameStorageKey, selectedTemplate]);

  // Load document list for current user
  useEffect(() => {
    const loadDocumentList = () => {
      const allKeys = Object.keys(localStorage);
      const userDocs = allKeys
        .filter(key => key.startsWith(`docEditor_${userId}_`) && key.endsWith('_content'))
        .map(key => {
          const parts = key.split('_');
          const templateId = parts[2];
          const content = localStorage.getItem(key);
          const lastSavedKey = key + '_lastSaved';
          const lastSaved = localStorage.getItem(lastSavedKey);
          const fileNameKey = key.replace('_content', '_fileName');
          const fileName = localStorage.getItem(fileNameKey) || 'Untitled Document';
          
          return {
            id: key,
            templateId,
            fileName,
            content,
            lastSaved: lastSaved ? new Date(lastSaved) : new Date(),
            wordCount: content ? content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length : 0
          };
        })
        .sort((a, b) => new Date(b.lastSaved) - new Date(a.lastSaved));
      
      setDocumentList(userDocs);
    };

    loadDocumentList();
  }, [userId, editorContent]);

  // Handle template selection with change detection
  const handleTemplateSelection = useCallback(async (template) => {
    // Check if there are unsaved changes
    const hasChanges = editorContent && editorContent.trim() !== '' && 
                      (!selectedTemplate || editorContent !== (selectedTemplate.content || ''));
    
    if (hasChanges) {
      // Store the pending template and show discard dialog
      window.pendingTemplate = template;
      setShowDiscardDialog(true);
      return;
    }
    
    // Proceed with template selection
    await selectTemplate(template);
  }, [editorContent, selectedTemplate]);

  // Function to actually select the template
  const selectTemplate = useCallback(async (template) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Template selected:', template);

      // Check if it's a DOCX file from editUrl
      if (template.editUrl && typeof template.editUrl === 'string' && template.editUrl.toLowerCase().endsWith('.docx')) {
        // Pass the editUrl directly to RichTextEditor for conversion
        setSelectedTemplate({
          ...template,
          content: template.editUrl,
        });
        setEditorContent(template.editUrl);
        setFileName(template.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'document');
      } else {
        // For backend templates, fetch the HTML content
        try {
          const result = await ApiService.openTemplateForEditing(template.id);
          console.log('Backend template result:', result);
          
          // Extract HTML content - handle different response formats
          let htmlContent = '';
          if (typeof result === 'string') {
            htmlContent = result;
          } else if (result && typeof result === 'object') {
            htmlContent = result.html || result.content || '';
          }
          
          // Ensure we have a string
          htmlContent = typeof htmlContent === 'string' ? htmlContent : '';
          
          setSelectedTemplate({
            ...template,
            content: htmlContent,
            isBackendTemplate: true,
          });
          
          setEditorContent(htmlContent);
          setFileName(template.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'document');
          
        } catch (err) {
          console.error('Error opening backend template:', err);
          setError('Failed to open backend template. Please try again.');
          
          // Fallback to template content if available
          const fallbackContent = template.content || '';
          setSelectedTemplate({
            ...template,
            content: fallbackContent,
          });
          setEditorContent(typeof fallbackContent === 'string' ? fallbackContent : '');
          setFileName(template.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'document');
        }
      }
      
    } catch (error) {
      console.error('Error selecting template:', error);
      setError('Failed to load template. Please try again.');
      
      // Fallback to basic template setup
      const fallbackContent = template.content || '';
      setSelectedTemplate({
        ...template,
        content: fallbackContent,
      });
      setEditorContent(typeof fallbackContent === 'string' ? fallbackContent : '');
      setFileName(template.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'document');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle content changes - FIXED VERSION
  const handleEditorChange = useCallback((content) => {
    // Ensure content is always a string
    const stringContent = typeof content === 'string' ? content : '';
    setEditorContent(stringContent);
    console.log('Editor content changed:', typeof stringContent, stringContent.substring(0, 100));
  }, []);

  // Export functions with backend integration
  const exportToPDF = useCallback(() => {
    const printWindow = window.open('', '_blank');
    const contentToPrint = typeof editorContent === 'string' ? editorContent : '';

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${fileName}</title>
          <style>
            body { 
              font-family: 'Times New Roman', serif; 
              margin: 0; 
              padding: 40px; 
              background-color: white; 
              line-height: 1.6;
              color: #1a1a1a;
            }
            @page {
              margin: 1in;
              size: letter;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none; }
            }
            h1, h2, h3, h4, h5, h6 { 
              margin-top: 1.5em; 
              margin-bottom: 0.5em; 
              page-break-after: avoid; 
            }
            p { margin-bottom: 1em; }
            table { 
              border-collapse: collapse; 
              width: 100%; 
              margin: 1em 0; 
            }
            th, td { 
              border: 1px solid #ccc; 
              padding: 8px; 
              text-align: left; 
            }
            th { background-color: #f5f5f5; }
            img { max-width: 100%; height: auto; }
            .page-break { page-break-before: always; }
          </style>
        </head>
        <body>
          ${contentToPrint}
        </body>
      </html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  }, [editorContent, fileName]);

  const exportToHTML = useCallback(() => {
    const contentToExport = typeof editorContent === 'string' ? editorContent : '';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${fileName}</title>
          <style>
            body { 
              font-family: 'Times New Roman', serif; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px; 
              line-height: 1.6; 
              color: #1a1a1a; 
            }
            h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
            p { margin-bottom: 1em; }
            table { border-collapse: collapse; width: 100%; margin: 1em 0; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          ${contentToExport}
        </body>
      </html>
    `;
    
    downloadBlob(`${fileName}.html`, new Blob([htmlContent], { type: "text/html;charset=utf-8" }));
  }, [editorContent, fileName]);

  const exportToText = useCallback(() => {
    const contentToExport = typeof editorContent === 'string' ? editorContent : '';
    // Strip HTML tags and convert to plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contentToExport;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    downloadBlob(`${fileName}.txt`, new Blob([textContent], { type: "text/plain;charset=utf-8" }));
  }, [editorContent, fileName]);

  // Go back to templates with change detection
  const handleBackToTemplates = useCallback(async () => {
    // Check if there are unsaved changes
    const hasChanges = editorContent && editorContent.trim() !== '' && 
                      (!selectedTemplate || editorContent !== (selectedTemplate.content || ''));
    
    if (hasChanges) {
      // Store the action and show discard dialog
      window.pendingAction = 'backToTemplates';
      setShowDiscardDialog(true);
      return;
    }
    
    // Proceed with going back
    await goBackToTemplates();
  }, [editorContent, selectedTemplate]);

  // Function to actually go back to templates
  const goBackToTemplates = useCallback(async () => {
    try {
      // Save current work
      if (editorContent && selectedTemplate) {
        localStorage.setItem(currentStorageKey, editorContent);
        localStorage.setItem(currentStorageKey + '_lastSaved', new Date().toISOString());
        
        // Save to backend if it's a backend template
        if (selectedTemplate.id && typeof selectedTemplate.id === 'string' && !selectedTemplate.id.includes('-')) {
          const blob = new Blob([editorContent], { type: 'text/html' });
          const file = new File([blob], fileName + '.html', { type: 'text/html' });
          
          await ApiService.saveUserDraft(selectedTemplate.id, fileName, file);
        }
      }
    } catch (error) {
      console.error('Error saving before exit:', error);
    }
    
    // Clear current session
    localStorage.removeItem(currentSessionKey);
    
    setSelectedTemplate(null);
    setEditorContent('');
    setFileName('Untitled Document');
    setError(null);
  }, [editorContent, selectedTemplate, currentStorageKey, fileName, currentSessionKey]);

  // Manual save function with backend integration
  const handleManualSave = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Save to localStorage
      localStorage.setItem(currentStorageKey, editorContent);
      localStorage.setItem(currentStorageKey + '_lastSaved', new Date().toISOString());
      
      // Save to backend if it's a backend template
      if (selectedTemplate?.id && typeof selectedTemplate.id === 'string' && !selectedTemplate.id.includes('-')) {
        const blob = new Blob([editorContent], { type: 'text/html' });
        const file = new File([blob], fileName + '.html', { type: 'text/html' });
          
        await ApiService.saveUserDraft(selectedTemplate.id, fileName, file);
      }
      
      // Show success message briefly
      setError(null);
      
    } catch (error) {
      console.error('Manual save failed:', error);
      setError('Failed to save document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [editorContent, currentStorageKey, selectedTemplate, fileName]);

  // Handle discard changes
  const handleDiscardChanges = useCallback(async () => {
    setShowDiscardDialog(false);
    
    if (window.pendingTemplate) {
      // User wanted to select a new template
      await selectTemplate(window.pendingTemplate);
      window.pendingTemplate = null;
    } else if (window.pendingAction === 'backToTemplates') {
      // User wanted to go back to templates
      await goBackToTemplates();
      window.pendingAction = null;
    }
  }, [selectTemplate, goBackToTemplates]);

  // Handle keep changes
  const handleKeepChanges = useCallback(() => {
    setShowDiscardDialog(false);
    window.pendingTemplate = null;
    window.pendingAction = null;
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {!selectedTemplate ? (
        // Template Selection View
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Document Templates</h1>
                <p className="text-sm text-gray-600 mt-1">Choose a template to start creating your document</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>User: {userId.slice(-8)}</span>
                </div>
                {documentList.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Recent Documents ({documentList.length})</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <div className="p-4 border-b border-gray-100">
                          <h3 className="font-semibold text-gray-900">Recent Documents</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {documentList.slice(0, 10).map((doc) => (
                            <button
                              key={doc.id}
                              onClick={() => {
                                const template = { id: doc.templateId, content: doc.content };
                                handleTemplateSelection(template);
                                setIsMenuOpen(false);
                              }}
                              className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{doc.fileName}</p>
                                  <p className="text-sm text-gray-600">{doc.wordCount} words</p>
                                </div>
                                <div className="text-xs text-gray-500 ml-2">
                                  {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                                    Math.floor((doc.lastSaved - new Date()) / (1000 * 60 * 60 * 24)),
                                    'day'
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Search */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Templates */}
          <div className="flex-1 overflow-hidden px-6 py-6">
            <Templates onSelectTemplate={handleTemplateSelection} query={searchQuery} />
          </div>
        </div>
      ) : (
        // Document Editor View
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToTemplates}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Back to Templates"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm font-medium">Templates</span>
                </button>
                
                <div className="h-6 w-px bg-gray-300"></div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 min-w-0 w-64"
                    placeholder="Document name"
                    disabled={isLoading}
                  />
                  
                  {/* Save status indicator */}
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    {isSaving ? (
                      <>
                        <Loader className="w-3 h-3 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : lastSaved ? (
                      <>
                        <Clock className="w-3 h-3" />
                        <span>
                          Saved {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                            Math.floor((lastSaved - new Date()) / (1000 * 60)),
                            'minute'
                          )}
                        </span>
                      </>
                    ) : (
                      <span className="text-yellow-600">● Unsaved changes</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleManualSave}
                  disabled={isLoading || isSaving}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  title="Save Document"
                >
                  {isLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span className="text-sm">Save</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm">Export</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            exportToPDF();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Export as PDF</span>
                        </button>
                        <button
                          onClick={() => {
                            exportToHTML();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Export as HTML</span>
                        </button>
                        <button
                          onClick={() => {
                            exportToText();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Export as Text</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                  <User className="w-4 h-4" />
                  <span>User: {userId.slice(-8)}</span>
                </div>
              </div>
            </div>

            {/* Error message in editor */}
            {error && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
                {error}
              </div>
            )}
          </header>

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <RichTextEditor
              value={typeof editorContent === 'string' ? editorContent : ''}
              onChange={handleEditorChange}
              placeholder={`Start editing your ${selectedTemplate?.name || 'document'}...`}
              userId={userId}
            />
          </div>
        </div>
      )}

      {/* Discard Changes Dialog */}
      {showDiscardDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-xl">⚠️</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Unsaved Changes</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    You have unsaved changes that will be lost if you continue. Do you want to discard your changes?
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleKeepChanges}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Keep Editing
                </button>
                <button
                  onClick={handleDiscardChanges}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menus */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-3">
            <Loader className="h-5 w-5 animate-spin text-blue-600" />
            <span>Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftingPage;