import { NextRequest, NextResponse } from 'next/server';
import { encryptText, decryptText } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Test encryption/decryption cycle
    const testText = `Health check test - ${new Date().toISOString()}`;
    
    // Encrypt
    const encrypted = await encryptText(testText);
    if (!encrypted || encrypted === testText) {
      throw new Error('Encryption failed - text was not encrypted');
    }
    
    // Decrypt
    const decrypted = await decryptText(encrypted);
    if (decrypted !== testText) {
      throw new Error('Decryption failed - text does not match original');
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Check if performance is acceptable (should be under 2 seconds)
    const isHealthy = duration < 2000;
    
    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      test: 'encryption_cycle',
      details: {
        originalLength: testText.length,
        encryptedLength: encrypted.length,
        performance: duration < 1000 ? 'excellent' : duration < 2000 ? 'good' : 'slow'
      }
    }, { 
      status: isHealthy ? 200 : 207 // 207 = Multi-Status (degraded but working)
    });
    
  } catch (error) {
    console.error('Encryption health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      test: 'encryption_cycle'
    }, { status: 503 });
  }
}
