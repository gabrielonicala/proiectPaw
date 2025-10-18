# PowerShell script to set up encryption environment variables
# Run this script to configure encryption for your environment

Write-Host "🔐 Setting up encryption environment variables..." -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found. Please create one first." -ForegroundColor Red
    exit 1
}

# Function to add or update environment variable
function Set-EnvVar {
    param(
        [string]$Key,
        [string]$Value,
        [string]$Description
    )
    
    $envFile = ".env"
    $content = Get-Content $envFile -Raw
    
    if ($content -match "$Key=.*") {
        # Update existing variable
        $content = $content -replace "$Key=.*", "$Key=$Value"
        Set-Content $envFile $content
        Write-Host "✅ Updated $Key" -ForegroundColor Green
    } else {
        # Add new variable
        Add-Content $envFile "`n# $Description`n$Key=$Value"
        Write-Host "✅ Added $Key" -ForegroundColor Green
    }
}

# Development environment setup
if ($args[0] -eq "dev" -or $args[0] -eq "development") {
    Write-Host "🔧 Setting up development environment..." -ForegroundColor Yellow
    
    # Generate a random 32-byte key for development
    $devKey = -join ((1..32) | ForEach {Get-Random -InputObject (0..9 + 'A'..'F')})
    
    Set-EnvVar "JOURNAL_ENCRYPTION_KEY" $devKey "Development encryption key (32 bytes hex)"
    
    Write-Host "`n📝 Development setup complete!" -ForegroundColor Green
    Write-Host "The encryption key has been generated and added to your .env file." -ForegroundColor White
    Write-Host "Keep this key secure and never commit it to version control." -ForegroundColor Yellow
}

# Production environment setup
elseif ($args[0] -eq "prod" -or $args[0] -eq "production") {
    Write-Host "🚀 Setting up production environment..." -ForegroundColor Yellow
    
    Write-Host "`n📋 AWS KMS Setup Instructions:" -ForegroundColor Cyan
    Write-Host "1. Go to https://aws.amazon.com and create an account" -ForegroundColor White
    Write-Host "2. Navigate to AWS KMS in the AWS Console" -ForegroundColor White
    Write-Host "3. Create a new KMS key with description 'Fantasy Journal Encryption Key'" -ForegroundColor White
    Write-Host "4. Copy the Key ID (ARN) from the KMS console" -ForegroundColor White
    Write-Host "5. Create an IAM user with KMS permissions" -ForegroundColor White
    Write-Host "6. Get the Access Key ID and Secret Access Key" -ForegroundColor White
    
    Write-Host "`n🔑 Enter your AWS credentials:" -ForegroundColor Cyan
    
    $awsRegion = Read-Host "AWS Region (e.g., us-east-1)"
    $awsAccessKeyId = Read-Host "AWS Access Key ID"
    $awsSecretKey = Read-Host "AWS Secret Access Key" -AsSecureString
    $awsKmsKeyId = Read-Host "AWS KMS Key ID (ARN)"
    
    # Convert secure string to plain text
    $awsSecretKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($awsSecretKey))
    
    Set-EnvVar "AWS_REGION" $awsRegion "AWS region for KMS"
    Set-EnvVar "AWS_ACCESS_KEY_ID" $awsAccessKeyId "AWS access key ID"
    Set-EnvVar "AWS_SECRET_ACCESS_KEY" $awsSecretKeyPlain "AWS secret access key"
    Set-EnvVar "AWS_KMS_KEY_ID" $awsKmsKeyId "AWS KMS key ID for encryption"
    
    Write-Host "`n✅ Production setup complete!" -ForegroundColor Green
    Write-Host "Your AWS KMS credentials have been added to your .env file." -ForegroundColor White
    Write-Host "Make sure to secure your .env file and never commit it to version control." -ForegroundColor Yellow
}

# Test encryption setup
elseif ($args[0] -eq "test") {
    Write-Host "🧪 Testing encryption setup..." -ForegroundColor Yellow
    
    # Load environment variables
    Get-Content .env | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
    
    # Run the encryption test
    try {
        $testScript = @"
const { testEncryption } = require('./src/lib/encryption');
testEncryption().then(result => {
    console.log(result ? 'PASS' : 'FAIL');
    process.exit(result ? 0 : 1);
}).catch(err => {
    console.log('ERROR:', err.message);
    process.exit(1);
});
"@
        $testResult = node -e $testScript
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Encryption test passed!" -ForegroundColor Green
        } else {
            Write-Host "❌ Encryption test failed!" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error running encryption test: $_" -ForegroundColor Red
    }
}

# Show help
else {
    Write-Host "🔐 Fantasy Journal Encryption Setup" -ForegroundColor Green
    Write-Host "`nUsage:" -ForegroundColor White
    Write-Host "  .\setup-encryption.ps1 dev     - Set up development environment" -ForegroundColor Cyan
    Write-Host "  .\setup-encryption.ps1 prod    - Set up production environment" -ForegroundColor Cyan
    Write-Host "  .\setup-encryption.ps1 test    - Test encryption setup" -ForegroundColor Cyan
    Write-Host "`nExamples:" -ForegroundColor White
    Write-Host "  .\setup-encryption.ps1 dev" -ForegroundColor Gray
    Write-Host "  .\setup-encryption.ps1 prod" -ForegroundColor Gray
    Write-Host "  .\setup-encryption.ps1 test" -ForegroundColor Gray
}

Write-Host "`n🔐 Encryption setup script completed!" -ForegroundColor Green
