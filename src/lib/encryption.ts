import { KMSClient, DecryptCommand, EncryptCommand } from "@aws-sdk/client-kms";

// Initialize KMS client
const kms = new KMSClient({ 
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});

const KEY_ID = process.env.AWS_KMS_KEY_ID!;

/**
 * Get encryption key - AWS KMS only (no local fallback)
 */
async function getEncryptionKey(): Promise<string> {
  // AWS KMS is required for all environments
  if (!KEY_ID || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS KMS not configured. Please set AWS_KMS_KEY_ID, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in your .env file');
  }
  
  return KEY_ID;
}

/**
 * Encrypt text using AWS KMS
 */
export async function encryptText(text: string): Promise<string> {
  if (!text) return text;
  
  const keyId = await getEncryptionKey();
  
  try {
    const command = new EncryptCommand({
      KeyId: keyId,
      Plaintext: Buffer.from(text, 'utf8')
    });
    
    const result = await kms.send(command);
    return Buffer.from(result.CiphertextBlob!).toString('base64');
  } catch (error) {
    console.error('KMS encryption error:', error);
    throw new Error('Failed to encrypt text with AWS KMS');
  }
}

/**
 * Decrypt text using AWS KMS
 */
export async function decryptText(encryptedText: string): Promise<string> {
  if (!encryptedText) return encryptedText;
  
  try {
    const command = new DecryptCommand({
      CiphertextBlob: Buffer.from(encryptedText, 'base64')
    });
    
    const result = await kms.send(command);
    return Buffer.from(result.Plaintext!).toString('utf8');
  } catch (error) {
    console.error('KMS decryption error:', error);
    throw new Error('Failed to decrypt text with AWS KMS');
  }
}


/**
 * Test encryption/decryption functionality
 */
export async function testEncryption(): Promise<boolean> {
  try {
    const testText = "This is a test message for encryption";
    const encrypted = await encryptText(testText);
    const decrypted = await decryptText(encrypted);
    
    if (decrypted === testText) {
      console.log('✅ Encryption test passed');
      return true;
    } else {
      console.error('❌ Encryption test failed: decrypted text does not match');
      return false;
    }
  } catch (error) {
    console.error('❌ Encryption test failed:', error);
    return false;
  }
}
