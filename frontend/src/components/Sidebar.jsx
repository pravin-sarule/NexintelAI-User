

// import React, { useState, useEffect } from 'react';
// import {
//   ChevronLeftIcon,
//   ChevronRightIcon,
//   PlusIcon,
//   ChartBarIcon,
//   DocumentTextIcon,
//   MagnifyingGlassCircleIcon,
//   PencilSquareIcon,
//   ScaleIcon,
//   BookOpenIcon,
//   ClockIcon,
//   UserGroupIcon,
//   Cog6ToothIcon,
//   Bars3Icon,
//   XMarkIcon,
//   UserCircleIcon, // Added UserCircleIcon
// } from '@heroicons/react/24/outline';
// import { Link, useLocation } from 'react-router-dom';
// import RoleSelection from './RoleSelection';
// import LegalIntelligence from './LegalIntelligence';
// import QuickTools from './QuickTools';

// const Sidebar = () => {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const [userInfo, setUserInfo] = useState(null); // New state for user info
//   const location = useLocation();

//   // Check if device is mobile/tablet
//   useEffect(() => {
//     const checkDevice = () => {
//       setIsMobile(window.innerWidth < 1024); // lg breakpoint
//       if (window.innerWidth < 1024) {
//         setIsMobileMenuOpen(false); // Close mobile menu on resize
//       }
//     };

//     checkDevice();
//     window.addEventListener('resize', checkDevice);
//     return () => window.removeEventListener('resize', checkDevice);
//   }, []);

//   // Load user info from local storage on component mount
//   useEffect(() => {
//     const storedUserInfo = localStorage.getItem('userInfo');
//     if (storedUserInfo) {
//       setUserInfo(JSON.parse(storedUserInfo));
//     }
//   }, []);

//   // Close mobile menu when route changes
//   useEffect(() => {
//     setIsMobileMenuOpen(false);
//   }, [location.pathname]);

//   // Prevent body scroll when mobile menu is open
//   useEffect(() => {
//     if (isMobileMenuOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }
//     return () => {
//       document.body.style.overflow = 'unset';
//     };
//   }, [isMobileMenuOpen]);

//   const toggleSidebar = () => {
//     if (isMobile) {
//       setIsMobileMenuOpen(!isMobileMenuOpen);
//     } else {
//       setIsCollapsed(!isCollapsed);
//     }
//   };

//   const isActive = (path) => {
//     return location.pathname === path;
//   };

//   const navigationItems = [
//     { name: 'Dashboard', path: '/', icon: ChartBarIcon },
//     { name: 'Document Upload', path: '/upload', icon: DocumentTextIcon },
//     { name: 'AI Analysis', path: '/analysis', icon: MagnifyingGlassCircleIcon },
//     { name: 'Document Drafting', path: '/drafting', icon: PencilSquareIcon },
//     // { name: 'Case Management', path: '/cases', icon: ScaleIcon },
//     // { name: 'Legal Research', path: '/research', icon: BookOpenIcon },
//     // { name: 'Client Portal', path: '/clients', icon: UserGroupIcon },
//   ];

//   const recentCases = [
//     {
//       title: 'Sharma v. State of Maharashtra',
//       type: 'Civil Appeal',
//       time: '2 hours ago',
//       status: 'active'
//     },
//     {
//       title: 'Tech Solutions Ltd. Contract Dispute',
//       type: 'Commercial',
//       time: 'Yesterday',
//       status: 'pending'
//     },
//     {
//       title: 'Property Rights Case - Pune',
//       type: 'Property Law',
//       time: '3 days ago',
//       status: 'completed'
//     },
//   ];

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'active': return 'bg-green-100 text-green-800';
//       case 'pending': return 'bg-yellow-100 text-yellow-800';
//       case 'completed': return 'bg-blue-100 text-blue-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   // Mobile Header Component
//   const MobileHeader = () => (
//     <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
//       <div className="flex items-center space-x-3">
//         {userInfo ? (
//           <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
//             {userInfo.firstName ? userInfo.firstName.charAt(0).toUpperCase() : ''}
//           </div>
//         ) : (
//           <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
//             <ScaleIcon className="h-5 w-5 text-white" />
//           </div>
//         )}
//         <div>
//           {userInfo ? (
//             <>
//               <div className="text-lg font-bold text-slate-800">
//                 Advocate {userInfo.firstName} {userInfo.lastName}
//               </div>
//               <div className="text-xs text-slate-500 font-medium">
//                 Mumbai High Court
//               </div>
//             </>
//           ) : (
//             <>
//               <div className="text-lg font-bold text-slate-800">Nexintel AI</div>
//               <div className="text-xs text-slate-500 font-medium">Legal Intelligence Suite</div>
//             </>
//           )}
//         </div>
//       </div>
//       <button
//         onClick={() => setIsMobileMenuOpen(true)}
//         className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
//       >
//         <Bars3Icon className="h-6 w-6 text-slate-600" />
//       </button>
//     </div>
//   );

//   // Sidebar Content Component
//   const SidebarContent = ({ isMobileView = false }) => (
//     <div className="flex flex-col h-full">
//       {/* Header for Desktop or Mobile Drawer Header */}
//       <div className={`px-4 py-3 border-b border-slate-200 relative bg-white ${isMobileView ? '' : 'hidden lg:block'}`}>
//         {!isMobileView && (
//           <button
//             onClick={toggleSidebar}
//             className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-white border border-slate-300 rounded-full p-1.5 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-200 z-10"
//           >
//             {isCollapsed ? (
//               <ChevronRightIcon className="h-4 w-4 text-slate-600" />
//             ) : (
//               <ChevronLeftIcon className="h-4 w-4 text-slate-600" />
//             )}
//           </button>
//         )}

//         {isMobileView && (
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               {userInfo ? (
//                 <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
//                   {userInfo.firstName ? userInfo.firstName.charAt(0).toUpperCase() : ''}
//                 </div>
//               ) : (
//                 <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
//                   <ScaleIcon className="h-5 w-5 text-white" />
//                 </div>
//               )}
//               <div>
//                 {userInfo ? (
//                   <>
//                     <div className="text-lg font-bold text-slate-800">
//                       Advocate {userInfo.firstName} {userInfo.lastName}
//                     </div>
//                     <div className="text-xs text-slate-500 font-medium">
//                       Mumbai High Court
//                     </div>
//                   </>
//                 ) : (
//                   <>
//                     <div className="text-lg font-bold text-slate-800">Nexintel AI</div>
//                     <div className="text-xs text-slate-500 font-medium">Legal Intelligence Suite</div>
//                   </>
//                 )}
//               </div>
//             </div>
//             <button
//               onClick={() => setIsMobileMenuOpen(false)}
//               className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
//             >
//               <XMarkIcon className="h-6 w-6 text-slate-600" />
//             </button>
//           </div>
//         )}
        
//         <div className={`transition-all duration-300 ${isCollapsed && !isMobileView ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
//           {(!isCollapsed || isMobileView) && !isMobileView && (
//             <div className="flex items-center space-x-3">
//               {userInfo ? (
//                 <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
//                   {userInfo.firstName ? userInfo.firstName.charAt(0).toUpperCase() : ''}
//                 </div>
//               ) : (
//                 <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
//                   <ScaleIcon className="h-5 w-5 text-white" />
//                 </div>
//               )}
//               <div>
//                 {userInfo ? (
//                   <>
//                     <div className="text-lg font-bold text-slate-800">
//                       Advocate {userInfo.firstName} {userInfo.lastName}
//                     </div>
//                     <div className="text-xs text-slate-500 font-medium">
//                       Mumbai High Court
//                     </div>
//                   </>
//                 ) : (
//                   <>
//                     <div className="text-lg font-bold text-slate-800">Nexintel AI</div>
//                     <div className="text-xs text-slate-500 font-medium">Legal Intelligence Suite</div>
//                   </>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
        
//         {isCollapsed && !isMobileView && (
//           <div className="flex justify-center">
//             {userInfo ? (
//               <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
//                 {userInfo.firstName ? userInfo.firstName.charAt(0).toUpperCase() : ''}
//               </div>
//             ) : (
//               <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
//                 <ScaleIcon className="h-5 w-5 text-white" />
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* New Case Button */}
//       <div className="p-4">
//         <button className="w-full bg-slate-800 text-white rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md">
//           <PlusIcon className="h-5 w-5" />
//           <span className={`${isCollapsed && !isMobileView ? 'hidden' : 'inline ml-2'}`}>
//             New Case Analysis
//           </span>
//         </button>
//       </div>

//       {/* Navigation */}
//       <div className="flex-1 overflow-y-auto px-2 pb-4">
//         <div className="mb-6">
//           {(!isCollapsed || isMobileView) && (
//             <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-3">
//               Navigation
//             </div>
//           )}
//           <nav className="space-y-1">
//             {navigationItems.map((item) => {
//               const Icon = item.icon;
//               const active = isActive(item.path);
              
//               return (
//                 <Link
//                   key={item.path}
//                   to={item.path}
//                   className={`group flex items-center ${isCollapsed && !isMobileView ? 'justify-center px-2' : 'px-3'} py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
//                     active
//                       ? 'bg-slate-100 text-slate-900 border border-slate-200'
//                       : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
//                   }`}
//                   title={isCollapsed && !isMobileView ? item.name : undefined}
//                 >
//                   <Icon 
//                     className={`h-5 w-5 ${isCollapsed && !isMobileView ? '' : 'mr-3'} transition-colors duration-200 ${
//                       active 
//                         ? 'text-slate-700' 
//                         : 'text-slate-500 group-hover:text-slate-700'
//                     }`} 
//                   />
//                   <span className={`${isCollapsed && !isMobileView ? 'hidden' : 'inline'} transition-all duration-200`}>
//                     {item.name}
//                   </span>
//                   {active && (!isCollapsed || isMobileView) && (
//                     <div className="ml-auto w-2 h-2 bg-slate-600 rounded-full"></div>
//                   )}
//                 </Link>
//               );
//             })}
//           </nav>
//         </div>

//         {/* Role Selection */}
//         <RoleSelection isCollapsed={isCollapsed && !isMobileView} />
        
//         {/* Legal Intelligence */}
//         <LegalIntelligence isCollapsed={isCollapsed && !isMobileView} />

//         {/* Recent Cases - Only show when expanded */}
//         {(!isCollapsed || isMobileView) && (
//           <div className="mb-6">
//             <div className="flex items-center justify-between px-3 mb-3">
//               <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
//                 Recent Cases
//               </div>
//               <ClockIcon className="h-4 w-4 text-slate-400" />
//             </div>
//             <div className="space-y-2">
//               {recentCases.map((case_, index) => (
//                 <div
//                   key={index}
//                   className="p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-slate-200 group"
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1 min-w-0">
//                       <div className="text-sm font-semibold text-slate-800 truncate group-hover:text-slate-900 transition-colors duration-200">
//                         {case_.title}
//                       </div>
//                       <div className="flex items-center justify-between mt-1">
//                         <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
//                           {case_.type}
//                         </span>
//                       </div>
//                       <div className="text-xs text-slate-500 mt-1 flex items-center">
//                         <ClockIcon className="h-3 w-3 mr-1" />
//                         {case_.time}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <button className="w-full text-xs text-slate-600 hover:text-slate-800 font-medium mt-3 py-2 hover:bg-slate-50 rounded-lg transition-all duration-200">
//               View All Cases →
//             </button>
//           </div>
//         )}

//         {/* Quick Tools */}
//         <QuickTools isCollapsed={isCollapsed && !isMobileView} />
//       </div>

//       {/* Footer */}
//       <div className="p-4 border-t border-slate-200 bg-white">
//         {(!isCollapsed || isMobileView) && (
//           <div className="space-y-3">
//             <button className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg py-2.5 text-sm font-medium transition-all duration-200">
//               <span>🌐</span>
//               <span>English | हिंदी | मराठी</span>
//             </button>
//             <button className="w-full flex items-center justify-center space-x-2 text-slate-500 hover:text-slate-700 text-xs font-medium transition-all duration-200">
//               <Cog6ToothIcon className="h-4 w-4" />
//               <span>Settings & Preferences</span>
//             </button>
//           </div>
//         )}
        
//         {isCollapsed && !isMobileView && (
//           <div className="flex flex-col space-y-2">
//             <button className="w-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg py-2 text-sm transition-all duration-200">
//               <span>🌐</span>
//             </button>
//             <button className="w-full flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all duration-200">
//               <Cog6ToothIcon className="h-4 w-4" />
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <>
//       {/* Mobile Header */}
//       <MobileHeader />

//       {/* Desktop Sidebar */}
//       <div
//         className={`hidden lg:flex bg-white border-r border-slate-200 flex-col transition-all duration-300 ease-in-out shadow-sm ${
//           isCollapsed ? 'w-20' : 'w-80'
//         } relative h-screen`}
//       >
//         <SidebarContent />
//       </div>

//       {/* Mobile Overlay */}
//       {isMobileMenuOpen && (
//         <div className="lg:hidden fixed inset-0 z-50 flex">
//           {/* Backdrop */}
//           <div
//             className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
//             onClick={() => setIsMobileMenuOpen(false)}
//           />
          
//           {/* Sidebar Drawer */}
//           <div className="relative flex flex-col w-80 max-w-xs bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
//             <SidebarContent isMobileView={true} />
//           </div>
//         </div>
//       )}

//       {/* Spacer for mobile header */}
//       <div className="lg:hidden h-16" />
//     </>
//   );
// };

// export default Sidebar;



// import React, { useState, useEffect, useRef } from 'react';
// import {
//   ChevronLeftIcon,
//   ChevronRightIcon,
//   PlusIcon, // Keep if used for "New Case Analysis"
//   ChartBarIcon,
//   DocumentTextIcon,
//   MagnifyingGlassCircleIcon,
//   PencilSquareIcon,
//   ScaleIcon,
//   BookOpenIcon,
//   ClockIcon,
//   UserGroupIcon,
//   Cog6ToothIcon,
//   Bars3Icon,
//   XMarkIcon,
// } from '@heroicons/react/24/outline';
// import {
//   FolderPlus, // From lucide-react
//   FileUp,     // From lucide-react
//   Home,       // From lucide-react
//   Folder,     // From lucide-react
//   Upload,     // From lucide-react
//   ChevronDown, // From lucide-react
//   ChevronRight, // From lucide-react
// } from 'lucide-react'; // Import from lucide-react
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import RoleSelection from './RoleSelection';
// import LegalIntelligence from './LegalIntelligence';
// import QuickTools from './QuickTools';
// import { useFileManager } from '../context/FileManagerContext';

// const Sidebar = () => {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();

//   const {
//     fileInputRef,
//     folderInputRef,
//     createFolder,
//     uploadFiles,
//     loadFolderContents,
//     selectFolder,
//     setShowNewFolderInput,
//     showNewFolderInput,
//     newFolderName,
//     setNewFolderName,
//     creatingFolder,
//     setError,
//     setSuccess,
//     folders,
//     expandedFolders,
//     toggleFolder,
//     selectedFolder,
//     loadUserFiles,
//     handleFileChange, // Add handleFileChange
//     handleFolderChange, // Add handleFolderChange
//   } = useFileManager();


//   // Check if device is mobile/tablet
//   useEffect(() => {
//     const checkDevice = () => {
//       setIsMobile(window.innerWidth < 1024); // lg breakpoint
//       if (window.innerWidth < 1024) {
//         setIsMobileMenuOpen(false); // Close mobile menu on resize
//       }
//     };

//     checkDevice();
//     window.addEventListener('resize', checkDevice);
//     return () => window.removeEventListener('resize', checkDevice);
//   }, []);

//   // Close mobile menu when route changes
//   useEffect(() => {
//     setIsMobileMenuOpen(false);
//   }, [location.pathname]);

//   // Prevent body scroll when mobile menu is open
//   useEffect(() => {
//     if (isMobileMenuOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }
//     return () => {
//       document.body.style.overflow = 'unset';
//     };
//   }, [isMobileMenuOpen]);

//   const toggleSidebar = () => {
//     if (isMobile) {
//       setIsMobileMenuOpen(!isMobileMenuOpen);
//     } else {
//       setIsCollapsed(!isCollapsed);
//     }
//   };

//   const isActive = (path) => {
//     return location.pathname === path;
//   };

//   const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false); // New state for submenu

//   const navigationItems = [
//     { name: 'Dashboard', path: '/dashboard', icon: ChartBarIcon },
//     {
//       name: 'Document Upload',
//       path: '/upload',
//       icon: DocumentTextIcon,
//       hasSubMenu: true,
//       subMenu: [
//         { name: 'My Drive', path: '/upload', action: 'view_all_files' },
//         { name: 'Create Folder', path: '/upload', action: 'create_folder' },
//         { name: 'Upload Files', path: '/upload', action: 'upload_files' },
//         { name: 'Upload Folder', path: '/upload', action: 'upload_folder' },
//       ]
//     },
//     { name: 'AI Analysis', path: '/analysis', icon: MagnifyingGlassCircleIcon },
//     { name: 'Document Drafting', path: '/drafting', icon: PencilSquareIcon },
//     // { name: 'Case Management', path: '/cases', icon: ScaleIcon },
//     // { name: 'Legal Research', path: '/research', icon: BookOpenIcon },
//     // { name: 'Client Portal', path: '/clients', icon: UserGroupIcon },
//   ];

//   const recentCases = [
//     {
//       title: 'Sharma v. State of Maharashtra',
//       type: 'Civil Appeal',
//       time: '2 hours ago',
//       status: 'active'
//     },
//     {
//       title: 'Tech Solutions Ltd. Contract Dispute',
//       type: 'Commercial',
//       time: 'Yesterday',
//       status: 'pending'
//     },
//     {
//       title: 'Property Rights Case - Pune',
//       type: 'Property Law',
//       time: '3 days ago',
//       status: 'completed'
//     },
//   ];

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'active': return 'bg-green-100 text-green-800';
//       case 'pending': return 'bg-yellow-100 text-yellow-800';
//       case 'completed': return 'bg-blue-100 text-blue-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   // Mobile Header Component
//   const MobileHeader = () => (
//     <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
//       <div className="flex items-center space-x-3">
//         <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
//           <ScaleIcon className="h-5 w-5 text-white" />
//         </div>
//         <div>
//           <div className="text-lg font-bold text-slate-800">Nexintel AI</div>
//           <div className="text-xs text-slate-500 font-medium">Legal Intelligence Suite</div>
//         </div>
//       </div>
//       <button
//         onClick={() => setIsMobileMenuOpen(true)}
//         className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
//       >
//         <Bars3Icon className="h-6 w-6 text-slate-600" />
//       </button>
//     </div>
//   );

//   // Sidebar Content Component
//   const SidebarContent = ({ isMobileView = false, searchQuery, folders, expandedFolders, toggleFolder, selectFolder, selectedFolder, showNewFolderInput, newFolderName, setNewFolderName, creatingFolder, createFolder, setShowNewFolderInput, fileInputRef, handleFileChange, folderInputRef, handleFolderChange }) => (
//     <div className="flex flex-col h-full">
//       {/* Header for Desktop or Mobile Drawer Header */}
//       <div className={`px-4 py-3 border-b border-slate-200 relative bg-white ${isMobileView ? '' : 'hidden lg:block'}`}>
//         {!isMobileView && (
//           <button
//             onClick={toggleSidebar}
//             className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-white border border-slate-300 rounded-full p-1.5 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-200 z-10"
//           >
//             {isCollapsed ? (
//               <ChevronRightIcon className="h-4 w-4 text-slate-600" />
//             ) : (
//               <ChevronLeftIcon className="h-4 w-4 text-slate-600" />
//             )}
//           </button>
//         )}

//         {isMobileView && (
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
//                 <ScaleIcon className="h-5 w-5 text-white" />
//               </div>
//               <div>
//                 <div className="text-lg font-bold text-slate-800">Nexintel AI</div>
//                 <div className="text-xs text-slate-500 font-medium">Legal Intelligence Suite</div>
//               </div>
//             </div>
//             <button
//               onClick={() => setIsMobileMenuOpen(false)}
//               className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
//             >
//               <XMarkIcon className="h-6 w-6 text-slate-600" />
//             </button>
//           </div>
//         )}
        
//         <div className={`transition-all duration-300 ${isCollapsed && !isMobileView ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
//           {(!isCollapsed || isMobileView) && !isMobileView && (
//             <div className="flex items-center space-x-3">
//               <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
//                 <ScaleIcon className="h-5 w-5 text-white" />
//               </div>
//               <div>
//                 <div className="text-lg font-bold text-slate-800">Nexintel AI</div>
//                 <div className="text-xs text-slate-500 font-medium">Legal Intelligence Suite</div>
//               </div>
//             </div>
//           )}
//         </div>
        
//         {isCollapsed && !isMobileView && (
//           <div className="flex justify-center">
//             <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
//               <ScaleIcon className="h-5 w-5 text-white" />
//             </div>
//           </div>
//         )}
//       </div>

//       {/* New Case Button */}
//       <div className="p-4">
//         <button
//           onClick={() => navigate('/analysis', { state: { newChat: true } })}
//           className="w-full bg-slate-800 text-white rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
//         >
//           <PlusIcon className="h-5 w-5" />
//           <span className={`${isCollapsed && !isMobileView ? 'hidden' : 'inline ml-2'}`}>
//             New Case Analysis
//           </span>
//         </button>
//       </div>

//       {/* Navigation */}
//       <div className="flex-1 overflow-y-auto px-2 pb-4">
//         <div className="mb-6">
//           {(!isCollapsed || isMobileView) && (
//             <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-3">
//               Navigation
//             </div>
//           )}
//           <nav className="space-y-1">
//             {navigationItems.map((item) => {
//               const Icon = item.icon;
//               const active = isActive(item.path);
//               const isDocumentUpload = item.name === 'Document Upload';

//               return (
//                 <div key={item.name}>
//                   <button
//                     onClick={() => {
//                       if (isDocumentUpload) {
//                         setIsDocumentUploadOpen(!isDocumentUploadOpen);
//                       } else {
//                         navigate(item.path);
//                       }
//                     }}
//                     className={`group flex items-center w-full ${isCollapsed && !isMobileView ? 'justify-center px-2' : 'px-3'} py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
//                       active
//                         ? 'bg-slate-100 text-slate-900 border border-slate-200'
//                         : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
//                     }`}
//                     title={isCollapsed && !isMobileView ? item.name : undefined}
//                   >
//                     <Icon
//                       className={`h-5 w-5 ${isCollapsed && !isMobileView ? '' : 'mr-3'} transition-colors duration-200 ${
//                         active
//                           ? 'text-slate-700'
//                           : 'text-slate-500 group-hover:text-slate-700'
//                       }`}
//                     />
//                     <span className={`${isCollapsed && !isMobileView ? 'hidden' : 'inline'} transition-all duration-200`}>
//                       {item.name}
//                     </span>
//                     {isDocumentUpload && (!isCollapsed || isMobileView) && (
//                       isDocumentUploadOpen ? (
//                         <ChevronDown className="h-4 w-4 ml-auto text-slate-500" />
//                       ) : (
//                         <ChevronRight className="h-4 w-4 ml-auto text-slate-500" />
//                       )
//                     )}
//                     {active && !isDocumentUpload && (!isCollapsed || isMobileView) && (
//                       <div className="ml-auto w-2 h-2 bg-slate-600 rounded-full"></div>
//                     )}
//                   </button>

//                   {isDocumentUpload && isDocumentUploadOpen && (!isCollapsed || isMobileView) && (
//                     <div className="ml-8 mt-1 space-y-1">
//                       {item.subMenu.map((subItem) => (
//                         <button
//                           key={subItem.name}
//                           onClick={() => {
//                             if (subItem.action === 'create_folder') {
//                               setShowNewFolderInput(!showNewFolderInput);
//                             } else if (subItem.action === 'upload_files') {
//                               fileInputRef.current?.click();
//                             } else if (subItem.action === 'upload_folder') {
//                               folderInputRef.current?.click();
//                             } else if (subItem.action === 'view_all_files') {
//                               selectFolder(null); // Go to My Drive (root)
//                               navigate(subItem.path);
//                             } else {
//                               navigate(subItem.path);
//                             }
//                           }}
//                           className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
//                             isActive(subItem.path) && subItem.action === 'view_all_files' && !selectedFolder
//                               ? 'bg-slate-100 text-slate-900 border border-slate-200'
//                               : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
//                           }`}
//                         >
//                           {subItem.action === 'create_folder' && <PlusIcon className="h-4 w-4 mr-2 text-slate-500" />}
//                           {subItem.action === 'upload_files' && <FileUp className="h-4 w-4 mr-2 text-slate-500" />}
//                           {subItem.action === 'upload_folder' && <FolderPlus className="h-4 w-4 mr-2 text-slate-500" />}
//                           {subItem.action === 'view_all_files' && <Home className="h-4 w-4 mr-2 text-slate-500" />}
//                           <span className="flex-1 text-left">{subItem.name}</span>
//                         </button>
//                       ))}
//                       {/* New Folder Input within Sidebar */}
//                       {showNewFolderInput && (
//                         <div className="px-3 py-2 bg-gray-50 rounded-lg">
//                           <input
//                             type="text"
//                             placeholder="Folder name"
//                             value={newFolderName}
//                             onChange={(e) => setNewFolderName(e.target.value)}
//                             className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
//                             onKeyPress={(e) => e.key === 'Enter' && createFolder()}
//                             autoFocus
//                           />
//                           <div className="flex gap-2 mt-2">
//                             <button
//                               onClick={createFolder}
//                               disabled={creatingFolder}
//                               className="flex-1 bg-blue-600 text-white text-xs py-1.5 px-3 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
//                             >
//                               {creatingFolder ? 'Creating...' : 'Create'}
//                             </button>
//                             <button
//                               onClick={() => {
//                                 setShowNewFolderInput(false);
//                                 setNewFolderName('');
//                               }}
//                               className="flex-1 bg-gray-300 text-gray-700 text-xs py-1.5 px-3 rounded hover:bg-gray-400 transition-colors"
//                             >
//                               Cancel
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                       {/* Folder Tree within Sidebar */}
//                       <div className="mt-4 space-y-1">
//                         {folders.length > 0 ? (
//                           <FolderTreeComponent
//                             items={folders}
//                             expandedFolders={expandedFolders}
//                             toggleFolder={toggleFolder}
//                             selectFolder={selectFolder}
//                             selectedFolder={selectedFolder}
//                             searchQuery={searchQuery} // Pass searchQuery as a prop
//                           />
//                         ) : (
//                           <div className="text-center text-xs text-gray-500 py-2">No folders</div>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </nav>
//         </div>

//         {/* Role Selection */}
//         <RoleSelection isCollapsed={isCollapsed && !isMobileView} />
        
//         {/* Legal Intelligence */}
//         <LegalIntelligence isCollapsed={isCollapsed && !isMobileView} />

//         {/* Recent Cases - Only show when expanded */}
//         {(!isCollapsed || isMobileView) && (
//           <div className="mb-6">
//             <div className="flex items-center justify-between px-3 mb-3">
//               <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
//                 Recent Cases
//               </div>
//               <ClockIcon className="h-4 w-4 text-slate-400" />
//             </div>
//             <div className="space-y-2">
//               {recentCases.map((case_, index) => (
//                 <div
//                   key={index}
//                   className="p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-slate-200 group"
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1 min-w-0">
//                       <div className="text-sm font-semibold text-slate-800 truncate group-hover:text-slate-900 transition-colors duration-200">
//                         {case_.title}
//                       </div>
//                       <div className="flex items-center justify-between mt-1">
//                         <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
//                           {case_.type}
//                         </span>
//                       </div>
//                       <div className="text-xs text-slate-500 mt-1 flex items-center">
//                         <ClockIcon className="h-3 w-3 mr-1" />
//                         {case_.time}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <button className="w-full text-xs text-slate-600 hover:text-slate-800 font-medium mt-3 py-2 hover:bg-slate-50 rounded-lg transition-all duration-200">
//               View All Cases →
//             </button>
//           </div>
//         )}

//         {/* Quick Tools */}
//         <QuickTools isCollapsed={isCollapsed && !isMobileView} />
//       </div>

//       {/* Footer */}
//       <div className="p-4 border-t border-slate-200 bg-white">
//         {(!isCollapsed || isMobileView) && (
//           <div className="space-y-3">
//             <button className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg py-2.5 text-sm font-medium transition-all duration-200">
//               <span>🌐</span>
//               <span>English | हिंदी | मराठी</span>
//             </button>
//             <button className="w-full flex items-center justify-center space-x-2 text-slate-500 hover:text-slate-700 text-xs font-medium transition-all duration-200">
//               <Cog6ToothIcon className="h-4 w-4" />
//               <span>Settings & Preferences</span>
//             </button>
//           </div>
//         )}
        
//         {isCollapsed && !isMobileView && (
//           <div className="flex flex-col space-y-2">
//             <button className="w-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg py-2 text-sm transition-all duration-200">
//               <span>🌐</span>
//             </button>
//             <button className="w-full flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all duration-200">
//               <Cog6ToothIcon className="h-4 w-4" />
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <>
//       {/* Mobile Header */}
//       <MobileHeader />

//       {/* Desktop Sidebar */}
//       <div
//         className={`hidden lg:flex bg-white border-r border-slate-200 flex-col transition-all duration-300 ease-in-out shadow-sm ${
//           isCollapsed ? 'w-20' : 'w-80'
//         } relative h-screen`}
//       >
//         <SidebarContent
//           searchQuery={searchQuery}
//           folders={folders}
//           expandedFolders={expandedFolders}
//           toggleFolder={toggleFolder}
//           selectFolder={selectFolder}
//           selectedFolder={selectedFolder}
//           showNewFolderInput={showNewFolderInput}
//           newFolderName={newFolderName}
//           setNewFolderName={setNewFolderName}
//           creatingFolder={creatingFolder}
//           createFolder={createFolder}
//           setShowNewFolderInput={setShowNewFolderInput}
//           fileInputRef={fileInputRef}
//           handleFileChange={handleFileChange}
//           folderInputRef={folderInputRef}
//           handleFolderChange={handleFolderChange}
//         />
//       </div>

//       {/* Mobile Overlay */}
//       {isMobileMenuOpen && (
//         <div className="lg:hidden fixed inset-0 z-50 flex">
//           {/* Backdrop */}
//           <div
//             className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
//             onClick={() => setIsMobileMenuOpen(false)}
//           />
          
//           {/* Sidebar Drawer */}
//           <div className="relative flex flex-col w-80 max-w-xs bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
//             <SidebarContent
//               isMobileView={true}
//               searchQuery={searchQuery}
//               folders={folders}
//               expandedFolders={expandedFolders}
//               toggleFolder={toggleFolder}
//               selectFolder={selectFolder}
//               selectedFolder={selectedFolder}
//               showNewFolderInput={showNewFolderInput}
//               newFolderName={newFolderName}
//               setNewFolderName={setNewFolderName}
//               creatingFolder={creatingFolder}
//               createFolder={createFolder}
//               setShowNewFolderInput={setShowNewFolderInput}
//               fileInputRef={fileInputRef}
//               handleFileChange={handleFileChange}
//               folderInputRef={folderInputRef}
//               handleFolderChange={handleFolderChange}
//             />
//           </div>
//         </div>
//       )}

//       {/* Hidden file inputs */}
//       <input
//         ref={fileInputRef}
//         type="file"
//         multiple
//         onChange={handleFileChange}
//         className="hidden"
//         accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
//       />
//       <input
//         ref={folderInputRef}
//         type="file"
//         multiple
//         onChange={handleFolderChange}
//         className="hidden"
//         webkitdirectory=""
//         directory=""
//       />
//     </>
//   );
// };

// // Helper component for rendering folder tree
// const FolderTreeComponent = ({ items, level = 0, parentPath = '', expandedFolders, toggleFolder, selectFolder, selectedFolder, searchQuery }) => {
//   return items
//     .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
//     .map((item, index) => {
//       const itemPath = parentPath ? `${parentPath}/${item.name}` : item.name;
//       const isExpanded = expandedFolders.has(itemPath);
//       const hasChildren = item.children && item.children.length > 0;
//       const isSelected = selectedFolder?.id === item.id;
      
//       return (
//         <div key={`${itemPath}-${index}`} className="select-none">
//           <button
//             onClick={() => selectFolder(item)}
//             className={`group flex items-center w-full py-1.5 px-3 mx-1 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
//               isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
//             }`}
//             style={{ paddingLeft: `${(level * 16) + 12}px` }} // Adjust padding for hierarchy
//           >
//             {hasChildren && (
//               <span
//                 onClick={(e) => {
//                   e.stopPropagation(); // Prevent button click from also selecting folder
//                   toggleFolder(itemPath);
//                 }}
//                 className="mr-2 p-0.5 rounded hover:bg-gray-200 transition-colors"
//               >
//                 {isExpanded ? (
//                   <ChevronDown className="w-4 h-4 text-gray-400" />
//                 ) : (
//                   <ChevronRight className="w-4 h-4 text-gray-400" />
//                 )}
//               </span>
//             )}
//             {!hasChildren && <span className="w-4 h-4 mr-2" />} {/* Spacer for alignment */}
//             <Folder className={`h-4 w-4 mr-2 flex-shrink-0 ${
//               isSelected ? 'text-blue-600' : 'text-gray-400'
//             }`} />
//             <span className="text-sm truncate">{item.name}</span>
//           </button>
          
//           {hasChildren && isExpanded && (
//             <div className="mt-0.5">
//               <FolderTreeComponent
//                 items={item.children}
//                 level={level + 1}
//                 parentPath={itemPath}
//                 expandedFolders={expandedFolders}
//                 toggleFolder={toggleFolder}
//                 selectFolder={selectFolder}
//                 selectedFolder={selectedFolder}
//                 searchQuery={searchQuery}
//               />
//             </div>
//           )}
//         </div>
//       );
//     });
// };

// export default Sidebar;

// import React, { useState, useEffect, useRef } from 'react';
// import {
//   ChevronLeftIcon,
//   ChevronRightIcon,
//   PlusIcon, // Keep if used for "New Case Analysis"
//   ChartBarIcon,
//   DocumentTextIcon,
//   MagnifyingGlassCircleIcon,
//   PencilSquareIcon,
//   ScaleIcon,
//   BookOpenIcon,
//   ClockIcon,
//   UserGroupIcon,
//   Cog6ToothIcon,
//   Bars3Icon,
//   XMarkIcon,
// } from '@heroicons/react/24/outline';
// import {
//   FolderPlus, // From lucide-react
//   FileUp,     // From lucide-react
//   Home,       // From lucide-react
//   Folder,     // From lucide-react
//   Upload,     // From lucide-react
//   ChevronDown, // From lucide-react
//   ChevronRight, // From lucide-react
// } from 'lucide-react'; // Import from lucide-react
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import RoleSelection from './RoleSelection';
// import LegalIntelligence from './LegalIntelligence';
// import QuickTools from './QuickTools';
// import { useFileManager } from '../context/FileManagerContext';

// const Sidebar = () => {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false); // State for submenu
//   const location = useLocation();
//   const navigate = useNavigate();

//   const {
//     fileInputRef,
//     folderInputRef,
//     createFolder,
//     uploadFiles,
//     loadFolderContents,
//     selectFolder,
//     setShowNewFolderInput,
//     showNewFolderInput,
//     newFolderName,
//     setNewFolderName,
//     creatingFolder,
//     setError,
//     setSuccess,
//     folders,
//     expandedFolders,
//     toggleFolder,
//     selectedFolder,
//     loadUserFiles,
//     handleFileChange, // Add handleFileChange
//     handleFolderChange, // Add handleFolderChange
//   } = useFileManager();

//   // Add searchQuery state for the folder tree (if not provided by context)
//   const [searchQuery, setSearchQuery] = useState('');

//   // Check if device is mobile/tablet
//   useEffect(() => {
//     const checkDevice = () => {
//       setIsMobile(window.innerWidth < 1024); // lg breakpoint
//       if (window.innerWidth < 1024) {
//         setIsMobileMenuOpen(false); // Close mobile menu on resize
//       }
//     };

//     checkDevice();
//     window.addEventListener('resize', checkDevice);
//     return () => window.removeEventListener('resize', checkDevice);
//   }, []);

//   // Close mobile menu when route changes
//   useEffect(() => {
//     setIsMobileMenuOpen(false);
//   }, [location.pathname]);

//   // Prevent body scroll when mobile menu is open
//   useEffect(() => {
//     if (isMobileMenuOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }
//     return () => {
//       document.body.style.overflow = 'unset';
//     };
//   }, [isMobileMenuOpen]);

//   const toggleSidebar = () => {
//     if (isMobile) {
//       setIsMobileMenuOpen(!isMobileMenuOpen);
//     } else {
//       setIsCollapsed(!isCollapsed);
//     }
//   };

//   const isActive = (path) => {
//     return location.pathname === path;
//   };

//   const navigationItems = [
//     { name: 'Dashboard', path: '/dashboard', icon: ChartBarIcon },
//     {
//       name: 'Document Upload',
//       path: '/upload',
//       icon: DocumentTextIcon,
//       hasSubMenu: true,
//       subMenu: [
//         { name: 'My Drive', path: '/upload', action: 'view_all_files' },
//         { name: 'Create Folder', path: '/upload', action: 'create_folder' },
//         { name: 'Upload Files', path: '/upload', action: 'upload_files' },
//         { name: 'Upload Folder', path: '/upload', action: 'upload_folder' },
//       ]
//     },
//     { name: 'AI Analysis', path: '/analysis', icon: MagnifyingGlassCircleIcon },
//     { name: 'Document Drafting', path: '/drafting', icon: PencilSquareIcon },
//     // { name: 'Case Management', path: '/cases', icon: ScaleIcon },
//     // { name: 'Legal Research', path: '/research', icon: BookOpenIcon },
//     // { name: 'Client Portal', path: '/clients', icon: UserGroupIcon },
//   ];

//   const recentCases = [
//     {
//       title: 'Sharma v. State of Maharashtra',
//       type: 'Civil Appeal',
//       time: '2 hours ago',
//       status: 'active'
//     },
//     {
//       title: 'Tech Solutions Ltd. Contract Dispute',
//       type: 'Commercial',
//       time: 'Yesterday',
//       status: 'pending'
//     },
//     {
//       title: 'Property Rights Case - Pune',
//       type: 'Property Law',
//       time: '3 days ago',
//       status: 'completed'
//     },
//   ];

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'active': return 'bg-green-100 text-green-800';
//       case 'pending': return 'bg-yellow-100 text-yellow-800';
//       case 'completed': return 'bg-blue-100 text-blue-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   // Mobile Header Component
//   const MobileHeader = () => (
//     <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
//       <div className="flex items-center space-x-3">
//         <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
//           <ScaleIcon className="h-5 w-5 text-white" />
//         </div>
//         <div>
//           <div className="text-lg font-bold text-slate-800">Nexintel AI</div>
//           <div className="text-xs text-slate-500 font-medium">Legal Intelligence Suite</div>
//         </div>
//       </div>
//       <button
//         onClick={() => setIsMobileMenuOpen(true)}
//         className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
//       >
//         <Bars3Icon className="h-6 w-6 text-slate-600" />
//       </button>
//     </div>
//   );

//   // Sidebar Content Component
//   const SidebarContent = ({ isMobileView = false }) => (
//     <div className="flex flex-col h-full">
//       {/* Header for Desktop or Mobile Drawer Header */}
//       <div className={`px-4 py-3 border-b border-slate-200 relative bg-white ${isMobileView ? '' : 'hidden lg:block'}`}>
//         {!isMobileView && (
//           <button
//             onClick={toggleSidebar}
//             className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-white border border-slate-300 rounded-full p-1.5 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-200 z-10"
//           >
//             {isCollapsed ? (
//               <ChevronRightIcon className="h-4 w-4 text-slate-600" />
//             ) : (
//               <ChevronLeftIcon className="h-4 w-4 text-slate-600" />
//             )}
//           </button>
//         )}

//         {isMobileView && (
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
//                 <ScaleIcon className="h-5 w-5 text-white" />
//               </div>
//               <div>
//                 <div className="text-lg font-bold text-slate-800">Nexintel AI</div>
//                 <div className="text-xs text-slate-500 font-medium">Legal Intelligence Suite</div>
//               </div>
//             </div>
//             <button
//               onClick={() => setIsMobileMenuOpen(false)}
//               className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
//             >
//               <XMarkIcon className="h-6 w-6 text-slate-600" />
//             </button>
//           </div>
//         )}
        
//         <div className={`transition-all duration-300 ${isCollapsed && !isMobileView ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
//           {(!isCollapsed || isMobileView) && !isMobileView && (
//             <div className="flex items-center space-x-3">
//               <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
//                 <ScaleIcon className="h-5 w-5 text-white" />
//               </div>
//               <div>
//                 <div className="text-lg font-bold text-slate-800">Nexintel AI</div>
//                 <div className="text-xs text-slate-500 font-medium">Legal Intelligence Suite</div>
//               </div>
//             </div>
//           )}
//         </div>
        
//         {isCollapsed && !isMobileView && (
//           <div className="flex justify-center">
//             <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
//               <ScaleIcon className="h-5 w-5 text-white" />
//             </div>
//           </div>
//         )}
//       </div>

//       {/* New Case Button */}
//       <div className="p-4">
//         <button
//           onClick={() => navigate('/analysis', { state: { newChat: true } })}
//           className="w-full bg-slate-800 text-white rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
//         >
//           <PlusIcon className="h-5 w-5" />
//           <span className={`${isCollapsed && !isMobileView ? 'hidden' : 'inline ml-2'}`}>
//             New Case Analysis
//           </span>
//         </button>
//       </div>

//       {/* Navigation */}
//       <div className="flex-1 overflow-y-auto px-2 pb-4">
//         <div className="mb-6">
//           {(!isCollapsed || isMobileView) && (
//             <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-3">
//               Navigation
//             </div>
//           )}
//           <nav className="space-y-1">
//             {navigationItems.map((item) => {
//               const Icon = item.icon;
//               const active = isActive(item.path);
//               const isDocumentUpload = item.name === 'Document Upload';

//               return (
//                 <div key={item.name}>
//                   <button
//                     onClick={() => {
//                       if (isDocumentUpload) {
//                         setIsDocumentUploadOpen(prev => !prev);
//                       } else {
//                         navigate(item.path);
//                       }
//                     }}
//                     className={`group flex items-center w-full ${isCollapsed && !isMobileView ? 'justify-center px-2' : 'px-3'} py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
//                       active
//                         ? 'bg-slate-100 text-slate-900 border border-slate-200'
//                         : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
//                     }`}
//                     title={isCollapsed && !isMobileView ? item.name : undefined}
//                   >
//                     <Icon
//                       className={`h-5 w-5 ${isCollapsed && !isMobileView ? '' : 'mr-3'} transition-colors duration-200 ${
//                         active
//                           ? 'text-slate-700'
//                           : 'text-slate-500 group-hover:text-slate-700'
//                       }`}
//                     />
//                     <span className={`${isCollapsed && !isMobileView ? 'hidden' : 'inline'} transition-all duration-200`}>
//                       {item.name}
//                     </span>
//                     {isDocumentUpload && (!isCollapsed || isMobileView) && (
//                       <div className="ml-auto">
//                         {isDocumentUploadOpen ? (
//                           <ChevronDown className="h-4 w-4 text-slate-500" />
//                         ) : (
//                           <ChevronRight className="h-4 w-4 text-slate-500" />
//                         )}
//                       </div>
//                     )}
//                     {active && !isDocumentUpload && (!isCollapsed || isMobileView) && (
//                       <div className="ml-auto w-2 h-2 bg-slate-600 rounded-full"></div>
//                     )}
//                   </button>

//                   {/* Submenu - Only show if it's Document Upload and submenu is open and not collapsed */}
//                   {isDocumentUpload && isDocumentUploadOpen && (!isCollapsed || isMobileView) && (
//                     <div className="ml-8 mt-1 space-y-1">
//                       {item.subMenu.map((subItem) => (
//                         <button
//                           key={subItem.name}
//                           onClick={() => {
//                             if (subItem.action === 'create_folder') {
//                               setShowNewFolderInput(!showNewFolderInput);
//                             } else if (subItem.action === 'upload_files') {
//                               fileInputRef.current?.click();
//                             } else if (subItem.action === 'upload_folder') {
//                               folderInputRef.current?.click();
//                             } else if (subItem.action === 'view_all_files') {
//                               selectFolder(null); // Go to My Drive (root)
//                               navigate(subItem.path);
//                             } else {
//                               navigate(subItem.path);
//                             }
//                           }}
//                           className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
//                             isActive(subItem.path) && subItem.action === 'view_all_files' && !selectedFolder
//                               ? 'bg-slate-100 text-slate-900 border border-slate-200'
//                               : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
//                           }`}
//                         >
//                           {subItem.action === 'create_folder' && <PlusIcon className="h-4 w-4 mr-2 text-slate-500" />}
//                           {subItem.action === 'upload_files' && <FileUp className="h-4 w-4 mr-2 text-slate-500" />}
//                           {subItem.action === 'upload_folder' && <FolderPlus className="h-4 w-4 mr-2 text-slate-500" />}
//                           {subItem.action === 'view_all_files' && <Home className="h-4 w-4 mr-2 text-slate-500" />}
//                           <span className="flex-1 text-left">{subItem.name}</span>
//                         </button>
//                       ))}
                      
//                       {/* New Folder Input within Sidebar */}
//                       {showNewFolderInput && (
//                         <div className="px-3 py-2 bg-gray-50 rounded-lg">
//                           <input
//                             type="text"
//                             placeholder="Folder name"
//                             value={newFolderName}
//                             onChange={(e) => setNewFolderName(e.target.value)}
//                             className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
//                             onKeyPress={(e) => e.key === 'Enter' && createFolder()}
//                             autoFocus
//                           />
//                           <div className="flex gap-2 mt-2">
//                             <button
//                               onClick={createFolder}
//                               disabled={creatingFolder}
//                               className="flex-1 bg-blue-600 text-white text-xs py-1.5 px-3 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
//                             >
//                               {creatingFolder ? 'Creating...' : 'Create'}
//                             </button>
//                             <button
//                               onClick={() => {
//                                 setShowNewFolderInput(false);
//                                 setNewFolderName('');
//                               }}
//                               className="flex-1 bg-gray-300 text-gray-700 text-xs py-1.5 px-3 rounded hover:bg-gray-400 transition-colors"
//                             >
//                               Cancel
//                             </button>
//                           </div>
//                         </div>
//                       )}
                      
//                       {/* Folder Tree within Sidebar */}
//                       <div className="mt-4 space-y-1">
//                         {folders.length > 0 ? (
//                           <FolderTreeComponent
//                             items={folders}
//                             expandedFolders={expandedFolders}
//                             toggleFolder={toggleFolder}
//                             selectFolder={selectFolder}
//                             selectedFolder={selectedFolder}
//                             searchQuery={searchQuery}
//                           />
//                         ) : (
//                           <div className="text-center text-xs text-gray-500 py-2">No folders</div>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </nav>
//         </div>

//         {/* Role Selection */}
//         <RoleSelection isCollapsed={isCollapsed && !isMobileView} />
        
//         {/* Legal Intelligence */}
//         <LegalIntelligence isCollapsed={isCollapsed && !isMobileView} />

//         {/* Recent Cases - Only show when expanded */}
//         {(!isCollapsed || isMobileView) && (
//           <div className="mb-6">
//             <div className="flex items-center justify-between px-3 mb-3">
//               <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
//                 Recent Cases
//               </div>
//               <ClockIcon className="h-4 w-4 text-slate-400" />
//             </div>
//             <div className="space-y-2">
//               {recentCases.map((case_, index) => (
//                 <div
//                   key={index}
//                   className="p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-slate-200 group"
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1 min-w-0">
//                       <div className="text-sm font-semibold text-slate-800 truncate group-hover:text-slate-900 transition-colors duration-200">
//                         {case_.title}
//                       </div>
//                       <div className="flex items-center justify-between mt-1">
//                         <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
//                           {case_.type}
//                         </span>
//                       </div>
//                       <div className="text-xs text-slate-500 mt-1 flex items-center">
//                         <ClockIcon className="h-3 w-3 mr-1" />
//                         {case_.time}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <button className="w-full text-xs text-slate-600 hover:text-slate-800 font-medium mt-3 py-2 hover:bg-slate-50 rounded-lg transition-all duration-200">
//               View All Cases →
//             </button>
//           </div>
//         )}

//         {/* Quick Tools */}
//         <QuickTools isCollapsed={isCollapsed && !isMobileView} />
//       </div>

//       {/* Footer */}
//       <div className="p-4 border-t border-slate-200 bg-white">
//         {(!isCollapsed || isMobileView) && (
//           <div className="space-y-3">
//             <button className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg py-2.5 text-sm font-medium transition-all duration-200">
//               <span>🌐</span>
//               <span>English | हिंदी | मराठी</span>
//             </button>
//             <button className="w-full flex items-center justify-center space-x-2 text-slate-500 hover:text-slate-700 text-xs font-medium transition-all duration-200">
//               <Cog6ToothIcon className="h-4 w-4" />
//               <span>Settings & Preferences</span>
//             </button>
//           </div>
//         )}
        
//         {isCollapsed && !isMobileView && (
//           <div className="flex flex-col space-y-2">
//             <button className="w-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg py-2 text-sm transition-all duration-200">
//               <span>🌐</span>
//             </button>
//             <button className="w-full flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all duration-200">
//               <Cog6ToothIcon className="h-4 w-4" />
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <>
//       {/* Mobile Header */}
//       <MobileHeader />

//       {/* Desktop Sidebar */}
//       <div
//         className={`hidden lg:flex bg-white border-r border-slate-200 flex-col transition-all duration-300 ease-in-out shadow-sm ${
//           isCollapsed ? 'w-20' : 'w-80'
//         } relative h-screen`}
//       >
//         <SidebarContent />
//       </div>

//       {/* Mobile Overlay */}
//       {isMobileMenuOpen && (
//         <div className="lg:hidden fixed inset-0 z-50 flex">
//           {/* Backdrop */}
//           <div
//             className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
//             onClick={() => setIsMobileMenuOpen(false)}
//           />
          
//           {/* Sidebar Drawer */}
//           <div className="relative flex flex-col w-80 max-w-xs bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
//             <SidebarContent isMobileView={true} />
//           </div>
//         </div>
//       )}

//       {/* Hidden file inputs */}
//       <input
//         ref={fileInputRef}
//         type="file"
//         multiple
//         onChange={handleFileChange}
//         className="hidden"
//         accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
//       />
//       <input
//         ref={folderInputRef}
//         type="file"
//         multiple
//         onChange={handleFolderChange}
//         className="hidden"
//         webkitdirectory=""
//         directory=""
//       />
//     </>
//   );
// };

// // Helper component for rendering folder tree
// const FolderTreeComponent = ({ items, level = 0, parentPath = '', expandedFolders, toggleFolder, selectFolder, selectedFolder, searchQuery = '' }) => {
//   return items
//     .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
//     .map((item, index) => {
//       const itemPath = parentPath ? `${parentPath}/${item.name}` : item.name;
//       const isExpanded = expandedFolders.has(itemPath);
//       const hasChildren = item.children && item.children.length > 0;
//       const isSelected = selectedFolder?.id === item.id;
      
//       return (
//         <div key={`${itemPath}-${index}`} className="select-none">
//           <button
//             onClick={() => selectFolder(item)}
//             className={`group flex items-center w-full py-1.5 px-3 mx-1 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
//               isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
//             }`}
//             style={{ paddingLeft: `${(level * 16) + 12}px` }} // Adjust padding for hierarchy
//           >
//             {hasChildren && (
//               <span
//                 onClick={(e) => {
//                   e.stopPropagation(); // Prevent button click from also selecting folder
//                   toggleFolder(itemPath);
//                 }}
//                 className="mr-2 p-0.5 rounded hover:bg-gray-200 transition-colors"
//               >
//                 {isExpanded ? (
//                   <ChevronDown className="w-4 h-4 text-gray-400" />
//                 ) : (
//                   <ChevronRight className="w-4 h-4 text-gray-400" />
//                 )}
//               </span>
//             )}
//             {!hasChildren && <span className="w-4 h-4 mr-2" />} {/* Spacer for alignment */}
//             <Folder className={`h-4 w-4 mr-2 flex-shrink-0 ${
//               isSelected ? 'text-blue-600' : 'text-gray-400'
//             }`} />
//             <span className="text-sm truncate">{item.name}</span>
//           </button>
          
//           {hasChildren && isExpanded && (
//             <div className="mt-0.5">
//               <FolderTreeComponent
//                 items={item.children}
//                 level={level + 1}
//                 parentPath={itemPath}
//                 expandedFolders={expandedFolders}
//                 toggleFolder={toggleFolder}
//                 selectFolder={selectFolder}
//                 selectedFolder={selectedFolder}
//                 searchQuery={searchQuery}
//               />
//             </div>
//           )}
//         </div>
//       );
//     });
// };

// export default Sidebar;

// import React, { useState, useEffect, useRef } from 'react';
// import {
//   ChevronLeftIcon,
//   ChevronRightIcon,
//   PlusIcon, // Keep if used for "New Case Analysis"
//   ChartBarIcon,
//   DocumentTextIcon,
//   MagnifyingGlassCircleIcon,
//   PencilSquareIcon,
//   ScaleIcon,
//   BookOpenIcon,
//   ClockIcon,
//   UserGroupIcon,
//   Cog6ToothIcon,
//   Bars3Icon,
//   XMarkIcon,
// } from '@heroicons/react/24/outline';
// import {
//   FolderPlus, // From lucide-react
//   FileUp,     // From lucide-react
//   Home,       // From lucide-react
//   Folder,     // From lucide-react
//   Upload,     // From lucide-react
//   ChevronDown, // From lucide-react
//   ChevronRight, // From lucide-react
//   MessageSquare // From lucide-react
// } from 'lucide-react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import RoleSelection from './RoleSelection';
// import LegalIntelligence from './LegalIntelligence';
// import QuickTools from './QuickTools';
// import { useFileManager } from '../context/FileManagerContext';
 
//  const Sidebar = () => {
//    const [isCollapsed, setIsCollapsed] = useState(false);
//    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//    const [currentFileId, setCurrentFileId] = useState(null); // State to hold currentFileId
//   const [isMobile, setIsMobile] = useState(false);
//   const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false); // State for submenu
//   const location = useLocation();
//   const navigate = useNavigate();

//   const {
//     fileInputRef,
//     folderInputRef,
//     setShowNewFolderInput,
//     showNewFolderInput,
//     newFolderName,
//     setNewFolderName,
//     creatingFolder,
//     createFolder,
//     handleFileChange,
//     handleFolderChange,
//   } = useFileManager();

//   // Check if device is mobile/tablet
//   useEffect(() => {
//     const checkDevice = () => {
//       setIsMobile(window.innerWidth < 1024); // lg breakpoint
//       if (window.innerWidth < 1024) {
//         setIsMobileMenuOpen(false); // Close mobile menu on resize
//       }
//     };

//     checkDevice();
//     window.addEventListener('resize', checkDevice);
//     return () => window.removeEventListener('resize', checkDevice);
//   }, []);

//   // Close mobile menu when route changes
//   useEffect(() => {
//     setIsMobileMenuOpen(false);
//   }, [location.pathname]);
 
//    // Load currentFileId from localStorage on mount
//    useEffect(() => {
//      setCurrentFileId(localStorage.getItem('currentFileId'));
//    }, []);

//    // Prevent body scroll when mobile menu is open
//    useEffect(() => {
//      if (isMobileMenuOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }
//     return () => {
//       document.body.style.overflow = 'unset';
//     };
//   }, [isMobileMenuOpen]);

//   const toggleSidebar = () => {
//     if (isMobile) {
//       setIsMobileMenuOpen(!isMobileMenuOpen);
//     } else {
//       setIsCollapsed(!isCollapsed);
//     }
//   };

//   const isActive = (path) => {
//     return location.pathname === path;
//   };

//   const navigationItems = [
//     { name: 'Dashboard', path: '/dashboard', icon: ChartBarIcon },
//     {
//       name: 'Document Upload',
//       path: '/upload',
//       icon: DocumentTextIcon,
//       hasSubMenu: true,
//       subMenu: [
//         { name: 'Create Folder', path: '/upload', action: 'create_folder' },
//         { name: 'Upload Files', path: '/upload', action: 'upload_files' },
//         { name: 'Upload Folder', path: '/upload', action: 'upload_folder' },
//       ]
//     },
//     { name: 'AI Analysis', path: '/analysis', icon: MagnifyingGlassCircleIcon },
//     { name: 'Chats', path: '/chats', icon: MessageSquare },
//     { name: 'Document Drafting', path: '/drafting', icon: PencilSquareIcon },
//     // { name: 'Case Management', path: '/cases', icon: ScaleIcon },
//     // { name: 'Legal Research', path: '/research', icon: BookOpenIcon },
//     // { name: 'Client Portal', path: '/clients', icon: UserGroupIcon },
//   ];

//   const recentCases = [
//     {
//       title: 'Sharma v. State of Maharashtra',
//       type: 'Civil Appeal',
//       time: '2 hours ago',
//       status: 'active'
//     },
//     {
//       title: 'Tech Solutions Ltd. Contract Dispute',
//       type: 'Commercial',
//       time: 'Yesterday',
//       status: 'pending'
//     },
//     {
//       title: 'Property Rights Case - Pune',
//       type: 'Property Law',
//       time: '3 days ago',
//       status: 'completed'
//     },
//   ];

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'active': return 'bg-green-100 text-green-800';
//       case 'pending': return 'bg-yellow-100 text-yellow-800';
//       case 'completed': return 'bg-blue-100 text-blue-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   // Mobile Header Component
//   const MobileHeader = () => (
//     <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
//       <div className="flex items-center space-x-3">
//         <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
//           <ScaleIcon className="h-5 w-5 text-white" />
//         </div>
//         <div>
//           <div className="text-lg font-bold text-slate-800">Nexintel AI</div>
//           <div className="text-xs text-slate-500 font-medium">Legal Intelligence Suite</div>
//         </div>
//       </div>
//       <button
//         onClick={() => setIsMobileMenuOpen(true)}
//         className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
//       >
//         <Bars3Icon className="h-6 w-6 text-slate-600" />
//       </button>
//     </div>
//   );

//   // Sidebar Content Component
//   const SidebarContent = ({ isMobileView = false }) => (
//     <div className="flex flex-col h-full">
//       {/* Header for Desktop or Mobile Drawer Header */}
//       <div className={`px-4 py-3 border-b border-slate-200 relative bg-white ${isMobileView ? '' : 'hidden lg:block'}`}>
//         {!isMobileView && (
//           <button
//             onClick={toggleSidebar}
//             className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-white border border-slate-300 rounded-full p-1.5 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-200 z-10"
//           >
//             {isCollapsed ? (
//               <ChevronRightIcon className="h-4 w-4 text-slate-600" />
//             ) : (
//               <ChevronLeftIcon className="h-4 w-4 text-slate-600" />
//             )}
//           </button>
//         )}

//         {isMobileView && (
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
//                 <ScaleIcon className="h-5 w-5 text-white" />
//               </div>
//               <div>
//                 <div className="text-lg font-bold text-slate-800">Nexintel AI</div>
//                 <div className="text-xs text-slate-500 font-medium">Legal Intelligence Suite</div>
//               </div>
//             </div>
//             <button
//               onClick={() => setIsMobileMenuOpen(false)}
//               className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
//             >
//               <XMarkIcon className="h-6 w-6 text-slate-600" />
//             </button>
//           </div>
//         )}
        
//         <div className={`transition-all duration-300 ${isCollapsed && !isMobileView ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
//           {(!isCollapsed || isMobileView) && !isMobileView && (
//             <div className="flex items-center space-x-3">
//               <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
//                 <ScaleIcon className="h-5 w-5 text-white" />
//               </div>
//               <div>
//                 <div className="text-lg font-bold text-slate-800">Nexintel AI</div>
//                 <div className="text-xs text-slate-500 font-medium">Legal Intelligence Suite</div>
//               </div>
//             </div>
//           )}
//         </div>
        
//         {isCollapsed && !isMobileView && (
//           <div className="flex justify-center">
//             <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
//               <ScaleIcon className="h-5 w-5 text-white" />
//             </div>
//           </div>
//         )}
//       </div>

//       {/* New Case Button */}
//       <div className="p-4">
//         <button
//           onClick={() => navigate('/analysis', { state: { newChat: true } })}
//           className="w-full bg-slate-800 text-white rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
//         >
//           <PlusIcon className="h-5 w-5" />
//           <span className={`${isCollapsed && !isMobileView ? 'hidden' : 'inline ml-2'}`}>
//             New Case Analysis
//           </span>
//         </button>
//       </div>

//       {/* Navigation */}
//       <div className="flex-1 overflow-y-auto px-2 pb-4">
//         <div className="mb-6">
//           {(!isCollapsed || isMobileView) && (
//             <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-3">
//               Navigation
//             </div>
//           )}
//           <nav className="space-y-1">
//             {navigationItems.map((item) => {
//               const Icon = item.icon;
//               const active = isActive(item.path);
//               const isDocumentUpload = item.name === 'Document Upload';

//               return (
//                 <div key={item.name}>
//                   {item.name === 'Chats' ? (
//                     <Link
//                       to={currentFileId ? `${item.path}/${currentFileId}` : item.path}
//                       className={`group flex items-center ${isCollapsed && !isMobileView ? 'justify-center px-2' : 'px-3'} py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
//                         active
//                           ? 'bg-slate-100 text-slate-900 border border-slate-200'
//                           : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
//                       }`}
//                       title={isCollapsed && !isMobileView ? item.name : undefined}
//                       onClick={() => {
//                         console.log('Navigating to:', currentFileId ? `${item.path}/${currentFileId}` : item.path);
//                         if (item.name === 'Chats') {
//                           // Ensure currentFileId is available before navigating
//                           if (currentFileId) {
//                             navigate(`${item.path}/${currentFileId}`);
//                           } else {
//                             console.warn('currentFileId is not set, navigating to base path:', item.path);
//                             navigate(item.path);
//                           }
//                         } else if (isDocumentUpload) {
//                           setIsDocumentUploadOpen(prev => !prev);
//                           navigate(item.path); // Navigate to upload page when clicking Document Upload
//                         } else {
//                           navigate(item.path);
//                         }
//                       }}
//                     >
//                       <Icon
//                         className={`h-5 w-5 ${isCollapsed && !isMobileView ? '' : 'mr-3'} transition-colors duration-200 ${
//                           active
//                             ? 'text-slate-700'
//                             : 'text-slate-500 group-hover:text-slate-700'
//                         }`}
//                       />
//                       <span className={`${isCollapsed && !isMobileView ? 'hidden' : 'inline'} transition-all duration-200`}>
//                         {item.name}
//                       </span>
//                       {active && (!isCollapsed || isMobileView) && (
//                         <div className="ml-auto w-2 h-2 bg-slate-600 rounded-full"></div>
//                       )}
//                     </Link>
//                   ) : (
//                     <button
//                       onClick={() => {
//                         if (isDocumentUpload) {
//                           setIsDocumentUploadOpen(prev => !prev);
//                           navigate(item.path); // Navigate to upload page when clicking Document Upload
//                         } else {
//                           navigate(item.path);
//                         }
//                       }}
//                       className={`group flex items-center w-full ${isCollapsed && !isMobileView ? 'justify-center px-2' : 'px-3'} py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
//                         active
//                           ? 'bg-slate-100 text-slate-900 border border-slate-200'
//                           : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
//                       }`}
//                       title={isCollapsed && !isMobileView ? item.name : undefined}
//                     >
//                       <Icon
//                         className={`h-5 w-5 ${isCollapsed && !isMobileView ? '' : 'mr-3'} transition-colors duration-200 ${
//                           active
//                             ? 'text-slate-700'
//                             : 'text-slate-500 group-hover:text-slate-700'
//                         }`}
//                       />
//                       <span className={`${isCollapsed && !isMobileView ? 'hidden' : 'inline'} transition-all duration-200`}>
//                         {item.name}
//                       </span>
//                       {isDocumentUpload && (!isCollapsed || isMobileView) && (
//                         <div className="ml-auto">
//                           {isDocumentUploadOpen ? (
//                             <ChevronDown className="h-4 w-4 text-slate-500" />
//                           ) : (
//                             <ChevronRight className="h-4 w-4 text-slate-500" />
//                           )}
//                         </div>
//                       )}
//                       {active && !isDocumentUpload && (!isCollapsed || isMobileView) && (
//                         <div className="ml-auto w-2 h-2 bg-slate-600 rounded-full"></div>
//                       )}
//                     </button>
//                   )}

//                   {/* Submenu - Only show if it's Document Upload and submenu is open and not collapsed */}
//                   {isDocumentUpload && isDocumentUploadOpen && (!isCollapsed || isMobileView) && (
//                     <div className="ml-8 mt-1 space-y-1">
//                       {item.subMenu.map((subItem) => (
//                         <button
//                           key={subItem.name}
//                           onClick={() => {
//                             if (subItem.action === 'create_folder') {
//                               setShowNewFolderInput(!showNewFolderInput);
//                             } else if (subItem.action === 'upload_files') {
//                               fileInputRef.current?.click();
//                             } else if (subItem.action === 'upload_folder') {
//                               folderInputRef.current?.click();
//                             }
//                           }}
//                           className="group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
//                         >
//                           {subItem.action === 'create_folder' && <PlusIcon className="h-4 w-4 mr-2 text-slate-500" />}
//                           {subItem.action === 'upload_files' && <FileUp className="h-4 w-4 mr-2 text-slate-500" />}
//                           {subItem.action === 'upload_folder' && <FolderPlus className="h-4 w-4 mr-2 text-slate-500" />}
//                           <span className="flex-1 text-left">{subItem.name}</span>
//                         </button>
//                       ))}
                      
//                       {/* New Folder Input within Sidebar */}
//                       {showNewFolderInput && (
//                         <div className="px-3 py-2 bg-gray-50 rounded-lg">
//                           <input
//                             type="text"
//                             placeholder="Folder name"
//                             value={newFolderName}
//                             onChange={(e) => setNewFolderName(e.target.value)}
//                             className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
//                             onKeyPress={(e) => e.key === 'Enter' && createFolder()}
//                             autoFocus
//                           />
//                           <div className="flex gap-2 mt-2">
//                             <button
//                               onClick={createFolder}
//                               disabled={creatingFolder}
//                               className="flex-1 bg-blue-600 text-white text-xs py-1.5 px-3 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
//                             >
//                               {creatingFolder ? 'Creating...' : 'Create'}
//                             </button>
//                             <button
//                               onClick={() => {
//                                 setShowNewFolderInput(false);
//                                 setNewFolderName('');
//                               }}
//                               className="flex-1 bg-gray-300 text-gray-700 text-xs py-1.5 px-3 rounded hover:bg-gray-400 transition-colors"
//                             >
//                               Cancel
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </nav>
//         </div>

//         {/* Role Selection */}
//         <RoleSelection isCollapsed={isCollapsed && !isMobileView} />
        
//         {/* Legal Intelligence */}
//         <LegalIntelligence isCollapsed={isCollapsed && !isMobileView} />

//         {/* Recent Cases - Only show when expanded */}
//         {(!isCollapsed || isMobileView) && (
//           <div className="mb-6">
//             <div className="flex items-center justify-between px-3 mb-3">
//               <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
//                 Recent Cases
//               </div>
//               <ClockIcon className="h-4 w-4 text-slate-400" />
//             </div>
//             <div className="space-y-2">
//               {recentCases.map((case_, index) => (
//                 <div
//                   key={index}
//                   className="p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-slate-200 group"
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1 min-w-0">
//                       <div className="text-sm font-semibold text-slate-800 truncate group-hover:text-slate-900 transition-colors duration-200">
//                         {case_.title}
//                       </div>
//                       <div className="flex items-center justify-between mt-1">
//                         <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
//                           {case_.type}
//                         </span>
//                       </div>
//                       <div className="text-xs text-slate-500 mt-1 flex items-center">
//                         <ClockIcon className="h-3 w-3 mr-1" />
//                         {case_.time}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <button className="w-full text-xs text-slate-600 hover:text-slate-800 font-medium mt-3 py-2 hover:bg-slate-50 rounded-lg transition-all duration-200">
//               View All Cases →
//             </button>
//           </div>
//         )}

//         {/* Quick Tools */}
//         <QuickTools isCollapsed={isCollapsed && !isMobileView} />
//       </div>

//       {/* Footer */}
//       <div className="p-4 border-t border-slate-200 bg-white">
//         {(!isCollapsed || isMobileView) && (
//           <div className="space-y-3">
//             <button className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg py-2.5 text-sm font-medium transition-all duration-200">
//               <span>🌐</span>
//               <span>English | हिंदी | मराठी</span>
//             </button>
//             <button className="w-full flex items-center justify-center space-x-2 text-slate-500 hover:text-slate-700 text-xs font-medium transition-all duration-200">
//               <Cog6ToothIcon className="h-4 w-4" />
//               <span>Settings & Preferences</span>
//             </button>
//           </div>
//         )}
        
//         {isCollapsed && !isMobileView && (
//           <div className="flex flex-col space-y-2">
//             <button className="w-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg py-2 text-sm transition-all duration-200">
//               <span>🌐</span>
//             </button>
//             <button className="w-full flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all duration-200">
//               <Cog6ToothIcon className="h-4 w-4" />
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <>
//       {/* Mobile Header */}
//       <MobileHeader />

//       {/* Desktop Sidebar */}
//       <div
//         className={`hidden lg:flex bg-white border-r border-slate-200 flex-col transition-all duration-300 ease-in-out shadow-sm ${
//           isCollapsed ? 'w-20' : 'w-80'
//         } relative h-screen`}
//       >
//         <SidebarContent />
//       </div>

//       {/* Mobile Overlay */}
//       {isMobileMenuOpen && (
//         <div className="lg:hidden fixed inset-0 z-50 flex">
//           {/* Backdrop */}
//           <div
//             className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
//             onClick={() => setIsMobileMenuOpen(false)}
//           />
          
//           {/* Sidebar Drawer */}
//           <div className="relative flex flex-col w-80 max-w-xs bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
//             <SidebarContent isMobileView={true} />
//           </div>
//         </div>
//       )}

//       {/* Hidden file inputs */}
//       <input
//         ref={fileInputRef}
//         type="file"
//         multiple
//         onChange={handleFileChange}
//         className="hidden"
//         accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
//       />
//       <input
//         ref={folderInputRef}
//         type="file"
//         multiple
//         onChange={handleFolderChange}
//         className="hidden"
//         webkitdirectory=""
//         directory=""
//       />
//     </>
//   );
// };


// // Helper component for rendering folder tree
// const FolderTreeComponent = ({ items, level = 0, parentPath = '', expandedFolders, toggleFolder, selectFolder, selectedFolder, searchQuery = '' }) => {
//   return items
//     .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
//     .map((item, index) => {
//       const itemPath = parentPath ? `${parentPath}/${item.name}` : item.name;
//       const isExpanded = expandedFolders.has(itemPath);
//       const hasChildren = item.children && item.children.length > 0;
//       const isSelected = selectedFolder?.id === item.id;
      
//       return (
//         <div key={`${itemPath}-${index}`} className="select-none">
//           <button
//             onClick={() => selectFolder(item)}
//             className={`group flex items-center w-full py-1.5 px-3 mx-1 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
//               isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
//             }`}
//             style={{ paddingLeft: `${(level * 16) + 12}px` }} // Adjust padding for hierarchy
//           >
//             {hasChildren && (
//               <span
//                 onClick={(e) => {
//                   e.stopPropagation(); // Prevent button click from also selecting folder
//                   toggleFolder(itemPath);
//                 }}
//                 className="mr-2 p-0.5 rounded hover:bg-gray-200 transition-colors"
//               >
//                 {isExpanded ? (
//                   <ChevronDown className="w-4 h-4 text-gray-400" />
//                 ) : (
//                   <ChevronRight className="w-4 h-4 text-gray-400" />
//                 )}
//               </span>
//             )}
//             {!hasChildren && <span className="w-4 h-4 mr-2" />} {/* Spacer for alignment */}
//             <Folder className={`h-4 w-4 mr-2 flex-shrink-0 ${
//               isSelected ? 'text-blue-600' : 'text-gray-400'
//             }`} />
//             <span className="text-sm truncate">{item.name}</span>
//           </button>
          
//           {hasChildren && isExpanded && (
//             <div className="mt-0.5">
//               <FolderTreeComponent
//                 items={item.children}
//                 level={level + 1}
//                 parentPath={itemPath}
//                 expandedFolders={expandedFolders}
//                 toggleFolder={toggleFolder}
//                 selectFolder={selectFolder}
//                 selectedFolder={selectedFolder}
//                 searchQuery={searchQuery}
//               />
//             </div>
//           )}
//         </div>
//       );
//     });
// };

// export default Sidebar;


import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  ChartBarIcon,
  DocumentTextIcon,
  MagnifyingGlassCircleIcon,
  PencilSquareIcon,
  ScaleIcon,
  BookOpenIcon,
  ClockIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  FolderPlus,
  FileUp,
  Home,
  Folder,
  Upload,
  ChevronDown,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import UserProfileMenu from './UserProfileMenu';
// import RoleSelection from './RoleSelection';
import LegalIntelligence from './LegalIntelligence';
import QuickTools from './QuickTools';
import { useFileManager } from '../context/FileManagerContext';
 
const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); // New state for profile menu
  const [currentFileId, setCurrentFileId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const {
    fileInputRef,
    folderInputRef,
    setShowNewFolderInput,
    showNewFolderInput,
    newFolderName,
    setNewFolderName,
    creatingFolder,
    createFolder,
    handleFileChange,
    handleFolderChange,
  } = useFileManager();

  // Check if device is mobile/tablet
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
 
  // Load currentFileId from localStorage on mount and listen for changes
  useEffect(() => {
    const loadCurrentFileId = () => {
      const fileId = localStorage.getItem('currentFileId');
      setCurrentFileId(fileId);
    };

    loadCurrentFileId();

    // Listen for localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === 'currentFileId') {
        setCurrentFileId(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events in case localStorage is updated in the same tab
    const handleCurrentFileChange = (e) => {
      setCurrentFileId(e.detail.fileId);
    };

    window.addEventListener('currentFileIdChanged', handleCurrentFileChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('currentFileIdChanged', handleCurrentFileChange);
    };
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(prev => !prev);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Handle navigation to chats
  const handleChatNavigation = () => {
    if (currentFileId) {
      navigate(`/chats/${currentFileId}`);
    } else {
      // Navigate to base chats route - your chat component should handle the empty state
      navigate('/chats');
    }
  };

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: ChartBarIcon },
    {
      name: 'Document Upload',
      path: '/upload',
      icon: DocumentTextIcon,
      hasSubMenu: true,
      subMenu: [
        { name: 'Create Folder', path: '/upload', action: 'create_folder' },
        { name: 'Upload Files', path: '/upload', action: 'upload_files' },
        { name: 'Upload Folder', path: '/upload', action: 'upload_folder' },
      ]
    },
    { name: 'AI Analysis', path: '/analysis', icon: MagnifyingGlassCircleIcon },
    { name: 'Chats', path: '/chats', icon: MessageSquare, isSpecial: true }, // Mark as special for custom handling
    { name: 'Document Drafting', path: '/drafting', icon: PencilSquareIcon },
  ];


  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Mobile Header Component
  const MobileHeader = () => (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
          <ScaleIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-lg font-bold text-slate-800">Nexintel AI</div>
          <div className="text-xs text-slate-500 font-medium">Legal Intelligence Suite</div>
        </div>
      </div>
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
      >
        <Bars3Icon className="h-6 w-6 text-slate-600" />
      </button>
    </div>
  );

  // Sidebar Content Component
  const SidebarContent = ({ isMobileView = false, toggleProfileMenu, isProfileMenuOpen }) => (
    <div className="flex flex-col h-full">
      {/* Header for Desktop or Mobile Drawer Header */}
      <div className={`px-4 py-3 border-b border-slate-200 relative bg-white ${isMobileView ? '' : 'hidden lg:block'}`}>
        {!isMobileView && (
          <button
            onClick={toggleSidebar}
            className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-white border border-slate-300 rounded-full p-1.5 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-200 z-10"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-4 w-4 text-slate-600" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4 text-slate-600" />
            )}
          </button>
        )}

        {isMobileView && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                <ScaleIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800">Nexintel AI</div>
                <div className="text-xs text-slate-500 font-medium">Legal Intelligence Suite</div>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
            >
              <XMarkIcon className="h-6 w-6 text-slate-600" />
            </button>
          </div>
        )}
        
        <div className={`transition-all duration-300 ${isCollapsed && !isMobileView ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {(!isCollapsed || isMobileView) && !isMobileView && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                <ScaleIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800">Nexintel AI</div>
                <div className="text-xs text-slate-500 font-medium">Legal Intelligence Suite</div>
              </div>
            </div>
          )}
        </div>
        
        {isCollapsed && !isMobileView && (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
              <ScaleIcon className="h-5 w-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* New Case Button */}
      <div className="p-4">
        <button
          onClick={() => navigate('/analysis', { state: { newChat: true } })}
          className="w-full bg-slate-800 text-white rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <PlusIcon className="h-5 w-5" />
          <span className={`${isCollapsed && !isMobileView ? 'hidden' : 'inline ml-2'}`}>
            New Case Analysis
          </span>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="mb-6">
          {(!isCollapsed || isMobileView) && (
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-3">
              Navigation
            </div>
          )}
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              const isDocumentUpload = item.name === 'Document Upload';
              const isChats = item.name === 'Chats';

              return (
                <div key={item.name}>
                  {isChats ? (
                    <button
                      onClick={handleChatNavigation}
                      className={`group flex items-center w-full ${isCollapsed && !isMobileView ? 'justify-center px-2' : 'px-3'} py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        active
                          ? 'bg-slate-100 text-slate-900 border border-slate-200'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                      title={isCollapsed && !isMobileView ? item.name : undefined}
                    >
                      <Icon
                        className={`h-5 w-5 ${isCollapsed && !isMobileView ? '' : 'mr-3'} transition-colors duration-200 ${
                          active
                            ? 'text-slate-700'
                            : 'text-slate-500 group-hover:text-slate-700'
                        }`}
                      />
                      <span className={`${isCollapsed && !isMobileView ? 'hidden' : 'inline'} transition-all duration-200`}>
                        {item.name}
                      </span>
                      {active && (!isCollapsed || isMobileView) && (
                        <div className="ml-auto w-2 h-2 bg-slate-600 rounded-full"></div>
                      )}
                      {!currentFileId && (!isCollapsed || isMobileView) && (
                        <div className="ml-auto">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-800">
                            No file
                          </span>
                        </div>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (isDocumentUpload) {
                          setIsDocumentUploadOpen(prev => !prev);
                          navigate(item.path);
                        } else {
                          navigate(item.path);
                        }
                      }}
                      className={`group flex items-center w-full ${isCollapsed && !isMobileView ? 'justify-center px-2' : 'px-3'} py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        active
                          ? 'bg-slate-100 text-slate-900 border border-slate-200'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                      title={isCollapsed && !isMobileView ? item.name : undefined}
                    >
                      <Icon
                        className={`h-5 w-5 ${isCollapsed && !isMobileView ? '' : 'mr-3'} transition-colors duration-200 ${
                          active
                            ? 'text-slate-700'
                            : 'text-slate-500 group-hover:text-slate-700'
                        }`}
                      />
                      <span className={`${isCollapsed && !isMobileView ? 'hidden' : 'inline'} transition-all duration-200`}>
                        {item.name}
                      </span>
                      {isDocumentUpload && (!isCollapsed || isMobileView) && (
                        <div className="ml-auto">
                          {isDocumentUploadOpen ? (
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-slate-500" />
                          )}
                        </div>
                      )}
                      {active && !isDocumentUpload && (!isCollapsed || isMobileView) && (
                        <div className="ml-auto w-2 h-2 bg-slate-600 rounded-full"></div>
                      )}
                    </button>
                  )}

                  {/* Submenu - Only show if it's Document Upload and submenu is open and not collapsed */}
                  {isDocumentUpload && isDocumentUploadOpen && (!isCollapsed || isMobileView) && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.subMenu.map((subItem) => (
                        <button
                          key={subItem.name}
                          onClick={() => {
                            if (subItem.action === 'create_folder') {
                              setShowNewFolderInput(!showNewFolderInput);
                            } else if (subItem.action === 'upload_files') {
                              fileInputRef.current?.click();
                            } else if (subItem.action === 'upload_folder') {
                              folderInputRef.current?.click();
                            }
                          }}
                          className="group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                        >
                          {subItem.action === 'create_folder' && <PlusIcon className="h-4 w-4 mr-2 text-slate-500" />}
                          {subItem.action === 'upload_files' && <FileUp className="h-4 w-4 mr-2 text-slate-500" />}
                          {subItem.action === 'upload_folder' && <FolderPlus className="h-4 w-4 mr-2 text-slate-500" />}
                          <span className="flex-1 text-left">{subItem.name}</span>
                        </button>
                      ))}
                      
                      {/* New Folder Input within Sidebar */}
                      {showNewFolderInput && (
                        <div className="px-3 py-2 bg-gray-50 rounded-lg">
                          <input
                            type="text"
                            placeholder="Folder name"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                            autoFocus
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={createFolder}
                              disabled={creatingFolder}
                              className="flex-1 bg-blue-600 text-white text-xs py-1.5 px-3 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                              {creatingFolder ? 'Creating...' : 'Create'}
                            </button>
                            <button
                              onClick={() => {
                                setShowNewFolderInput(false);
                                setNewFolderName('');
                              }}
                              className="flex-1 bg-gray-300 text-gray-700 text-xs py-1.5 px-3 rounded hover:bg-gray-400 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Role Selection */}
        {/* <RoleSelection isCollapsed={isCollapsed && !isMobileView} /> */}
        
        {/* Legal Intelligence */}
        <LegalIntelligence isCollapsed={isCollapsed && !isMobileView} />


        {/* Quick Tools */}
        <QuickTools isCollapsed={isCollapsed && !isMobileView} />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-white">
        {(!isCollapsed || isMobileView) && (
          <div className="space-y-3">
            {/* Removed Language and Settings buttons as per user request */}
          </div>
        )}
        
        {isCollapsed && !isMobileView && (
          <div className="flex flex-col space-y-2">
            {/* Removed Language and Settings buttons as per user request */}
          </div>
        )}
      </div>

      {/* User Profile Menu Trigger at the bottom */}
      <div className="p-4 border-t border-slate-200 bg-white relative">
        <button
          onClick={toggleProfileMenu}
          className="w-full flex items-center justify-between space-x-2 text-slate-700 hover:bg-slate-50 rounded-lg py-2.5 text-sm font-medium transition-all duration-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              PS
            </div>
            {!isCollapsed && (
              <div className="text-sm font-medium text-gray-900">pravin sarule</div>
            )}
          </div>
          {!isCollapsed && (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </button>
        {isProfileMenuOpen && (
          <div className="absolute bottom-full left-0 w-full mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <UserProfileMenu />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <MobileHeader />

      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex bg-white border-r border-slate-200 flex-col transition-all duration-300 ease-in-out shadow-sm ${
          isCollapsed ? 'w-20' : 'w-80'
        } relative h-screen`}
      >
        <SidebarContent toggleProfileMenu={toggleProfileMenu} isProfileMenuOpen={isProfileMenuOpen} />
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar Drawer */}
          <div className="relative flex flex-col w-80 max-w-xs bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <SidebarContent isMobileView={true} toggleProfileMenu={toggleProfileMenu} isProfileMenuOpen={isProfileMenuOpen} />
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        onChange={handleFolderChange}
        className="hidden"
        webkitdirectory=""
        directory=""
      />
    </>
  );
};

// Helper component for rendering folder tree
const FolderTreeComponent = ({ items, level = 0, parentPath = '', expandedFolders, toggleFolder, selectFolder, selectedFolder, searchQuery = '' }) => {
  return items
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .map((item, index) => {
      const itemPath = parentPath ? `${parentPath}/${item.name}` : item.name;
      const isExpanded = expandedFolders.has(itemPath);
      const hasChildren = item.children && item.children.length > 0;
      const isSelected = selectedFolder?.id === item.id;
      
      return (
        <div key={`${itemPath}-${index}`} className="select-none">
          <button
            onClick={() => selectFolder(item)}
            className={`group flex items-center w-full py-1.5 px-3 mx-1 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
              isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
            }`}
            style={{ paddingLeft: `${(level * 16) + 12}px` }}
          >
            {hasChildren && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(itemPath);
                }}
                className="mr-2 p-0.5 rounded hover:bg-gray-200 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </span>
            )}
            {!hasChildren && <span className="w-4 h-4 mr-2" />}
            <Folder className={`h-4 w-4 mr-2 flex-shrink-0 ${
              isSelected ? 'text-blue-600' : 'text-gray-400'
            }`} />
            <span className="text-sm truncate">{item.name}</span>
          </button>
          
          {hasChildren && isExpanded && (
            <div className="mt-0.5">
              <FolderTreeComponent
                items={item.children}
                level={level + 1}
                parentPath={itemPath}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                selectFolder={selectFolder}
                selectedFolder={selectedFolder}
                searchQuery={searchQuery}
              />
            </div>
          )}
        </div>
      );
    });
};

export default Sidebar;