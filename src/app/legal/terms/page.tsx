'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

export default function TermsPage() {
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white font-pixel">Terms of Service</h1>
            <p className="text-gray-300 font-pixel">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-invert max-w-none">
            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">1. Acceptance of Terms and Binding Agreement</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User&quot;, &quot;you&quot;, or &quot;your&quot;) and Quillia (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) regarding your use of the Quillia fantasy journal application and related services (&quot;Service&quot;). By accessing, downloading, installing, or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">2. Service Description and AI-Generated Content</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                Quillia is a fantasy journal application that transforms your daily experiences into magical adventures using artificial intelligence. The Service includes:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li>AI-generated fantasy stories based on your journal entries</li>
                <li>AI-generated images and visual content</li>
                <li>Character creation and customization</li>
                <li>Theme-based adventure experiences</li>
                <li>Music and audio integration</li>
              </ul>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">3. Eligibility and Age Restrictions</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                You must be at least 13 years old to use the Service. If you are between 13 and 18 years old, you must have parental or guardian consent to use the Service.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">4. User Accounts and Registration</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">5. Acceptable Use Policy and Prohibited Activities</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                You agree not to use the Service for any unlawful or prohibited activities, including but not limited to harassment, abuse, or inappropriate content.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">6. Content Moderation and Reporting</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                We reserve the right to moderate content and remove any material that violates these Terms.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">7. Intellectual Property Rights and Content Ownership</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                You retain ownership of your original journal entries, but grant us license to use them for service provision.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">8. Privacy and Data Protection</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                Your privacy is important to us. Our collection, use, and protection of your information is governed by our Privacy Policy.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">9. Subscription Services and Payment Terms</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                Premium features may be available through subscription services with clearly stated pricing and terms.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">10. Limitation of Liability and Indemnification</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                Our liability is limited to the maximum extent permitted by law.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">11. Termination and Account Suspension</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                We may terminate or suspend your account for violations of these Terms.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">12. Dispute Resolution and Governing Law</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                Disputes will be resolved through binding arbitration in accordance with applicable law.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">13. Force Majeure</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                We are not liable for delays or failures due to circumstances beyond our control.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">14. Changes to Terms and Service</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                We may modify these Terms at any time with notice to users.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">15. Governing Law and Jurisdiction</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                These Terms are governed by applicable law and jurisdiction.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">16. Severability and Entire Agreement</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and Quillia.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">18. Company Information and Contact</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                For questions about these Terms, contact us through the provided contact information.
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
      <Footer />
    </div>
  );
}
