# Avax Studio - Build Chains, Not Commands

A comprehensive SaaS-style web application for creating, deploying, and monitoring Avalanche subnets visually without using CLI. Built with modern web technologies and featuring a beautiful glassmorphic dark theme.

## 🚀 Features

### Frontend
- **Visual Subnet Builder**: Drag-and-drop interface for configuring subnet components
- **Real-time Monitoring**: Live metrics for block height, TPS, validators, and health status
- **Template Library**: Save and share subnet configurations as reusable templates
- **Wallet Integration**: Seamless MetaMask connection for secure transactions
- **Responsive Design**: Beautiful glassmorphic UI with GSAP animations

### Backend
- **Automated Deployment**: One-click subnet deployment using avalanche-cli
- **Real-time Monitoring**: Comprehensive metrics via Avalanche RPC APIs
- **Template Management**: Full CRUD operations for subnet templates
- **Health Monitoring**: System health checks and status monitoring

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Beautiful component library
- **Redux Toolkit** - State management
- **React Flow** - Drag-and-drop interface
- **GSAP** - Advanced animations
- **MetaMask SDK** - Wallet integration

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **AvalancheJS SDK** - Avalanche blockchain integration
- **Supabase** - Database and authentication
- **Docker** - Containerization

### Infrastructure
- **AvalancheGo** - Local Avalanche node
- **avalanche-cli** - Command-line interface
- **Docker Compose** - Multi-container orchestration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** and **Docker Compose**
- **Git**
- **MetaMask** browser extension

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/subnet-studio.git
cd subnet-studio
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install

# Return to root
cd ..
```

### 3. Environment Setup

#### Backend Configuration

```bash
cd backend
cp env.example .env
```

Edit `backend/.env` with your configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Avalanche Configuration
AVALANCHE_RPC_URL=http://localhost:9650
AVALANCHE_NETWORK_ID=5
AVALANCHE_CHAIN_ID=C
```

#### Frontend Configuration

```bash
cd frontend
cp env.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AVALANCHE_RPC=http://localhost:9650
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Start Avalanche Node

```bash
# Start AvalancheGo node in Docker
docker-compose up -d

# Wait for node to sync (check logs)
docker-compose logs -f avalanche-node
```

### 5. Install avalanche-cli

```bash
# Install avalanche-cli globally
npm install -g @avalanche/cli

# Verify installation
avalanche --version
```

### 6. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

### 7. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Avalanche Node**: http://localhost:9650

## 📊 Database Setup

### Supabase Configuration

1. Create a new Supabase project
2. Create the following tables:

#### Templates Table

```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  config JSONB NOT NULL,
  author VARCHAR(255) NOT NULL,
  is_public BOOLEAN DEFAULT false,
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public templates are viewable by everyone" ON templates
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own templates" ON templates
  FOR INSERT WITH CHECK (auth.uid()::text = author);

CREATE POLICY "Users can update their own templates" ON templates
  FOR UPDATE USING (auth.uid()::text = author);

CREATE POLICY "Users can delete their own templates" ON templates
  FOR DELETE USING (auth.uid()::text = author);
```

#### Subnet Logs Table

```sql
CREATE TABLE subnet_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subnet_id VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  level VARCHAR(20) DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX idx_subnet_logs_subnet_id ON subnet_logs(subnet_id);
CREATE INDEX idx_subnet_logs_created_at ON subnet_logs(created_at);
```

## 🔧 API Documentation

### Deployment Endpoints

#### POST /deploy
Deploy a new subnet

**Request Body:**
```json
{
  "name": "MySubnet",
  "vmType": "EVM",
  "validators": ["NodeID-...", "NodeID-..."],
  "tokenomics": {
    "supply": "1000000000",
    "gasPrice": "25000000000",
    "gasLimit": "8000000"
  },
  "governance": {
    "enabled": false,
    "threshold": 2,
    "validators": []
  },
  "network": "fuji"
}
```

**Response:**
```json
{
  "deploymentId": "uuid",
  "status": "deploying",
  "message": "Deployment started successfully"
}
```

#### GET /deploy/:id
Get deployment status

**Response:**
```json
{
  "id": "uuid",
  "status": "success",
  "config": {...},
  "logs": [...],
  "subnetInfo": {...},
  "createdAt": "2024-01-01T00:00:00Z",
  "completedAt": "2024-01-01T00:05:00Z"
}
```

### Monitoring Endpoints

#### GET /monitor/:subnetId
Get subnet metrics

**Response:**
```json
{
  "subnetId": "subnet-id",
  "blockHeight": 12345,
  "tps": 150,
  "validators": [...],
  "health": "green",
  "lastUpdate": "2024-01-01T00:00:00Z"
}
```

#### GET /monitor/:subnetId/metrics
Get current metrics

#### GET /monitor/:subnetId/validators
Get validator list

#### GET /monitor/:subnetId/logs
Get subnet logs

### Template Endpoints

#### GET /templates
Get all public templates

#### POST /templates
Save new template

#### GET /templates/:id
Get specific template

#### PUT /templates/:id
Update template

#### DELETE /templates/:id
Delete template

### Health Endpoints

#### GET /health
Basic health check

#### GET /health/avalanche
Avalanche node health

#### GET /health/database
Database connection health

#### GET /health/full
Comprehensive health check

## 🎨 UI Components

### Custom Node Types

The builder includes custom React Flow nodes for:

- **VM Node**: Configure VM type (EVM, SpacesVM, CustomVM)
- **Validators Node**: Manage validator count and configuration
- **Tokenomics Node**: Set supply, gas price, and gas limit
- **Governance Node**: Enable/disable governance features

### Glassmorphic Design

The application features a modern glassmorphic design with:

- Translucent backgrounds with backdrop blur
- Subtle borders and shadows
- Gradient text and borders
- Smooth animations and transitions

## 🚀 Deployment

### Production Deployment

#### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Backend (Railway)

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main branch

#### Avalanche Node

For production, use public Avalanche nodes or deploy your own:

```bash
# Use public Fuji testnet nodes
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc

# Or use public mainnet nodes
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
```

### Environment Variables

#### Production Backend (.env)

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
```

#### Production Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_AVALANCHE_RPC=https://api.avax-test.network/ext/bc/C/rpc
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔒 Security Considerations

- **Rate Limiting**: Implemented on all API endpoints
- **CORS**: Configured for specific origins
- **Input Validation**: All user inputs are validated
- **Environment Variables**: Sensitive data stored in environment variables
- **HTTPS**: Required for production deployments

## 🧪 Testing

### Frontend Testing

```bash
cd frontend
npm run test
```

### Backend Testing

```bash
cd backend
npm test
```

### API Testing

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test Avalanche health
curl http://localhost:3001/health/avalanche

# Test full health check
curl http://localhost:3001/health/full
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/your-username/subnet-studio/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/subnet-studio/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/subnet-studio/discussions)

## 🙏 Acknowledgments

- [Avalanche](https://avalanche.network/) - For the amazing blockchain platform
- [Next.js](https://nextjs.org/) - For the excellent React framework
- [Tailwind CSS](https://tailwindcss.com/) - For the utility-first CSS framework
- [React Flow](https://reactflow.dev/) - For the drag-and-drop functionality

---

**Built with ❤️ for the Avalanche community**
