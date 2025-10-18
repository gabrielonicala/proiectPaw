import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { testEncryption } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Test encryption functionality
    const testResult = await testEncryption();
    
    return NextResponse.json({
      success: testResult,
      message: testResult 
        ? 'Encryption test passed' 
        : 'Encryption test failed',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Encryption test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Encryption test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testText } = await request.json();
    
    if (!testText) {
      return NextResponse.json({ error: 'testText is required' }, { status: 400 });
    }

    // Test encryption/decryption with custom text
    const { encryptText, decryptText } = await import('@/lib/encryption');
    
    const encrypted = await encryptText(testText);
    const decrypted = await decryptText(encrypted);
    
    const success = decrypted === testText;
    
    return NextResponse.json({
      success,
      originalText: testText,
      encryptedText: encrypted,
      decryptedText: decrypted,
      message: success 
        ? 'Custom encryption test passed' 
        : 'Custom encryption test failed - decrypted text does not match original',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Custom encryption test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Custom encryption test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
