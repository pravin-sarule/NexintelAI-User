// import React from 'react';
// import { Link } from 'react-router-dom';
// import { Shield, FileText } from 'lucide-react';
// import nexintelLogo from '../assets/nexintel.jpg'; // Assuming you have a logo in assets

// const PublicLayout = ({ children, hideHeaderAndFooter = false }) => {
//   return (
//     <div className="min-h-screen bg-white font-inter">
//       {!hideHeaderAndFooter && (
//         <>
//           {/* Navbar */}
//           <nav className="bg-gray-800 p-4 shadow-lg border-b border-gray-700">
//             <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4 sm:px-6 lg:px-8">
//               <h1 className="text-white text-2xl font-semibold mb-4 md:mb-0">Nexintel AI Legal Summarizer</h1>
//               <ul className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-6 items-center">
//                 <li><Link to="/" className="text-gray-200 hover:text-white font-medium transition-colors">Home</Link></li>
//                 <li>
//                   <Link to="/services" className="text-gray-200 hover:text-white font-medium transition-colors" target="_blank" rel="noopener noreferrer">
//                     Services
//                   </Link>
//                 </li>
//                 <li><Link to="/pricing" className="text-gray-200 hover:text-white font-medium transition-colors" target="_blank" rel="noopener noreferrer">Pricing</Link></li>
//                 <li><Link to="/about-us" className="text-gray-200 hover:text-white font-medium transition-colors" target="_blank" rel="noopener noreferrer">About Us</Link></li>
//                 <li>
//                   <Link to="/login" className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
//                     Login
//                   </Link>
//                 </li>
//               </ul>
//             </div>
//           </nav>
//         </>
//       )}

//       <main>{children}</main>

//       {!hideHeaderAndFooter && (
//         <>
//           {/* Footer */}
//           <footer className="bg-gray-900 text-gray-300 py-8 border-t border-gray-800">
//             <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8">
//               <div className="flex flex-col sm:flex-row items-center justify-center mb-4">
//                 <Shield className="w-6 h-6 text-gray-500 mr-2" />
//                 <span className="text-lg font-semibold text-gray-400 mt-2 sm:mt-0">Nexintel AI</span>
//               </div>
//               <p className="text-sm font-medium">&copy; {new Date().getFullYear()} Nexintel AI. All rights reserved.</p>
//               <p className="text-xs text-gray-500 mt-2">
//                 Secure • Professional • Compliant
//               </p>
//             </div>
//           </footer>
//         </>
//       )}
//     </div>
//   );
// };

// export default PublicLayout;


import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText } from 'lucide-react';
import nexintelLogo from '../assets/logo.png'; // Assuming you have a logo in assets

const PublicLayout = ({ children, hideHeaderAndFooter = false }) => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {!hideHeaderAndFooter && (
        <>
          {/* Navbar */}
          <nav className="bg-gray-800 p-4 shadow-lg border-b border-gray-700">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4 sm:px-6 lg:px-8">
              <h1 className="text-white text-2xl font-semibold mb-4 md:mb-0">Nexintel AI Legal Summarizer</h1>
              <ul className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-6 items-center">
                <li><Link to="/" className="text-gray-200 hover:text-white font-medium transition-colors">Home</Link></li>
                <li>
                  <Link to="/services" className="text-gray-200 hover:text-white font-medium transition-colors" target="_blank" rel="noopener noreferrer">
                    Services
                  </Link>
                </li>
                <li><Link to="/pricing" className="text-gray-200 hover:text-white font-medium transition-colors" target="_blank" rel="noopener noreferrer">Pricing</Link></li>
                <li><Link to="/about-us" className="text-gray-200 hover:text-white font-medium transition-colors" target="_blank" rel="noopener noreferrer">About Us</Link></li>
                <li>
                  <Link to="/login" className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </>
      )}

      <main className="flex-1 h-full overflow-hidden">{children}</main>

      {!hideHeaderAndFooter && (
        <>
          {/* Footer */}
          <footer className="bg-gray-900 text-gray-300 py-8 border-t border-gray-800">
            <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center md:items-start">
                  <div className="flex items-center mb-4">
                    <Shield className="w-6 h-6 text-gray-500 mr-2" />
                    <span className="text-lg font-semibold text-gray-400">Nexintel AI</span>
                  </div>
                  <p className="text-sm font-medium text-center md:text-left">&copy; {new Date().getFullYear()} Nexintel AI. All rights reserved.</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Secure • Professional • Compliant
                  </p>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                  <ul className="space-y-2">
                    <li><Link to="/" className="text-sm text-slate-400 hover:text-white transition">Home</Link></li>
                    <li><Link to="/services" className="text-sm text-slate-400 hover:text-white transition">Services</Link></li>
                    <li><Link to="/pricing" className="text-sm text-slate-400 hover:text-white transition">Pricing</Link></li>
                    <li><Link to="/about-us" className="text-sm text-slate-400 hover:text-white transition">About Us</Link></li>
                    <li><Link to="/terms" className="text-sm text-slate-400 hover:text-white transition">Terms & Conditions</Link></li>
                  </ul>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
                  <ul className="space-y-2 text-sm text-slate-400 text-center md:text-left">
                    <li>B-11, near Railway Station Road, MIDC, Chhtrapati Sambhajinagar, (MH) 431010</li>
                    <li>Contact: 9226408832</li>
                    <li>Email: hr@nexintelai.com</li>
                  </ul>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default PublicLayout;