import { KMSClient, DescribeKeyCommand, ListKeysCommand } from "@aws-sdk/client-kms";
import { config } from 'dotenv';

config(); // Load environment variables

const kms = new KMSClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

async function monitorKMS() {
  console.log('🔍 AWS KMS Monitoring Report');
  console.log('============================');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Region: ${process.env.AWS_REGION || "us-east-1"}`);
  console.log('');

  try {
    // Check if we can connect to KMS
    console.log('📡 Testing KMS Connection...');
    const listKeysResult = await kms.send(new ListKeysCommand({}));
    console.log(`✅ KMS Connection: OK (${listKeysResult.Keys?.length || 0} keys found)`);
    console.log('');

    // Check our specific key
    const keyId = process.env.AWS_KMS_KEY_ID;
    if (keyId) {
      console.log(`🔑 Checking Key: ${keyId}`);
      try {
        const describeResult = await kms.send(new DescribeKeyCommand({ KeyId: keyId }));
        const key = describeResult.KeyMetadata;
        
        console.log(`   Key ID: ${key?.KeyId}`);
        console.log(`   Description: ${key?.Description || 'No description'}`);
        console.log(`   Key State: ${key?.KeyState}`);
        console.log(`   Key Usage: ${key?.KeyUsage}`);
        console.log(`   Key Spec: ${key?.KeySpec}`);
        console.log(`   Created: ${key?.CreationDate}`);
        console.log(`   Rotation Enabled: ${key?.KeyRotationEnabled ? 'Yes' : 'No'}`);
        
        if (key?.KeyState !== 'Enabled') {
          console.log(`   ⚠️  WARNING: Key is not in 'Enabled' state!`);
        }
        
        if (!key?.KeyRotationEnabled) {
          console.log(`   ⚠️  WARNING: Key rotation is not enabled!`);
        }
        
        console.log('');
      } catch (error) {
        console.log(`   ❌ Error checking key: ${error.message}`);
        console.log('');
      }
    } else {
      console.log('❌ AWS_KMS_KEY_ID not set in environment variables');
      console.log('');
    }

    // Check environment variables
    console.log('🔧 Environment Variables Check:');
    const requiredVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_KMS_KEY_ID', 'AWS_REGION'];
    let allVarsPresent = true;
    
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`   ✅ ${varName}: Set (${value.length} characters)`);
      } else {
        console.log(`   ❌ ${varName}: Missing`);
        allVarsPresent = false;
      }
    });
    
    if (!allVarsPresent) {
      console.log('');
      console.log('⚠️  WARNING: Some required environment variables are missing!');
    }
    
    console.log('');
    console.log('📊 Summary:');
    console.log(`   KMS Connection: ${listKeysResult.Keys?.length >= 0 ? 'OK' : 'FAILED'}`);
    console.log(`   Environment: ${allVarsPresent ? 'OK' : 'INCOMPLETE'}`);
    console.log(`   Key Status: ${keyId ? 'CHECKED' : 'NOT SET'}`);
    
  } catch (error) {
    console.error('❌ KMS Monitoring Failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting Tips:');
    console.log('   1. Check AWS credentials are correct');
    console.log('   2. Verify AWS region is correct');
    console.log('   3. Ensure IAM user has KMS permissions');
    console.log('   4. Check if KMS key exists and is accessible');
  }
}

// Run if this script is executed directly
if (process.argv[1] && process.argv[1].endsWith('monitor-kms.js')) {
  monitorKMS().catch(console.error);
}

export { monitorKMS };
