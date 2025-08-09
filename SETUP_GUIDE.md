# 🚀 Avax Studio - Complete Setup Guide

## 📋 Prerequisites

### 1. System Requirements
- **Node.js** 18+ 
- **Go** 1.19+ (for Avalanche CLI)
- **Docker** (for local Avalanche node)
- **Git**

### 2. Required Accounts
- **Supabase Account** (for database)
- **MetaMask Wallet** (for testing)

---

## 🔧 Step 1: Install Avalanche CLI

### Install Avalanche CLI
```bash
# Install Avalanche CLI
curl -sSfL https://raw.githubusercontent.com/ava-labs/avalanche-cli/main/scripts/install.sh | sh -s

# Add to PATH (add this to your ~/.bashrc or ~/.zshrc)
export PATH=$PATH:~/bin

# Verify installation
avalanche --version
```

### Create and Fund Private Key
```bash
# Create a new private key
avalanche key create mytestkey

# Output will show addresses:
# C-Chain address: 0x86BB07a534ADF43786ECA5Dd34A97e3F96927e4F
# P-Chain address (Fuji): P-fuji1a3azftqvygc4tlqsdvd82wks2u7nx85rhk6zqh
```

### Fund Your Key (CRITICAL STEP)
1. **Get testnet AVAX** from faucet using C-Chain address
   - Visit: https://core.app/tools/testnet-faucet/
   - Enter your C-Chain address
   - Request 10 AVAX

2. **Export your private key** to import into Core wallet
   ```bash
   avalanche key export mytestkey
   ```

3. **Import key into Core wallet** and transfer AVAX from C-Chain to P-Chain
   - Use Core web app: https://core.app/ → Stake → Cross-Chain Transfer
   - Transfer at least 5 AVAX to P-Chain for deployment fees

---

## 🗄️ Step 2: Supabase Database Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and API keys

### 2. Run Database Schema
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the complete SQL schema from `SUPABASE_SCHEMA.sql`
4. Execute the schema

### 3. Configure Environment Variables
```bash
# Backend (.env)
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 🏗️ Step 3: Project Setup

### 1. Clone and Install Dependencies
```bash
# Clone the repository
git clone <your-repo-url>
cd avax-studio

# Install all dependencies
npm run install:all
```

### 2. Environment Configuration
```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials

# Frontend environment
cd ../frontend
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### 3. Start Local Avalanche Node
```bash
# Start Avalanche node in Docker
docker-compose up -d

# Verify node is running
curl http://localhost:9650/ext/info
```

---

## 🚀 Step 4: Start the Application

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Verify Everything is Running
```bash
# Check backend health
curl http://localhost:3001/health

# Check frontend
curl http://localhost:3000
```

---

## 🎯 Step 5: First Subnet Deployment

### 1. Connect Wallet
1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Connect your MetaMask wallet

### 2. Create Subnet Configuration
1. Navigate to **Builder**
2. Add components:
   - **VM Type**: Select EVM
   - **Validators**: Set count to 3
   - **Tokenomics**: Set supply and gas price
   - **Governance**: Enable if needed

### 3. Deploy Subnet
1. Click **"Deploy to Testnet"**
2. Monitor deployment progress
3. Note the deployment ID and logs

### 4. Monitor Deployment
```bash
# Check deployment status
curl http://localhost:3001/deploy/{deploymentId}

# Check network status
curl http://localhost:3001/deploy/network/status
```

---

## 📊 Step 6: Monitoring and Management

### 1. View Subnet Metrics
1. Go to **Monitor** page
2. Enter your subnet ID
3. View real-time metrics:
   - Block height
   - TPS (Transactions per second)
   - Validator status
   - Health indicators

### 2. Manage Templates
1. Go to **Templates** page
2. Save your subnet configuration as a template
3. Browse public templates
4. Load templates into builder

### 3. Database Operations
```bash
# Check database connection
curl http://localhost:3001/health/database

# Get user templates
curl http://localhost:3001/templates/user/{userId}

# Get deployment history
curl http://localhost:3001/deploy?userId={userId}
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Avalanche CLI Not Found
```bash
# Error: avalanche: command not found
export PATH=$PATH:~/bin
# Add to your shell profile (~/.bashrc, ~/.zshrc)
```

#### 2. Insufficient Funds
```bash
# Error: insufficient funds
# Ensure P-Chain has AVAX, not just C-Chain
# Use Core wallet to transfer C-Chain → P-Chain
```

#### 3. Node Not Bootstrapped
```bash
# Error: node not bootstrapped
avalanche network status
# Wait for node sync completion
```

#### 4. Database Connection Issues
```bash
# Check Supabase credentials
curl http://localhost:3001/health/database

# Verify environment variables
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

#### 5. Frontend Build Issues
```bash
# Clear Next.js cache
cd frontend
rm -rf .next
npm run build
npm run dev
```

### Network Commands
```bash
# Start local network
avalanche network start

# Stop local network
avalanche network stop

# Clean network data
avalanche network clean

# Check network status
avalanche network status
```

### Key Management
```bash
# List all keys
avalanche key list

# Delete a key
avalanche key delete keyname

# Export key (hex format)
avalanche key export keyname

# Import existing key
avalanche key import keyname --file /path/to/key
```

---

## 📈 Production Deployment

### 1. Frontend (Vercel)
```bash
# Deploy to Vercel
vercel --prod
```

### 2. Backend (Railway/Render)
```bash
# Set environment variables
SUPABASE_URL=your_production_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
AVALANCHE_NETWORK=mainnet  # For production
```

### 3. Database (Supabase)
- Use production Supabase project
- Configure RLS policies
- Set up monitoring alerts

---

## 🔐 Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use secure secret management
- Rotate API keys regularly

### 2. Database Security
- Enable Row Level Security (RLS)
- Use service role key only in backend
- Implement proper authentication

### 3. Network Security
- Use HTTPS in production
- Implement rate limiting
- Monitor for suspicious activity

---

## 📚 API Documentation

### Deployment Endpoints
```bash
# Deploy subnet
POST /deploy
{
  "config": {
    "name": "MySubnet",
    "vmType": "evm",
    "network": "fuji"
  },
  "userId": "user-uuid"
}

# Get deployment status
GET /deploy/{deploymentId}

# List user deployments
GET /deploy?userId={userId}
```

### Monitoring Endpoints
```bash
# Get subnet metrics
GET /monitor/{subnetId}

# Get monitoring history
GET /monitor/{subnetId}/history?limit=100&hours=24

# Get subnet health
GET /monitor/health/{subnetId}
```

### Template Endpoints
```bash
# Get public templates
GET /templates

# Create template
POST /templates
{
  "userId": "user-uuid",
  "name": "My Template",
  "config": {...}
}

# Use template
POST /templates/{templateId}/use
{
  "userId": "user-uuid"
}
```

---

## 🎉 Success!

Your Subnet Studio is now fully operational! You can:

✅ **Create and deploy subnets** using the visual builder  
✅ **Monitor subnet performance** in real-time  
✅ **Save and share templates** with the community  
✅ **Manage validators** and network health  
✅ **Track deployment history** and metrics  

---

## 📞 Support

For issues and questions:
- Check the troubleshooting section above
- Review the API documentation
- Check Avalanche CLI documentation
- Open an issue in the repository

Happy subnet building! 🚀
