import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { decryptText } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    };
    
    // Test 1: Check if we can connect to database
    try {
      const userCount = await db.user.count();
      results.tests.database_connection = {
        status: 'pass',
        details: { userCount }
      };
    } catch (error) {
      results.tests.database_connection = {
        status: 'fail',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    // Test 2: Check if we can decrypt existing entries
    try {
      const recentEntry = await db.journalEntry.findFirst({
        where: { outputType: 'text' },
        orderBy: { createdAt: 'desc' },
        select: { id: true, originalText: true, reimaginedText: true }
      });
      
      if (recentEntry) {
        // Test decryption
        const decryptedOriginal = await decryptText(recentEntry.originalText);
        const decryptedReimagined = recentEntry.reimaginedText 
          ? await decryptText(recentEntry.reimaginedText) 
          : null;
        
        results.tests.existing_entry_decryption = {
          status: 'pass',
          details: {
            entryId: recentEntry.id,
            originalLength: decryptedOriginal.length,
            reimaginedLength: decryptedReimagined?.length || 0
          }
        };
      } else {
        results.tests.existing_entry_decryption = {
          status: 'skip',
          details: 'No text entries found to test'
        };
      }
    } catch (error) {
      results.tests.existing_entry_decryption = {
        status: 'fail',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    // Test 3: Check encryption coverage
    try {
      const totalEntries = await db.journalEntry.count();
      const textEntries = await db.journalEntry.count({
        where: { outputType: 'text' }
      });
      
      results.tests.encryption_coverage = {
        status: 'pass',
        details: {
          totalEntries,
          textEntries,
          coverage: totalEntries > 0 ? `${textEntries}/${totalEntries} entries are text-based` : 'No entries found'
        }
      };
    } catch (error) {
      results.tests.encryption_coverage = {
        status: 'fail',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Determine overall health
    const failedTests = Object.values(results.tests).filter((test: any) => test.status === 'fail');
    const overallStatus = failedTests.length === 0 ? 'healthy' : 'unhealthy';
    
    results.overall_status = overallStatus;
    results.duration = `${duration}ms`;
    
    return NextResponse.json(results, { 
      status: overallStatus === 'healthy' ? 200 : 503 
    });
    
  } catch (error) {
    console.error('Database encryption health check failed:', error);
    
    return NextResponse.json({
      overall_status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      tests: {}
    }, { status: 503 });
  }
}
