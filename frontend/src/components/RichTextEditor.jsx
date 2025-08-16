// import React, { useState, useRef, useEffect } from 'react';
// import { 
//   Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
//   List, ListOrdered, Link, Image, Languages, SpellCheck, 
//   Sparkles, MessageSquare, Loader, Type, Palette, Minus, Plus,
//   Undo, Redo, Copy, Scissors, ClipboardPaste, Quote, Code,
//   Subscript, Superscript, Strikethrough, Table, Divide,
//   Indent, Outdent, RotateCcw, Settings, MoreVertical
// } from 'lucide-react';
// import mammoth from 'mammoth';

// const RichTextEditor = ({ 
//   value = '', 
//   onChange = () => {}, 
//   placeholder = "Start typing your document...",
//   userId = 'guest'
// }) => {
//   const editorRef = useRef(null);
//   const [selectedText, setSelectedText] = useState('');
//   const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
//   const [linkUrl, setLinkUrl] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [loadingAction, setLoadingAction] = useState('');
//   const [fontSize, setFontSize] = useState(16);
//   const [fontFamily, setFontFamily] = useState('Georgia');
//   const [textColor, setTextColor] = useState('#000000');
//   const [backgroundColor, setBackgroundColor] = useState('#ffffff');
//   const [isTableModalOpen, setIsTableModalOpen] = useState(false);
//   const [tableRows, setTableRows] = useState(3);
//   const [tableCols, setTableCols] = useState(3);
//   const [undoStack, setUndoStack] = useState([]);
//   const [redoStack, setRedoStack] = useState([]);

//   // Get API key for AI features
//   const getApiKey = () => {
//     return 'AIzaSyCK7KbeHityDSFGP3SLwYApHSdnp-KMUcw';
//   };
  
//   const GEMINI_API_KEY = getApiKey();

//   useEffect(() => {
//     const loadContent = async () => {
//       if (typeof value === 'string' && value.toLowerCase().endsWith('.docx')) {
//         setIsLoading(true);
//         setLoadingAction('Loading and converting DOCX...');
//         try {
//           const response = await fetch(value);
//           if (!response.ok) {
//             throw new Error(`Failed to fetch DOCX: ${response.statusText}`);
//           }
//           const arrayBuffer = await response.arrayBuffer();
//           const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
//           if (editorRef.current) {
//             editorRef.current.innerHTML = result.value;
//             onChange(result.value);
//           }
//         } catch (error) {
//           console.error("Error loading or converting DOCX:", error);
//           alert(`Error loading document: ${error.message}`);
//           if (editorRef.current) {
//             editorRef.current.innerHTML = `<p style="color: red;">Error loading document: ${error.message}</p>`;
//             onChange(`<p style="color: red;">Error loading document: ${error.message}</p>`);
//           }
//         } finally {
//           setIsLoading(false);
//           setLoadingAction('');
//         }
//       } else if (editorRef.current && editorRef.current.innerHTML !== value) {
//         editorRef.current.innerHTML = value;
//       }
//     };

//     loadContent();
//   }, [value, onChange]);

//   const handleSelectionChange = () => {
//     const selection = window.getSelection();
//     setSelectedText(selection.toString());
//   };

//   const saveToUndoStack = () => {
//     const currentContent = editorRef.current?.innerHTML || '';
//     setUndoStack(prev => [...prev.slice(-19), currentContent]); // Keep last 20 states
//     setRedoStack([]); // Clear redo stack when new action is performed
//   };

//   const formatText = (command, value = null) => {
//     saveToUndoStack();
//     document.execCommand(command, false, value);
//     editorRef.current?.focus();
//     onChange(editorRef.current?.innerHTML || '');
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
//       }
//     }
//   };

//   const insertLink = () => {
//     if (linkUrl) {
//       formatText('createLink', linkUrl);
//       setIsLinkModalOpen(false);
//       setLinkUrl('');
//     }
//   };

//   const insertImage = () => {
//     const url = prompt('Enter image URL:');
//     if (url) {
//       formatText('insertImage', url);
//     }
//   };

//   const insertTable = () => {
//     let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
//     for (let i = 0; i < tableRows; i++) {
//       tableHTML += '<tr>';
//       for (let j = 0; j < tableCols; j++) {
//         tableHTML += '<td style="border: 1px solid #ccc; padding: 8px; min-width: 50px; min-height: 30px;">&nbsp;</td>';
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
//     const pageBreakHtml = '<div class="page-break-visual" style="border-top: 1px dashed #ccc; margin: 20px 0; padding-top: 20px; text-align: center; color: #888; font-size: 0.8em;">--- Page Break ---</div><p><br></p>';
//     document.execCommand('insertHTML', false, pageBreakHtml);
//     onChange(editorRef.current?.innerHTML || '');
//   };

//   const handlePaste = (e) => {
//     e.preventDefault();
//     const text = e.clipboardData.getData('text/plain');
//     document.execCommand('insertText', false, text);
//   };

//   const handleCopy = () => {
//     document.execCommand('copy');
//   };

//   const handleCut = () => {
//     document.execCommand('cut');
//   };

//   // AI Functions
//   const callGeminiAPI = async (prompt) => {
//     if (!GEMINI_API_KEY) {
//       alert('Gemini API Key is not configured.');
//       return null;
//     }

//     try {
//       const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           contents: [{
//             parts: [{
//               text: prompt
//             }]
//           }],
//           generationConfig: {
//             temperature: 0.7,
//             topK: 1,
//             topP: 1,
//             maxOutputTokens: 2048,
//           },
//           safetySettings: [
//             {
//               category: "HARM_CATEGORY_HARASSMENT",
//               threshold: "BLOCK_MEDIUM_AND_ABOVE"
//             },
//             {
//               category: "HARM_CATEGORY_HATE_SPEECH",
//               threshold: "BLOCK_MEDIUM_AND_ABOVE"
//             },
//             {
//               category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
//               threshold: "BLOCK_MEDIUM_AND_ABOVE"
//             },
//             {
//               category: "HARM_CATEGORY_DANGEROUS_CONTENT",
//               threshold: "BLOCK_MEDIUM_AND_ABOVE"
//             }
//           ]
//         })
//       });

//       if (!response.ok) {
//         throw new Error(`API request failed: ${response.status} ${response.statusText}`);
//       }

//       const data = await response.json();
      
//       if (data.candidates && data.candidates[0] && data.candidates[0].content) {
//         return data.candidates[0].content.parts[0].text;
//       } else {
//         throw new Error('Invalid response format from Gemini API');
//       }
//     } catch (error) {
//       console.error("Error calling Gemini API:", error);
//       alert(`Error communicating with AI: ${error.message}`);
//       return null;
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
    
//     const prompt = `Translate the following English text to Marathi, maintaining HTML formatting:\n\n${content}`;
//     const translatedContent = await callGeminiAPI(prompt);
    
//     if (translatedContent && editorRef.current) {
//       saveToUndoStack();
//       editorRef.current.innerHTML = translatedContent;
//       onChange(translatedContent);
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
    
//     const prompt = `Correct any spelling and grammatical mistakes in the following text, maintaining HTML formatting:\n\n${content}`;
//     const correctedContent = await callGeminiAPI(prompt);
    
//     if (correctedContent && editorRef.current) {
//       saveToUndoStack();
//       editorRef.current.innerHTML = correctedContent;
//       onChange(correctedContent);
//     }
    
//     setIsLoading(false);
//     setLoadingAction('');
//   };

//   const handleGenerateContent = async () => {
//     const promptText = prompt("Enter a prompt for content generation:");
//     if (!promptText) return;

//     setIsLoading(true);
//     setLoadingAction('Generating content...');
    
//     const aiPrompt = `Generate content based on the following prompt, in HTML format:\n\n${promptText}`;
//     const generatedContent = await callGeminiAPI(aiPrompt);
    
//     if (generatedContent && editorRef.current) {
//       saveToUndoStack();
//       const currentContent = editorRef.current.innerHTML;
//       const newContent = currentContent + generatedContent;
//       editorRef.current.innerHTML = newContent;
//       onChange(newContent);
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
    
//     const prompt = `Review the following document content for clarity, conciseness, grammar, and overall quality. Provide feedback and suggestions:\n\n${content}`;
//     const reviewContent = await callGeminiAPI(prompt);
    
//     if (reviewContent) {
//       alert("AI Review:\n\n" + reviewContent);
//     }
    
//     setIsLoading(false);
//     setLoadingAction('');
//   };

//   const handleKeyDown = (e) => {
//     // Handle keyboard shortcuts
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
//           // Auto-save handled by parent component
//           break;
//       }
//     }
//   };

//   const applyFontSize = (size) => {
//     setFontSize(size);
//     formatText('fontSize', '7'); // Reset first
//     const selection = window.getSelection();
//     if (selection.rangeCount > 0) {
//       const range = selection.getRangeAt(0);
//       if (!range.collapsed) {
//         document.execCommand('fontSize', false, '7');
//         const fontElements = editorRef.current?.querySelectorAll('font[size="7"]');
//         fontElements?.forEach(element => {
//           element.style.fontSize = `${size}px`;
//           element.removeAttribute('size');
//         });
//       }
//     }
//     onChange(editorRef.current?.innerHTML || '');
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

//       {/* Toolbar */}
//       <div className="border-b border-gray-200 p-3 bg-gray-50">
//         <div className="flex flex-wrap items-center gap-1">
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
//               <option value="Georgia">Georgia</option>
//               <option value="Arial">Arial</option>
//               <option value="Times New Roman">Times New Roman</option>
//               <option value="Helvetica">Helvetica</option>
//               <option value="Verdana">Verdana</option>
//               <option value="Courier New">Courier New</option>
//             </select>
            
//             <div className="flex items-center border border-gray-300 rounded">
//               <button
//                 onClick={() => applyFontSize(Math.max(8, fontSize - 1))}
//                 className="p-1 hover:bg-gray-200"
//                 title="Decrease font size"
//               >
//                 <Minus className="h-3 w-3" />
//               </button>
//               <input
//                 type="number"
//                 value={fontSize}
//                 onChange={(e) => applyFontSize(parseInt(e.target.value) || 16)}
//                 className="w-12 text-center text-sm border-0 focus:outline-none"
//                 min="8"
//                 max="72"
//               />
//               <button
//                 onClick={() => applyFontSize(Math.min(72, fontSize + 1))}
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

//       {/* Editor Canvas */}
//       <div className="flex-1 overflow-hidden">
//         <div className="h-full overflow-y-auto bg-gray-100 p-6">
//           <div className="max-w-4xl mx-auto bg-white shadow-lg">
//             <div
//               ref={editorRef}
//               contentEditable
//               onInput={(e) => onChange(e.target.innerHTML)}
//               onMouseUp={handleSelectionChange}
//               onKeyUp={handleSelectionChange}
//               onKeyDown={handleKeyDown}
//               onPaste={handlePaste}
//               className="p-16 focus:outline-none"
//               style={{
//                 fontFamily: fontFamily,
//                 fontSize: `${fontSize}px`,
//                 lineHeight: '1.6',
//                 color: '#1a1a1a',
//                 minHeight: 'calc(100vh - 250px)' // Adjusted min-height for better multi-page simulation
//               }}
//               suppressContentEditableWarning={true}
//               data-placeholder={placeholder}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Link Modal */}
//       {isLinkModalOpen && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
//             <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
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
//                 className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
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
//                 onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
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
//                 onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
//                 min="1"
//                 max="10"
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
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
//           <div>
//             <span className="font-medium">User:</span> {userId} | 
//             <span className="font-medium ml-2">AI Features:</span> {GEMINI_API_KEY ? '✅ Ready' : '❌ Not Available'}
//           </div>
//           <div className="flex items-center space-x-4">
//             <span>Auto-save enabled</span>
//             <span>Words: {editorRef.current?.textContent?.split(/\s+/).filter(Boolean).length || 0}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RichTextEditor;



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
//   const GEMINI_API_KEY = 'demo-key-for-ui-demo';

//   useEffect(() => {
//     if (editorRef.current && editorRef.current.innerHTML !== value) {
//       editorRef.current.innerHTML = value;
//       updateWordCount();
//       updatePageCount();
//     }
//   }, [value]);

//   const updateWordCount = useCallback(() => {
//     // Count words from all pages
//     const allContent = pageContents.join(' ');
//     const tempDiv = document.createElement('div');
//     tempDiv.innerHTML = allContent;
//     const text = tempDiv.textContent || '';
//     const words = text.trim().split(/\s+/).filter(word => word.length > 0);
//     setWordCount(words.length);
//   }, [pageContents]);

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
//       if (translatedContent && editorRef.current) {
//         saveToUndoStack();
//         editorRef.current.innerHTML = translatedContent;
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
//         onChange(newContent);
//         updateWordCount();
//         updatePageCount();
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
//     const printContent = editorRef.current?.innerHTML || '';
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
//     const content = editorRef.current?.innerHTML || '';
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
  Printer, Download, Upload, Save, Eye
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [pageContents, setPageContents] = useState(['']);

  // Mock API key for demo - in real app, this should come from environment variables
  const GEMINI_API_KEY = 'demo-key-for-ui-demo';

  const splitContentIntoPages = (content) => {
    if (!content || content === '<br>') return [''];
    
    // Split content by explicit page breaks first
    const pageBreakRegex = /<div[^>]*class="page-break"[^>]*>.*?<\/div>/gi;
    const sections = content.split(pageBreakRegex);
    
    const pages = [];
    
    sections.forEach((section, sectionIndex) => {
      if (!section.trim()) {
        if (sectionIndex === 0) pages.push('');
        return;
      }
      
      // For now, let's use a simpler approach - split by paragraphs and estimate
      const paragraphs = section.split(/(<p[^>]*>.*?<\/p>|<h[1-6][^>]*>.*?<\/h[1-6]>|<div[^>]*>.*?<\/div>|<br\s*\/?>)/gi).filter(p => p.trim());
      
      let currentPageContent = '';
      const wordsPerPage = 500; // Approximate words per page
      let currentWordCount = 0;
      
      paragraphs.forEach(paragraph => {
        if (!paragraph.trim()) return;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = paragraph;
        const wordCount = (tempDiv.textContent || '').split(/\s+/).filter(w => w.length > 0).length;
        
        if (currentWordCount + wordCount > wordsPerPage && currentPageContent) {
          // Start new page
          pages.push(currentPageContent);
          currentPageContent = paragraph;
          currentWordCount = wordCount;
        } else {
          currentPageContent += paragraph;
          currentWordCount += wordCount;
        }
      });
      
      if (currentPageContent.trim()) {
        pages.push(currentPageContent);
      }
    });
    
    return pages.length > 0 ? pages : [''];
  };

  const updateWordCount = useCallback(() => {
    // Count words from all pages
    const allContent = pageContents.join(' ');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = allContent;
    const text = tempDiv.textContent || '';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [pageContents]);

  useEffect(() => {
    if (value && typeof value === 'string') {
      // Handle HTML content
      const pages = splitContentIntoPages(value);
      setPageContents(pages);
      setTotalPages(pages.length);
      if (editorRef.current && pages[0] !== undefined) {
        editorRef.current.innerHTML = pages[0];
      }
      updateWordCount();
    }
  }, [value, fontFamily, fontSize, updateWordCount]);

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    setSelectedText(selection.toString());
  };

  const saveToUndoStack = () => {
    const currentContent = editorRef.current?.innerHTML || '';
    setUndoStack(prev => [...prev.slice(-19), currentContent]);
    setRedoStack([]);
  };

  const formatText = (command, value = null) => {
    saveToUndoStack();
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    const newContent = editorRef.current?.innerHTML || '';
    onChange(newContent);
    
    // Update pages after formatting
    setTimeout(() => {
      const pages = splitContentIntoPages(newContent);
      setPageContents(pages);
      setTotalPages(pages.length);
      updateWordCount();
    }, 50);
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const currentContent = editorRef.current?.innerHTML || '';
      const previousContent = undoStack[undoStack.length - 1];
      
      setRedoStack(prev => [...prev, currentContent]);
      setUndoStack(prev => prev.slice(0, -1));
      
      if (editorRef.current) {
        editorRef.current.innerHTML = previousContent;
        onChange(previousContent);
        
        // Update pages after undo
        const pages = splitContentIntoPages(previousContent);
        setPageContents(pages);
        setTotalPages(pages.length);
        updateWordCount();
      }
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const currentContent = editorRef.current?.innerHTML || '';
      const nextContent = redoStack[redoStack.length - 1];
      
      setUndoStack(prev => [...prev, currentContent]);
      setRedoStack(prev => prev.slice(0, -1));
      
      if (editorRef.current) {
        editorRef.current.innerHTML = nextContent;
        onChange(nextContent);
        
        // Update pages after redo
        const pages = splitContentIntoPages(nextContent);
        setPageContents(pages);
        setTotalPages(pages.length);
        updateWordCount();
      }
    }
  };

  const insertLink = () => {
    if (linkUrl) {
      if (selectedText) {
        const linkHtml = `<a href="${linkUrl}" target="_blank" style="color: #0066cc; text-decoration: underline;">${selectedText}</a>`;
        document.execCommand('insertHTML', false, linkHtml);
      } else {
        formatText('createLink', linkUrl);
      }
      setIsLinkModalOpen(false);
      setLinkUrl('');
      onChange(editorRef.current?.innerHTML || '');
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      const imgHtml = `<img src="${url}" style="max-width: 100%; height: auto; margin: 10px 0;" alt="Inserted image" />`;
      document.execCommand('insertHTML', false, imgHtml);
      onChange(editorRef.current?.innerHTML || '');
    }
  };

  const insertTable = () => {
    let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #ddd;">';
    for (let i = 0; i < tableRows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < tableCols; j++) {
        const cellStyle = 'border: 1px solid #ddd; padding: 8px; min-width: 50px; min-height: 30px;';
        tableHTML += `<td style="${cellStyle}">${i === 0 ? `Header ${j + 1}` : '&nbsp;'}</td>`;
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</table>';
    
    document.execCommand('insertHTML', false, tableHTML);
    setIsTableModalOpen(false);
    onChange(editorRef.current?.innerHTML || '');
  };

  const insertPageBreak = () => {
    saveToUndoStack();
    const pageBreakHtml = `
      <div class="page-break" style="
        page-break-before: always;
        break-before: page;
        border-top: 2px dashed #007bff;
        margin: 40px 0;
        padding-top: 40px;
        text-align: center;
        color: #007bff;
        font-size: 12px;
        font-weight: bold;
        position: relative;
      ">
        <span style="background: white; padding: 0 15px;">--- Page Break ---</span>
      </div>
      <p><br></p>
    `;
    document.execCommand('insertHTML', false, pageBreakHtml);
    
    // Update pages after inserting page break
    setTimeout(() => {
      const newContent = editorRef.current?.innerHTML || '';
      const pages = splitContentIntoPages(newContent);
      setPageContents(pages);
      setTotalPages(pages.length);
      onChange(newContent);
    }, 100);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    
    // Update pages after paste
    setTimeout(() => {
      const newContent = editorRef.current?.innerHTML || '';
      const pages = splitContentIntoPages(newContent);
      setPageContents(pages);
      setTotalPages(pages.length);
      updateWordCount();
      onChange(newContent);
    }, 50);
  };

  const handleCopy = () => {
    document.execCommand('copy');
  };

  const handleCut = () => {
    document.execCommand('cut');
    
    // Update pages after cut
    setTimeout(() => {
      const newContent = editorRef.current?.innerHTML || '';
      const pages = splitContentIntoPages(newContent);
      setPageContents(pages);
      setTotalPages(pages.length);
      updateWordCount();
      onChange(newContent);
    }, 50);
  };

  // Enhanced AI Functions with better error handling
  const mockAICall = async (prompt, action) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock responses based on action
    switch (action) {
      case 'translate':
        return `<p>मराठी भाषांतर: ${prompt.substring(0, 100)}...</p>`;
      case 'spellcheck':
        return prompt.replace(/teh/g, 'the').replace(/recieve/g, 'receive');
      case 'generate':
        return `<p>AI Generated Content based on your prompt: "${prompt}"</p><p>This is a sample generated paragraph that demonstrates the AI content generation feature. In a real implementation, this would be replaced with actual AI-generated content.</p>`;
      case 'review':
        return 'Document Review:\n\n✅ Grammar: Good\n✅ Clarity: Excellent\n📝 Suggestions: Consider adding more examples\n⭐ Overall Score: 8/10';
      default:
        return 'AI processing completed.';
    }
  };

  const handleTranslateToMarathi = async () => {
    const content = editorRef.current?.innerHTML || '';
    if (!content || content === '<br>') {
      alert("Editor is empty. Nothing to translate.");
      return;
    }
    
    setIsLoading(true);
    setLoadingAction('Translating to Marathi...');
    
    try {
      const translatedContent = await mockAICall(content, 'translate');
      if (editorRef.current) {
        saveToUndoStack();
        editorRef.current.innerHTML = translatedContent;
        const pages = splitContentIntoPages(translatedContent);
        setPageContents(pages);
        setTotalPages(pages.length);
        onChange(translatedContent);
        updateWordCount();
      }
    } catch (error) {
      alert('Translation failed. Please try again.');
    }
    
    setIsLoading(false);
    setLoadingAction('');
  };

  const handleSpellCheck = async () => {
    const content = editorRef.current?.innerHTML || '';
    if (!content || content === '<br>') {
      alert("Editor is empty. Nothing to spell check.");
      return;
    }
    
    setIsLoading(true);
    setLoadingAction('Checking spelling...');
    
    try {
      const correctedContent = await mockAICall(content, 'spellcheck');
      if (correctedContent && editorRef.current) {
        saveToUndoStack();
        editorRef.current.innerHTML = correctedContent;
        const pages = splitContentIntoPages(correctedContent);
        setPageContents(pages);
        setTotalPages(pages.length);
        onChange(correctedContent);
        updateWordCount();
      }
    } catch (error) {
      alert('Spell check failed. Please try again.');
    }
    
    setIsLoading(false);
    setLoadingAction('');
  };

  const handleGenerateContent = async () => {
    const promptText = prompt("Enter a prompt for content generation:");
    if (!promptText) return;

    setIsLoading(true);
    setLoadingAction('Generating content...');
    
    try {
      const generatedContent = await mockAICall(promptText, 'generate');
      if (generatedContent && editorRef.current) {
        saveToUndoStack();
        const currentContent = editorRef.current.innerHTML;
        const newContent = currentContent + generatedContent;
        editorRef.current.innerHTML = newContent;
        const pages = splitContentIntoPages(newContent);
        setPageContents(pages);
        setTotalPages(pages.length);
        onChange(newContent);
        updateWordCount();
      }
    } catch (error) {
      alert('Content generation failed. Please try again.');
    }
    
    setIsLoading(false);
    setLoadingAction('');
  };

  const handleAIReview = async () => {
    const content = editorRef.current?.innerHTML || '';
    if (!content || content === '<br>') {
      alert("Editor is empty. Nothing to review.");
      return;
    }
    
    setIsLoading(true);
    setLoadingAction('Reviewing content...');
    
    try {
      const reviewContent = await mockAICall(content, 'review');
      if (reviewContent) {
        alert("AI Review:\n\n" + reviewContent);
      }
    } catch (error) {
      alert('Content review failed. Please try again.');
    }
    
    setIsLoading(false);
    setLoadingAction('');
  };

  const handleKeyDown = (e) => {
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
        case 'c':
          if (!e.shiftKey) {
            handleCopy();
          }
          break;
        case 'x':
          if (!e.shiftKey) {
            handleCut();
          }
          break;
        case 's':
          e.preventDefault();
          alert('Document auto-saved!');
          break;
      }
    }
  };

  const applyFontSize = (size) => {
    const validSize = Math.max(8, Math.min(72, size));
    setFontSize(validSize);
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      saveToUndoStack();
      document.execCommand('fontSize', false, '7');
      const fontElements = editorRef.current?.querySelectorAll('font[size="7"]');
      fontElements?.forEach(element => {
        element.style.fontSize = `${validSize}px`;
        element.removeAttribute('size');
      });
      onChange(editorRef.current?.innerHTML || '');
    }
  };

  const applyFontFamily = (family) => {
    setFontFamily(family);
    formatText('fontName', family);
  };

  const applyTextColor = (color) => {
    setTextColor(color);
    formatText('foreColor', color);
  };

  const applyBackgroundColor = (color) => {
    setBackgroundColor(color);
    formatText('hiliteColor', color);
  };

  const handlePrint = () => {
    const printContent = pageContents.join('<div style="page-break-before: always;"></div>');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Document</title>
          <style>
            body { font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: 1.6; margin: 1in; }
            .page-break { page-break-before: always; border: none; }
            @media print { .page-break { border: none; } }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSaveAsHTML = () => {
    const content = pageContents.join('<div style="page-break-before: always;"></div>');
    const blob = new Blob([`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Document</title>
          <style>
            body { font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: 1.6; margin: 1in; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `], { type: 'text/html' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === 'text/html') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        // Extract body content from HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const bodyContent = doc.body.innerHTML;
        
        if (editorRef.current) {
          saveToUndoStack();
          editorRef.current.innerHTML = bodyContent;
          const pages = splitContentIntoPages(bodyContent);
          setPageContents(pages);
          setTotalPages(pages.length);
          onChange(bodyContent);
          updateWordCount();
        }
      };
      reader.readAsText(file);
    } else if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result.replace(/\n/g, '<br>');
        if (editorRef.current) {
          saveToUndoStack();
          editorRef.current.innerHTML = `<p>${content}</p>`;
          const pages = splitContentIntoPages(editorRef.current.innerHTML);
          setPageContents(pages);
          setTotalPages(pages.length);
          onChange(editorRef.current.innerHTML);
          updateWordCount();
        }
      };
      reader.readAsText(file);
    }
  };

  const handleZoomChange = (newZoom) => {
    setZoomLevel(newZoom);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg h-full flex flex-col">
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
              onChange={handleFileUpload}
              accept=".html,.txt"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Upload File"
            >
              <Upload className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleSaveAsHTML}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Save as HTML"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Print"
            >
              <Printer className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isPreviewMode ? 'bg-blue-100' : ''}`}
              title="Toggle Preview"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </button>
          </div>

          {/* Font Settings */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2 gap-1">
            <select
              value={fontFamily}
              onChange={(e) => applyFontFamily(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Times New Roman">Times New Roman</option>
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Verdana">Verdana</option>
              <option value="Courier New">Courier New</option>
            </select>
            
            <div className="flex items-center border border-gray-300 rounded">
              <button
                onClick={() => applyFontSize(fontSize - 1)}
                className="p-1 hover:bg-gray-200"
                title="Decrease font size"
              >
                <Minus className="h-3 w-3" />
              </button>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => applyFontSize(parseInt(e.target.value) || 14)}
                className="w-12 text-center text-sm border-0 focus:outline-none"
                min="8"
                max="72"
              />
              <button
                onClick={() => applyFontSize(fontSize + 1)}
                className="p-1 hover:bg-gray-200"
                title="Increase font size"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Text Formatting */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              type="button"
              onClick={() => formatText('bold')}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('italic')}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('underline')}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Underline (Ctrl+U)"
            >
              <Underline className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('strikeThrough')}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </button>
          </div>

          {/* Colors */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <div className="flex items-center">
              <input
                type="color"
                value={textColor}
                onChange={(e) => applyTextColor(e.target.value)}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                title="Text Color"
              />
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => applyBackgroundColor(e.target.value)}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer ml-1"
                title="Highlight Color"
              />
            </div>
          </div>

          {/* Alignment */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              type="button"
              onClick={() => formatText('justifyLeft')}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('justifyCenter')}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('justifyRight')}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('justifyFull')}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Justify"
            >
              <AlignJustify className="h-4 w-4" />
            </button>
          </div>

          {/* Lists and Indentation */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              type="button"
              onClick={() => formatText('insertUnorderedList')}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('insertOrderedList')}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('indent')}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Increase Indent"
            >
              <Indent className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('outdent')}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Decrease Indent"
            >
              <Outdent className="h-4 w-4" />
            </button>
          </div>

          {/* Headings */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  formatText('formatBlock', e.target.value);
                  e.target.value = '';
                }
              }}
              className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="">Format</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
              <option value="h5">Heading 5</option>
              <option value="h6">Heading 6</option>
              <option value="p">Paragraph</option>
              <option value="blockquote">Quote</option>
            </select>
          </div>

          {/* Insert Elements */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              type="button"
              onClick={() => setIsLinkModalOpen(true)}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Insert Link"
            >
              <Link className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={insertImage}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Insert Image"
            >
              <Image className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsTableModalOpen(true)}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Insert Table"
            >
              <Table className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={insertPageBreak}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Insert Page Break"
            >
              <Divide className="h-4 w-4" />
            </button>
          </div>

          {/* Special Formatting */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              type="button"
              onClick={() => formatText('superscript')}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Superscript"
            >
              <Superscript className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('subscript')}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Subscript"
            >
              <Subscript className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('formatBlock', 'blockquote')}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </button>
          </div>

          {/* Clipboard Operations */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Copy (Ctrl+C)"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleCut}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Cut (Ctrl+X)"
            >
              <Scissors className="h-4 w-4" />
            </button>
          </div>

          {/* AI Features */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleTranslateToMarathi}
              disabled={isLoading}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              title="Translate to Marathi"
            >
              <Languages className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleSpellCheck}
              disabled={isLoading}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              title="Spell Check"
            >
              <SpellCheck className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleGenerateContent}
              disabled={isLoading}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              title="Generate Content"
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleAIReview}
              disabled={isLoading}
              className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              title="AI Review"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Toolbar - Zoom and Page Controls */}
      <div className="border-b border-gray-200 p-2 bg-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Zoom:</span>
              <select
                value={zoomLevel}
                onChange={(e) => handleZoomChange(parseInt(e.target.value))}
                className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <span className="text-sm font-medium">Page:</span>
              <span className="text-sm bg-white border border-gray-300 rounded px-2 py-1">
                {currentPage} of {totalPages}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Words: {wordCount}</span>
            <div className="w-2 h-2 rounded-full bg-green-500" title="Auto-save enabled"></div>
          </div>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto bg-gray-200 p-6" style={{ backgroundColor: '#f5f5f5' }}>
          {/* Multi-page container */}
          <div className="flex flex-col items-center space-y-6">
            {pageContents.map((pageContent, pageIndex) => (
              <div 
                key={pageIndex}
                className="bg-white shadow-xl border border-gray-300 relative"
                style={{
                  width: `${(8.5 * 96 * zoomLevel) / 100}px`, // 8.5 inches at 96 DPI
                  minHeight: `${(11 * 96 * zoomLevel) / 100}px`, // 11 inches at 96 DPI
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center',
                  marginBottom: `${zoomLevel < 100 ? (100 - zoomLevel) * 3 : 0}px`
                }}
              >
                {/* Page number indicator */}
                <div className="absolute -top-6 left-0 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
                  Page {pageIndex + 1}
                </div>
                
                {/* Page content area */}
                <div
                  ref={pageIndex === 0 ? editorRef : null}
                  contentEditable={!isPreviewMode && pageIndex === 0}
                  onInput={(e) => {
                    if (pageIndex === 0) {
                      const newContent = e.target.innerHTML;
                      onChange(newContent);
                      
                      // Re-split content across pages
                      setTimeout(() => {
                        const pages = splitContentIntoPages(newContent);
                        setPageContents(pages);
                        setTotalPages(pages.length);
                        updateWordCount();
                      }, 100);
                    }
                  }}
                  onMouseUp={handleSelectionChange}
                  onKeyUp={handleSelectionChange}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  className={`focus:outline-none ${isPreviewMode ? 'pointer-events-none' : ''} ${pageIndex > 0 ? 'pointer-events-none' : ''}`}
                  style={{
                    fontFamily: fontFamily,
                    fontSize: `${fontSize}px`,
                    lineHeight: '1.6',
                    color: '#1a1a1a',
                    padding: '1in', // Standard document margins
                    minHeight: `${(11 * 96 * zoomLevel) / 100 - 32}px`, // Account for padding
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                  suppressContentEditableWarning={true}
                  data-placeholder={pageIndex === 0 ? placeholder : ''}
                  dangerouslySetInnerHTML={{ __html: pageContent }}
                />
              </div>
            ))}
            
            {/* Show placeholder for empty document */}
            {pageContents.length === 0 && (
              <div 
                className="bg-white shadow-xl border border-gray-300 relative"
                style={{
                  width: `${(8.5 * 96 * zoomLevel) / 100}px`,
                  minHeight: `${(11 * 96 * zoomLevel) / 100}px`,
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center'
                }}
              >
                <div className="absolute -top-6 left-0 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
                  Page 1
                </div>
                <div
                  ref={editorRef}
                  contentEditable={!isPreviewMode}
                  onInput={(e) => {
                    const newContent = e.target.innerHTML;
                    onChange(newContent);
                    const pages = splitContentIntoPages(newContent);
                    setPageContents(pages);
                    setTotalPages(pages.length);
                    updateWordCount();
                  }}
                  onMouseUp={handleSelectionChange}
                  onKeyUp={handleSelectionChange}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  className={`focus:outline-none ${isPreviewMode ? 'pointer-events-none' : ''}`}
                  style={{
                    fontFamily: fontFamily,
                    fontSize: `${fontSize}px`,
                    lineHeight: '1.6',
                    color: '#1a1a1a',
                    padding: '1in',
                    minHeight: `${(11 * 96 * zoomLevel) / 100 - 32}px`,
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                  suppressContentEditableWarning={true}
                  data-placeholder={placeholder}
                />
              </div>
            )}
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
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Insert Link
              </button>
              <button
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setLinkUrl('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
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
              <p className="text-sm text-gray-600">Preview: {tableRows} × {tableCols} table</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={insertTable}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Insert Table
              </button>
              <button
                onClick={() => setIsTableModalOpen(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
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
            <span><span className="font-medium">AI Features:</span> {GEMINI_API_KEY ? '✅ Ready' : '❌ Not Available'}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Zoom: {zoomLevel}%</span>
            <span>Pages: {totalPages}</span>
            <span>Characters: {pageContents.join('').replace(/<[^>]*>/g, '').length || 0}</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Auto-saved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;