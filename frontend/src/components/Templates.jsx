// import React, { useState, useEffect } from 'react';
// import { Edit3, Scale, Briefcase, Shield, Loader, FileText, AlertCircle } from 'lucide-react';
// import ApiService from '../services/api'; // Correct import path

// const Templates = ({ onSelectTemplate, query = "" }) => {
//   const [templates, setTemplates] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [processingTemplateId, setProcessingTemplateId] = useState(null);

//   // Get category icon based on template category
//   const getCategoryIcon = (category) => {
//     switch (category && category.toLowerCase()) {
//       case 'legal':
//         return <Scale className="w-5 h-5 text-blue-600" />;
//       case 'business':
//         return <Briefcase className="w-5 h-5 text-purple-600" />;
//       case 'confidentiality':
//         return <Shield className="w-5 h-5 text-green-600" />;
//       default:
//         return <FileText className="w-5 h-5 text-gray-600" />;
//     }
//   };

//   // Get category color based on template category
//   const getCategoryColor = (category) => {
//     switch (category && category.toLowerCase()) {
//       case 'legal':
//         return 'bg-blue-100 text-blue-800';
//       case 'business':
//         return 'bg-purple-100 text-purple-800';
//       case 'confidentiality':
//         return 'bg-green-100 text-green-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   // Fetch templates from backend on component mount
//   useEffect(() => {
//     const fetchTemplates = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         console.log('Fetching templates from /api/templates/user...');
//         const data = await ApiService.getTemplates();
//         console.log('Successfully fetched templates:', data);
        
//         // Handle different response structures
//         const templatesArray = Array.isArray(data) ? data : (data.templates || data.data || []);
        
//         if (!Array.isArray(templatesArray)) {
//           throw new Error('Server did not return an array of templates. Response structure: ' + JSON.stringify(data).substring(0, 200));
//         }
        
//         // Transform backend data to match component expectations
//         const transformedTemplates = templatesArray.map(template => ({
//           ...template,
//           icon: getCategoryIcon(template.category),
//           isEditable: true,
//           isBackendTemplate: true
//         }));
        
//         setTemplates(transformedTemplates);
//         console.log('Templates set successfully:', transformedTemplates.length, 'templates loaded');
        
//       } catch (err) {
//         console.error('Error fetching templates:', err);
//         setError(err.message);
//         setTemplates([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTemplates();
//   }, []);

//   // Handle template selection with backend integration
//   const handleTemplateSelection = async (template) => {
//     try {
//       setProcessingTemplateId(template.id);
      
//       console.log('Opening template for editing:', template.id);
//       // The backend /api/templates/:id now returns the full template object including HTML
//       const fetchedTemplate = await ApiService.openTemplateForEditing(template.id);
      
//       // Ensure fetchedTemplate.html exists
//       if (!fetchedTemplate || !fetchedTemplate.html) {
//         throw new Error('Fetched template is missing HTML content.');
//       }

//       // Create enhanced template object with backend data
//       const enhancedTemplate = {
//         ...template,
//         content: fetchedTemplate.html, // Use 'content' for the editor
//         fileName: fetchedTemplate.name || template.name, // Use fetched name or original
//         isBackendTemplate: true // Mark as backend template
//       };
      
//       console.log('Template opened successfully:', enhancedTemplate);
//       onSelectTemplate(enhancedTemplate);
//     } catch (error) {
//       console.error('Error opening template:', error);
//       setError(`Failed to open template: ${error.message}`);
//       // Fallback to static template content if backend fails
//       onSelectTemplate({ ...template, content: template.content || '' });
//     } finally {
//       setProcessingTemplateId(null);
//     }
//   };

//   // Filter templates based on search query
//   const filteredTemplates = templates.filter(template => {
//     if (!query) return true;
//     const searchTerm = query.toLowerCase();
//     return (
//       (template.name && template.name.toLowerCase().includes(searchTerm)) ||
//       (template.category && template.category.toLowerCase().includes(searchTerm)) ||
//       (template.type && template.type.toLowerCase().includes(searchTerm)) ||
//       (template.description && template.description.toLowerCase().includes(searchTerm))
//     );
//   });

//   // Loading state
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading templates...</p>
//         </div>
//       </div>
//     );
//   }

//   // Error state with no templates
//   if (error && filteredTemplates.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center max-w-md">
//           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Templates</h3>
//           <p className="text-gray-600 mb-4">{error}</p>
//           <button 
//             onClick={() => window.location.reload()} 
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       {/* Error message (if templates are still available) */}
//       {error && filteredTemplates.length > 0 && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <div className="flex items-center">
//             <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
//             <div className="text-red-600">
//               <p className="font-medium">Warning</p>
//               <p className="text-sm mt-1">{error}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Header */}
//       <div className="text-center mb-8">
//         <h2 className="text-3xl font-bold text-gray-900 mb-4">Professional Document Templates</h2>
//         <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//           Choose from our curated collection of legal and business templates. 
//           Each template is professionally formatted and ready to customize for your needs.
//         </p>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
//           <div className="flex items-center">
//             <Scale className="w-10 h-10 text-blue-600 mr-4" />
//             <div>
//               <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">Legal Documents</p>
//               <p className="text-3xl font-bold text-blue-900">
//                 {filteredTemplates.filter(t => t.category && t.category.toLowerCase() === 'legal').length}
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
//           <div className="flex items-center">
//             <Briefcase className="w-10 h-10 text-purple-600 mr-4" />
//             <div>
//               <p className="text-sm font-medium text-purple-600 uppercase tracking-wide">Business Templates</p>
//               <p className="text-3xl font-bold text-purple-900">
//                 {filteredTemplates.filter(t => t.category && t.category.toLowerCase() === 'business').length}
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
//           <div className="flex items-center">
//             <Shield className="w-10 h-10 text-green-600 mr-4" />
//             <div>
//               <p className="text-sm font-medium text-green-600 uppercase tracking-wide">Ready to Use</p>
//               <p className="text-3xl font-bold text-green-900">{filteredTemplates.length}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Templates Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
//         {filteredTemplates.map((template) => (
//           <div
//             key={template.id}
//             className={`group relative bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-2 hover:border-blue-300 ${
//               processingTemplateId === template.id ? 'opacity-75 cursor-not-allowed' : ''
//             }`}
//             onClick={() => processingTemplateId !== template.id && handleTemplateSelection(template)}
//           >
//             <div className="p-8">
//               {/* Header */}
//               <div className="flex items-start space-x-4 mb-6">
//                 <div className="flex-shrink-0 p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors duration-300">
//                   {processingTemplateId === template.id ? (
//                     <Loader className="w-5 h-5 animate-spin text-blue-600" />
//                   ) : (
//                     template.icon || <FileText className="w-5 h-5 text-blue-600" />
//                   )}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
//                     {template.name}
//                   </h3>
//                   <div className="flex items-center space-x-2 mb-3">
//                     {template.category && (
//                       <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(template.category)}`}>
//                         {template.category}
//                       </span>
//                     )}
//                     {template.type && (
//                       <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
//                         {template.type}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
              
//               {/* Description */}
//               <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
//                 {template.description || 'Professional document template ready for customization.'}
//               </p>
              
//               {/* Preview */}
//               <div className="relative bg-gray-50 rounded-xl p-4 h-40 overflow-hidden border group-hover:bg-blue-50 transition-colors duration-300">
//                 <div className="text-xs text-gray-700 leading-relaxed font-serif space-y-1">
//                   <div className="font-bold text-center text-sm mb-3 text-gray-800 uppercase tracking-wider">
//                     {template.name}
//                   </div>
//                   <div className="text-xs text-gray-600">
//                     THIS AGREEMENT is made this _____ day of _____, 20____
//                   </div>
//                   <div className="ml-4 text-xs text-gray-500 mt-2">
//                     <div className="font-semibold">PARTY 1:</div>
//                     <div>Name: ________________________</div>
//                     <div>Address: ________________________</div>
//                     <div className="mt-2">
//                       <div className="font-semibold">SCOPE OF WORK:</div>
//                       <div>• Service details...</div>
//                       <div>• Terms and conditions...</div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-50 group-hover:from-blue-50 to-transparent transition-colors duration-300"></div>
//               </div>
              
//               {/* Action Button */}
//               <div className="mt-6 flex items-center justify-center">
//                 <div className="flex items-center space-x-2 text-blue-600 text-base font-semibold group-hover:text-blue-700 transition-colors">
//                   <Edit3 className="w-5 h-5" />
//                   <span>
//                     {processingTemplateId === template.id ? 'Opening...' : 'Use This Template'}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Backend indicator */}
//             {template.isBackendTemplate && (
//               <div className="absolute top-4 right-4">
//                 <div className="w-3 h-3 bg-green-500 rounded-full" title="Server template"></div>
//               </div>
//             )}

//             {/* Hover Overlay */}
//             <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
//           </div>
//         ))}
        
//         {filteredTemplates.length === 0 && !loading && (
//           <div className="col-span-full text-center py-16">
//             <div className="text-gray-400 mb-6">
//               <FileText className="w-20 h-20 mx-auto" />
//             </div>
//             <h3 className="text-xl font-semibold text-gray-900 mb-3">No templates found</h3>
//             <p className="text-gray-500 mb-6">
//               {query ? 'Try adjusting your search terms.' : 'No templates are currently available.'}
//             </p>
//           </div>
//         )}
//       </div>
      
//       {/* Footer */}
//       <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 rounded-2xl p-8 text-center border border-blue-200">
//         <div className="space-y-4">
//           <h3 className="text-xl font-bold text-gray-900">Professional Document Standards</h3>
//           <div className="flex flex-wrap items-center justify-center space-x-8 text-sm text-gray-600">
//             <div className="flex items-center space-x-2">
//               <Scale className="w-5 h-5 text-blue-600" />
//               <span>Legal formatting compliant</span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <Shield className="w-5 h-5 text-green-600" />
//               <span>Industry standard structure</span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <Briefcase className="w-5 h-5 text-purple-600" />
//               <span>Professional appearance</span>
//             </div>
//           </div>
//           <div className="bg-amber-50 border border-amber-200 rounded-lg px-6 py-3 mx-auto max-w-2xl">
//             <div className="flex items-center justify-center space-x-2 text-amber-800 font-medium">
//               <span>⚖️</span>
//               <span>Always consult with a qualified attorney before using legal documents</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Templates;
// import React, { useState, useEffect } from 'react';
// import { Edit3, Scale, Briefcase, Shield, Loader, FileText, AlertCircle } from 'lucide-react';
// import ApiService from '../services/api';

// const Templates = ({ onSelectTemplate, query = "" }) => {
//   const [templates, setTemplates] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [processingTemplateId, setProcessingTemplateId] = useState(null);

//   const getCategoryIcon = (category) => {
//     switch ((category || '').toLowerCase()) {
//       case 'legal': return <Scale className="w-5 h-5 text-blue-600" />;
//       case 'business': return <Briefcase className="w-5 h-5 text-purple-600" />;
//       case 'confidentiality': return <Shield className="w-5 h-5 text-green-600" />;
//       default: return <FileText className="w-5 h-5 text-gray-600" />;
//     }
//   };

//   const getCategoryColor = (category) => {
//     switch ((category || '').toLowerCase()) {
//       case 'legal': return 'bg-blue-100 text-blue-800';
//       case 'business': return 'bg-purple-100 text-purple-800';
//       case 'confidentiality': return 'bg-green-100 text-green-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   useEffect(() => {
//     const fetchTemplates = async () => {
//       try {
//         setLoading(true);
//         const data = await ApiService.getTemplates();
//         const templatesArray = Array.isArray(data) ? data : (data.templates || data.data || []);

//         const transformed = templatesArray.map(template => ({
//           ...template,
//           icon: getCategoryIcon(template.category),
//           isEditable: true,
//           isBackendTemplate: true,
//         }));

//         setTemplates(transformed);
//       } catch (err) {
//         console.error('Fetch error:', err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchTemplates();
//   }, []);

//   const handleTemplateSelection = async (template) => {
//     try {
//       setProcessingTemplateId(template.id);
//       const fetchedTemplate = await ApiService.openTemplateForEditing(template.id);

//       const enhancedTemplate = {
//         ...template,
//         content: typeof fetchedTemplate === 'string' ? fetchedTemplate : (fetchedTemplate.html || ''),
//         fileName: fetchedTemplate.name || template.name,
//         isBackendTemplate: true
//       };

//       onSelectTemplate(enhancedTemplate);
//     } catch (error) {
//       console.error('Template open error:', error);
//       setError(`Failed to open template: ${error.message}`);
//       onSelectTemplate({ ...template, content: template.content || '' });
//     } finally {
//       setProcessingTemplateId(null);
//     }
//   };

//   const filteredTemplates = templates.filter(template => {
//     if (!query) return true;
//     const search = query.toLowerCase();
//     return (
//       (template.name || '').toLowerCase().includes(search) ||
//       (template.category || '').toLowerCase().includes(search) ||
//       (template.type || '').toLowerCase().includes(search) ||
//       (template.description || '').toLowerCase().includes(search)
//     );
//   });

//   if (loading) {
//     return <div className="text-center p-10"><Loader className="animate-spin text-blue-600 mx-auto" /> Loading templates...</div>;
//   }

//   if (error && filteredTemplates.length === 0) {
//     return (
//       <div className="text-center text-red-600">
//         <AlertCircle className="mx-auto mb-2" />
//         <p>{error}</p>
//         <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Retry</button>
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//       {filteredTemplates.map(template => (
//         <div
//           key={template.id}
//           className={`p-4 border rounded-lg shadow hover:shadow-lg transition cursor-pointer relative ${processingTemplateId === template.id ? 'opacity-50 pointer-events-none' : ''}`}
//           onClick={() => handleTemplateSelection(template)}
//         >
//           <div className="flex items-center space-x-3 mb-4">
//             <div className="p-2 bg-gray-100 rounded">{template.icon}</div>
//             <div>
//               <h3 className="font-semibold text-lg line-clamp-1">{template.name}</h3>
//               <div className="text-sm space-x-2 mt-1">
//                 <span className={`px-2 py-1 rounded ${getCategoryColor(template.category)}`}>{template.category}</span>
//                 <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">{template.type}</span>
//               </div>
//             </div>
//           </div>
//           <p className="text-sm text-gray-600 line-clamp-3">{template.description || 'Template description...'}</p>
//           <div className="mt-4 flex items-center justify-between">
//             <span className="text-sm text-gray-500">{template.fileName || 'template.docx'}</span>
//             <Edit3 className="w-4 h-4 text-blue-600" />
//           </div>
//           {template.isBackendTemplate && <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" title="Backend Template" />}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Templates;




// import React, { useState, useEffect } from 'react';
// import { Edit3, Scale, Briefcase, Shield, Loader, FileText, AlertCircle } from 'lucide-react';
// import ApiService from '../services/api';

// const Templates = ({ onSelectTemplate, query = "" }) => {
//   const [templates, setTemplates] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [processingTemplateId, setProcessingTemplateId] = useState(null);

//   const getCategoryIcon = (category) => {
//     switch ((category || '').toLowerCase()) {
//       case 'legal': return <Scale className="w-5 h-5 text-blue-600" />;
//       case 'business': return <Briefcase className="w-5 h-5 text-purple-600" />;
//       case 'confidentiality': return <Shield className="w-5 h-5 text-green-600" />;
//       default: return <FileText className="w-5 h-5 text-gray-600" />;
//     }
//   };

//   const getCategoryColor = (category) => {
//     switch ((category || '').toLowerCase()) {
//       case 'legal': return 'bg-blue-100 text-blue-800';
//       case 'business': return 'bg-purple-100 text-purple-800';
//       case 'confidentiality': return 'bg-green-100 text-green-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   useEffect(() => {
//     const fetchTemplates = async () => {
//       try {
//         setLoading(true);
//         const data = await ApiService.getTemplates();
//         const templatesArray = Array.isArray(data) ? data : (data.templates || data.data || []);

//         const transformed = templatesArray.map(template => ({
//           ...template,
//           icon: getCategoryIcon(template.category),
//           isEditable: true,
//           isBackendTemplate: true,
//         }));

//         setTemplates(transformed);
//       } catch (err) {
//         console.error('Fetch error:', err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchTemplates();
//   }, []);

//   const handleTemplateSelection = async (template) => {
//     try {
//       setProcessingTemplateId(template.id);
//       const result = await ApiService.openTemplateForEditing(template.id);

//       const enhancedTemplate = {
//         ...template,
//         content: result.html || '',
//         fileName: result.name || template.name,
//         isBackendTemplate: true
//       };

//       onSelectTemplate(enhancedTemplate);
//     } catch (error) {
//       console.error('Template open error:', error);
//       setError(`Failed to open template: ${error.message}`);
//       onSelectTemplate({ ...template, content: template.content || '' });
//     } finally {
//       setProcessingTemplateId(null);
//     }
//   };

//   const filteredTemplates = templates.filter(template => {
//     if (!query) return true;
//     const search = query.toLowerCase();
//     return (
//       (template.name || '').toLowerCase().includes(search) ||
//       (template.category || '').toLowerCase().includes(search) ||
//       (template.type || '').toLowerCase().includes(search) ||
//       (template.description || '').toLowerCase().includes(search)
//     );
//   });

//   if (loading) {
//     return <div className="text-center p-10"><Loader className="animate-spin text-blue-600 mx-auto" /> Loading templates...</div>;
//   }

//   if (error && filteredTemplates.length === 0) {
//     return (
//       <div className="text-center text-red-600">
//         <AlertCircle className="mx-auto mb-2" />
//         <p>{error}</p>
//         <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Retry</button>
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//       {filteredTemplates.map(template => (
//         <div
//           key={template.id}
//           className={`p-4 border rounded-lg shadow hover:shadow-lg transition cursor-pointer relative ${processingTemplateId === template.id ? 'opacity-50 pointer-events-none' : ''}`}
//           onClick={() => handleTemplateSelection(template)}
//         >
//           <div className="flex items-center space-x-3 mb-4">
//             <div className="p-2 bg-gray-100 rounded">{template.icon}</div>
//             <div>
//               <h3 className="font-semibold text-lg line-clamp-1">{template.name}</h3>
//               <div className="text-sm space-x-2 mt-1">
//                 <span className={`px-2 py-1 rounded ${getCategoryColor(template.category)}`}>{template.category}</span>
//                 <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">{template.type}</span>
//               </div>
//             </div>
//           </div>
//           <p className="text-sm text-gray-600 line-clamp-3">{template.description || 'Template description...'}</p>
//           <div className="mt-4 flex items-center justify-between">
//             <span className="text-sm text-gray-500">{template.fileName || 'template.docx'}</span>
//             <Edit3 className="w-4 h-4 text-blue-600" />
//           </div>
//           {template.isBackendTemplate && <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" title="Backend Template" />}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Templates;


import React, { useState, useEffect } from 'react';
import { Edit3, Scale, Briefcase, Shield, Loader, FileText, AlertCircle } from 'lucide-react';
import ApiService from '../services/api';

const Templates = ({ onSelectTemplate, query = "" }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingTemplateId, setProcessingTemplateId] = useState(null);

  const getCategoryIcon = (category) => {
    switch ((category || '').toLowerCase()) {
      case 'legal': return <Scale className="w-5 h-5 text-blue-600" />;
      case 'business': return <Briefcase className="w-5 h-5 text-purple-600" />;
      case 'confidentiality': return <Shield className="w-5 h-5 text-green-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category) => {
    switch ((category || '').toLowerCase()) {
      case 'legal': return 'bg-blue-100 text-blue-800';
      case 'business': return 'bg-purple-100 text-purple-800';
      case 'confidentiality': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        console.log('Attempting to fetch templates from:', ApiService.baseURL + '/api/draft'); // Log the full URL
        const data = await ApiService.getTemplates();
        const templatesArray = Array.isArray(data) ? data : (data.templates || data.data || []);

        const transformed = templatesArray.map(template => ({
          ...template,
          icon: getCategoryIcon(template.category),
          isEditable: true,
          isBackendTemplate: true,
        }));

        setTemplates(transformed);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleTemplateSelection = async (template) => {
    try {
      setProcessingTemplateId(template.id);
      const result = await ApiService.openTemplateForEditing(template.id);

      const enhancedTemplate = {
        ...template,
        content: result.html || '',
        fileName: result.name || template.name,
        isBackendTemplate: true
      };

      onSelectTemplate(enhancedTemplate);
    } catch (error) {
      console.error('Template open error:', error);
      setError(`Failed to open template: ${error.message}`);
      onSelectTemplate({ ...template, content: template.content || '' });
    } finally {
      setProcessingTemplateId(null);
    }
  };

  const filteredTemplates = templates.filter(template => {
    if (!query) return true;
    const search = query.toLowerCase();
    return (
      (template.name || '').toLowerCase().includes(search) ||
      (template.category || '').toLowerCase().includes(search) ||
      (template.type || '').toLowerCase().includes(search) ||
      (template.description || '').toLowerCase().includes(search)
    );
  });

  if (loading) {
    return <div className="text-center p-10"><Loader className="animate-spin text-blue-600 mx-auto" /> Loading templates...</div>;
  }

  if (error && filteredTemplates.length === 0) {
    return (
      <div className="text-center text-red-600">
        <AlertCircle className="mx-auto mb-2" />
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Retry</button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTemplates.map(template => (
        <div
          key={template.id}
          className={`p-4 border rounded-lg shadow hover:shadow-lg transition cursor-pointer relative ${processingTemplateId === template.id ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={() => handleTemplateSelection(template)}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gray-100 rounded">{template.icon}</div>
            <div>
              <h3 className="font-semibold text-lg line-clamp-1">{template.name}</h3>
              <div className="text-sm space-x-2 mt-1">
                <span className={`px-2 py-1 rounded ${getCategoryColor(template.category)}`}>{template.category}</span>
                <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">{template.type}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-3">{template.description || 'Template description...'}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">{template.fileName || 'template.docx'}</span>
            <Edit3 className="w-4 h-4 text-blue-600" />
          </div>
          {template.isBackendTemplate && <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" title="Backend Template" />}
        </div>
      ))}
    </div>
  );
};

export default Templates;