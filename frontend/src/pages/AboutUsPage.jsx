import React from 'react';

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-white font-inter py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl sm:text-4xl font-semibold text-gray-800 mb-4">About Nexintel AI</h3>
          <p className="text-gray-600 font-medium max-w-2xl mx-auto">
            Built for modern legal professionals who demand efficiency, security, and comprehensive functionality.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto text-lg text-gray-700 leading-relaxed">
          <p className="mb-6">
            Nexintel AI is at the forefront of legal technology, dedicated to transforming how legal professionals
            interact with documents. Our mission is to empower lawyers, paralegals, and legal researchers with
            intelligent tools that streamline workflows, enhance accuracy, and provide deeper insights into legal data.
          </p>
          <p className="mb-6">
            Founded by a team of legal experts and AI innovators, we understand the unique challenges of the legal
            industry. We are committed to delivering secure, reliable, and user-friendly solutions that meet the
            highest standards of professional practice.
          </p>
          <p>
            Join us in shaping the future of legal practice with AI-powered efficiency and intelligence.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;