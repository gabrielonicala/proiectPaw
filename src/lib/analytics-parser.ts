/**
 * GDPR-compliant analytics parsing utilities
 * These functions parse user agent and referrer data without storing personal information
 */

export interface ParsedAnalytics {
  deviceType: 'mobile' | 'desktop' | 'tablet' | null;
  browser: string | null;
  referrerSource: string | null;
}

/**
 * Parse device type from user agent
 */
export function parseDeviceType(userAgent: string | null): 'mobile' | 'desktop' | 'tablet' | null {
  if (!userAgent) return null;
  
  const ua = userAgent.toLowerCase();
  
  // Check for mobile devices
  if (/mobile|android|iphone|ipod|blackberry|opera|mini|windows\s+ce|palm|smartphone|iemobile/i.test(ua)) {
    // Check if it's a tablet
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet';
    }
    return 'mobile';
  }
  
  // Check for tablets
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet';
  }
  
  // Default to desktop
  return 'desktop';
}

/**
 * Parse browser from user agent
 */
export function parseBrowser(userAgent: string | null): string | null {
  if (!userAgent) return null;
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('edg/')) return 'edge';
  if (ua.includes('chrome/') && !ua.includes('edg/')) return 'chrome';
  if (ua.includes('firefox/')) return 'firefox';
  if (ua.includes('safari/') && !ua.includes('chrome/')) return 'safari';
  if (ua.includes('opera/') || ua.includes('opr/')) return 'opera';
  if (ua.includes('msie') || ua.includes('trident/')) return 'ie';
  if (ua.includes('brave/')) return 'brave';
  
  return 'other';
}

/**
 * Parse referrer source (GDPR-compliant - only domain, no personal data)
 */
export function parseReferrerSource(referer: string | null): string | null {
  if (!referer) return 'direct';
  
  try {
    const url = new URL(referer);
    const hostname = url.hostname.toLowerCase();
    
    // Remove www. prefix
    const domain = hostname.replace(/^www\./, '');
    
    // Search engines
    if (domain.includes('google.')) return 'google';
    if (domain.includes('bing.')) return 'bing';
    if (domain.includes('yahoo.')) return 'yahoo';
    if (domain.includes('duckduckgo.')) return 'duckduckgo';
    if (domain.includes('yandex.')) return 'yandex';
    if (domain.includes('baidu.')) return 'baidu';
    
    // Social media
    if (domain.includes('facebook.') || domain.includes('fb.')) return 'facebook';
    if (domain.includes('twitter.') || domain.includes('x.com')) return 'twitter';
    if (domain.includes('linkedin.')) return 'linkedin';
    if (domain.includes('reddit.')) return 'reddit';
    if (domain.includes('instagram.')) return 'instagram';
    if (domain.includes('pinterest.')) return 'pinterest';
    if (domain.includes('youtube.')) return 'youtube';
    if (domain.includes('tiktok.')) return 'tiktok';
    
    // If it's from the same domain, it's internal
    if (domain.includes('quillia.app')) return 'internal';
    
    // Otherwise, it's an external referrer (we only store the domain, not full URL)
    return 'external';
  } catch {
    return 'direct';
  }
}

/**
 * Country code to full name mapping
 */
const COUNTRY_NAMES: Record<string, string> = {
  'US': 'United States', 'GB': 'United Kingdom', 'CA': 'Canada', 'AU': 'Australia',
  'DE': 'Germany', 'FR': 'France', 'IT': 'Italy', 'ES': 'Spain', 'NL': 'Netherlands',
  'BE': 'Belgium', 'CH': 'Switzerland', 'AT': 'Austria', 'SE': 'Sweden', 'NO': 'Norway',
  'DK': 'Denmark', 'FI': 'Finland', 'PL': 'Poland', 'CZ': 'Czech Republic', 'IE': 'Ireland',
  'PT': 'Portugal', 'GR': 'Greece', 'HU': 'Hungary', 'RO': 'Romania', 'BG': 'Bulgaria',
  'HR': 'Croatia', 'SK': 'Slovakia', 'SI': 'Slovenia', 'EE': 'Estonia', 'LV': 'Latvia',
  'LT': 'Lithuania', 'LU': 'Luxembourg', 'MT': 'Malta', 'CY': 'Cyprus', 'IS': 'Iceland',
  'JP': 'Japan', 'KR': 'South Korea', 'CN': 'China', 'IN': 'India', 'SG': 'Singapore',
  'MY': 'Malaysia', 'TH': 'Thailand', 'PH': 'Philippines', 'ID': 'Indonesia', 'VN': 'Vietnam',
  'TW': 'Taiwan', 'HK': 'Hong Kong', 'NZ': 'New Zealand', 'BR': 'Brazil', 'MX': 'Mexico',
  'AR': 'Argentina', 'CL': 'Chile', 'CO': 'Colombia', 'PE': 'Peru', 'VE': 'Venezuela',
  'ZA': 'South Africa', 'EG': 'Egypt', 'NG': 'Nigeria', 'KE': 'Kenya', 'MA': 'Morocco',
  'AE': 'United Arab Emirates', 'SA': 'Saudi Arabia', 'IL': 'Israel', 'TR': 'Turkey',
  'RU': 'Russia', 'UA': 'Ukraine', 'BY': 'Belarus', 'KZ': 'Kazakhstan', 'PK': 'Pakistan',
  'BD': 'Bangladesh', 'LK': 'Sri Lanka', 'NP': 'Nepal', 'MM': 'Myanmar', 'KH': 'Cambodia',
  'LA': 'Laos', 'BN': 'Brunei', 'FJ': 'Fiji', 'PG': 'Papua New Guinea', 'NC': 'New Caledonia',
};

/**
 * Get country name from IP using a free GeoIP service
 * Uses ipapi.co free tier (1000 requests/day) or Cloudflare header if available
 * Returns full country name (e.g., 'United States', 'United Kingdom') or null
 */
export async function getCountryFromIP(
  ip: string | null,
  requestHeaders?: Headers
): Promise<string | null> {
  if (!ip || ip === 'unknown') return null;

  let countryCode: string | null = null;

  // First, check for Cloudflare country header (if using Cloudflare)
  if (requestHeaders) {
    const cfCountry = requestHeaders.get('cf-ipcountry');
    if (cfCountry && cfCountry !== 'XX' && cfCountry.length === 2) {
      countryCode = cfCountry.toUpperCase();
    }
  }

  // Skip localhost/internal IPs
  if (!countryCode && (ip.startsWith('127.') || 
      ip.startsWith('192.168.') || 
      ip.startsWith('10.') || 
      ip.startsWith('172.16.') ||
      ip === '::1' ||
      ip === 'localhost')) {
    return null;
  }

  // If we don't have a country code yet, fetch it
  if (!countryCode) {
    // Try ipapi.co first (free tier: 1000 requests/day) - get full country name
    try {
      const response = await fetch(`https://ipapi.co/${ip}/country_name/`, {
        headers: {
          'User-Agent': 'Quillia Analytics',
        },
        signal: AbortSignal.timeout(2000),
      });

      if (response.ok) {
        const countryName = (await response.text()).trim();
        if (countryName && countryName.length > 0 && countryName !== 'None') {
          return countryName;
        }
      }
    } catch (error) {
      // Try fallback service if first one fails
    }

    // Fallback: Use ip-api.com (free tier: 45 requests/minute) - get country name
    try {
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=country`, {
        headers: {
          'User-Agent': 'Quillia Analytics',
        },
        signal: AbortSignal.timeout(2000),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.country && typeof data.country === 'string' && data.country.length > 0) {
          return data.country;
        }
        // If we got countryCode but not country name, convert it
        if (data.countryCode && typeof data.countryCode === 'string' && data.countryCode.length === 2) {
          countryCode = data.countryCode.toUpperCase();
        }
      }
    } catch (error) {
      // Log errors in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.warn('Country detection failed for IP:', ip.substring(0, 15), error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }

  // If we have a country code but not a name, convert it
  if (countryCode && COUNTRY_NAMES[countryCode]) {
    return COUNTRY_NAMES[countryCode];
  }

  return null;
}

/**
 * Parse all analytics data from request
 */
export function parseAnalyticsData(userAgent: string | null, referer: string | null): ParsedAnalytics {
  return {
    deviceType: parseDeviceType(userAgent),
    browser: parseBrowser(userAgent),
    referrerSource: parseReferrerSource(referer),
  };
}

