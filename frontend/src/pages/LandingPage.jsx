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

      {/* CTA Section */}
      <section className="py-16 bg-gray-800">
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
      </section>
    </PublicLayout>
  );
};

export default LandingPage;