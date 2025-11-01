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
        
        {/* Steel Spirit - Red */}
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
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                <strong>Contact Information:</strong> For any privacy-related questions, please contact us at <Link href="mailto:contact@quillia.app" className="text-orange-400 hover:text-orange-300">contact@quillia.app</Link>
              </p>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our fantasy journal application. This policy applies to all users worldwide, with specific provisions for EU users under GDPR.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">2. Information We Collect and Categories of Personal Data</h2>
              <h3 className="text-lg font-medium mb-3 text-orange-300 font-serif">Personal Information You Provide:</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li><strong>Account Information:</strong> Email address, username (required), encrypted password</li>
                <li><strong>Journal Entries:</strong> Your personal journal content (encrypted with AWS KMS)</li>
                <li><strong>Character Data:</strong> Character names, descriptions, themes, appearances, pronouns, and customizations</li>
                <li><strong>Character Memory:</strong> AI-generated character memories, relationships, locations, and goals</li>
                <li><strong>User Preferences:</strong> Theme selections, music preferences, and app settings</li>
                <li><strong>Subscription Information:</strong> Payment details (processed by Paddle), subscription status and billing dates</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-3 text-orange-300 font-serif">Automatically Collected Information:</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li><strong>Technical Data:</strong> IP address, device information, browser type and version</li>
                <li><strong>Usage Data:</strong> App usage patterns, feature interactions, session duration</li>
                <li><strong>AI Processing Logs:</strong> Story generation requests, image generation requests (for service improvement)</li>
                <li><strong>Security Data:</strong> Login attempts, security events, and authentication logs</li>
                <li><strong>Analytics Data:</strong> In-app statistics (stories generated, images created, streaks)</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-3 text-orange-300 font-serif">Third-Party Data:</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li><strong>Google OAuth:</strong> Name and email (if you choose Google authentication)</li>
                <li><strong>Payment Data:</strong> Processed by Paddle (we do not store payment card details)</li>
              </ul>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">3. How We Use Your Information and Processing Purposes</h2>
              <h3 className="text-lg font-medium mb-3 text-orange-300 font-serif">Primary Service Functions:</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li><strong>Service Provision:</strong> Provide fantasy journal services and AI-generated content</li>
                <li><strong>AI Processing:</strong> Generate stories using OpenAI GPT-4o-mini and images using DALL-E 3/Google Gemini</li>
                <li><strong>Character Memory:</strong> Maintain character continuity, relationships, and world state across entries</li>
                <li><strong>Personalization:</strong> Customize themes, characters, and user experience</li>
                <li><strong>Account Management:</strong> Maintain user accounts, authentication, and security</li>
                <li><strong>Progress Tracking:</strong> Calculate character statistics, experience points, and achievements</li>
                <li><strong>Subscription Management:</strong> Process payments and manage subscription status</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-3 text-orange-300 font-serif">Legal Basis for Processing (GDPR):</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li><strong>Contract Performance:</strong> Providing the service you've requested</li>
                <li><strong>Legitimate Interest:</strong> Service improvement, security, and analytics</li>
                <li><strong>Consent:</strong> Optional features and marketing communications</li>
                <li><strong>Legal Obligation:</strong> Compliance with applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">4. Data Sharing and Third-Party Services</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">We may share data with the following third parties:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li><strong>AI Service Providers:</strong> OpenAI (GPT-4o-mini for story generation, DALL-E 3 for images) and Google Gemini (image generation) - only your journal entries are shared for content generation</li>
                <li><strong>Payment Processors:</strong> Paddle (Merchant of Record for subscription payments) - we do not store payment card details</li>
                <li><strong>Authentication Providers:</strong> Google (for OAuth authentication) - only if you choose Google login</li>
                <li><strong>Cloud Infrastructure:</strong> Vercel (hosting), Neon (PostgreSQL database), AWS (KMS encryption, other services) - for technical service provision</li>
                <li><strong>Email Services:</strong> Resend (for email verification and notifications)</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights and users</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-3 text-orange-300 font-serif">Data Protection Measures:</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li>All third-party services are bound by appropriate data protection agreements</li>
                <li>Journal entries are sent to AI services in plain text for processing, then encrypted for storage</li>
                <li>We minimize data sharing to only what's necessary for service provision</li>
                <li>We do not sell your personal data to third parties</li>
                <li>AI services may process your journal entries according to their own privacy policies</li>
              </ul>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">5. Data Security and Protection</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal data:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li><strong>Encryption:</strong> Journal entries are encrypted using AWS KMS (Key Management Service) before storage in the database</li>
                <li><strong>AI Processing:</strong> Journal entries are sent to AI services (OpenAI, Google Gemini) in plain text for processing</li>
                <li><strong>Secure Transmission:</strong> All data transmission uses HTTPS/TLS encryption</li>
                <li><strong>Access Controls:</strong> Limited access to personal data on a need-to-know basis</li>
                <li><strong>Secure Infrastructure:</strong> Hosted on secure cloud platforms (Vercel, Neon PostgreSQL, AWS KMS)</li>
                <li><strong>Key Management:</strong> AWS KMS provides automatic key rotation and secure key management</li>
                <li><strong>Database Security:</strong> PostgreSQL database with encrypted connections and secure access controls</li>
                <li><strong>Regular Updates:</strong> Security patches and updates applied regularly</li>
                <li><strong>Monitoring:</strong> Security monitoring and incident response procedures</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-3 text-orange-300 font-serif">Data Breach Notification:</h3>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                In the event of a data breach that may affect your personal data, we will notify you and relevant authorities within 72 hours as required by GDPR.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">6. Data Retention</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                We retain your data only as long as necessary for service provision and legal compliance:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
                <li><strong>Account Deletion:</strong> Data deleted within 30 days of account termination</li>
                <li><strong>Legal Requirements:</strong> Some data may be retained longer for legal compliance</li>
                <li><strong>Backup Data:</strong> Encrypted backups may be retained for up to 90 days</li>
                <li><strong>Analytics Data:</strong> Aggregated, anonymized data may be retained longer</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-3 text-orange-300 font-serif">Your Right to Deletion:</h3>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                You can request deletion of your data at any time by contacting us. We will process your request within 30 days.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">7. Your Rights Under GDPR and Other Privacy Laws</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">Under GDPR and other privacy laws, you have the following rights:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right of Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right of Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for consent-based processing</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-3 text-orange-300 font-serif">Exercising Your Rights:</h3>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                To exercise any of these rights, contact us at <Link href="mailto:contact@quillia.app" className="text-orange-400 hover:text-orange-300">contact@quillia.app</Link>. We will respond to your request within 30 days.
              </p>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                <strong>Supervisory Authority:</strong> If you're not satisfied with our response, you can contact your local data protection authority.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">8. Cookies and Tracking Technologies</h2>
              <h3 className="text-lg font-medium mb-3 text-orange-300 font-serif">Types of Cookies We Use:</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li><strong>Essential Cookies:</strong> Required for basic service functionality (authentication, security)</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Performance Cookies:</strong> Help us understand how you use the service</li>
                <li><strong>Analytics Cookies:</strong> Track usage patterns and service improvements</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-3 text-orange-300 font-serif">Cookie Management:</h3>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                You can control cookies through your browser settings. However, disabling essential cookies may affect service functionality.
              </p>
              
              <h3 className="text-lg font-medium mb-3 text-orange-300 font-serif">Third-Party Cookies:</h3>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                We may use third-party services that set their own cookies. These are governed by their respective privacy policies.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">9. International Data Transfers</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                Your data may be transferred to and processed in countries outside your jurisdiction:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li><strong>AI Services:</strong> OpenAI (US) for story and image generation, Google Gemini (US) for image generation</li>
                <li><strong>Cloud Infrastructure:</strong> Vercel (US) for hosting, Neon (US) for PostgreSQL database, AWS (Global) for KMS encryption</li>
                <li><strong>Payment Processing:</strong> Paddle (US) for subscription payments as Merchant of Record</li>
                <li><strong>Email Services:</strong> Resend (US) for email verification and notifications</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-3 text-orange-300 font-serif">Safeguards for International Transfers:</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li>Standard Contractual Clauses (SCCs) with third-party service providers</li>
                <li>Adequacy decisions where applicable</li>
                <li>Appropriate technical and organizational measures</li>
                <li>Regular security assessments and audits</li>
              </ul>
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
                For privacy-related questions, please contact us at:
              </p>
              <div className="mb-4 text-gray-300 font-serif leading-relaxed">
                <p><strong>Email:</strong> <Link href="mailto:contact@quillia.app" className="text-orange-400 hover:text-orange-300">contact@quillia.app</Link></p>
                <p><strong>Website:</strong> <Link href="https://quillia.app" className="text-orange-400 hover:text-orange-300">https://quillia.app</Link></p>
                <p><strong>Business Address:</strong> [Your Business Address], Romania</p>
              </div>
              
              <h3 className="text-lg font-medium mb-3 text-orange-300 font-serif">Privacy Inquiries:</h3>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                For privacy-related questions or to exercise your data protection rights, please contact us at the email address above.
              </p>
              
              <h3 className="text-lg font-medium mb-3 text-orange-300 font-serif">Supervisory Authority:</h3>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                If you're not satisfied with our response, you can contact your local data protection authority. For EU users, this is typically your country's data protection authority.
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
