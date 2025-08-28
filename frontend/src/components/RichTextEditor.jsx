// import React, { useState, useRef, useEffect, useCallback, createRef } from 'react';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';
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
//   const [charCount, setCharCount] = useState(0);
//   const [totalPages, setTotalPages] = useState(1); // Total pages, derived from pageContents
//   const [isPreviewMode, setIsPreviewMode] = useState(false);
//   const [zoomLevel, setZoomLevel] = useState(100);
//   const [isModified, setIsModified] = useState(false);
//   const [pageContents, setPageContents] = useState(['']); // State to hold content for each page

//   // Refs for each page's contentEditable div
//   const pageRefs = useRef([]);
//   pageRefs.current = pageContents.map((_, i) => pageRefs.current[i] ?? createRef());

//   // Enhanced content state (represents the full document HTML)
//   const [fullDocumentContent, setFullDocumentContent] = useState(value || '');

//   // Update word and character count for the *entire document*
//   const updateCounts = useCallback((htmlContent) => {
//     const tempDiv = document.createElement('div');
//     tempDiv.innerHTML = htmlContent;
//     const text = tempDiv.textContent || tempDiv.innerText || '';
    
//     const words = text.trim().split(/\s+/).filter(word => word.length > 0);
//     setWordCount(words.length);
//     setCharCount(text.length);
//   }, []);

//   // Function to split content into pages based on a target page height
//   const splitContentIntoPages = useCallback((htmlContent) => {
//     if (!htmlContent || htmlContent === '<br>' || htmlContent === '<p><br></p>') return [''];

//     const tempDiv = document.createElement('div');
//     tempDiv.style.width = `${(8.5 * 96)}px`; // A4 width at 96 DPI
//     tempDiv.style.padding = '1in'; // Match editor padding
//     tempDiv.style.fontFamily = fontFamily;
//     tempDiv.style.fontSize = `${fontSize}px`;
//     tempDiv.style.lineHeight = '1.6';
//     tempDiv.style.wordWrap = 'break-word';
//     tempDiv.style.overflowWrap = 'break-word';
//     tempDiv.style.visibility = 'hidden'; // Don't display
//     tempDiv.style.position = 'absolute';
//     tempDiv.style.top = '-9999px';
//     document.body.appendChild(tempDiv);

//     const targetPageHeight = 11 * 96; // A4 height at 96 DPI
//     const pages = [];
//     let currentContent = '';

//     const nodes = Array.from(new DOMParser().parseFromString(htmlContent, 'text/html').body.childNodes);

//     nodes.forEach(node => {
//       tempDiv.innerHTML = currentContent + node.outerHTML;
//       if (tempDiv.scrollHeight > targetPageHeight && currentContent !== '') {
//         pages.push(currentContent);
//         currentContent = node.outerHTML;
//       } else {
//         currentContent += node.outerHTML;
//       }
//     });

//     if (currentContent) {
//       pages.push(currentContent);
//     }

//     document.body.removeChild(tempDiv);
//     return pages.length > 0 ? pages : [''];
//   }, [fontFamily, fontSize]);

//   // Initialize content and page data
//   useEffect(() => {
//     const initialContent = value || fullDocumentContent || '';
//     const pages = splitContentIntoPages(initialContent);
//     setPageContents(pages);
//     setTotalPages(pages.length);
//     setFullDocumentContent(initialContent);
//     updateCounts(initialContent);
//     saveToHistory(initialContent); // Save initial state to undo stack
//   }, [value, splitContentIntoPages, updateCounts]);

//   // Enhanced selection management with better persistence
//   const savedSelectionRef = useRef(null);
  
//   const saveSelection = useCallback(() => {
//     if (window.getSelection) {
//       const selection = window.getSelection();
//       if (selection.rangeCount > 0) {
//         const range = selection.getRangeAt(0);
//         // Only save if selection is within one of our editor pages
//         const editorContainer = pageRefs.current.find(ref => ref.current && ref.current.contains(range.commonAncestorContainer));
//         if (editorContainer) {
//           const savedSelection = {
//             startContainer: range.startContainer,
//             startOffset: range.startOffset,
//             endContainer: range.endContainer,
//             endOffset: range.endOffset,
//             collapsed: range.collapsed,
//             text: selection.toString(),
//             // Store the path to containers for better restoration
//             startPath: getNodePath(range.startContainer, editorContainer.current),
//             endPath: getNodePath(range.endContainer, editorContainer.current)
//           };
//           savedSelectionRef.current = savedSelection;
//           return savedSelection;
//         }
//       }
//     }
//     return null;
//   }, []);

//   // Helper function to get node path
//   const getNodePath = useCallback((node, root) => {
//     const path = [];
//     let current = node;
    
//     while (current && current !== root) {
//       const parent = current.parentNode;
//       if (parent) {
//         const index = Array.from(parent.childNodes).indexOf(current);
//         path.unshift(index);
//         current = parent;
//       } else {
//         break;
//       }
//     }
//     return path;
//   }, []);

//   // Helper function to get node from path
//   const getNodeFromPath = useCallback((path, root) => {
//     let current = root;
//     for (const index of path) {
//       if (current && current.childNodes[index]) {
//         current = current.childNodes[index];
//       } else {
//         return null;
//       }
//     }
//     return current;
//   }, []);

//   const restoreSelection = useCallback((savedSelection = null) => {
//     const selectionToRestore = savedSelection || savedSelectionRef.current;
    
//     if (selectionToRestore && window.getSelection) {
//       // Find the correct editor container for restoration
//       const editorContainer = pageRefs.current.find(ref => 
//         ref.current && 
//         (ref.current.contains(selectionToRestore.startContainer) || 
//          getNodeFromPath(selectionToRestore.startPath, ref.current))
//       );

//       if (!editorContainer) return false;

//       try {
//         // Try to restore using node paths first
//         let startContainer = getNodeFromPath(selectionToRestore.startPath, editorContainer.current);
//         let endContainer = getNodeFromPath(selectionToRestore.endPath, editorContainer.current);

//         // Fallback to original containers if path method fails
//         if (!startContainer || !editorContainer.current.contains(startContainer)) {
//           startContainer = selectionToRestore.startContainer;
//         }
//         if (!endContainer || !editorContainer.current.contains(endContainer)) {
//           endContainer = selectionToRestore.endContainer;
//         }

//         // Final fallback: find text in editor
//         if (!startContainer || !endContainer || 
//             !editorContainer.current.contains(startContainer) || 
//             !editorContainer.current.contains(endContainer)) {
          
//           if (selectionToRestore.text) {
//             // Try to find the same text in the editor
//             const walker = document.createTreeWalker(
//               editorContainer.current,
//               NodeFilter.SHOW_TEXT,
//               null,
//               false
//             );
            
//             let node;
//             while (node = walker.nextNode()) {
//               const textContent = node.textContent;
//               const index = textContent.indexOf(selectionToRestore.text);
//               if (index !== -1) {
//                 const selection = window.getSelection();
//                 const range = document.createRange();
//                 range.setStart(node, index);
//                 range.setEnd(node, index + selectionToRestore.text.length);
//                 selection.removeAllRanges();
//                 selection.addRange(range);
//                 return true;
//               }
//             }
//           }
//           return false;
//         }

//         const selection = window.getSelection();
//         const range = document.createRange();
        
//         // Ensure offsets are within bounds
//         const startOffset = Math.min(selectionToRestore.startOffset, startContainer.textContent?.length || 0);
//         const endOffset = Math.min(selectionToRestore.endOffset, endContainer.textContent?.length || 0);
        
//         range.setStart(startContainer, startOffset);
//         range.setEnd(endContainer, endOffset);
//         selection.removeAllRanges();
//         selection.addRange(range);
//         return true;
//       } catch (e) {
//         console.warn("Could not restore selection:", e);
//         return false;
//       }
//     }
//     return false;
//   }, [getNodeFromPath]);

//   // Enhanced undo/redo system
//   const saveToHistory = useCallback((contentToSave = fullDocumentContent) => {
//     setUndoStack(prev => {
//       const newStack = [...prev.slice(-19), contentToSave];
//       return newStack;
//     });
//     setRedoStack([]);
//     setIsModified(true);
//   }, [fullDocumentContent]);

//   // Handle content changes for the entire document
//   const handleFullDocumentContentChange = useCallback((newFullContent) => {
//     setFullDocumentContent(newFullContent);
//     updateCounts(newFullContent);
//     onChange(newFullContent);
//     setIsModified(true);
    
//     // Re-split content into pages
//     const pages = splitContentIntoPages(newFullContent);
//     setPageContents(pages);
//     setTotalPages(pages.length);
//   }, [onChange, updateCounts, splitContentIntoPages]);

//   // Enhanced format text function - PROPERLY FIXED for selection-only formatting
//   const formatText = useCallback((command, value = null) => {
//     const selection = window.getSelection();
//     if (!selection || selection.rangeCount === 0) return;
    
//     const range = selection.getRangeAt(0);
//     const isCollapsed = range.collapsed;
    
//     // Ensure we're working within one of the editor pages
//     const activeEditorRef = pageRefs.current.find(ref => ref.current && ref.current.contains(range.commonAncestorContainer));
//     if (!activeEditorRef) return;
    
//     // For style commands that need special handling to apply only to selection
//     if (['fontSize', 'fontName', 'foreColor', 'hiliteColor'].includes(command)) {
//       if (isCollapsed) {
//         // If no selection, set style for future typing by inserting invisible span
//         const span = document.createElement('span');
//         span.style.display = 'inline';
//         span.setAttribute('data-formatting', 'true');
        
//         switch (command) {
//           case 'fontSize':
//             span.style.fontSize = value + 'px';
//             break;
//           case 'fontName':
//             span.style.fontFamily = value;
//             break;
//           case 'foreColor':
//             span.style.color = value;
//             break;
//           case 'hiliteColor':
//             span.style.backgroundColor = value;
//             break;
//         }
        
//         // Insert span at cursor position
//         range.insertNode(span);
//         range.setStart(span, 0);
//         range.collapse(true);
//         selection.removeAllRanges();
//         selection.addRange(range);
        
//         // Update the content of the specific page
//         const pageIndex = pageRefs.current.indexOf(activeEditorRef);
//         const newPageContents = [...pageContents];
//         newPageContents[pageIndex] = activeEditorRef.current?.innerHTML || '';
//         setPageContents(newPageContents);
//         handleFullDocumentContentChange(newPageContents.join('<div class="page-break" style="page-break-before: always; break-before: page; border-top: 2px dashed #007bff; margin: 40px 0; padding-top: 40px; text-align: center; color: #007bff; font-size: 12px; font-weight: bold;"><span style="background: white; padding: 0 15px;">--- Page Break ---</span></div>'));
        
//         return;
//       }
      
//       // Save the selected text content and range info
//       const selectedText = selection.toString();
//       const startContainer = range.startContainer;
//       const endContainer = range.endContainer;
//       const startOffset = range.startOffset;
//       const endOffset = range.endOffset;
      
//       // Create a span with the appropriate styling
//       const span = document.createElement('span');
//       span.style.display = 'inline';
      
//       // Preserve existing styles from parent elements
//       const computedStyle = window.getComputedStyle(range.commonAncestorContainer.parentElement || range.commonAncestorContainer);
      
//       // Apply the new style
//       switch (command) {
//         case 'fontSize':
//           span.style.fontSize = value + 'px';
//           break;
//         case 'fontName':
//           span.style.fontFamily = value;
//           break;
//         case 'foreColor':
//           span.style.color = value;
//           break;
//         case 'hiliteColor':
//           span.style.backgroundColor = value;
//           break;
//       }
      
//       try {
//         // Extract the selected content
//         const selectedContent = range.extractContents();
        
//         // Wrap it in our styled span
//         span.appendChild(selectedContent);
        
//         // Insert the styled span
//         range.insertNode(span);
        
//         // Reselect the content
//         const newRange = document.createRange();
//         newRange.selectNodeContents(span);
//         selection.removeAllRanges();
//         selection.addRange(newRange);
        
//         // Save to history and update content
//         saveToHistory();
//         const pageIndex = pageRefs.current.indexOf(activeEditorRef);
//         const newPageContents = [...pageContents];
//         newPageContents[pageIndex] = activeEditorRef.current?.innerHTML || '';
//         setPageContents(newPageContents);
//         handleFullDocumentContentChange(newPageContents.join('<div class="page-break" style="page-break-before: always; break-before: page; border-top: 2px dashed #007bff; margin: 40px 0; padding-top: 40px; text-align: center; color: #007bff; font-size: 12px; font-weight: bold;"><span style="background: white; padding: 0 15px;">--- Page Break ---</span></div>'));
        
//         return;
//       } catch (error) {
//         console.warn('Error applying font formatting:', error);
//         // Fallback to document.execCommand
//         try {
//           document.execCommand(command, false, value);
//         } catch (fallbackError) {
//           console.warn('Fallback formatting also failed:', fallbackError);
//         }
//       }
//     }
    
//     // For other formatting commands (bold, italic, etc.)
//     if (isCollapsed) {
//       activeEditorRef.current.focus();
//       document.execCommand(command, false, value);
//     } else {
//       // Save selection info for restoration
//       const selectedText = selection.toString();
//       const rangeInfo = {
//         startContainer: range.startContainer,
//         endContainer: range.endContainer,
//         startOffset: range.startOffset,
//         endOffset: range.endOffset
//       };
      
//       saveToHistory();
      
//       try {
//         // Execute the formatting command
//         const success = document.execCommand(command, false, value);
        
//         if (success) {
//           // Try to restore selection after formatting
//           setTimeout(() => {
//             try {
//               // Method 1: Try to restore using original range info
//               if (activeEditorRef.current.contains(rangeInfo.startContainer) && 
//                   activeEditorRef.current.contains(rangeInfo.endContainer)) {
//                 const newRange = document.createRange();
//                 const newSelection = window.getSelection();
//                 newRange.setStart(rangeInfo.startContainer, rangeInfo.startOffset);
//                 newRange.setEnd(rangeInfo.endContainer, rangeInfo.endOffset);
//                 newSelection.removeAllRanges();
//                 newSelection.addRange(newRange);
//               } else if (selectedText) {
//                 // Method 2: Find the text and reselect it
//                 const walker = document.createTreeWalker(
//                   activeEditorRef.current,
//                   NodeFilter.SHOW_TEXT,
//                   null,
//                   false
//                 );
                
//                 let node;
//                 while (node = walker.nextNode()) {
//                   const text = node.textContent || '';
//                   const index = text.indexOf(selectedText);
//                   if (index !== -1) {
//                     const newRange = document.createRange();
//                     const newSelection = window.getSelection();
//                     newRange.setStart(node, index);
//                     newRange.setEnd(node, index + selectedText.length);
//                     newSelection.removeAllRanges();
//                     newSelection.addRange(newRange);
//                     break;
//                   }
//                 }
//               }
//             } catch (e) {
//               console.warn('Could not restore selection after formatting:', e);
//             }
//           }, 10);
//         }
//       } catch (error) {
//         console.warn('Formatting command failed:', error);
//       }
//     }
    
//     const pageIndex = pageRefs.current.indexOf(activeEditorRef);
//     const newPageContents = [...pageContents];
//     newPageContents[pageIndex] = activeEditorRef.current?.innerHTML || '';
//     setPageContents(newPageContents);
//     handleFullDocumentContentChange(newPageContents.join('<div class="page-break" style="page-break-before: always; break-before: page; border-top: 2px dashed #007bff; margin: 40px 0; padding-top: 40px; text-align: center; color: #007bff; font-size: 12px; font-weight: bold;"><span style="background: white; padding: 0 15px;">--- Page Break ---</span></div>'));
//   }, [saveToHistory, handleFullDocumentContentChange, pageContents]);

//   // Handle selection changes without interfering with formatting
//   const handleSelectionChange = useCallback(() => {
//     requestAnimationFrame(() => {
//       const selection = window.getSelection();
//       if (selection && selection.anchorNode) {
//         const activeEditorRef = pageRefs.current.find(ref => ref.current && ref.current.contains(selection.anchorNode));
//         if (activeEditorRef) {
//           const selectedTextContent = selection.toString();
//           setSelectedText(selectedTextContent);
//         }
//       }
//     });
//   }, []);

//   // Update content of a specific page when its editor changes
//   const handlePageInput = useCallback((pageIndex, newPageContent) => {
//     const newPageContents = [...pageContents];
//     newPageContents[pageIndex] = newPageContent;
//     setPageContents(newPageContents);
    
//     const fullContent = newPageContents.join('<div class="page-break" style="page-break-before: always; break-before: page; border-top: 2px dashed #007bff; margin: 40px 0; padding-top: 40px; text-align: center; color: #007bff; font-size: 12px; font-weight: bold;"><span style="background: white; padding: 0 15px;">--- Page Break ---</span></div>');
//     handleFullDocumentContentChange(fullContent);
//   }, [pageContents, handleFullDocumentContentChange]);

//   // File operations
//   const handleSave = useCallback(() => {
//     // The fullDocumentContent is already updated via handleFullDocumentContentChange
//     setIsModified(false);
//     alert('Document saved successfully!');
//   }, []);

//   const handleDownloadPdf = useCallback(async () => {
//     setIsLoading(true);
//     setLoadingAction('Generating PDF...');
//     try {
//       const pdf = new jsPDF('p', 'pt', 'a4'); // 'p' for portrait, 'pt' for points, 'a4' for A4 size
//       const margin = 40; // Margin in points (approx 0.5 inch)
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = pdf.internal.pageSize.getHeight();
//       const contentWidth = pdfWidth - 2 * margin;
//       const contentHeight = pdfHeight - 2 * margin;

//       for (let i = 0; i < pageRefs.current.length; i++) {
//         const pageElement = pageRefs.current[i].current;
//         if (pageElement) {
//           // Temporarily adjust styles for rendering
//           const originalPadding = pageElement.style.padding;
//           const originalWidth = pageElement.style.width;
//           const originalMinHeight = pageElement.style.minHeight;
//           const originalTransform = pageElement.style.transform;
//           const originalTransformOrigin = pageElement.style.transformOrigin;
//           const originalMarginBottom = pageElement.style.marginBottom;

//           pageElement.style.padding = '0'; // Remove padding for canvas rendering
//           pageElement.style.width = `${contentWidth}px`; // Set width to fit PDF content area
//           pageElement.style.minHeight = 'auto';
//           pageElement.style.transform = 'none';
//           pageElement.style.transformOrigin = 'unset';
//           pageElement.style.marginBottom = '0';

//           const canvas = await html2canvas(pageElement, {
//             scale: 2, // Increase scale for better resolution
//             useCORS: true,
//             logging: false,
//           });

//           // Restore original styles
//           pageElement.style.padding = originalPadding;
//           pageElement.style.width = originalWidth;
//           pageElement.style.minHeight = originalMinHeight;
//           pageElement.style.transform = originalTransform;
//           pageElement.style.transformOrigin = originalTransformOrigin;
//           pageElement.style.marginBottom = originalMarginBottom;

//           const imgData = canvas.toDataURL('image/png');
//           const imgWidth = contentWidth;
//           const imgHeight = (canvas.height * imgWidth) / canvas.width;

//           if (i > 0) {
//             pdf.addPage();
//           }
//           pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
//         }
//       }
//       pdf.save('document.pdf');
//       alert('PDF downloaded successfully!');
//     } catch (error) {
//       console.error('Error generating PDF:', error);
//       alert('Failed to generate PDF. Please try again.');
//     } finally {
//       setIsLoading(false);
//       setLoadingAction('');
//     }
//   }, [pageRefs, fontFamily, fontSize, setIsLoading, setLoadingAction]);

//   const handleSaveAsHTML = useCallback(() => {
//     const fullContent = pageContents.join('<div style="page-break-before: always;"></div>');
//     const htmlContent = `<!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Document</title>
//     <style>
//         body { 
//             font-family: ${fontFamily}; 
//             font-size: ${fontSize}px; 
//             line-height: 1.6; 
//             max-width: 800px; 
//             margin: 0 auto; 
//             padding: 20px; 
//         }
//         @media print {
//             div[style*="page-break-before"] {
//                 page-break-before: always;
//             }
//         }
//     </style>
// </head>
// <body>
//     ${fullContent}
// </body>
// </html>`;

//     const blob = new Blob([htmlContent], { type: 'text/html' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'document.html';
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   }, [pageContents, fontFamily, fontSize]);

//   const handlePrint = useCallback(() => {
//     const fullContent = pageContents.join('<div style="page-break-before: always;"></div>');
//     const printWindow = window.open('', '_blank');
//     const htmlContent = `<!DOCTYPE html>
// <html>
// <head>
//     <title>Print Document</title>
//     <style>
//         body { 
//             font-family: ${fontFamily}; 
//             font-size: ${fontSize}px; 
//             line-height: 1.6; 
//             margin: 20px; 
//         }
//         @media print {
//             body { margin: 0; }
//             div[style*="page-break-before"] {
//                 page-break-before: always;
//             }
//         }
//     </style>
// </head>
// <body>
//     ${fullContent}
//     <script>
//         window.onload = function() {
//             window.print();
//             window.close();
//         }
//     </script>
// </body>
// </html>`;
    
//     printWindow.document.write(htmlContent);
//     printWindow.document.close();
//   }, [pageContents, fontFamily, fontSize]);

//   // Keyboard shortcuts
//   const handleKeyDown = useCallback((e) => {
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
//         case 's':
//           e.preventDefault();
//           handleSave();
//           break;
//       }
//     }
    
//     // Auto-save history on Enter for paragraph breaks
//     if (e.key === 'Enter' && !e.shiftKey) {
//       setTimeout(() => saveToHistory(fullDocumentContent), 100);
//     }
//   }, [formatText, handleSave, saveToHistory, fullDocumentContent]);

//   // Enhanced undo function
//   const handleUndo = useCallback(() => {
//     if (undoStack.length > 0) {
//       const previousContent = undoStack[undoStack.length - 1];
      
//       setRedoStack(prev => [...prev, fullDocumentContent]);
//       setUndoStack(prev => prev.slice(0, -1));
      
//       handleFullDocumentContentChange(previousContent);
//       setTimeout(() => {
//         // Restore selection after undo
//         restoreSelection();
//         // Focus the first page or the last focused page
//         if (pageRefs.current[0]?.current) {
//           pageRefs.current[0].current.focus();
//         }
//       }, 10);
//     }
//   }, [undoStack, fullDocumentContent, handleFullDocumentContentChange, restoreSelection]);

//   // Enhanced redo function
//   const handleRedo = useCallback(() => {
//     if (redoStack.length > 0) {
//       const nextContent = redoStack[redoStack.length - 1];
      
//       setUndoStack(prev => [...prev, fullDocumentContent]);
//       setRedoStack(prev => prev.slice(0, -1));
      
//       handleFullDocumentContentChange(nextContent);
//       setTimeout(() => {
//         // Restore selection after redo
//         restoreSelection();
//         // Focus the first page or the last focused page
//         if (pageRefs.current[0]?.current) {
//           pageRefs.current[0].current.focus();
//         }
//       }, 10);
//     }
//   }, [redoStack, fullDocumentContent, handleFullDocumentContentChange, restoreSelection]);

//   // Enhanced paste handler
//   const handlePaste = useCallback((e) => {
//     e.preventDefault();
//     saveToHistory(fullDocumentContent);
    
//     const clipboardData = e.clipboardData || window.clipboardData;
//     const htmlData = clipboardData.getData('text/html');
//     const textData = clipboardData.getData('text/plain');
    
//     const pasteContent = htmlData || textData.replace(/\n/g, '<br>');
//     const cleanContent = pasteContent
//       .replace(/<script[^>]*>.*?<\/script>/gi, '')
//       .replace(/on\w+="[^"]*"/gi, '')
//       .replace(/javascript:/gi, '');
    
//     document.execCommand('insertHTML', false, cleanContent);
    
//     // After paste, update the content of the specific page that was edited
//     const selection = window.getSelection();
//     if (selection && selection.anchorNode) {
//       const activeEditorRef = pageRefs.current.find(ref => ref.current && ref.current.contains(selection.anchorNode));
//       if (activeEditorRef) {
//         const pageIndex = pageRefs.current.indexOf(activeEditorRef);
//         handlePageInput(pageIndex, activeEditorRef.current?.innerHTML || '');
//       }
//     }
//   }, [saveToHistory, fullDocumentContent, handlePageInput]);

//   // Enhanced link insertion
//   const insertLink = useCallback(() => {
//     if (linkUrl) {
//       const selection = saveSelection();
      
//       if (selectedText) {
//         const linkHtml = `<a href="${linkUrl}" target="_blank" style="color: #0066cc; text-decoration: underline;">${selectedText}</a>`;
//         document.execCommand('insertHTML', false, linkHtml);
//       } else {
//         formatText('createLink', linkUrl);
//       }
      
//       setIsLinkModalOpen(false);
//       setLinkUrl('');
      
//       // Update the content of the specific page that was edited
//       const currentSelection = window.getSelection();
//       if (currentSelection && currentSelection.anchorNode) {
//         const activeEditorRef = pageRefs.current.find(ref => ref.current && ref.current.contains(currentSelection.anchorNode));
//         if (activeEditorRef) {
//           const pageIndex = pageRefs.current.indexOf(activeEditorRef);
//           handlePageInput(pageIndex, activeEditorRef.current?.innerHTML || '');
//         }
//       }
//     }
//   }, [linkUrl, selectedText, saveSelection, formatText, handlePageInput]);

//   // Enhanced image insertion
//   const insertImage = useCallback(() => {
//     const url = prompt('Enter image URL:');
//     if (url) {
//       saveToHistory(fullDocumentContent);
//       const imgHtml = `<img src="${url}" style="max-width: 100%; height: auto; margin: 10px 0; display: block;" alt="Inserted image" />`;
//       document.execCommand('insertHTML', false, imgHtml);
      
//       // Update the content of the specific page that was edited
//       const selection = window.getSelection();
//       if (selection && selection.anchorNode) {
//         const activeEditorRef = pageRefs.current.find(ref => ref.current && ref.current.contains(selection.anchorNode));
//         if (activeEditorRef) {
//           const pageIndex = pageRefs.current.indexOf(activeEditorRef);
//           handlePageInput(pageIndex, activeEditorRef.current?.innerHTML || '');
//         }
//       }
//     }
//   }, [saveToHistory, fullDocumentContent, handlePageInput]);

//   // Enhanced table insertion
//   const insertTable = useCallback(() => {
//     saveToHistory(fullDocumentContent);
//     let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #ddd;">';
    
//     for (let i = 0; i < tableRows; i++) {
//       tableHTML += '<tr>';
//       for (let j = 0; j < tableCols; j++) {
//         const cellStyle = 'border: 1px solid #ddd; padding: 8px; min-width: 50px; min-height: 30px;';
//         const isHeader = i === 0;
//         const cellContent = isHeader ? `Header ${j + 1}` : '&nbsp;';
//         const tag = isHeader ? 'th' : 'td';
//         tableHTML += `<${tag} style="${cellStyle}${isHeader ? ' font-weight: bold; background-color: #f5f5f5;' : ''}">${cellContent}</${tag}>`;
//       }
//       tableHTML += '</tr>';
//     }
//     tableHTML += '</table><p><br></p>';
    
//     document.execCommand('insertHTML', false, tableHTML);
//     setIsTableModalOpen(false);
    
//     // Update the content of the specific page that was edited
//     const selection = window.getSelection();
//     if (selection && selection.anchorNode) {
//       const activeEditorRef = pageRefs.current.find(ref => ref.current && ref.current.contains(selection.anchorNode));
//       if (activeEditorRef) {
//         const pageIndex = pageRefs.current.indexOf(activeEditorRef);
//         handlePageInput(pageIndex, activeEditorRef.current?.innerHTML || '');
//       }
//     }
//   }, [saveToHistory, fullDocumentContent, tableRows, tableCols, handlePageInput]);

//   const insertPageBreak = useCallback(() => {
//     saveToHistory(fullDocumentContent);
//     const selection = window.getSelection();
//     if (!selection || selection.rangeCount === 0) return;

//     const range = selection.getRangeAt(0);
//     const activeEditorRef = pageRefs.current.find(ref => ref.current && ref.current.contains(range.commonAncestorContainer));
//     if (!activeEditorRef) return;

//     const pageIndex = pageRefs.current.indexOf(activeEditorRef);
//     const currentPageContent = activeEditorRef.current?.innerHTML || '';

//     // Split the current page content at the cursor
//     const preBreakContent = currentPageContent.substring(0, range.startOffset);
//     const postBreakContent = currentPageContent.substring(range.startOffset);

//     const newPageContents = [...pageContents];
//     newPageContents[pageIndex] = preBreakContent; // Content before the break
//     newPageContents.splice(pageIndex + 1, 0, postBreakContent || ''); // Insert new page with content after break

//     setPageContents(newPageContents);
//     setTotalPages(newPageContents.length);
//     handleFullDocumentContentChange(newPageContents.join('<div class="page-break" style="page-break-before: always; break-before: page; border-top: 2px dashed #007bff; margin: 40px 0; padding-top: 40px; text-align: center; color: #007bff; font-size: 12px; font-weight: bold;"><span style="background: white; padding: 0 15px;">--- Page Break ---</span></div>'));

//     // Focus the new page
//     setTimeout(() => {
//       if (pageRefs.current[pageIndex + 1]?.current) {
//         pageRefs.current[pageIndex + 1].current.focus();
//       }
//     }, 50);
//   }, [pageContents, fullDocumentContent, saveToHistory, handleFullDocumentContentChange]);

//   // AI Functions (mock implementations)
//   const handleAIAction = useCallback(async (action, prompt = '') => {
//     const currentContent = fullDocumentContent; // Use full document content for AI
//     if (!currentContent && action !== 'generate') {
//       alert("Document is empty. Nothing to process.");
//       return;
//     }
    
//     setIsLoading(true);
//     setLoadingAction(`Processing with AI (${action})...`);
    
//     try {
//       await new Promise(resolve => setTimeout(resolve, 2000));
      
//       let result = '';
//       switch (action) {
//         case 'translate':
//           result = `<p><strong>Marathi Translation:</strong></p><p>आपला मजकूर इथे अनुवादित केला जाईल...</p>`;
//           break;
//         case 'spellcheck':
//           result = currentContent.replace(/teh/g, 'the').replace(/recieve/g, 'receive');
//           break;
//         case 'generate':
//           result = `<p><strong>AI Generated Content:</strong></p><p>This is AI-generated content based on your prompt: "${prompt}". This would be replaced with actual AI-generated text in a real implementation.</p>`;
//           break;
//         case 'review':
//           alert('AI Review Complete!\n\n✅ Grammar: Excellent\n✅ Clarity: Good\n📝 Suggestions: Consider adding more examples\n⭐ Overall Score: 8.5/10');
//           return;
//         default:
//           result = currentContent;
//       }
      
//       saveToHistory(fullDocumentContent);
//       if (action === 'generate') {
//         handleFullDocumentContentChange(fullDocumentContent + result);
//       } else {
//         handleFullDocumentContentChange(result);
//       }
//     } catch (error) {
//       alert(`AI ${action} failed. Please try again.`);
//     } finally {
//       setIsLoading(false);
//       setLoadingAction('');
//     }
//   }, [saveToHistory, fullDocumentContent, handleFullDocumentContentChange]);

//   // Initialize editor (no longer sets innerHTML directly, relies on pageContents map)
//   useEffect(() => {
//     // This effect now primarily ensures counts are updated and history is saved on initial load
//     // The actual rendering of pages is handled by the JSX map
//     updateCounts(fullDocumentContent);
//     saveToHistory(fullDocumentContent);
//   }, [fullDocumentContent, updateCounts, saveToHistory]);

//   return (
//     <div className="h-screen flex flex-col border border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg">
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
//               onChange={(e) => {
//                 const file = e.target.files[0];
//                 if (file && file.type === 'text/html') {
//                   const reader = new FileReader();
//                   reader.onload = (e) => {
//                     const htmlContent = e.target.result;
//                     const parser = new DOMParser();
//                     const doc = parser.parseFromString(htmlContent, 'text/html');
//                     const bodyContent = doc.body.innerHTML;
                    
//                     saveToHistory(fullDocumentContent);
//                     handleFullDocumentContentChange(bodyContent);
//                   };
//                   reader.readAsText(file);
//                 }
//               }}
//               accept=".html,.txt"
//               className="hidden"
//             />
//             <button
//               onClick={() => fileInputRef.current?.click()}
//               className="p-2 hover:bg-gray-200 rounded transition-colors"
//               title="Open File"
//             >
//               <Upload className="h-4 w-4" />
//             </button>
//             <button
//               onClick={handleSave}
//               className="p-2 hover:bg-gray-200 rounded transition-colors"
//               title="Save (Ctrl+S)"
//             >
//               <Save className="h-4 w-4" />
//             </button>
//             <button
//               onClick={handleSaveAsHTML}
//               className="p-2 hover:bg-gray-200 rounded transition-colors"
//               title="Download HTML"
//             >
//               <Download className="h-4 w-4" />
//             </button>
//             <button
//               onClick={handleDownloadPdf}
//               disabled={isLoading || pageContents.length === 0}
//               className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
//               title="Download as PDF"
//             >
//               <Download className="h-4 w-4" />
//             </button>
//             <button
//               onClick={handlePrint}
//               className="p-2 hover:bg-gray-200 rounded transition-colors"
//               title="Print"
//             >
//               <Printer className="h-4 w-4" />
//             </button>
//           </div>

//           {/* Undo/Redo */}
//           <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
//             <button
//               onClick={handleUndo}
//               disabled={undoStack.length === 0}
//               className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
//               title="Undo (Ctrl+Z)"
//             >
//               <Undo className="h-4 w-4" />
//             </button>
//             <button
//               onClick={handleRedo}
//               disabled={redoStack.length === 0}
//               className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
//               title="Redo (Ctrl+Y)"
//             >
//               <Redo className="h-4 w-4" />
//             </button>
//           </div>

//           {/* Font Settings - COMPLETELY FIXED to apply only to selected text */}
//           <div className="flex items-center border-r border-gray-300 pr-2 mr-2 gap-1">
//             <select
//               value=""
//               onChange={(e) => {
//                 const newFont = e.target.value;
//                 if (newFont) {
//                   setFontFamily(newFont);
                  
//                   // Apply font only to selected text
//                   const selection = window.getSelection();
//                   if (selection && selection.rangeCount > 0) {
//                     formatText('fontName', newFont);
//                   }
//                   // Reset select to show placeholder
//                   e.target.value = '';
//                 }
//               }}
//               className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
//               title="Change font family for selected text"
//             >
//               <option value="">Font Family</option>
//               <option value="Times New Roman">Times New Roman</option>
//               <option value="Arial">Arial</option>
//               <option value="Georgia">Georgia</option>
//               <option value="Helvetica">Helvetica</option>
//               <option value="Verdana">Verdana</option>
//               <option value="Courier New">Courier New</option>
//               <option value="Impact">Impact</option>
//               <option value="Comic Sans MS">Comic Sans MS</option>
//               <option value="Trebuchet MS">Trebuchet MS</option>
//             </select>
            
//             <div className="flex items-center border border-gray-300 rounded">
//               <button
//                 onClick={() => {
//                   const selection = window.getSelection();
//                   if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
//                     // Apply to selected text
//                     const currentElement = selection.getRangeAt(0).commonAncestorContainer.parentElement;
//                     const computedStyle = window.getComputedStyle(currentElement);
//                     const currentSize = parseInt(computedStyle.fontSize) || fontSize;
//                     const newSize = Math.max(8, Math.min(72, currentSize - 1));
//                     formatText('fontSize', newSize);
//                   } else {
//                     // Update default for future typing
//                     const newSize = Math.max(8, Math.min(72, fontSize - 1));
//                     setFontSize(newSize);
//                   }
//                 }}
//                 className="p-1 hover:bg-gray-200 rounded transition-colors"
//                 title="Decrease font size for selected text"
//               >
//                 <Minus className="h-3 w-3" />
//               </button>
//               <input
//                 type="number"
//                 value={fontSize}
//                 onChange={(e) => {
//                   const newSize = parseInt(e.target.value) || 14;
//                   const validSize = Math.max(8, Math.min(72, newSize));
//                   setFontSize(validSize);
                  
//                   const selection = window.getSelection();
//                   if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
//                     formatText('fontSize', validSize);
//                   }
//                 }}
//                 onKeyDown={(e) => {
//                   if (e.key === 'Enter') {
//                     const newSize = parseInt(e.target.value) || 14;
//                     const validSize = Math.max(8, Math.min(72, newSize));
//                     setFontSize(validSize);
                    
//                     const selection = window.getSelection();
//                     if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
//                       formatText('fontSize', validSize);
//                     }
//                     e.target.blur();
//                   }
//                 }}
//                 className="w-12 text-center text-sm border-0"
//                 min="8"
//                 max="72"
//                 title="Font size (Enter to apply to selected text)"
//               />
//               <button
//                 onClick={() => {
//                   const selection = window.getSelection();
//                   if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
//                     // Apply to selected text
//                     const currentElement = selection.getRangeAt(0).commonAncestorContainer.parentElement;
//                     const computedStyle = window.getComputedStyle(currentElement);
//                     const currentSize = parseInt(computedStyle.fontSize) || fontSize;
//                     const newSize = Math.max(8, Math.min(72, currentSize + 1));
//                     formatText('fontSize', newSize);
//                   } else {
//                     // Update default for future typing
//                     const newSize = Math.max(8, Math.min(72, fontSize + 1));
//                     setFontSize(newSize);
//                   }
//                 }}
//                 className="p-1 hover:bg-gray-200 rounded transition-colors"
//                 title="Increase font size for selected text"
//               >
//                 <Plus className="h-3 w-3" />
//               </button>
//             </div>
//           </div>

//           {/* Text Formatting */}
//           <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
//             <button
//               onClick={() => formatText('bold')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors"
//               title="Bold (Ctrl+B)"
//             >
//               <Bold className="h-4 w-4" />
//             </button>
//             <button
//               onClick={() => formatText('italic')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors"
//               title="Italic (Ctrl+I)"
//             >
//               <Italic className="h-4 w-4" />
//             </button>
//             <button
//               onClick={() => formatText('underline')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors"
//               title="Underline (Ctrl+U)"
//             >
//               <Underline className="h-4 w-4" />
//             </button>
//             <button
//               onClick={() => formatText('strikeThrough')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors"
//               title="Strikethrough"
//             >
//               <Strikethrough className="h-4 w-4" />
//             </button>
//           </div>

//           {/* Colors */}
//           <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
//             <input
//               type="color"
//               value={textColor}
//               onChange={(e) => {
//                 setTextColor(e.target.value);
//                 formatText('foreColor', e.target.value);
//               }}
//               className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
//               title="Text Color (applies to selected text)"
//             />
//             <input
//               type="color"
//               value={backgroundColor}
//               onChange={(e) => {
//                 setBackgroundColor(e.target.value);
//                 formatText('hiliteColor', e.target.value);
//               }}
//               className="w-8 h-8 border border-gray-300 rounded cursor-pointer ml-1"
//               title="Highlight Color (applies to selected text)"
//             />
//           </div>

//           {/* Alignment */}
//           <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
//             <button
//               onClick={() => formatText('justifyLeft')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors"
//               title="Align Left"
//             >
//               <AlignLeft className="h-4 w-4" />
//             </button>
//             <button
//               onClick={() => formatText('justifyCenter')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors"
//               title="Align Center"
//             >
//               <AlignCenter className="h-4 w-4" />
//             </button>
//             <button
//               onClick={() => formatText('justifyRight')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors"
//               title="Align Right"
//             >
//               <AlignRight className="h-4 w-4" />
//             </button>
//             <button
//               onClick={() => formatText('justifyFull')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors"
//               title="Justify"
//             >
//               <AlignJustify className="h-4 w-4" />
//             </button>
//           </div>

//           {/* Lists */}
//           <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
//             <button
//               onClick={() => formatText('insertUnorderedList')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors"
//               title="Bullet List"
//             >
//               <List className="h-4 w-4" />
//             </button>
//             <button
//               onClick={() => formatText('insertOrderedList')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors"
//               title="Numbered List"
//             >
//               <ListOrdered className="h-4 w-4" />
//             </button>
//             <button
//               onClick={() => formatText('indent')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors"
//               title="Increase Indent"
//             >
//               <Indent className="h-4 w-4" />
//             </button>
//             <button
//               onClick={() => formatText('outdent')}
//               className="p-2 hover:bg-gray-200 rounded transition-colors"
//               title="Decrease Indent"
//             >
//               <Outdent className="h-4 w-4" />
//             </button>
//           </div>

//           {/* Insert Elements */}
//           <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
//             <button
//               onClick={() => setIsLinkModalOpen(true)}
//               className="p-2 hover:bg-gray-200 rounded transition-colors"
//               title="Insert Link"
//             >
//               <Link className="h-4 w-4" />
//             </button>
//             <button
//               onClick={insertImage}
//               className="p-2 hover:bg-gray-200 rounded transition-colors"
//               title="Insert Image"
//             >
//               <Image className="h-4 w-4" />
//             </button>
//             <button
//               onClick={() => setIsTableModalOpen(true)}
//               className="p-2 hover:bg-gray-200 rounded transition-colors"
//               title="Insert Table"
//             >
//               <Table className="h-4 w-4" />
//             </button>
//             <button
//               onClick={insertPageBreak}
//               className="p-2 hover:bg-gray-200 rounded transition-colors"
//               title="Add New Page"
//             >
//               <Divide className="h-4 w-4" />
//             </button>
//             <button
//               onClick={handleDownloadPdf}
//               disabled={isLoading || pageContents.length === 0}
//               className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
//               title="Download as PDF"
//             >
//               <Download className="h-4 w-4" />
//             </button>
//           </div>

//           {/* AI Features */}
//           <div className="flex items-center">
//             <button
//               onClick={() => handleAIAction('translate')}
//               disabled={isLoading}
//               className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
//               title="Translate to Marathi"
//             >
//               <Languages className="h-4 w-4" />
//             </button>
//             <button
//               onClick={() => handleAIAction('spellcheck')}
//               disabled={isLoading}
//               className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
//               title="Spell Check"
//             >
//               <SpellCheck className="h-4 w-4" />
//             </button>
//             <button
//               onClick={() => {
//                 const prompt = window.prompt('Enter a prompt for content generation:');
//                 if (prompt) handleAIAction('generate', prompt);
//               }}
//               disabled={isLoading}
//               className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
//               title="Generate Content"
//             >
//               <Sparkles className="h-4 w-4" />
//             </button>
//             <button
//               onClick={() => handleAIAction('review')}
//               disabled={isLoading}
//               className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
//               title="AI Review"
//             >
//               <MessageSquare className="h-4 w-4" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Secondary Toolbar */}
//       <div className="border-b border-gray-200 p-2 bg-gray-100">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center space-x-2">
//               <span className="text-sm font-medium">Zoom:</span>
//               <select
//                 value={zoomLevel}
//                 onChange={(e) => setZoomLevel(parseInt(e.target.value))}
//                 className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
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
//               <span className="text-sm font-medium">Style:</span>
//               <select
//                 onChange={(e) => {
//                   if (e.target.value) {
//                     formatText('formatBlock', e.target.value);
//                     e.target.value = '';
//                   }
//                 }}
//                 className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
//                 defaultValue=""
//               >
//                 <option value="">Normal</option>
//                 <option value="h1">Heading 1</option>
//                 <option value="h2">Heading 2</option>
//                 <option value="h3">Heading 3</option>
//                 <option value="h4">Heading 4</option>
//                 <option value="h5">Heading 5</option>
//                 <option value="h6">Heading 6</option>
//                 <option value="p">Paragraph</option>
//                 <option value="blockquote">Quote</option>
//                 <option value="pre">Code Block</option>
//               </select>
//             </div>
//           </div>
          
//           <div className="flex items-center space-x-4">
//             <span className="text-sm text-gray-600">Words: {wordCount}</span>
//             <span className="text-sm text-gray-600">Characters: {charCount}</span>
//             {selectedText && (
//               <span className="text-sm text-blue-600">Selected: {selectedText.length} chars</span>
//             )}
//             {isModified && (
//               <div className="flex items-center space-x-1">
//                 <div className="w-2 h-2 rounded-full bg-orange-500"></div>
//                 <span className="text-sm text-orange-600">Modified</span>
//               </div>
//             )}
//             {!isModified && (
//               <div className="flex items-center space-x-1">
//                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
//                 <span className="text-sm text-green-600">Saved</span>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Editor Area */}
//       <div className="flex-1 overflow-hidden">
//         <div className="h-full overflow-y-auto bg-gray-200 p-8" style={{ backgroundColor: '#f5f5f5' }}>
//           <div className="flex flex-col items-center space-y-6">
//             {/* Document Container - Renders all pages */}
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
//                   Page {pageIndex + 1} of {totalPages}
//                 </div>
                
//                 {/* Page content area */}
//                 <div
//                   ref={pageRefs.current[pageIndex]}
//                   contentEditable={!isPreviewMode}
//                   onInput={(e) => handlePageInput(pageIndex, e.target.innerHTML)}
//                   onMouseUp={handleSelectionChange}
//                   onKeyUp={handleSelectionChange}
//                   onKeyDown={handleKeyDown}
//                   onPaste={handlePaste}
//                   onFocus={() => {
//                     if (pageRefs.current[pageIndex]?.current) {
//                       pageRefs.current[pageIndex].current.style.outline = '2px solid #3b82f6';
//                     }
//                   }}
//                   onBlur={() => {
//                     if (pageRefs.current[pageIndex]?.current) {
//                       pageRefs.current[pageIndex].current.style.outline = 'none';
//                     }
//                     // Re-split content on blur to adjust pagination
//                     handleFullDocumentContentChange(pageContents.join('<div class="page-break" style="page-break-before: always; break-before: page; border-top: 2px dashed #007bff; margin: 40px 0; padding-top: 40px; text-align: center; color: #007bff; font-size: 12px; font-weight: bold;"><span style="background: white; padding: 0 15px;">--- Page Break ---</span></div>'));
//                   }}
//                   className={`focus:outline-none w-full h-full min-h-[10in] p-16 leading-relaxed ${isPreviewMode ? 'pointer-events-none' : ''}`}
//                   style={{
//                     fontFamily: fontFamily,
//                     fontSize: `${fontSize}px`,
//                     lineHeight: '1.6',
//                     color: '#1a1a1a',
//                     wordWrap: 'break-word',
//                     overflowWrap: 'break-word',
//                     cursor: isPreviewMode ? 'default' : 'text',
//                     userSelect: 'text',
//                     WebkitUserSelect: 'text',
//                     MozUserSelect: 'text',
//                     msUserSelect: 'text'
//                   }}
//                   suppressContentEditableWarning={true}
//                   data-placeholder={`${placeholder} (Page ${pageIndex + 1})`}
//                   dangerouslySetInnerHTML={{ __html: pageContent }}
//                 />
//               </div>
//             ))}
            
//             {/* Show placeholder for empty document if no pages */}
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
//                   Page 1 of 1
//                 </div>
//                 <div
//                   ref={pageRefs.current[0]} // Use the first ref for the initial empty page
//                   contentEditable={!isPreviewMode}
//                   onInput={(e) => handlePageInput(0, e.target.innerHTML)}
//                   onMouseUp={handleSelectionChange}
//                   onKeyUp={handleSelectionChange}
//                   onKeyDown={handleKeyDown}
//                   onPaste={handlePaste}
//                   onFocus={() => {
//                     if (pageRefs.current[0]?.current) {
//                       pageRefs.current[0].current.style.outline = '2px solid #3b82f6';
//                     }
//                   }}
//                   onBlur={() => {
//                     if (pageRefs.current[0]?.current) {
//                       pageRefs.current[0].current.style.outline = 'none';
//                     }
//                     handleFullDocumentContentChange(pageContents.join('<div class="page-break" style="page-break-before: always; break-before: page; border-top: 2px dashed #007bff; margin: 40px 0; padding-top: 40px; text-align: center; color: #007bff; font-size: 12px; font-weight: bold;"><span style="background: white; padding: 0 15px;">--- Page Break ---</span></div>'));
//                   }}
//                   className={`focus:outline-none w-full h-full min-h-[10in] p-16 leading-relaxed ${isPreviewMode ? 'pointer-events-none' : ''}`}
//                   style={{
//                     fontFamily: fontFamily,
//                     fontSize: `${fontSize}px`,
//                     lineHeight: '1.6',
//                     color: '#1a1a1a',
//                     wordWrap: 'break-word',
//                     overflowWrap: 'break-word',
//                     cursor: isPreviewMode ? 'default' : 'text',
//                     userSelect: 'text',
//                     WebkitUserSelect: 'text',
//                     MozUserSelect: 'text',
//                     msUserSelect: 'text'
//                   }}
//                   suppressContentEditableWarning={true}
//                   data-placeholder={placeholder}
//                 />
//               </div>
//             )}
            
//             {/* Editor specific styles */}
//             <style jsx>{`
//               [contenteditable="true"]:empty:before {
//                 content: attr(data-placeholder);
//                 color: #9ca3af;
//                 font-style: italic;
//                 pointer-events: none;
//               }
//               [contenteditable="true"]:focus:before {
//                 content: none;
//               }
//               /* Ensure list markers are visible */
//               [contenteditable="true"] ol,
//               [contenteditable="true"] ul {
//                 list-style-position: inside;
//                 margin-left: 1.5em;
//               }
//               [contenteditable="true"] ol {
//                 list-style-type: decimal;
//               }
//               [contenteditable="true"] ul {
//                 list-style-type: disc;
//               }
//               [contenteditable="true"] li {
//                 margin-bottom: 0.5em;
//               }
//             `}</style>
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
//                 className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
//               >
//                 Insert Link
//               </button>
//               <button
//                 onClick={() => {
//                   setIsLinkModalOpen(false);
//                   setLinkUrl('');
//                 }}
//                 className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
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
//               <p className="text-sm text-gray-600">Preview: {tableRows} × {tableCols} table with headers</p>
//             </div>
//             <div className="flex space-x-3">
//               <button
//                 onClick={insertTable}
//                 className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 Insert Table
//               </button>
//               <button
//                 onClick={() => setIsTableModalOpen(false)}
//                 className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
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
//             <span><span className="font-medium">Font:</span> {fontFamily}, {fontSize}px</span>
//             <span><span className="font-medium">Pages:</span> {totalPages}</span>
//           </div>
//           <div className="flex items-center space-x-4">
//             <span>Zoom: {zoomLevel}%</span>
//             <span>Selection: {selectedText ? `${selectedText.length} chars` : 'None'}</span>
//             <span>Last saved: {isModified ? 'Unsaved changes' : 'Auto-saved'}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RichTextEditor;

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link, Image, Languages, SpellCheck, 
  Sparkles, MessageSquare, Loader, Palette, Minus, Plus,
  Undo, Redo, Quote, Strikethrough, Table, Divide,
  Indent, Outdent, Settings, FileText,
  Printer, Download, Upload, Save, Eye, EyeOff
} from 'lucide-react';

const RichTextEditor = ({ 
  value = '', 
  onChange = () => {}, 
  placeholder = "Start typing your document...",
  userId = 'guest'
}) => {
  // Core editor state
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [content, setContent] = useState(value);
  const [selectedText, setSelectedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');
  
  // Formatting state
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState('Times New Roman');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  
  // Modal states
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  
  // History state
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  
  // Document state
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isModified, setIsModified] = useState(false);

  // Update word and character counts
  const updateCounts = useCallback((htmlContent) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);
  }, []);

  // Save to history for undo/redo
  const saveToHistory = useCallback((contentToSave = content) => {
    setUndoStack(prev => {
      const newStack = [...prev.slice(-19), contentToSave];
      return newStack;
    });
    setRedoStack([]);
    setIsModified(true);
  }, [content]);

  // Handle content changes
  const handleContentChange = useCallback((newContent) => {
    // Only update if content actually changed
    if (newContent !== content) {
      setContent(newContent);
      updateCounts(newContent);
      onChange(newContent);
      setIsModified(true);
    }
  }, [content, onChange, updateCounts]);

  // Selection management
  const savedSelectionRef = useRef(null);
  
  const saveSelection = useCallback(() => {
    if (window.getSelection && editorRef.current) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (editorRef.current.contains(range.commonAncestorContainer)) {
          savedSelectionRef.current = {
            startContainer: range.startContainer,
            startOffset: range.startOffset,
            endContainer: range.endContainer,
            endOffset: range.endOffset,
            text: selection.toString()
          };
          return savedSelectionRef.current;
        }
      }
    }
    return null;
  }, []);

  const restoreSelection = useCallback(() => {
    if (savedSelectionRef.current && window.getSelection && editorRef.current) {
      try {
        const selection = window.getSelection();
        const range = document.createRange();
        
        if (editorRef.current.contains(savedSelectionRef.current.startContainer) &&
            editorRef.current.contains(savedSelectionRef.current.endContainer)) {
          range.setStart(savedSelectionRef.current.startContainer, savedSelectionRef.current.startOffset);
          range.setEnd(savedSelectionRef.current.endContainer, savedSelectionRef.current.endOffset);
          selection.removeAllRanges();
          selection.addRange(range);
          return true;
        }
      } catch (e) {
        console.warn("Could not restore selection:", e);
      }
    }
    return false;
  }, []);

  // Format text function
  const formatText = useCallback((command, value = null) => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;
    
    // Save the current selection details
    const selectionInfo = {
      startContainer: range.startContainer,
      startOffset: range.startOffset,
      endContainer: range.endContainer,
      endOffset: range.endOffset,
      text: selection.toString()
    };
    
    saveToHistory();
    
    try {
      // Special handling for font formatting
      if (['fontSize', 'fontName', 'foreColor', 'hiliteColor'].includes(command)) {
        if (!range.collapsed) {
          const span = document.createElement('span');
          
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
          
          const selectedContent = range.extractContents();
          span.appendChild(selectedContent);
          range.insertNode(span);
          
          // Restore selection on the formatted content
          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } else {
        // Standard formatting commands
        document.execCommand(command, false, value);
        
        // Try to restore selection after standard formatting
        setTimeout(() => {
          try {
            if (selectionInfo.text && editorRef.current.contains(selectionInfo.startContainer)) {
              const newSelection = window.getSelection();
              const newRange = document.createRange();
              newRange.setStart(selectionInfo.startContainer, selectionInfo.startOffset);
              newRange.setEnd(selectionInfo.endContainer, selectionInfo.endOffset);
              newSelection.removeAllRanges();
              newSelection.addRange(newRange);
            }
          } catch (e) {
            // If we can't restore exact selection, try to find the text
            if (selectionInfo.text) {
              const walker = document.createTreeWalker(
                editorRef.current,
                NodeFilter.SHOW_TEXT,
                null,
                false
              );
              let node;
              while (node = walker.nextNode()) {
                const index = node.textContent.indexOf(selectionInfo.text);
                if (index !== -1) {
                  const newSelection = window.getSelection();
                  const newRange = document.createRange();
                  newRange.setStart(node, index);
                  newRange.setEnd(node, index + selectionInfo.text.length);
                  newSelection.removeAllRanges();
                  newSelection.addRange(newRange);
                  break;
                }
              }
            }
          }
        }, 10);
      }
      
      // Update content immediately after formatting (no delays)
      handleContentChange(editorRef.current.innerHTML);
      
    } catch (error) {
      console.warn('Formatting command failed:', error);
    }
  }, [saveToHistory, handleContentChange]);

  // Handle selection changes
  const handleSelectionChange = useCallback(() => {
    // Use requestAnimationFrame to avoid interfering with active selection
    requestAnimationFrame(() => {
      if (editorRef.current) {
        const selection = window.getSelection();
        if (selection && selection.anchorNode && editorRef.current.contains(selection.anchorNode)) {
          const selectedTextContent = selection.toString();
          setSelectedText(selectedTextContent);
          
          // Only save selection if it's not empty and stable
          if (selectedTextContent && !selection.isCollapsed) {
            savedSelectionRef.current = {
              startContainer: selection.getRangeAt(0).startContainer,
              startOffset: selection.getRangeAt(0).startOffset,
              endContainer: selection.getRangeAt(0).endContainer,
              endOffset: selection.getRangeAt(0).endOffset,
              text: selectedTextContent
            };
          }
        }
      }
    });
  }, []);

  // File operations
  const handleSave = useCallback(() => {
    setIsModified(false);
    alert('Document saved successfully!');
  }, []);

  const handleOpenFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      let htmlContent = e.target.result;
      
      if (file.type === 'text/html') {
        // Clean HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        htmlContent = doc.body.innerHTML || htmlContent;
      } else {
        // Plain text - convert to HTML
        htmlContent = htmlContent.replace(/\n/g, '<br>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
      }
      
      saveToHistory(content);
      handleContentChange(htmlContent);
      
      // Update editor content
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlContent;
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = '';
  }, [content, saveToHistory, handleContentChange]);

  const handleDownloadHTML = useCallback(() => {
    const cleanContent = content || '<p>Empty document</p>';
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
            padding: 40px 20px; 
            color: #333;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
        }
        table td, table th {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        table th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        blockquote {
            margin: 1em 0;
            padding-left: 1em;
            border-left: 4px solid #ddd;
            color: #666;
            font-style: italic;
        }
        pre {
            font-family: 'Courier New', monospace;
            background-color: #f5f5f5;
            padding: 1em;
            border-radius: 4px;
            overflow-x: auto;
            white-space: pre-wrap;
        }
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 10px auto;
        }
        @media print {
            body { margin: 0; padding: 20px; }
        }
    </style>
</head>
<body>
    ${cleanContent}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [content, fontFamily, fontSize]);

  // Alternative PDF export using print functionality
  const handleDownloadPDF = useCallback(() => {
    if (!content.trim()) {
      alert('No content to export');
      return;
    }
    
    setIsLoading(true);
    setLoadingAction('Preparing PDF...');
    
    try {
      const cleanContent = content || '<p>Empty document</p>';
      const printWindow = window.open('', '_blank');
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Document PDF</title>
    <style>
        @page {
            margin: 1in;
            size: A4;
        }
        body { 
            font-family: ${fontFamily}; 
            font-size: ${fontSize}px; 
            line-height: 1.6; 
            margin: 0;
            padding: 0;
            color: #333;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
            break-inside: avoid;
        }
        table td, table th {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        table th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        blockquote {
            margin: 1em 0;
            padding-left: 1em;
            border-left: 4px solid #ddd;
            color: #666;
            font-style: italic;
        }
        pre {
            font-family: 'Courier New', monospace;
            background-color: #f5f5f5;
            padding: 1em;
            border-radius: 4px;
            overflow-x: auto;
            white-space: pre-wrap;
        }
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 10px auto;
        }
        h1, h2, h3, h4, h5, h6 {
            break-after: avoid;
        }
        p, li {
            orphans: 2;
            widows: 2;
        }
        @media print {
            body { margin: 0; }
        }
    </style>
</head>
<body>
    ${cleanContent}
    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500);
        }
        
        window.onafterprint = function() {
            setTimeout(function() {
                window.close();
            }, 1000);
        }
    </script>
</body>
</html>`;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      setTimeout(() => {
        setIsLoading(false);
        setLoadingAction('');
        alert('PDF print dialog opened. Use your browser\'s print function to save as PDF.');
      }, 1000);
      
    } catch (error) {
      console.error('Error preparing PDF:', error);
      alert('Failed to prepare PDF. Please try again.');
      setIsLoading(false);
      setLoadingAction('');
    }
  }, [content, fontFamily, fontSize]);

  const handlePrint = useCallback(() => {
    if (!content.trim()) {
      alert('No content to print');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Print Document</title>
    <style>
        @page {
            margin: 1in;
        }
        body { 
            font-family: ${fontFamily}; 
            font-size: ${fontSize}px; 
            line-height: 1.6; 
            margin: 0;
            padding: 0;
            color: #333;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
        }
        table td, table th {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        table th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        blockquote {
            margin: 1em 0;
            padding-left: 1em;
            border-left: 4px solid #ddd;
            color: #666;
            font-style: italic;
        }
        pre {
            font-family: 'Courier New', monospace;
            background-color: #f5f5f5;
            padding: 1em;
            border-radius: 4px;
            white-space: pre-wrap;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        @media print {
            body { margin: 0; }
        }
    </style>
</head>
<body>
    ${content}
    <script>
        window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 1000);
        }
    </script>
</body>
</html>`;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }, [content, fontFamily, fontSize]);

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
    
    if (e.key === 'Enter' && !e.shiftKey) {
      setTimeout(() => saveToHistory(), 100);
    }
  }, [formatText, handleSave, saveToHistory]);

  // Undo/Redo functions
  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const previousContent = undoStack[undoStack.length - 1];
      
      setRedoStack(prev => [...prev, content]);
      setUndoStack(prev => prev.slice(0, -1));
      
      handleContentChange(previousContent);
      
      if (editorRef.current) {
        editorRef.current.innerHTML = previousContent;
        editorRef.current.focus();
      }
    }
  }, [undoStack, content, handleContentChange]);

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextContent = redoStack[redoStack.length - 1];
      
      setUndoStack(prev => [...prev, content]);
      setRedoStack(prev => prev.slice(0, -1));
      
      handleContentChange(nextContent);
      
      if (editorRef.current) {
        editorRef.current.innerHTML = nextContent;
        editorRef.current.focus();
      }
    }
  }, [redoStack, content, handleContentChange]);

  // Paste handler
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
    
    setTimeout(() => {
      if (editorRef.current) {
        handleContentChange(editorRef.current.innerHTML);
      }
    }, 10);
  }, [saveToHistory, handleContentChange]);

  // Link insertion
  const insertLink = useCallback(() => {
    if (linkUrl && editorRef.current) {
      saveToHistory();
      
      if (selectedText) {
        const linkHtml = `<a href="${linkUrl}" target="_blank" style="color: #0066cc; text-decoration: underline;">${selectedText}</a>`;
        document.execCommand('insertHTML', false, linkHtml);
      } else {
        document.execCommand('createLink', false, linkUrl);
      }
      
      setIsLinkModalOpen(false);
      setLinkUrl('');
      
      setTimeout(() => {
        if (editorRef.current) {
          handleContentChange(editorRef.current.innerHTML);
        }
      }, 10);
    }
  }, [linkUrl, selectedText, saveToHistory, handleContentChange]);

  // Image insertion
  const insertImage = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url && editorRef.current) {
      saveToHistory();
      const imgHtml = `<img src="${url}" style="max-width: 100%; height: auto; margin: 10px 0; display: block;" alt="Inserted image" />`;
      document.execCommand('insertHTML', false, imgHtml);
      
      setTimeout(() => {
        if (editorRef.current) {
          handleContentChange(editorRef.current.innerHTML);
        }
      }, 10);
    }
  }, [saveToHistory, handleContentChange]);

  // Table insertion
  const insertTable = useCallback(() => {
    if (!editorRef.current) return;
    
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
    
    setTimeout(() => {
      if (editorRef.current) {
        handleContentChange(editorRef.current.innerHTML);
      }
    }, 10);
  }, [saveToHistory, tableRows, tableCols, handleContentChange]);

  // AI Functions (mock implementations)
  const handleAIAction = useCallback(async (action, prompt = '') => {
    if (!content && action !== 'generate') {
      alert("Document is empty. Nothing to process.");
      return;
    }
    
    setIsLoading(true);
    setLoadingAction(`Processing with AI (${action})...`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let result = '';
      switch (action) {
        case 'translate':
          result = `<p><strong>Translation:</strong></p><p>Your content would be translated here...</p>`;
          break;
        case 'spellcheck':
          result = content.replace(/teh/g, 'the').replace(/recieve/g, 'receive');
          break;
        case 'generate':
          result = `<p><strong>AI Generated Content:</strong></p><p>This is AI-generated content based on your prompt: "${prompt}". This would be replaced with actual AI-generated text in a real implementation.</p>`;
          break;
        case 'review':
          alert('AI Review Complete!\n\n✅ Grammar: Excellent\n✅ Clarity: Good\n📝 Suggestions: Consider adding more examples\n⭐ Overall Score: 8.5/10');
          return;
        default:
          result = content;
      }
      
      saveToHistory();
      const newContent = action === 'generate' ? content + result : result;
      handleContentChange(newContent);
      
      if (editorRef.current) {
        editorRef.current.innerHTML = newContent;
      }
    } catch (error) {
      alert(`AI ${action} failed. Please try again.`);
    } finally {
      setIsLoading(false);
      setLoadingAction('');
    }
  }, [content, saveToHistory, handleContentChange]);

  // Initialize content only once and avoid re-renders during typing
  useEffect(() => {
    if (editorRef.current && value && value !== content) {
      // Only set innerHTML if we're initializing or loading new content
      editorRef.current.innerHTML = value;
      setContent(value);
      updateCounts(value);
      if (value) {
        saveToHistory(value);
      }
    }
  }, [value]); // Remove content dependency to avoid re-renders

  // Separate effect for initial setup
  useEffect(() => {
    if (editorRef.current && !content && !value) {
      // Initialize empty editor
      editorRef.current.innerHTML = '';
    }
  }, []); // Only run once on mount

  // Style object for editor scaling
  const editorStyle = useMemo(() => ({
    fontFamily: fontFamily,
    fontSize: `${fontSize}px`,
    lineHeight: '1.6',
    color: '#333',
    minHeight: '600px',
    padding: '40px',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    cursor: isPreviewMode ? 'default' : 'text',
    transform: `scale(${zoomLevel / 100})`,
    transformOrigin: 'top left',
    width: `${10000 / zoomLevel}%`
  }), [fontFamily, fontSize, isPreviewMode, zoomLevel]);

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
              onChange={handleFileChange}
              accept=".html,.txt"
              className="hidden"
            />
            <button
              onClick={handleOpenFile}
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
              onClick={handleDownloadHTML}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Download HTML"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isLoading}
              className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
              title="Save as PDF (uses browser print)"
            >
              <FileText className="h-4 w-4" />
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

          {/* Font Settings */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2 gap-1">
            <select
              value=""
              onChange={(e) => {
                const newFont = e.target.value;
                if (newFont) {
                  // Check if there's a selection before applying
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                    formatText('fontName', newFont);
                  } else {
                    setFontFamily(newFont);
                  }
                  e.target.value = '';
                }
              }}
              className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
              title="Font Family"
            >
              <option value="">Font</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Verdana">Verdana</option>
              <option value="Courier New">Courier New</option>
            </select>
            
            <div className="flex items-center border border-gray-300 rounded">
              <button
                onClick={() => {
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                    // Get current font size from selection if possible
                    const range = selection.getRangeAt(0);
                    const parentElement = range.commonAncestorContainer.parentElement;
                    const computedStyle = window.getComputedStyle(parentElement);
                    const currentSize = parseInt(computedStyle.fontSize) || fontSize;
                    const newSize = Math.max(8, Math.min(72, currentSize - 1));
                    formatText('fontSize', newSize);
                  } else {
                    const newSize = Math.max(8, Math.min(72, fontSize - 1));
                    setFontSize(newSize);
                  }
                }}
                className="p-1 hover:bg-gray-200"
              >
                <Minus className="h-3 w-3" />
              </button>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => {
                  const newSize = Math.max(8, Math.min(72, parseInt(e.target.value) || 14));
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                    formatText('fontSize', newSize);
                  } else {
                    setFontSize(newSize);
                  }
                }}
                className="w-12 text-center text-sm border-0"
                min="8"
                max="72"
              />
              <button
                onClick={() => {
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                    // Get current font size from selection if possible
                    const range = selection.getRangeAt(0);
                    const parentElement = range.commonAncestorContainer.parentElement;
                    const computedStyle = window.getComputedStyle(parentElement);
                    const currentSize = parseInt(computedStyle.fontSize) || fontSize;
                    const newSize = Math.max(8, Math.min(72, currentSize + 1));
                    formatText('fontSize', newSize);
                  } else {
                    const newSize = Math.max(8, Math.min(72, fontSize + 1));
                    setFontSize(newSize);
                  }
                }}
                className="p-1 hover:bg-gray-200"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Text Formatting */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              onClick={() => formatText('bold')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatText('italic')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatText('underline')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Underline (Ctrl+U)"
            >
              <Underline className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatText('strikeThrough')}
              className="p-2 hover:bg-gray-200 rounded"
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
              title="Text Color"
            />
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => {
                setBackgroundColor(e.target.value);
                formatText('hiliteColor', e.target.value);
              }}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer ml-1"
              title="Highlight Color"
            />
          </div>

          {/* Alignment */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              onClick={() => formatText('justifyLeft')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatText('justifyCenter')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatText('justifyRight')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatText('justifyFull')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Justify"
            >
              <AlignJustify className="h-4 w-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              onClick={() => formatText('insertUnorderedList')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatText('insertOrderedList')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatText('indent')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Increase Indent"
            >
              <Indent className="h-4 w-4" />
            </button>
            <button
              onClick={() => formatText('outdent')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Decrease Indent"
            >
              <Outdent className="h-4 w-4" />
            </button>
          </div>

          {/* Insert Elements */}
          <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="p-2 hover:bg-gray-200 rounded"
              title="Insert Link"
            >
              <Link className="h-4 w-4" />
            </button>
            <button
              onClick={insertImage}
              className="p-2 hover:bg-gray-200 rounded"
              title="Insert Image"
            >
              <Image className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsTableModalOpen(true)}
              className="p-2 hover:bg-gray-200 rounded"
              title="Insert Table"
            >
              <Table className="h-4 w-4" />
            </button>
          </div>

          {/* AI Features */}
          <div className="flex items-center">
            <button
              onClick={() => handleAIAction('translate')}
              disabled={isLoading}
              className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
              title="Translate"
            >
              <Languages className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleAIAction('spellcheck')}
              disabled={isLoading}
              className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
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
              className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
              title="Generate Content"
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleAIAction('review')}
              disabled={isLoading}
              className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
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

            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="text-sm">{isPreviewMode ? 'Edit' : 'Preview'}</span>
            </button>
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
        <div className="h-full overflow-y-auto bg-gray-100 p-4">
          <div className="max-w-4xl mx-auto">
            <div 
              className="bg-white shadow-xl border border-gray-300 rounded-lg overflow-hidden"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                marginBottom: zoomLevel < 100 ? `${(100 - zoomLevel) * 5}px` : '0'
              }}
            >
              <div
                ref={editorRef}
                contentEditable={!isPreviewMode}
                onInput={(e) => {
                  // Handle input without losing focus or cursor position
                  const newContent = e.target.innerHTML;
                  handleContentChange(newContent);
                }}
                onMouseUp={handleSelectionChange}
                onKeyUp={handleSelectionChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                suppressContentEditableWarning={true}
                className={`focus:outline-none w-full ${isPreviewMode ? 'pointer-events-none' : ''}`}
                style={editorStyle}
                data-placeholder={placeholder}
              />
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
          </div>
          <div className="flex items-center space-x-4">
            <span>Zoom: {zoomLevel}%</span>
            <span>Selection: {selectedText ? `${selectedText.length} chars` : 'None'}</span>
            <span>Status: {isModified ? 'Modified' : 'Saved'}</span>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
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
        [contenteditable="true"] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        [contenteditable="true"] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }
        [contenteditable="true"] h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
        }
        [contenteditable="true"] h4 {
          font-size: 1em;
          font-weight: bold;
          margin: 1em 0;
        }
        [contenteditable="true"] h5 {
          font-size: 0.83em;
          font-weight: bold;
          margin: 1.17em 0;
        }
        [contenteditable="true"] h6 {
          font-size: 0.75em;
          font-weight: bold;
          margin: 1.33em 0;
        }
        [contenteditable="true"] blockquote {
          margin: 1em 0;
          padding-left: 1em;
          border-left: 4px solid #ddd;
          color: #666;
          font-style: italic;
        }
        [contenteditable="true"] pre {
          font-family: 'Courier New', monospace;
          background-color: #f5f5f5;
          padding: 1em;
          border-radius: 4px;
          overflow-x: auto;
          white-space: pre-wrap;
        }
        [contenteditable="true"] table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        [contenteditable="true"] table td,
        [contenteditable="true"] table th {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        [contenteditable="true"] table th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        [contenteditable="true"] a {
          color: #0066cc;
          text-decoration: underline;
        }
        [contenteditable="true"] a:hover {
          color: #0052a3;
        }
        [contenteditable="true"] img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 10px auto;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;