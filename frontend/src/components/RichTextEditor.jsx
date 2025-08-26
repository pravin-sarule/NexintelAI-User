

// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import { 
//   Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
//   List, ListOrdered, Link, Image, Languages, SpellCheck, 
//   Sparkles, MessageSquare, Loader, Type, Palette, Minus, Plus,
//   Undo, Redo, Copy, Scissors, ClipboardPaste, Quote, Code,
//   Subscript, Superscript, Strikethrough, Table, Divide,
//   Indent, Outdent, RotateCcw, Settings, MoreVertical, FileText,
//   Printer, Download, Upload, Save, Eye
// } from 'lucide-react';

// const RichTextEditor = ({ 
//   value = '', 
//   onChange = () => {}, 
//   placeholder = "Start typing your document...",
//   userId = 'guest'
// }) => {
//   const editorRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const [selectedText, setSelectedText] = useState('');
//   const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
//   const [linkUrl, setLinkUrl] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [loadingAction, setLoadingAction] = useState('');
//   const [fontSize, setFontSize] = useState(14);
//   const [fontFamily, setFontFamily] = useState('Times New Roman');
//   const [textColor, setTextColor] = useState('#000000');
//   const [backgroundColor, setBackgroundColor] = useState('#ffffff');
//   const [isTableModalOpen, setIsTableModalOpen] = useState(false);
//   const [tableRows, setTableRows] = useState(3);
//   const [tableCols, setTableCols] = useState(3);
//   const [undoStack, setUndoStack] = useState([]);
//   const [redoStack, setRedoStack] = useState([]);
//   const [wordCount, setWordCount] = useState(0);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [isPreviewMode, setIsPreviewMode] = useState(false);
//   const [zoomLevel, setZoomLevel] = useState(100);
//   const [pageContents, setPageContents] = useState(['']);

//   // Mock API key for demo - in real app, this should come from environment variables
//   const GEMINI_API_KEY = 'AIzaSyCK7KbeHityDSFGP3SLwYApHSdnp-KMUcw';

//   const splitContentIntoPages = (content) => {
//     if (!content || content === '<br>') return [''];
    
//     // Split content by explicit page breaks first
//     const pageBreakRegex = /<div[^>]*class="page-break"[^>]*>.*?<\/div>/gi;
//     const sections = content.split(pageBreakRegex);
    
//     const pages = [];
    
//     sections.forEach((section, sectionIndex) => {
//       if (!section.trim()) {
//         if (sectionIndex === 0) pages.push('');
//         return;
//       }
      
//       // For now, let's use a simpler approach - split by paragraphs and estimate
//       const paragraphs = section.split(/(<p[^>]*>.*?<\/p>|<h[1-6][^>]*>.*?<\/h[1-6]>|<div[^>]*>.*?<\/div>|<br\s*\/?>)/gi).filter(p => p.trim());
      
//       let currentPageContent = '';
//       const wordsPerPage = 500; // Approximate words per page
//       let currentWordCount = 0;
      
//       paragraphs.forEach(paragraph => {
//         if (!paragraph.trim()) return;
        
//         const tempDiv = document.createElement('div');
//         tempDiv.innerHTML = paragraph;
//         const wordCount = (tempDiv.textContent || '').split(/\s+/).filter(w => w.length > 0).length;
        
//         if (currentWordCount + wordCount > wordsPerPage && currentPageContent) {
//           // Start new page
//           pages.push(currentPageContent);
//           currentPageContent = paragraph;
//           currentWordCount = wordCount;
//         } else {
//           currentPageContent += paragraph;
//           currentWordCount += wordCount;
//         }
//       });
      
//       if (currentPageContent.trim()) {
//         pages.push(currentPageContent);
//       }
//     });
    
//     return pages.length > 0 ? pages : [''];
//   };

//   const updateWordCount = useCallback(() => {
//     // Count words from all pages
//     const allContent = pageContents.join(' ');
//     const tempDiv = document.createElement('div');
//     tempDiv.innerHTML = allContent;
//     const text = tempDiv.textContent || '';
//     const words = text.trim().split(/\s+/).filter(word => word.length > 0);
//     setWordCount(words.length);
//   }, [pageContents]);

//   useEffect(() => {
//     if (value && typeof value === 'string') {
//       // Handle HTML content
//       const pages = splitContentIntoPages(value);
//       setPageContents(pages);
//       setTotalPages(pages.length);
//       if (editorRef.current && pages[0] !== undefined) {
//         editorRef.current.innerHTML = pages[0];
//       }
//       updateWordCount();
//     }
//   }, [value, fontFamily, fontSize, updateWordCount]);

//   const handleSelectionChange = () => {
//     const selection = window.getSelection();
//     setSelectedText(selection.toString());
//   };

//   const saveToUndoStack = () => {
//     const currentContent = editorRef.current?.innerHTML || '';
//     setUndoStack(prev => [...prev.slice(-19), currentContent]);
//     setRedoStack([]);
//   };

//   const formatText = (command, value = null) => {
//     saveToUndoStack();
//     document.execCommand(command, false, value);
//     editorRef.current?.focus();
//     const newContent = editorRef.current?.innerHTML || '';
//     onChange(newContent);
    
//     // Update pages after formatting
//     setTimeout(() => {
//       const pages = splitContentIntoPages(newContent);
//       setPageContents(pages);
//       setTotalPages(pages.length);
//       updateWordCount();
//     }, 50);
//   };

//   const handleUndo = () => {
//     if (undoStack.length > 0) {
//       const currentContent = editorRef.current?.innerHTML || '';
//       const previousContent = undoStack[undoStack.length - 1];
      
//       setRedoStack(prev => [...prev, currentContent]);
//       setUndoStack(prev => prev.slice(0, -1));
      
//       if (editorRef.current) {
//         editorRef.current.innerHTML = previousContent;
//         onChange(previousContent);
        
//         // Update pages after undo
//         const pages = splitContentIntoPages(previousContent);
//         setPageContents(pages);
//         setTotalPages(pages.length);
//         updateWordCount();
//       }
//     }
//   };

//   const handleRedo = () => {
//     if (redoStack.length > 0) {
//       const currentContent = editorRef.current?.innerHTML || '';
//       const nextContent = redoStack[redoStack.length - 1];
      
//       setUndoStack(prev => [...prev, currentContent]);
//       setRedoStack(prev => prev.slice(0, -1));
      
//       if (editorRef.current) {
//         editorRef.current.innerHTML = nextContent;
//         onChange(nextContent);
        
//         // Update pages after redo
//         const pages = splitContentIntoPages(nextContent);
//         setPageContents(pages);
//         setTotalPages(pages.length);
//         updateWordCount();
//       }
//     }
//   };

//   const insertLink = () => {
//     if (linkUrl) {
//       if (selectedText) {
//         const linkHtml = `<a href="${linkUrl}" target="_blank" style="color: #0066cc; text-decoration: underline;">${selectedText}</a>`;
//         document.execCommand('insertHTML', false, linkHtml);
//       } else {
//         formatText('createLink', linkUrl);
//       }
//       setIsLinkModalOpen(false);
//       setLinkUrl('');
//       onChange(editorRef.current?.innerHTML || '');
//     }
//   };

//   const insertImage = () => {
//     const url = prompt('Enter image URL:');
//     if (url) {
//       const imgHtml = `<img src="${url}" style="max-width: 100%; height: auto; margin: 10px 0;" alt="Inserted image" />`;
//       document.execCommand('insertHTML', false, imgHtml);
//       onChange(editorRef.current?.innerHTML || '');
//     }
//   };

//   const insertTable = () => {
//     let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #ddd;">';
//     for (let i = 0; i < tableRows; i++) {
//       tableHTML += '<tr>';
//       for (let j = 0; j < tableCols; j++) {
//         const cellStyle = 'border: 1px solid #ddd; padding: 8px; min-width: 50px; min-height: 30px;';
//         tableHTML += `<td style="${cellStyle}">${i === 0 ? `Header ${j + 1}` : '&nbsp;'}</td>`;
//       }
//       tableHTML += '</tr>';
//     }
//     tableHTML += '</table>';
    
//     document.execCommand('insertHTML', false, tableHTML);
//     setIsTableModalOpen(false);
//     onChange(editorRef.current?.innerHTML || '');
//   };

//   const insertPageBreak = () => {
//     saveToUndoStack();
//     const pageBreakHtml = `
//       <div class="page-break" style="
//         page-break-before: always;
//         break-before: page;
//         border-top: 2px dashed #007bff;
//         margin: 40px 0;
//         padding-top: 40px;
//         text-align: center;
//         color: #007bff;
//         font-size: 12px;
//         font-weight: bold;
//         position: relative;
//       ">
//         <span style="background: white; padding: 0 15px;">--- Page Break ---</span>
//       </div>
//       <p><br></p>
//     `;
//     document.execCommand('insertHTML', false, pageBreakHtml);
    
//     // Update pages after inserting page break
//     setTimeout(() => {
//       const newContent = editorRef.current?.innerHTML || '';
//       const pages = splitContentIntoPages(newContent);
//       setPageContents(pages);
//       setTotalPages(pages.length);
//       onChange(newContent);
//     }, 100);
//   };

//   const handlePaste = (e) => {
//     e.preventDefault();
//     const text = e.clipboardData.getData('text/plain');
//     document.execCommand('insertText', false, text);
    
//     // Update pages after paste
//     setTimeout(() => {
//       const newContent = editorRef.current?.innerHTML || '';
//       const pages = splitContentIntoPages(newContent);
//       setPageContents(pages);
//       setTotalPages(pages.length);
//       updateWordCount();
//       onChange(newContent);
//     }, 50);
//   };

//   const handleCopy = () => {
//     document.execCommand('copy');
//   };

//   const handleCut = () => {
//     document.execCommand('cut');
    
//     // Update pages after cut
//     setTimeout(() => {
//       const newContent = editorRef.current?.innerHTML || '';
//       const pages = splitContentIntoPages(newContent);
//       setPageContents(pages);
//       setTotalPages(pages.length);
//       updateWordCount();
//       onChange(newContent);
//     }, 50);
//   };

//   // Enhanced AI Functions with better error handling
//   const mockAICall = async (prompt, action) => {
//     // Simulate API call delay
//     await new Promise(resolve => setTimeout(resolve, 2000));
    
//     // Mock responses based on action
//     switch (action) {
//       case 'translate':
//         return `<p>मराठी भाषांतर: ${prompt.substring(0, 100)}...</p>`;
//       case 'spellcheck':
//         return prompt.replace(/teh/g, 'the').replace(/recieve/g, 'receive');
//       case 'generate':
//         return `<p>AI Generated Content based on your prompt: "${prompt}"</p><p>This is a sample generated paragraph that demonstrates the AI content generation feature. In a real implementation, this would be replaced with actual AI-generated content.</p>`;
//       case 'review':
//         return 'Document Review:\n\n✅ Grammar: Good\n✅ Clarity: Excellent\n📝 Suggestions: Consider adding more examples\n⭐ Overall Score: 8/10';
//       default:
//         return 'AI processing completed.';
//     }
//   };

//   const handleTranslateToMarathi = async () => {
//     const content = editorRef.current?.innerHTML || '';
//     if (!content || content === '<br>') {
//       alert("Editor is empty. Nothing to translate.");
//       return;
//     }
    
//     setIsLoading(true);
//     setLoadingAction('Translating to Marathi...');
    
//     try {
//       const translatedContent = await mockAICall(content, 'translate');
//       if (editorRef.current) {
//         saveToUndoStack();
//         editorRef.current.innerHTML = translatedContent;
//         const pages = splitContentIntoPages(translatedContent);
//         setPageContents(pages);
//         setTotalPages(pages.length);
//         onChange(translatedContent);
//         updateWordCount();
//       }
//     } catch (error) {
//       alert('Translation failed. Please try again.');
//     }
    
//     setIsLoading(false);
//     setLoadingAction('');
//   };

//   const handleSpellCheck = async () => {
//     const content = editorRef.current?.innerHTML || '';
//     if (!content || content === '<br>') {
//       alert("Editor is empty. Nothing to spell check.");
//       return;
//     }
    
//     setIsLoading(true);
//     setLoadingAction('Checking spelling...');
    
//     try {
//       const correctedContent = await mockAICall(content, 'spellcheck');
//       if (correctedContent && editorRef.current) {
//         saveToUndoStack();
//         editorRef.current.innerHTML = correctedContent;
//         const pages = splitContentIntoPages(correctedContent);
//         setPageContents(pages);
//         setTotalPages(pages.length);
//         onChange(correctedContent);
//         updateWordCount();
//       }
//     } catch (error) {
//       alert('Spell check failed. Please try again.');
//     }
    
//     setIsLoading(false);
//     setLoadingAction('');
//   };

//   const handleGenerateContent = async () => {
//     const promptText = prompt("Enter a prompt for content generation:");
//     if (!promptText) return;

//     setIsLoading(true);
//     setLoadingAction('Generating content...');
    
//     try {
//       const generatedContent = await mockAICall(promptText, 'generate');
//       if (generatedContent && editorRef.current) {
//         saveToUndoStack();
//         const currentContent = editorRef.current.innerHTML;
//         const newContent = currentContent + generatedContent;
//         editorRef.current.innerHTML = newContent;
//         const pages = splitContentIntoPages(newContent);
//         setPageContents(pages);
//         setTotalPages(pages.length);
//         onChange(newContent);
//         updateWordCount();
//       }
//     } catch (error) {
//       alert('Content generation failed. Please try again.');
//     }
    
//     setIsLoading(false);
//     setLoadingAction('');
//   };

//   const handleAIReview = async () => {
//     const content = editorRef.current?.innerHTML || '';
//     if (!content || content === '<br>') {
//       alert("Editor is empty. Nothing to review.");
//       return;
//     }
    
//     setIsLoading(true);
//     setLoadingAction('Reviewing content...');
    
//     try {
//       const reviewContent = await mockAICall(content, 'review');
//       if (reviewContent) {
//         alert("AI Review:\n\n" + reviewContent);
//       }
//     } catch (error) {
//       alert('Content review failed. Please try again.');
//     }
    
//     setIsLoading(false);
//     setLoadingAction('');
//   };

//   const handleKeyDown = (e) => {
//     if (e.ctrlKey || e.metaKey) {
//       switch (e.key.toLowerCase()) {
//         case 'b':
//           e.preventDefault();
//           formatText('bold');
//           break;
//         case 'i':
//           e.preventDefault();
//           formatText('italic');
//           break;
//         case 'u':
//           e.preventDefault();
//           formatText('underline');
//           break;
//         case 'z':
//           e.preventDefault();
//           if (e.shiftKey) {
//             handleRedo();
//           } else {
//             handleUndo();
//           }
//           break;
//         case 'y':
//           e.preventDefault();
//           handleRedo();
//           break;
//         case 'c':
//           if (!e.shiftKey) {
//             handleCopy();
//           }
//           break;
//         case 'x':
//           if (!e.shiftKey) {
//             handleCut();
//           }
//           break;
//         case 's':
//           e.preventDefault();
//           alert('Document auto-saved!');
//           break;
//       }
//     }
//   };

//   const applyFontSize = (size) => {
//     const validSize = Math.max(8, Math.min(72, size));
//     setFontSize(validSize);
    
//     const selection = window.getSelection();
//     if (selection.rangeCount > 0 && !selection.isCollapsed) {
//       saveToUndoStack();
//       document.execCommand('fontSize', false, '7');
//       const fontElements = editorRef.current?.querySelectorAll('font[size="7"]');
//       fontElements?.forEach(element => {
//         element.style.fontSize = `${validSize}px`;
//         element.removeAttribute('size');
//       });
//       onChange(editorRef.current?.innerHTML || '');
//     }
//   };

//   const applyFontFamily = (family) => {
//     setFontFamily(family);
//     formatText('fontName', family);
//   };

//   const applyTextColor = (color) => {
//     setTextColor(color);
//     formatText('foreColor', color);
//   };

//   const applyBackgroundColor = (color) => {
//     setBackgroundColor(color);
//     formatText('hiliteColor', color);
//   };

//   const handlePrint = () => {
//     const printContent = pageContents.join('<div style="page-break-before: always;"></div>');
//     const printWindow = window.open('', '_blank');
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Print Document</title>
//           <style>
//             body { font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: 1.6; margin: 1in; }
//             .page-break { page-break-before: always; border: none; }
//             @media print { .page-break { border: none; } }
//           </style>
//         </head>
//         <body>${printContent}</body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.print();
//   };

//   const handleSaveAsHTML = () => {
//     const content = pageContents.join('<div style="page-break-before: always;"></div>');
//     const blob = new Blob([`
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <title>Document</title>
//           <style>
//             body { font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: 1.6; margin: 1in; }
//           </style>
//         </head>
//         <body>${content}</body>
//       </html>
//     `], { type: 'text/html' });
    
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'document.html';
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (file.type === 'text/html') {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const content = e.target.result;
//         // Extract body content from HTML
//         const parser = new DOMParser();
//         const doc = parser.parseFromString(content, 'text/html');
//         const bodyContent = doc.body.innerHTML;
        
//         if (editorRef.current) {
//           saveToUndoStack();
//           editorRef.current.innerHTML = bodyContent;
//           const pages = splitContentIntoPages(bodyContent);
//           setPageContents(pages);
//           setTotalPages(pages.length);
//           onChange(bodyContent);
//           updateWordCount();
//         }
//       };
//       reader.readAsText(file);
//     } else if (file.type === 'text/plain') {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const content = e.target.result.replace(/\n/g, '<br>');
//         if (editorRef.current) {
//           saveToUndoStack();
//           editorRef.current.innerHTML = `<p>${content}</p>`;
//           const pages = splitContentIntoPages(editorRef.current.innerHTML);
//           setPageContents(pages);
//           setTotalPages(pages.length);
//           onChange(editorRef.current.innerHTML);
//           updateWordCount();
//         }
//       };
//       reader.readAsText(file);
//     }
//   };

//   const handleZoomChange = (newZoom) => {
//     setZoomLevel(newZoom);
//   };

//   return (
//     <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg h-full flex flex-col">
//       {/* Loading Overlay */}
//       {isLoading && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-3">
//             <Loader className="h-5 w-5 animate-spin text-blue-600" />
//             <span className="text-lg">{loadingAction}</span>
//           </div>
//         </div>
//       )}

//       {/* Main Toolbar */}
//       <div className="border-b border-gray-200 p-3 bg-gray-50">
//         <div className="flex flex-wrap items-center gap-1">
//           {/* File Operations */}
//           <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
//             <input
//               ref={fileInputRef}
//               type="file"
//               onChange={handleFileUpload}
//               accept=".html,.txt"
//               className="hidden"
//             />
//             <button
//               type="button"
//               onClick={() => fileInputRef.current?.click()}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Upload File"
//             >
//               <Upload className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               onClick={handleSaveAsHTML}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Save as HTML"
//             >
//               <Download className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               onClick={handlePrint}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Print"
//             >
//               <Printer className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               onClick={() => setIsPreviewMode(!isPreviewMode)}
//               className={`p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isPreviewMode ? 'bg-blue-100' : ''}`}
//               title="Toggle Preview"
//             >
//               <Eye className="h-4 w-4" />
//             </button>
//           </div>

//           {/* Undo/Redo */}
//           <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
//             <button
//               type="button"
//               onClick={handleUndo}
//               disabled={undoStack.length === 0}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
//               title="Undo (Ctrl+Z)"
//             >
//               <Undo className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               onClick={handleRedo}
//               disabled={redoStack.length === 0}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
//               title="Redo (Ctrl+Y)"
//             >
//               <Redo className="h-4 w-4" />
//             </button>
//           </div>

//           {/* Font Settings */}
//           <div className="flex items-center border-r border-gray-300 pr-2 mr-2 gap-1">
//             <select
//               value={fontFamily}
//               onChange={(e) => applyFontFamily(e.target.value)}
//               className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="Times New Roman">Times New Roman</option>
//               <option value="Arial">Arial</option>
//               <option value="Georgia">Georgia</option>
//               <option value="Helvetica">Helvetica</option>
//               <option value="Verdana">Verdana</option>
//               <option value="Courier New">Courier New</option>
//             </select>
            
//             <div className="flex items-center border border-gray-300 rounded">
//               <button
//                 onClick={() => applyFontSize(fontSize - 1)}
//                 className="p-1 hover:bg-gray-200"
//                 title="Decrease font size"
//               >
//                 <Minus className="h-3 w-3" />
//               </button>
//               <input
//                 type="number"
//                 value={fontSize}
//                 onChange={(e) => applyFontSize(parseInt(e.target.value) || 14)}
//                 className="w-12 text-center text-sm border-0 focus:outline-none"
//                 min="8"
//                 max="72"
//               />
//               <button
//                 onClick={() => applyFontSize(fontSize + 1)}
//                 className="p-1 hover:bg-gray-200"
//                 title="Increase font size"
//               >
//                 <Plus className="h-3 w-3" />
//               </button>
//             </div>
//           </div>

//           {/* Text Formatting */}
//           <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
//             <button
//               type="button"
//               onClick={() => formatText('bold')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Bold (Ctrl+B)"
//             >
//               <Bold className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               onClick={() => formatText('italic')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Italic (Ctrl+I)"
//             >
//               <Italic className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               onClick={() => formatText('underline')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Underline (Ctrl+U)"
//             >
//               <Underline className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               onClick={() => formatText('strikeThrough')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Strikethrough"
//             >
//               <Strikethrough className="h-4 w-4" />
//             </button>
//           </div>

//           {/* Colors */}
//           <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
//             <div className="flex items-center">
//               <input
//                 type="color"
//                 value={textColor}
//                 onChange={(e) => applyTextColor(e.target.value)}
//                 className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
//                 title="Text Color"
//               />
//               <input
//                 type="color"
//                 value={backgroundColor}
//                 onChange={(e) => applyBackgroundColor(e.target.value)}
//                 className="w-8 h-8 border border-gray-300 rounded cursor-pointer ml-1"
//                 title="Highlight Color"
//               />
//             </div>
//           </div>

//           {/* Alignment */}
//           <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
//             <button
//               type="button"
//               onClick={() => formatText('justifyLeft')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Align Left"
//             >
//               <AlignLeft className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               onClick={() => formatText('justifyCenter')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Align Center"
//             >
//               <AlignCenter className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               onClick={() => formatText('justifyRight')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Align Right"
//             >
//               <AlignRight className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               onClick={() => formatText('justifyFull')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Justify"
//             >
//               <AlignJustify className="h-4 w-4" />
//             </button>
//           </div>

//           {/* Lists and Indentation */}
//           <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
//             <button
//               type="button"
//               onClick={() => formatText('insertUnorderedList')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Bullet List"
//             >
//               <List className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               onClick={() => formatText('insertOrderedList')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Numbered List"
//             >
//               <ListOrdered className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               onClick={() => formatText('indent')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Increase Indent"
//             >
//               <Indent className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               onClick={() => formatText('outdent')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Decrease Indent"
//             >
//               <Outdent className="h-4 w-4" />
//             </button>
//           </div>

//           {/* Headings */}
//           <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
//             <select
//               onChange={(e) => {
//                 if (e.target.value) {
//                   formatText('formatBlock', e.target.value);
//                   e.target.value = '';
//                 }
//               }}
//               className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               defaultValue=""
//             >
//               <option value="">Format</option>
//               <option value="h1">Heading 1</option>
//               <option value="h2">Heading 2</option>
//               <option value="h3">Heading 3</option>
//               <option value="h4">Heading 4</option>
//               <option value="h5">Heading 5</option>
//               <option value="h6">Heading 6</option>
//               <option value="p">Paragraph</option>
//               <option value="blockquote">Quote</option>
//             </select>
//           </div>

//           {/* Insert Elements */}
//           <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
//             <button
//               type="button"
//               onClick={() => setIsLinkModalOpen(true)}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Insert Link"
//             >
//               <Link className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               onClick={insertImage}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Insert Image"
//             >
//               <Image className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               onClick={() => setIsTableModalOpen(true)}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Insert Table"
//             >
//               <Table className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               onClick={insertPageBreak}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Insert Page Break"
//             >
//               <Divide className="h-4 w-4" />
//             </button>
//           </div>

//           {/* Special Formatting */}
//           <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
//             <button
//               type="button"
//               onClick={() => formatText('superscript')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Superscript"
//             >
//               <Superscript className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               onClick={() => formatText('subscript')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Subscript"
//             >
//               <Subscript className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               onClick={() => formatText('formatBlock', 'blockquote')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Quote"
//             >
//               <Quote className="h-4 w-4" />
//             </button>
//           </div>

//           {/* Clipboard Operations */}
//           <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
//             <button
//               type="button"
//               onClick={handleCopy}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Copy (Ctrl+C)"
//             >
//               <Copy className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               onClick={handleCut}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               title="Cut (Ctrl+X)"
//             >
//               <Scissors className="h-4 w-4" />
//             </button>
//           </div>

//           {/* AI Features */}
//           <div className="flex items-center">
//             <button
//               type="button"
//               onClick={handleTranslateToMarathi}
//               disabled={isLoading}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
//               title="Translate to Marathi"
//             >
//               <Languages className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               onClick={handleSpellCheck}
//               disabled={isLoading}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
//               title="Spell Check"
//             >
//               <SpellCheck className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               onClick={handleGenerateContent}
//               disabled={isLoading}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
//               title="Generate Content"
//             >
//               <Sparkles className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               onClick={handleAIReview}
//               disabled={isLoading}
//               className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
//               title="AI Review"
//             >
//               <MessageSquare className="h-4 w-4" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Secondary Toolbar - Zoom and Page Controls */}
//       <div className="border-b border-gray-200 p-2 bg-gray-100">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center space-x-2">
//               <span className="text-sm font-medium">Zoom:</span>
//               <select
//                 value={zoomLevel}
//                 onChange={(e) => handleZoomChange(parseInt(e.target.value))}
//                 className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value={50}>50%</option>
//                 <option value={75}>75%</option>
//                 <option value={100}>100%</option>
//                 <option value={125}>125%</option>
//                 <option value={150}>150%</option>
//                 <option value={200}>200%</option>
//               </select>
//             </div>
//             <div className="flex items-center space-x-2">
//               <span className="text-sm font-medium">Page:</span>
//               <span className="text-sm bg-white border border-gray-300 rounded px-2 py-1">
//                 {currentPage} of {totalPages}
//               </span>
//             </div>
//           </div>
//           <div className="flex items-center space-x-2">
//             <span className="text-sm text-gray-600">Words: {wordCount}</span>
//             <div className="w-2 h-2 rounded-full bg-green-500" title="Auto-save enabled"></div>
//           </div>
//         </div>
//       </div>

//       {/* Editor Canvas */}
//       <div className="flex-1 overflow-hidden">
//         <div className="h-full overflow-y-auto bg-gray-200 p-6" style={{ backgroundColor: '#f5f5f5' }}>
//           {/* Multi-page container */}
//           <div className="flex flex-col items-center space-y-6">
//             {pageContents.map((pageContent, pageIndex) => (
//               <div 
//                 key={pageIndex}
//                 className="bg-white shadow-xl border border-gray-300 relative"
//                 style={{
//                   width: `${(8.5 * 96 * zoomLevel) / 100}px`, // 8.5 inches at 96 DPI
//                   minHeight: `${(11 * 96 * zoomLevel) / 100}px`, // 11 inches at 96 DPI
//                   transform: `scale(${zoomLevel / 100})`,
//                   transformOrigin: 'top center',
//                   marginBottom: `${zoomLevel < 100 ? (100 - zoomLevel) * 3 : 0}px`
//                 }}
//               >
//                 {/* Page number indicator */}
//                 <div className="absolute -top-6 left-0 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
//                   Page {pageIndex + 1}
//                 </div>
                
//                 {/* Page content area */}
//                 <div
//                   ref={pageIndex === 0 ? editorRef : null}
//                   contentEditable={!isPreviewMode && pageIndex === 0}
//                   onInput={(e) => {
//                     if (pageIndex === 0) {
//                       const newContent = e.target.innerHTML;
//                       onChange(newContent);
                      
//                       // Re-split content across pages
//                       setTimeout(() => {
//                         const pages = splitContentIntoPages(newContent);
//                         setPageContents(pages);
//                         setTotalPages(pages.length);
//                         updateWordCount();
//                       }, 100);
//                     }
//                   }}
//                   onMouseUp={handleSelectionChange}
//                   onKeyUp={handleSelectionChange}
//                   onKeyDown={handleKeyDown}
//                   onPaste={handlePaste}
//                   className={`focus:outline-none ${isPreviewMode ? 'pointer-events-none' : ''} ${pageIndex > 0 ? 'pointer-events-none' : ''}`}
//                   style={{
//                     fontFamily: fontFamily,
//                     fontSize: `${fontSize}px`,
//                     lineHeight: '1.6',
//                     color: '#1a1a1a',
//                     padding: '1in', // Standard document margins
//                     minHeight: `${(11 * 96 * zoomLevel) / 100 - 32}px`, // Account for padding
//                     wordWrap: 'break-word',
//                     overflowWrap: 'break-word'
//                   }}
//                   suppressContentEditableWarning={true}
//                   data-placeholder={pageIndex === 0 ? placeholder : ''}
//                   dangerouslySetInnerHTML={{ __html: pageContent }}
//                 />
//               </div>
//             ))}
            
//             {/* Show placeholder for empty document */}
//             {pageContents.length === 0 && (
//               <div 
//                 className="bg-white shadow-xl border border-gray-300 relative"
//                 style={{
//                   width: `${(8.5 * 96 * zoomLevel) / 100}px`,
//                   minHeight: `${(11 * 96 * zoomLevel) / 100}px`,
//                   transform: `scale(${zoomLevel / 100})`,
//                   transformOrigin: 'top center'
//                 }}
//               >
//                 <div className="absolute -top-6 left-0 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
//                   Page 1
//                 </div>
//                 <div
//                   ref={editorRef}
//                   contentEditable={!isPreviewMode}
//                   onInput={(e) => {
//                     const newContent = e.target.innerHTML;
//                     onChange(newContent);
//                     const pages = splitContentIntoPages(newContent);
//                     setPageContents(pages);
//                     setTotalPages(pages.length);
//                     updateWordCount();
//                   }}
//                   onMouseUp={handleSelectionChange}
//                   onKeyUp={handleSelectionChange}
//                   onKeyDown={handleKeyDown}
//                   onPaste={handlePaste}
//                   className={`focus:outline-none ${isPreviewMode ? 'pointer-events-none' : ''}`}
//                   style={{
//                     fontFamily: fontFamily,
//                     fontSize: `${fontSize}px`,
//                     lineHeight: '1.6',
//                     color: '#1a1a1a',
//                     padding: '1in',
//                     minHeight: `${(11 * 96 * zoomLevel) / 100 - 32}px`,
//                     wordWrap: 'break-word',
//                     overflowWrap: 'break-word'
//                   }}
//                   suppressContentEditableWarning={true}
//                   data-placeholder={placeholder}
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Link Modal */}
//       {isLinkModalOpen && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
//             <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-2">Selected text:</label>
//               <div className="bg-gray-100 p-2 rounded text-sm">
//                 {selectedText || 'No text selected - link text will be the URL'}
//               </div>
//             </div>
//             <input
//               type="url"
//               value={linkUrl}
//               onChange={(e) => setLinkUrl(e.target.value)}
//               onKeyDown={(e) => e.key === 'Enter' && insertLink()}
//               placeholder="Enter URL (https://...)"
//               className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               autoFocus
//             />
//             <div className="flex space-x-3">
//               <button
//                 onClick={insertLink}
//                 disabled={!linkUrl}
//                 className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
//               >
//                 Insert Link
//               </button>
//               <button
//                 onClick={() => {
//                   setIsLinkModalOpen(false);
//                   setLinkUrl('');
//                 }}
//                 className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Table Modal */}
//       {isTableModalOpen && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
//             <h3 className="text-lg font-semibold mb-4">Insert Table</h3>
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-2">Rows:</label>
//               <input
//                 type="number"
//                 value={tableRows}
//                 onChange={(e) => setTableRows(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
//                 min="1"
//                 max="20"
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-2">Columns:</label>
//               <input
//                 type="number"
//                 value={tableCols}
//                 onChange={(e) => setTableCols(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
//                 min="1"
//                 max="10"
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div className="mb-4 p-3 bg-gray-100 rounded">
//               <p className="text-sm text-gray-600">Preview: {tableRows} × {tableCols} table</p>
//             </div>
//             <div className="flex space-x-3">
//               <button
//                 onClick={insertTable}
//                 className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 Insert Table
//               </button>
//               <button
//                 onClick={() => setIsTableModalOpen(false)}
//                 className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Status Bar */}
//       <div className="border-t border-gray-200 p-3 bg-gray-50 text-sm text-gray-600">
//         <div className="flex justify-between items-center">
//           <div className="flex items-center space-x-4">
//             <span><span className="font-medium">User:</span> {userId}</span>
//             <span><span className="font-medium">Mode:</span> {isPreviewMode ? 'Preview' : 'Edit'}</span>
//             <span><span className="font-medium">AI Features:</span> {GEMINI_API_KEY ? '✅ Ready' : '❌ Not Available'}</span>
//           </div>
//           <div className="flex items-center space-x-4">
//             <span>Zoom: {zoomLevel}%</span>
//             <span>Pages: {totalPages}</span>
//             <span>Characters: {pageContents.join('').replace(/<[^>]*>/g, '').length || 0}</span>
//             <div className="flex items-center space-x-1">
//               <div className="w-2 h-2 rounded-full bg-green-500"></div>
//               <span>Auto-saved</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RichTextEditor;
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link, Image, Languages, SpellCheck, 
  Sparkles, MessageSquare, Loader, Type, Palette, Minus, Plus,
  Undo, Redo, Copy, Scissors, ClipboardPaste, Quote, Code,
  Subscript, Superscript, Strikethrough, Table, Divide,
  Indent, Outdent, RotateCcw, Settings, MoreVertical, FileText,
  Printer, Download, Upload, Save, Eye, ChevronLeft, ChevronRight
} from 'lucide-react';

const RichTextEditor = ({ 
  value = '', 
  onChange = () => {}, 
  placeholder = "Start typing your document...",
  userId = 'guest'
}) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedText, setSelectedText] = useState('');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState('Times New Roman');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isModified, setIsModified] = useState(false);
  const [pageContents, setPageContents] = useState(['']); // State to hold content for each page

  // Enhanced content state
  const [content, setContent] = useState(value || '');

  // Track cursor position for better editing experience
  const [cursorPosition, setCursorPosition] = useState(0);

  // Update word and character count
  const updateCounts = useCallback((htmlContent) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    
    // Count words (split by whitespace and filter empty strings)
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    
    // Count characters (including spaces)
    setCharCount(text.length);
  }, []);

  // Function to split content into pages
  const splitContentIntoPages = useCallback((htmlContent) => {
    if (!htmlContent || htmlContent === '<br>' || htmlContent === '<p><br></p>') return [''];
    
    // Split content by explicit page breaks first
    const pageBreakRegex = /<div[^>]*class="page-break"[^>]*>.*?<\/div>/gi;
    let sections = htmlContent.split(pageBreakRegex);
    
    const pages = [];
    const wordsPerPage = 400; // Approximate words per page
    
    sections.forEach((section, sectionIndex) => {
      if (!section.trim() && sectionIndex > 0) {
        // Add empty page for page breaks
        if (pages.length === 0) pages.push('');
        return;
      }
      
      if (!section.trim()) return;
      
      // Parse HTML and count words more accurately
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = section;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      const wordCount = textContent.trim().split(/\s+/).filter(w => w.length > 0).length;
      
      if (wordCount <= wordsPerPage) {
        // Content fits in one page
        pages.push(section);
      } else {
        // Split content into multiple pages
        const paragraphs = section.match(/<p[^>]*>.*?<\/p>|<h[1-6][^>]*>.*?<\/h[1-6]>|<div[^>]*>.*?<\/div>|<br\s*\/?>/gi) || [section];
        
        let currentPageContent = '';
        let currentWordCount = 0;
        
        paragraphs.forEach(paragraph => {
          const pDiv = document.createElement('div');
          pDiv.innerHTML = paragraph;
          const pWordCount = (pDiv.textContent || '').trim().split(/\s+/).filter(w => w.length > 0).length;
          
          if (currentWordCount + pWordCount > wordsPerPage && currentPageContent) {
            pages.push(currentPageContent);
            currentPageContent = paragraph;
            currentWordCount = pWordCount;
          } else {
            currentPageContent += paragraph;
            currentWordCount += pWordCount;
          }
        });
        
        if (currentPageContent.trim()) {
          pages.push(currentPageContent);
        }
      }
    });
    
    return pages.length > 0 ? pages : [''];
  }, []);

  // Initialize content and page data
  useEffect(() => {
    if (editorRef.current) {
      const initialContent = value || content || '';
      editorRef.current.innerHTML = initialContent;
      setContent(initialContent);
      updateCounts(initialContent);
      saveToHistory(); // Save initial state to undo stack

      // Update page contents based on initial value
      const pages = splitContentIntoPages(initialContent);
      setPageContents(pages);
      setTotalPages(pages.length);
      
      // Ensure current page is valid
      if (currentPage > pages.length) {
        setCurrentPage(1);
      }
    }
  }, [value, updateCounts, splitContentIntoPages]);

  // Enhanced selection management with better persistence
  const savedSelectionRef = useRef(null);
  
  const saveSelection = useCallback(() => {
    if (window.getSelection && editorRef.current) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        // Only save if selection is within our editor
        if (editorRef.current.contains(range.commonAncestorContainer)) {
          const savedSelection = {
            startContainer: range.startContainer,
            startOffset: range.startOffset,
            endContainer: range.endContainer,
            endOffset: range.endOffset,
            collapsed: range.collapsed,
            text: selection.toString(),
            // Store the path to containers for better restoration
            startPath: getNodePath(range.startContainer, editorRef.current),
            endPath: getNodePath(range.endContainer, editorRef.current)
          };
          savedSelectionRef.current = savedSelection;
          return savedSelection;
        }
      }
    }
    return null;
  }, []);

  // Helper function to get node path
  const getNodePath = useCallback((node, root) => {
    const path = [];
    let current = node;
    
    while (current && current !== root) {
      const parent = current.parentNode;
      if (parent) {
        const index = Array.from(parent.childNodes).indexOf(current);
        path.unshift(index);
        current = parent;
      } else {
        break;
      }
    }
    return path;
  }, []);

  // Helper function to get node from path
  const getNodeFromPath = useCallback((path, root) => {
    let current = root;
    for (const index of path) {
      if (current.childNodes[index]) {
        current = current.childNodes[index];
      } else {
        return null;
      }
    }
    return current;
  }, []);

  const restoreSelection = useCallback((savedSelection = null) => {
    const selectionToRestore = savedSelection || savedSelectionRef.current;
    
    if (selectionToRestore && window.getSelection && editorRef.current) {
      try {
        // Try to restore using node paths first
        let startContainer = getNodeFromPath(selectionToRestore.startPath, editorRef.current);
        let endContainer = getNodeFromPath(selectionToRestore.endPath, editorRef.current);

        // Fallback to original containers if path method fails
        if (!startContainer || !editorRef.current.contains(startContainer)) {
          startContainer = selectionToRestore.startContainer;
        }
        if (!endContainer || !editorRef.current.contains(endContainer)) {
          endContainer = selectionToRestore.endContainer;
        }

        // Final fallback: find text in editor
        if (!startContainer || !endContainer || 
            !editorRef.current.contains(startContainer) || 
            !editorRef.current.contains(endContainer)) {
          
          if (selectionToRestore.text) {
            // Try to find the same text in the editor
            const walker = document.createTreeWalker(
              editorRef.current,
              NodeFilter.SHOW_TEXT,
              null,
              false
            );
            
            let node;
            while (node = walker.nextNode()) {
              const textContent = node.textContent;
              const index = textContent.indexOf(selectionToRestore.text);
              if (index !== -1) {
                const selection = window.getSelection();
                const range = document.createRange();
                range.setStart(node, index);
                range.setEnd(node, index + selectionToRestore.text.length);
                selection.removeAllRanges();
                selection.addRange(range);
                return true;
              }
            }
          }
          return false;
        }

        const selection = window.getSelection();
        const range = document.createRange();
        
        // Ensure offsets are within bounds
        const startOffset = Math.min(selectionToRestore.startOffset, startContainer.textContent?.length || 0);
        const endOffset = Math.min(selectionToRestore.endOffset, endContainer.textContent?.length || 0);
        
        range.setStart(startContainer, startOffset);
        range.setEnd(endContainer, endOffset);
        selection.removeAllRanges();
        selection.addRange(range);
        return true;
      } catch (e) {
        console.warn("Could not restore selection:", e);
        return false;
      }
    }
    return false;
  }, [getNodeFromPath]);

  // Enhanced undo/redo system
  const saveToHistory = useCallback(() => {
    const currentContent = editorRef.current?.innerHTML || '';
    setUndoStack(prev => {
      const newStack = [...prev.slice(-19), currentContent];
      return newStack;
    });
    setRedoStack([]);
    setIsModified(true);
  }, []);

  // Handle content changes
  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
    updateCounts(newContent);
    onChange(newContent);
    setIsModified(true);
    
    // Update pages when content changes
    const pages = splitContentIntoPages(newContent);
    setPageContents(pages);
    setTotalPages(pages.length);
    
    // Adjust current page if necessary
    if (currentPage > pages.length && pages.length > 0) {
      setCurrentPage(pages.length);
    }
  }, [onChange, updateCounts, splitContentIntoPages, currentPage]);

  // Enhanced format text function - PROPERLY FIXED for selection-only formatting
  const formatText = useCallback((command, value = null) => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const isCollapsed = range.collapsed;
    
    // Ensure we're working within the editor
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;
    
    // For style commands that need special handling to apply only to selection
    if (['fontSize', 'fontName', 'foreColor', 'hiliteColor'].includes(command)) {
      if (isCollapsed) {
        // If no selection, set style for future typing by inserting invisible span
        const span = document.createElement('span');
        span.style.display = 'inline';
        span.setAttribute('data-formatting', 'true');
        
        switch (command) {
          case 'fontSize':
            span.style.fontSize = value + 'px';
            break;
          case 'fontName':
            span.style.fontFamily = value;
            break;
          case 'foreColor':
            span.style.color = value;
            break;
          case 'hiliteColor':
            span.style.backgroundColor = value;
            break;
        }
        
        // Insert span at cursor position
        range.insertNode(span);
        range.setStart(span, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        return;
      }
      
      // Save the selected text content and range info
      const selectedText = selection.toString();
      const startContainer = range.startContainer;
      const endContainer = range.endContainer;
      const startOffset = range.startOffset;
      const endOffset = range.endOffset;
      
      // Create a span with the appropriate styling
      const span = document.createElement('span');
      span.style.display = 'inline';
      
      // Preserve existing styles from parent elements
      const computedStyle = window.getComputedStyle(range.commonAncestorContainer.parentElement || range.commonAncestorContainer);
      
      // Apply the new style
      switch (command) {
        case 'fontSize':
          span.style.fontSize = value + 'px';
          break;
        case 'fontName':
          span.style.fontFamily = value;
          break;
        case 'foreColor':
          span.style.color = value;
          break;
        case 'hiliteColor':
          span.style.backgroundColor = value;
          break;
      }
      
      try {
        // Extract the selected content
        const selectedContent = range.extractContents();
        
        // Wrap it in our styled span
        span.appendChild(selectedContent);
        
        // Insert the styled span
        range.insertNode(span);
        
        // Reselect the content
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        // Save to history and update content
        saveToHistory();
        const newContent = editorRef.current?.innerHTML || '';
        handleContentChange(newContent);
        
        return;
      } catch (error) {
        console.warn('Error applying font formatting:', error);
        // Fallback to document.execCommand
        try {
          document.execCommand(command, false, value);
        } catch (fallbackError) {
          console.warn('Fallback formatting also failed:', fallbackError);
        }
      }
    }
    
    // For other formatting commands (bold, italic, etc.)
    if (isCollapsed) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
    } else {
      // Save selection info for restoration
      const selectedText = selection.toString();
      const rangeInfo = {
        startContainer: range.startContainer,
        endContainer: range.endContainer,
        startOffset: range.startOffset,
        endOffset: range.endOffset
      };
      
      saveToHistory();
      
      try {
        // Execute the formatting command
        const success = document.execCommand(command, false, value);
        
        if (success) {
          // Try to restore selection after formatting
          setTimeout(() => {
            try {
              // Method 1: Try to restore using original range info
              if (editorRef.current.contains(rangeInfo.startContainer) && 
                  editorRef.current.contains(rangeInfo.endContainer)) {
                const newRange = document.createRange();
                const newSelection = window.getSelection();
                newRange.setStart(rangeInfo.startContainer, rangeInfo.startOffset);
                newRange.setEnd(rangeInfo.endContainer, rangeInfo.endOffset);
                newSelection.removeAllRanges();
                newSelection.addRange(newRange);
              } else if (selectedText) {
                // Method 2: Find the text and reselect it
                const walker = document.createTreeWalker(
                  editorRef.current,
                  NodeFilter.SHOW_TEXT,
                  null,
                  false
                );
                
                let node;
                while (node = walker.nextNode()) {
                  const text = node.textContent || '';
                  const index = text.indexOf(selectedText);
                  if (index !== -1) {
                    const newRange = document.createRange();
                    const newSelection = window.getSelection();
                    newRange.setStart(node, index);
                    newRange.setEnd(node, index + selectedText.length);
                    newSelection.removeAllRanges();
                    newSelection.addRange(newRange);
                    break;
                  }
                }
              }
            } catch (e) {
              console.warn('Could not restore selection after formatting:', e);
            }
          }, 10);
        }
      } catch (error) {
        console.warn('Formatting command failed:', error);
      }
    }
    
    const newContent = editorRef.current?.innerHTML || '';
    handleContentChange(newContent);
  }, [saveToHistory, handleContentChange]);

  // Handle selection changes without interfering with formatting
  const handleSelectionChange = useCallback(() => {
    requestAnimationFrame(() => {
      const selection = window.getSelection();
      if (selection && editorRef.current && 
          selection.anchorNode && 
          editorRef.current.contains(selection.anchorNode)) {
        const selectedTextContent = selection.toString();
        setSelectedText(selectedTextContent);
      }
    });
  }, []);

  // Page navigation functions
  const goToPage = useCallback((pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      
      // Update editor content to show specific page
      if (editorRef.current && pageContents[pageNumber - 1] !== undefined) {
        const pageContent = pageContents[pageNumber - 1];
        editorRef.current.innerHTML = pageContent;
        setContent(pageContent);
        updateCounts(pageContent);
      }
    }
  }, [totalPages, pageContents, updateCounts]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  // Update current page content when editor changes
  const updateCurrentPageContent = useCallback(() => {
    if (editorRef.current && currentPage <= pageContents.length) {
      const currentContent = editorRef.current.innerHTML || '';
      const newPageContents = [...pageContents];
      newPageContents[currentPage - 1] = currentContent;
      setPageContents(newPageContents);
      
      // Update the full document content
      const fullContent = newPageContents.join('<div class="page-break" style="page-break-before: always; break-before: page; border-top: 2px dashed #007bff; margin: 40px 0; padding-top: 40px; text-align: center; color: #007bff; font-size: 12px; font-weight: bold;"><span style="background: white; padding: 0 15px;">--- Page Break ---</span></div>');
      setContent(fullContent);
      onChange(fullContent);
    }
  }, [currentPage, pageContents, onChange]);

  // File operations
  const handleSave = useCallback(() => {
    updateCurrentPageContent();
    setIsModified(false);
    alert('Document saved successfully!');
  }, [updateCurrentPageContent]);

  const handleSaveAsHTML = useCallback(() => {
    const fullContent = pageContents.join('<div style="page-break-before: always;"></div>');
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        body { 
            font-family: ${fontFamily}; 
            font-size: ${fontSize}px; 
            line-height: 1.6; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        @media print {
            div[style*="page-break-before"] {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
    ${fullContent}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [pageContents, fontFamily, fontSize]);

  const handlePrint = useCallback(() => {
    const fullContent = pageContents.join('<div style="page-break-before: always;"></div>');
    const printWindow = window.open('', '_blank');
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Print Document</title>
    <style>
        body { 
            font-family: ${fontFamily}; 
            font-size: ${fontSize}px; 
            line-height: 1.6; 
            margin: 20px; 
        }
        @media print {
            body { margin: 0; }
            div[style*="page-break-before"] {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
    ${fullContent}
    <script>
        window.onload = function() {
            window.print();
            window.close();
        }
    </script>
</body>
</html>`;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }, [pageContents, fontFamily, fontSize]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          formatText('bold');
          break;
        case 'i':
          e.preventDefault();
          formatText('italic');
          break;
        case 'u':
          e.preventDefault();
          formatText('underline');
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
          break;
        case 'y':
          e.preventDefault();
          handleRedo();
          break;
        case 's':
          e.preventDefault();
          handleSave();
          break;
      }
    }
    
    // Auto-save history on Enter for paragraph breaks
    if (e.key === 'Enter' && !e.shiftKey) {
      setTimeout(saveToHistory, 100);
    }
  }, [formatText, handleSave, saveToHistory]);

  // Enhanced input handler that preserves selection
  const handleInput = useCallback(() => {
    const newContent = editorRef.current?.innerHTML || '';
    
    if (newContent !== content) {
      // Update current page content
      const newPageContents = [...pageContents];
      newPageContents[currentPage - 1] = newContent;
      setPageContents(newPageContents);
      
      // Update counts
      updateCounts(newContent);
      setIsModified(true);
      
      // Auto-split if content gets too long for current page
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = newContent;
      const wordCount = (tempDiv.textContent || '').trim().split(/\s+/).filter(w => w.length > 0).length;
      
      if (wordCount > 500) { // If current page exceeds word limit
        const pages = splitContentIntoPages(newContent);
        if (pages.length > 1) {
          setPageContents(pages);
          setTotalPages(pages.length);
          // Keep user on first page of the split
          editorRef.current.innerHTML = pages[0];
        }
      }
    }
    
    handleSelectionChange();
  }, [content, pageContents, currentPage, updateCounts, handleSelectionChange, splitContentIntoPages]);

  // Enhanced undo function
  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const currentContent = editorRef.current?.innerHTML || '';
      const previousContent = undoStack[undoStack.length - 1];
      
      setRedoStack(prev => [...prev, currentContent]);
      setUndoStack(prev => prev.slice(0, -1));
      
      if (editorRef.current) {
        editorRef.current.innerHTML = previousContent;
        updateCurrentPageContent();
        setTimeout(() => editorRef.current?.focus(), 10);
      }
    }
  }, [undoStack, updateCurrentPageContent]);

  // Enhanced redo function
  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const currentContent = editorRef.current?.innerHTML || '';
      const nextContent = redoStack[redoStack.length - 1];
      
      setUndoStack(prev => [...prev, currentContent]);
      setRedoStack(prev => prev.slice(0, -1));
      
      if (editorRef.current) {
        editorRef.current.innerHTML = nextContent;
        updateCurrentPageContent();
        setTimeout(() => editorRef.current?.focus(), 10);
      }
    }
  }, [redoStack, updateCurrentPageContent]);

  // Enhanced paste handler
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    saveToHistory();
    
    const clipboardData = e.clipboardData || window.clipboardData;
    const htmlData = clipboardData.getData('text/html');
    const textData = clipboardData.getData('text/plain');
    
    const pasteContent = htmlData || textData.replace(/\n/g, '<br>');
    const cleanContent = pasteContent
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '');
    
    document.execCommand('insertHTML', false, cleanContent);
    
    const newContent = editorRef.current?.innerHTML || '';
    handleContentChange(newContent);
  }, [saveToHistory, handleContentChange]);

  // Enhanced link insertion
  const insertLink = useCallback(() => {
    if (linkUrl) {
      const selection = saveSelection();
      
      if (selectedText) {
        const linkHtml = `<a href="${linkUrl}" target="_blank" style="color: #0066cc; text-decoration: underline;">${selectedText}</a>`;
        document.execCommand('insertHTML', false, linkHtml);
      } else {
        formatText('createLink', linkUrl);
      }
      
      setIsLinkModalOpen(false);
      setLinkUrl('');
      
      const newContent = editorRef.current?.innerHTML || '';
      handleContentChange(newContent);
    }
  }, [linkUrl, selectedText, saveSelection, formatText, handleContentChange]);

  // Enhanced image insertion
  const insertImage = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url) {
      saveToHistory();
      const imgHtml = `<img src="${url}" style="max-width: 100%; height: auto; margin: 10px 0; display: block;" alt="Inserted image" />`;
      document.execCommand('insertHTML', false, imgHtml);
      
      const newContent = editorRef.current?.innerHTML || '';
      handleContentChange(newContent);
    }
  }, [saveToHistory, handleContentChange]);

  // Enhanced table insertion
  const insertTable = useCallback(() => {
    saveToHistory();
    let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #ddd;">';
    
    for (let i = 0; i < tableRows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < tableCols; j++) {
        const cellStyle = 'border: 1px solid #ddd; padding: 8px; min-width: 50px; min-height: 30px;';
        const isHeader = i === 0;
        const cellContent = isHeader ? `Header ${j + 1}` : '&nbsp;';
        const tag = isHeader ? 'th' : 'td';
        tableHTML += `<${tag} style="${cellStyle}${isHeader ? ' font-weight: bold; background-color: #f5f5f5;' : ''}">${cellContent}</${tag}>`;
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</table><p><br></p>';
    
    document.execCommand('insertHTML', false, tableHTML);
    setIsTableModalOpen(false);
    
    const newContent = editorRef.current?.innerHTML || '';
    handleContentChange(newContent);
  }, [saveToHistory, tableRows, tableCols, handleContentChange]);

  const insertPageBreak = useCallback(() => {
    // Instead of inserting a page break, create a new page
    updateCurrentPageContent();
    
    const newPageContents = [...pageContents];
    newPageContents.push(''); // Add empty new page
    setPageContents(newPageContents);
    setTotalPages(newPageContents.length);
    
    // Navigate to the new page
    setCurrentPage(newPageContents.length);
    
    // Clear editor for new page
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      editorRef.current.focus();
    }
  }, [pageContents, updateCurrentPageContent]);

  // AI Functions (mock implementations)
  const handleAIAction = useCallback(async (action, prompt = '') => {
    const currentContent = editorRef.current?.innerHTML || '';
    if (!currentContent && action !== 'generate') {
      alert("Page is empty. Nothing to process.");
      return;
    }
    
    setIsLoading(true);
    setLoadingAction(`Processing with AI (${action})...`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let result = '';
      switch (action) {
        case 'translate':
          result = `<p><strong>Marathi Translation:</strong></p><p>आपला मजकूर इथे अनुवादित केला जाईल...</p>`;
          break;
        case 'spellcheck':
          result = currentContent.replace(/teh/g, 'the').replace(/recieve/g, 'receive');
          break;
        case 'generate':
          result = `<p><strong>AI Generated Content:</strong></p><p>This is AI-generated content based on your prompt: "${prompt}". This would be replaced with actual AI-generated text in a real implementation.</p>`;
          break;
        case 'review':
          alert('AI Review Complete!\n\n✅ Grammar: Excellent\n✅ Clarity: Good\n📝 Suggestions: Consider adding more examples\n⭐ Overall Score: 8.5/10');
          return;
        default:
          result = currentContent;
      }
      
      if (editorRef.current) {
        saveToHistory();
        if (action === 'generate') {
          editorRef.current.innerHTML = currentContent + result;
        } else {
          editorRef.current.innerHTML = result;
        }
        updateCurrentPageContent();
      }
    } catch (error) {
      alert(`AI ${action} failed. Please try again.`);
    } finally {
      setIsLoading(false);
      setLoadingAction('');
    }
  }, [saveToHistory, updateCurrentPageContent]);

  // Initialize editor
  useEffect(() => {
    if (editorRef.current && pageContents.length > 0) {
      const pageContent = pageContents[currentPage - 1] || '';
      editorRef.current.innerHTML = pageContent;
      updateCounts(pageContent);
    }
  }, [currentPage, pageContents, updateCounts]);

  return (
    <div className="h-screen flex flex-col border border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-3">
            <Loader className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-lg">{loadingAction}</span>
          </div>
        </div>
      )}

      {/* Main Toolbar */}
      <div className="border-b border-gray-200 p-3 bg-gray-50">
        <div className="flex flex-wrap items-center gap-1">
          {/* File Operations */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && file.type === 'text/html') {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const htmlContent = e.target.result;
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlContent, 'text/html');
                    const bodyContent = doc.body.innerHTML;
                    
                    if (editorRef.current) {
                      saveToHistory();
                      editorRef.current.innerHTML = bodyContent;
                      handleContentChange(bodyContent);
                    }
                  };
                  reader.readAsText(file);
                }
              }}
              accept=".html,.txt"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Open File"
            >
              <Upload className="h-4 w-4" />
            </button>
            <button
              onClick={handleSave}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Save (Ctrl+S)"
            >
              <Save className="h-4 w-4" />
            </button>
            <button
              onClick={handleSaveAsHTML}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Download HTML"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Print"
            >
              <Printer className="h-4 w-4" />
            </button>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </button>
          </div>

          {/* Font Settings - COMPLETELY FIXED to apply only to selected text */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2 gap-1">
            <select
              value=""
              onChange={(e) => {
                const newFont = e.target.value;
                if (newFont) {
                  setFontFamily(newFont);
                  
                  // Apply font only to selected text
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    formatText('fontName', newFont);
                  }
                  // Reset select to show placeholder
                  e.target.value = '';
                }
              }}
              className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
              title="Change font family for selected text"
            >
              <option value="">Font Family</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Verdana">Verdana</option>
              <option value="Courier New">Courier New</option>
              <option value="Impact">Impact</option>
              <option value="Comic Sans MS">Comic Sans MS</option>
              <option value="Trebuchet MS">Trebuchet MS</option>
            </select>
            
            <div className="flex items-center border border-gray-300 rounded">
              <button
                onClick={() => {
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                    // Apply to selected text
                    const currentElement = selection.getRangeAt(0).commonAncestorContainer.parentElement;
                    const computedStyle = window.getComputedStyle(currentElement);
                    const currentSize = parseInt(computedStyle.fontSize) || fontSize;
                    const newSize = Math.max(8, Math.min(72, currentSize - 1));
                    formatText('fontSize', newSize);
                  } else {
                    // Update default for future typing
                    const newSize = Math.max(8, Math.min(72, fontSize - 1));
                    setFontSize(newSize);
                  }
                }}
                className="p-1 hover:bg-gray-200"
                title="Decrease font size for selected text"
              >
                <Minus className="h-3 w-3" />
              </button>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => {
                  const newSize = parseInt(e.target.value) || 14;
                  const validSize = Math.max(8, Math.min(72, newSize));
                  setFontSize(validSize);
                  
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                    formatText('fontSize', validSize);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const newSize = parseInt(e.target.value) || 14;
                    const validSize = Math.max(8, Math.min(72, newSize));
                    setFontSize(validSize);
                    
                    const selection = window.getSelection();
                    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                      formatText('fontSize', validSize);
                    }
                    e.target.blur();
                  }
                }}
                className="w-12 text-center text-sm border-0"
                min="8"
                max="72"
                title="Font size (Enter to apply to selected text)"
              />
              <button
                onClick={() => {
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                    // Apply to selected text
                    const currentElement = selection.getRangeAt(0).commonAncestorContainer.parentElement;
                    const computedStyle = window.getComputedStyle(currentElement);
                    const currentSize = parseInt(computedStyle.fontSize) || fontSize;
                    const newSize = Math.max(8, Math.min(72, currentSize + 1));
                    formatText('fontSize', newSize);
                  } else {
                    // Update default for future typing
                    const newSize = Math.max(8, Math.min(72, fontSize + 1));
                    setFontSize(newSize);
                  }
                }}
                className="p-1 hover:bg-gray-200"
                title="Increase font size for selected text"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Text Formatting */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              onClick={() => formatText('bold')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatText('italic')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatText('underline')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Underline (Ctrl+U)"
            >
              <Underline className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatText('strikeThrough')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </button>
          </div>

          {/* Colors */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                setTextColor(e.target.value);
                formatText('foreColor', e.target.value);
              }}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              title="Text Color (applies to selected text)"
            />
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => {
                setBackgroundColor(e.target.value);
                formatText('hiliteColor', e.target.value);
              }}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer ml-1"
              title="Highlight Color (applies to selected text)"
            />
          </div>

          {/* Alignment */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              onClick={() => formatText('justifyLeft')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatText('justifyCenter')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatText('justifyRight')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatText('justifyFull')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Justify"
            >
              <AlignJustify className="h-4 w-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              onClick={() => formatText('insertUnorderedList')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatText('insertOrderedList')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatText('indent')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Increase Indent"
            >
              <Indent className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatText('outdent')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Decrease Indent"
            >
              <Outdent className="h-4 w-4" />
            </button>
          </div>

          {/* Insert Elements */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Insert Link"
            >
              <Link className="h-4 w-4" />
            </button>
            <button
              onClick={insertImage}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Insert Image"
            >
              <Image className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsTableModalOpen(true)}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Insert Table"
            >
              <Table className="h-4 w-4" />
            </button>
            <button
              onClick={insertPageBreak}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Add New Page"
            >
              <Divide className="h-4 w-4" />
            </button>
          </div>

          {/* AI Features */}
          <div className="flex items-center">
            <button
              onClick={() => handleAIAction('translate')}
              disabled={isLoading}
              className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
              title="Translate to Marathi"
            >
              <Languages className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleAIAction('spellcheck')}
              disabled={isLoading}
              className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
              title="Spell Check"
            >
              <SpellCheck className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                const prompt = window.prompt('Enter a prompt for content generation:');
                if (prompt) handleAIAction('generate', prompt);
              }}
              disabled={isLoading}
              className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
              title="Generate Content"
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleAIAction('review')}
              disabled={isLoading}
              className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
              title="AI Review"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Toolbar */}
      <div className="border-b border-gray-200 p-2 bg-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Zoom:</span>
              <select
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseInt(e.target.value))}
                className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
              >
                <option value={50}>50%</option>
                <option value={75}>75%</option>
                <option value={100}>100%</option>
                <option value={125}>125%</option>
                <option value={150}>150%</option>
                <option value={200}>200%</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Style:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    formatText('formatBlock', e.target.value);
                    e.target.value = '';
                  }
                }}
                className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                defaultValue=""
              >
                <option value="">Normal</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
                <option value="h5">Heading 5</option>
                <option value="h6">Heading 6</option>
                <option value="p">Paragraph</option>
                <option value="blockquote">Quote</option>
                <option value="pre">Code Block</option>
              </select>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center space-x-2 border-l pl-4">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage <= 1}
                className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium">Page:</span>
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => {
                    const pageNum = parseInt(e.target.value);
                    if (pageNum >= 1 && pageNum <= totalPages) {
                      goToPage(pageNum);
                    }
                  }}
                  min="1"
                  max={totalPages}
                  className="w-12 text-center text-sm border border-gray-300 rounded px-1 py-0.5"
                />
                <span className="text-sm text-gray-600">of {totalPages}</span>
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
                className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Words: {wordCount}</span>
            <span className="text-sm text-gray-600">Characters: {charCount}</span>
            {selectedText && (
              <span className="text-sm text-blue-600">Selected: {selectedText.length} chars</span>
            )}
            {isModified && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-sm text-orange-600">Modified</span>
              </div>
            )}
            {!isModified && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-green-600">Saved</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto bg-gray-200 p-8" style={{ backgroundColor: '#f5f5f5' }}>
          <div className="max-w-4xl mx-auto">
            {/* Document Container */}
            <div 
              className="bg-white shadow-xl border border-gray-300 min-h-[11in] relative"
              style={{
                width: `${(8.5 * 96 * zoomLevel) / 100}px`,
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                marginBottom: `${zoomLevel < 100 ? (100 - zoomLevel) * 2 : 0}px`
              }}
            >
              {/* Page Header */}
              <div className="absolute -top-8 left-0 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
                Document - Page {currentPage} of {totalPages}
              </div>

              {/* Editor Content */}
              <div
                ref={editorRef}
                contentEditable={!isPreviewMode}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onMouseUp={handleSelectionChange}
                onKeyUp={handleSelectionChange}
                onSelectStart={() => true}
                onSelect={handleSelectionChange}
                onPaste={handlePaste}
                onFocus={() => {
                  if (editorRef.current) {
                    editorRef.current.style.outline = '2px solid #3b82f6';
                  }
                }}
                onBlur={() => {
                  if (editorRef.current) {
                    editorRef.current.style.outline = 'none';
                  }
                  // Save current page content when losing focus
                  updateCurrentPageContent();
                }}
                className="focus:outline-none w-full h-full min-h-[10in] p-16 leading-relaxed"
                style={{
                  fontFamily: fontFamily,
                  fontSize: `${fontSize}px`,
                  lineHeight: '1.6',
                  color: '#1a1a1a',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  cursor: isPreviewMode ? 'default' : 'text',
                  userSelect: 'text',
                  WebkitUserSelect: 'text',
                  MozUserSelect: 'text',
                  msUserSelect: 'text'
                }}
                suppressContentEditableWarning={true}
                data-placeholder={`${placeholder} (Page ${currentPage})`}
              />

              {/* Editor specific styles */}
              <style jsx>{`
                [contenteditable="true"]:empty:before {
                  content: attr(data-placeholder);
                  color: #9ca3af;
                  font-style: italic;
                  pointer-events: none;
                }
                [contenteditable="true"]:focus:before {
                  content: none;
                }
                /* Ensure list markers are visible */
                [contenteditable="true"] ol,
                [contenteditable="true"] ul {
                  list-style-position: inside;
                  margin-left: 1.5em;
                }
                [contenteditable="true"] ol {
                  list-style-type: decimal;
                }
                [contenteditable="true"] ul {
                  list-style-type: disc;
                }
                [contenteditable="true"] li {
                  margin-bottom: 0.5em;
                }
              `}</style>
            </div>
          </div>
        </div>
      </div>

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Selected text:</label>
              <div className="bg-gray-100 p-2 rounded text-sm">
                {selectedText || 'No text selected - link text will be the URL'}
              </div>
            </div>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && insertLink()}
              placeholder="Enter URL (https://...)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={insertLink}
                disabled={!linkUrl}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Insert Link
              </button>
              <button
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setLinkUrl('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Modal */}
      {isTableModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Insert Table</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rows:</label>
              <input
                type="number"
                value={tableRows}
                onChange={(e) => setTableRows(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                min="1"
                max="20"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Columns:</label>
              <input
                type="number"
                value={tableCols}
                onChange={(e) => setTableCols(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                min="1"
                max="10"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4 p-3 bg-gray-100 rounded">
              <p className="text-sm text-gray-600">Preview: {tableRows} × {tableCols} table with headers</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={insertTable}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Insert Table
              </button>
              <button
                onClick={() => setIsTableModalOpen(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="border-t border-gray-200 p-3 bg-gray-50 text-sm text-gray-600">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span><span className="font-medium">User:</span> {userId}</span>
            <span><span className="font-medium">Mode:</span> {isPreviewMode ? 'Preview' : 'Edit'}</span>
            <span><span className="font-medium">Font:</span> {fontFamily}, {fontSize}px</span>
            <span><span className="font-medium">Page:</span> {currentPage}/{totalPages}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Zoom: {zoomLevel}%</span>
            <span>Selection: {selectedText ? `${selectedText.length} chars` : 'None'}</span>
            <span>Last saved: {isModified ? 'Unsaved changes' : 'Auto-saved'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;