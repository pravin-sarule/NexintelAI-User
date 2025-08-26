// import React from 'react';
// import { Link } from 'react-router-dom';
// import { Shield, FileText } from 'lucide-react';
// import PublicLayout from '../layouts/PublicLayout'; // Import PublicLayout

// const LandingPage = () => {
//   return (
//     <PublicLayout>
//       {/* Hero Section */}
//       <header className="bg-gray-50 py-16 shadow-sm border-b border-gray-200">
//         <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8">
//           <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-700 rounded-xl mb-6 shadow-lg">
//             <Shield className="w-10 h-10 text-white" />
//           </div>
//           <h2 className="text-4xl sm:text-5xl font-semibold text-gray-800 mb-4">Welcome to Nexintel AI Legal Summarizer</h2>
//           <p className="text-lg sm:text-xl text-gray-600 mb-8 font-medium max-w-2xl mx-auto">
//             Your intelligent partner for legal document analysis and summarization.
//           </p>
//           <div className="flex justify-center space-x-4">
//             <Link to="/register" className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-8 rounded-lg text-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl inline-flex items-center">
//               <FileText className="w-5 h-5 mr-2" />
//               Get Started
//             </Link>
//             <Link to="/about-nexintel" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-8 rounded-lg text-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl inline-flex items-center">
//               Learn More
//             </Link>
//           </div>
//         </div>
//       </header>

//       {/* CTA Section */}
//       <section className="py-16 bg-gray-800">
//         <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8">
//           <h3 className="text-3xl sm:text-4xl font-semibold text-white mb-4">Ready to Get Started?</h3>
//           <p className="text-gray-300 font-medium mb-8 max-w-2xl mx-auto">
//             Join thousands of legal professionals who trust our platform for their administrative needs.
//           </p>
//           <Link to="/register" className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-8 rounded-lg text-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl inline-flex items-center">
//             <Shield className="w-5 h-5 mr-2" />
//             Register Now
//           </Link>
//         </div>
//       </section>
//     </PublicLayout>
//   );
// };

// export default LandingPage;

import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout'; // Import PublicLayout

const LandingPage = () => {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <header className="bg-gray-50 py-16 shadow-sm border-b border-gray-200">
        <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-700 rounded-xl mb-6 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold text-gray-800 mb-4">Welcome to Nexintel AI Legal Summarizer</h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 font-medium max-w-2xl mx-auto">
            Your intelligent partner for legal document analysis and summarization.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register" className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-8 rounded-lg text-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl inline-flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Get Started
            </Link>
            <Link to="/about-nexintel" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-8 rounded-lg text-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl inline-flex items-center">
              Learn More
            </Link>
          </div>
        </div>
      </header>

     {/* How it Works Section */}
     <section className="py-16 bg-white">
       <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8">
         <h3 className="text-3xl sm:text-4xl font-semibold text-gray-800 mb-12">How It Works</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
           {/* Step 1 */}
           <div className="p-8 bg-gray-50 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
             <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-full mb-5 shadow-lg">
               <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
             </div>
             <h4 className="text-xl font-semibold text-gray-800 mb-3">Upload Document</h4>
             <p className="text-gray-600 font-medium">
               Securely upload your legal documents in various formats like PDF, DOCX, or TXT.
             </p>
           </div>
           {/* Step 2 */}
           <div className="p-8 bg-gray-50 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
             <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-full mb-5 shadow-lg">
               <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V4m0 16v-2M8 12a4 4 0 118 0 4 4 0 01-8 0z"></path></svg>
             </div>
             <h4 className="text-xl font-semibold text-gray-800 mb-3">AI-Powered Analysis</h4>
             <p className="text-gray-600 font-medium">
               Our advanced AI algorithms analyze the content, identifying key points and legal nuances.
             </p>
           </div>
           {/* Step 3 */}
           <div className="p-8 bg-gray-50 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
             <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-full mb-5 shadow-lg">
               <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             </div>
             <h4 className="text-xl font-semibold text-gray-800 mb-3">Receive Summary</h4>
             <p className="text-gray-600 font-medium">
               Get a concise, easy-to-understand summary, saving you time and effort.
             </p>
           </div>
         </div>
       </div>
     </section>

     {/* CTA Section */}
     {/* <section className="py-16 bg-gray-800">
       <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl sm:text-4xl font-semibold text-white mb-4">Ready to Get Started?</h3>
          <p className="text-gray-300 font-medium mb-8 max-w-2xl mx-auto">
            Join thousands of legal professionals who trust our platform for their administrative needs.
          </p>
          <Link to="/register" className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-8 rounded-lg text-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl inline-flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Register Now
          </Link>
        </div>
      </section> */}
    </PublicLayout>
  );
};

export default LandingPage;