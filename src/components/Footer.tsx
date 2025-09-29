'use client';

import Link from 'next/link';

interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-gray-900/80 border-t border-gray-700 ${className}`}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo and Description */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-bold text-orange-400 font-pixel mb-2">
              Quillia
            </h3>
            <p className="text-sm text-gray-400 text-center md:text-left max-w-xs">
              Turn Your Days Into Adventures
            </p>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
            <Link 
              href="/legal/terms" 
              className="text-gray-400 hover:text-orange-400 transition-colors font-pixel"
            >
              Terms & Conditions
            </Link>
            <Link 
              href="/legal/privacy" 
              className="text-gray-400 hover:text-orange-400 transition-colors font-pixel"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/legal/contact" 
              className="text-gray-400 hover:text-orange-400 transition-colors font-pixel"
            >
              Contact
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center font-pixel">
            © {currentYear} Quillia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
