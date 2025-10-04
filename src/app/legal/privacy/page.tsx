'use client';

import Link from 'next/link';
// import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black relative overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-4">
      {/* Mobile background pattern */}
      <div className="absolute inset-0 md:hidden bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
      
      {/* Theme-colored moving squares - Reduced on mobile for performance */}
      <div className="absolute inset-0 hidden md:block">
        {/* Velour Nights - Orange */}
        <div 
          className="absolute w-6 h-6 pixelated opacity-60" 
          style={{
            backgroundColor: '#E8A87C',
            animation: 'float1 8s ease-in-out infinite',
            top: '20%',
            left: '15%'
          }}
        ></div>
        <div 
          className="absolute w-4 h-4 pixelated opacity-50" 
          style={{
            backgroundColor: '#E8A87C',
            animation: 'float2 6s ease-in-out infinite',
            top: '70%',
            right: '20%'
          }}
        ></div>
        
        {/* Neon Ashes - Green */}
        <div 
          className="absolute w-8 h-8 pixelated opacity-70" 
          style={{
            backgroundColor: '#00FF88',
            animation: 'float3 10s ease-in-out infinite',
            top: '10%',
            right: '25%'
          }}
        ></div>
        <div 
          className="absolute w-5 h-5 pixelated opacity-55" 
          style={{
            backgroundColor: '#00FF88',
            animation: 'float4 7s ease-in-out infinite',
            bottom: '30%',
            left: '25%'
          }}
        ></div>
        
        {/* Crimson Casefiles - Gold */}
        <div 
          className="absolute w-4 h-4 pixelated opacity-80"
          style={{
            backgroundColor: '#FFD700',
            animation: 'float5 9s ease-in-out infinite',
            top: '50%',
            left: '10%'
          }}
        ></div>
        <div 
          className="absolute w-6 h-6 pixelated opacity-65"
          style={{
            backgroundColor: '#FFD700',
            animation: 'float6 5s ease-in-out infinite',
            bottom: '20%',
            right: '15%'
          }}
        ></div>
        
        {/* Obsidian Veil - Purple */}
        <div 
          className="absolute w-5 h-5 pixelated opacity-75"
          style={{
            backgroundColor: '#8B5CF6',
            animation: 'float7 11s ease-in-out infinite',
            top: '30%',
            right: '10%'
          }}
        ></div>
        <div 
          className="absolute w-3 h-3 pixelated opacity-60"
          style={{
            backgroundColor: '#8B5CF6',
            animation: 'float8 8s ease-in-out infinite',
            bottom: '50%',
            left: '20%'
          }}
        ></div>
        
        {/* Blazeheart Saga - Red */}
        <div 
          className="absolute w-7 h-7 pixelated opacity-70"
          style={{
            backgroundColor: '#EF4444',
            animation: 'float9 12s ease-in-out infinite',
            top: '80%',
            left: '30%'
          }}
        ></div>
        <div 
          className="absolute w-4 h-4 pixelated opacity-55"
          style={{
            backgroundColor: '#EF4444',
            animation: 'float10 6s ease-in-out infinite',
            top: '15%',
            left: '40%'
          }}
        ></div>
        
        {/* Ivory Quill - Cream */}
        <div 
          className="absolute w-5 h-5 pixelated opacity-60"
          style={{
            backgroundColor: '#F5F5DC',
            animation: 'float11 10s ease-in-out infinite',
            bottom: '10%',
            right: '30%'
          }}
        ></div>
        <div 
          className="absolute w-3 h-3 pixelated opacity-50"
          style={{
            backgroundColor: '#F5F5DC',
            animation: 'float12 7s ease-in-out infinite',
            top: '60%',
            right: '5%'
          }}
        ></div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          50% { transform: translateX(15px) rotate(-180deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-25px) scale(1.1); }
        }
        @keyframes float4 {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          50% { transform: translateX(-20px) rotate(90deg); }
        }
        @keyframes float5 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(270deg); }
        }
        @keyframes float6 {
          0%, 100% { transform: translateX(0px) scale(1); }
          50% { transform: translateX(10px) scale(0.9); }
        }
        @keyframes float7 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(180deg); }
        }
        @keyframes float8 {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          50% { transform: translateX(-15px) rotate(-90deg); }
        }
        @keyframes float9 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.2); }
        }
        @keyframes float10 {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          50% { transform: translateX(20px) rotate(180deg); }
        }
        @keyframes float11 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(270deg); }
        }
        @keyframes float12 {
          0%, 100% { transform: translateX(0px) scale(1); }
          50% { transform: translateX(-10px) scale(0.8); }
        }
      `}</style>

      <div className="w-full max-w-4xl relative z-10 bg-gray-900/95 border border-gray-700 rounded-lg shadow-2xl">
        <div className="p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white font-pixel">Privacy Policy</h1>
            <p className="text-gray-300 font-pixel">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-invert max-w-none">
            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">1. Introduction and Data Controller</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                <strong>Data Controller:</strong> Quillia is the data controller responsible for processing your personal data in accordance with applicable data protection laws, including the General Data Protection Regulation (GDPR).
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">2. Information We Collect and Categories of Personal Data</h2>
              <h3 className="text-lg font-medium mb-3 text-orange-300 font-serif">Personal Information You Provide:</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li>Account information (username, email, password)</li>
                <li>Journal entries and personal content</li>
                <li>Character preferences and customizations</li>
                <li>Theme and music preferences</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-3 text-orange-300 font-serif">Automatically Collected Information:</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li>IP address and general location data</li>
                <li>Cookies and similar tracking technologies</li>
                <li>AI processing logs (story generation requests, image generation requests)</li>
                <li>Device information and browser data</li>
              </ul>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">3. How We Use Your Information and Processing Purposes</h2>
              <h3 className="text-lg font-medium mb-3 text-orange-300 font-serif">Primary Service Functions:</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li>Provide fantasy journal services</li>
                <li>Generate AI content based on your entries</li>
                <li>Personalize your experience</li>
                <li>Maintain account security</li>
              </ul>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">4. Data Sharing and Third-Party Services</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">We may share data with:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li>AI service providers for content generation</li>
                <li>Analytics services for service improvement</li>
                <li>Legal authorities when required by law</li>
              </ul>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">5. Data Security and Protection</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal data.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">6. Data Retention</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                We retain your data only as long as necessary for service provision and legal compliance.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">7. Your Rights Under GDPR and Other Privacy Laws</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li>Access your personal data</li>
                <li>Rectify inaccurate data</li>
                <li>Erase your data</li>
                <li>Restrict processing</li>
                <li>Data portability</li>
                <li>Object to processing</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-3 text-orange-300 font-serif">Exercising Your Rights:</h3>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                Contact us to exercise any of these rights.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">8. Cookies and Tracking Technologies</h2>
              <h3 className="text-lg font-medium mb-3 text-orange-300 font-serif">Types of Cookies We Use:</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li><strong>Essential Cookies:</strong> Session management, authentication, and security</li>
                <li><strong>Performance Cookies:</strong> Analytics and usage tracking</li>
                <li><strong>Functional Cookies:</strong> User preferences and personalization</li>
                <li><strong>Analytics Cookies:</strong> Service usage patterns and metrics</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-3 text-orange-300 font-serif">Specific Cookies Used:</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li><strong>Session Cookies:</strong> Temporary cookies for authentication</li>
                <li><strong>Preference Cookies:</strong> Store user settings and theme preferences</li>
                <li><strong>Analytics Cookies:</strong> Google Analytics or similar services</li>
                <li><strong>Security Cookies:</strong> Session security and authentication monitoring</li>
              </ul>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">9. International Data Transfers</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                Your data may be transferred to and processed in countries outside your jurisdiction with appropriate safeguards.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">10. Children&apos;s Privacy</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">11. Changes to Privacy Policy</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                We may update this Privacy Policy from time to time with notice to users.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">12. Contact Information and Data Protection Officer</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                For privacy-related questions, contact us through the provided contact information.
              </p>
              
              <h3 className="text-lg font-medium mb-3 text-orange-300 font-serif">Data Protection Officer (DPO):</h3>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                Our designated Data Protection Officer is available for privacy inquiries.
              </p>
            </section>
          </div>

          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-pixel px-6 py-3 rounded transition-colors"
            >
              Back to Quillia
            </Link>
          </div>
        </div>
      </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
