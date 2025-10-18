# 🔐 Journal Entry Encryption Setup

This document explains how to set up encryption for journal entries in the Fantasy Journal app to protect user privacy.

## Overview

Journal entries contain sensitive personal information and must be encrypted at rest. This implementation uses:

- **Development**: Local AES-256-GCM encryption with environment variables
- **Production**: AWS KMS (Key Management Service) for enterprise-grade security

## Quick Start

### 1. Development Setup

```bash
# Set up development encryption
.\scripts\setup-encryption.ps1 dev

# Test encryption
.\scripts\setup-encryption.ps1 test
```

### 2. Production Setup

```bash
# Set up production encryption (requires AWS account)
.\scripts\setup-encryption.ps1 prod
```

## Detailed Setup Instructions

### Development Environment

1. **Generate Encryption Key**:
   ```bash
   .\scripts\setup-encryption.ps1 dev
   ```
   This generates a random 32-byte encryption key and adds it to your `.env` file.

2. **Test Encryption**:
   ```bash
   .\scripts\setup-encryption.ps1 test
   ```

3. **Environment Variables** (automatically added):
   ```bash
   JOURNAL_ENCRYPTION_KEY=your-32-byte-hex-key-here
   ```

### Production Environment

1. **Create AWS Account**:
   - Go to [aws.amazon.com](https://aws.amazon.com)
   - Create a free account (credit card required but won't be charged)

2. **Set up AWS KMS**:
   ```bash
   # Install AWS CLI
   npm install -g aws-cli
   
   # Configure AWS credentials
   aws configure
   # Enter your AWS Access Key ID, Secret Access Key, region (us-east-1), output format (json)
   
   # Create KMS key
   aws kms create-key --description "Fantasy Journal Encryption Key"
   # Save the KeyId from the response
   ```

3. **Configure Environment**:
   ```bash
   .\scripts\setup-encryption.ps1 prod
   ```
   This will prompt you for your AWS credentials and KMS key ID.

4. **Environment Variables** (automatically added):
   ```bash
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_KMS_KEY_ID=arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012
   ```

## Database Migration

### 1. Run Database Migration

```bash
# Apply the database schema changes
npx prisma migrate deploy
```

### 2. Migrate Existing Data

```bash
# Run the migration script to encrypt existing entries
npx ts-node scripts/migrate-encryption.ts
```

### 3. Verify Migration

```bash
# Check migration status
npx ts-node -e "
import { getMigrationStats } from './scripts/migrate-encryption';
getMigrationStats().then(() => process.exit(0));
"
```

## Testing

### 1. Test Encryption API

```bash
# Test basic encryption
curl -X GET http://localhost:3000/api/debug/test-encryption

# Test custom text encryption
curl -X POST http://localhost:3000/api/debug/test-encryption \
  -H "Content-Type: application/json" \
  -d '{"testText": "This is a test message"}'
```

### 2. Test Journal Entry Creation

Create a new journal entry and verify it's encrypted in the database:

```sql
-- Check if entries are encrypted
SELECT id, isEncrypted, 
       CASE WHEN encryptedOriginalText IS NOT NULL THEN 'Encrypted' ELSE 'Not Encrypted' END as status
FROM "JournalEntry" 
ORDER BY createdAt DESC 
LIMIT 5;
```

## Security Considerations

### Development
- ✅ Encryption key stored in environment variables
- ✅ AES-256-GCM encryption (industry standard)
- ⚠️ Key visible to developers with server access
- ⚠️ No key rotation or audit trail

### Production
- ✅ AWS KMS for key management
- ✅ Automatic key rotation
- ✅ Audit logging
- ✅ Compliance ready (GDPR, CCPA, HIPAA)
- ✅ 99.99% uptime SLA

## Cost Analysis

### AWS KMS Costs
- **Free tier**: 20,000 requests/month
- **After free tier**: ~$0.03 per 10,000 requests
- **Estimated monthly cost**:
  - Small app (1,000 users): ~$0.50
  - Medium app (10,000 users): ~$5
  - Large app (100,000 users): ~$50

## Troubleshooting

### Common Issues

1. **"Encryption key not found"**:
   - Ensure environment variables are set correctly
   - Check `.env` file exists and contains the key

2. **"KMS encryption error"**:
   - Verify AWS credentials are correct
   - Check KMS key ID is valid
   - Ensure IAM user has KMS permissions

3. **"Invalid encrypted text format"**:
   - Data corruption or wrong encryption key
   - Check if migration was completed properly

### Debug Commands

```bash
# Test encryption functionality
.\scripts\setup-encryption.ps1 test

# Check migration status
npx ts-node -e "
import { getMigrationStats } from './scripts/migrate-encryption';
getMigrationStats();
"

# View encryption test results
curl http://localhost:3000/api/debug/test-encryption
```

## File Structure

```
src/
├── lib/
│   ├── encryption.ts          # Core encryption functions
│   ├── journal-utils.ts       # Journal entry utilities with encryption
│   └── server-utils.ts        # Updated with encryption support
├── app/api/debug/
│   └── test-encryption/       # Encryption testing endpoint
scripts/
├── migrate-encryption.ts      # Data migration script
└── setup-encryption.ps1       # Environment setup script
prisma/
└── migrations/
    └── 20250120000000_add_encryption_fields/  # Database schema update
```

## Migration Timeline

1. **Week 1**: Deploy encryption system with dual-write
2. **Week 2**: Run background migration for existing data
3. **Week 3**: Monitor and verify encryption
4. **Week 4**: Complete migration, optionally remove old fields

## Support

For issues with encryption setup:

1. Check the troubleshooting section above
2. Verify environment variables are set correctly
3. Test encryption functionality with the debug endpoints
4. Check AWS KMS permissions and key configuration

## Security Best Practices

1. **Never commit encryption keys to version control**
2. **Use different keys for different environments**
3. **Implement key rotation strategy**
4. **Monitor key usage and access**
5. **Use least-privilege access for key services**
6. **Consider key escrow for disaster recovery**
7. **Regular security audits and penetration testing**
