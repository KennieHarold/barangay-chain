# BarangayChain

A blockchain-powered accountability system for transparent barangay (Philippine village/district) governance, featuring milestone-based fund disbursement and community-driven verification.

## Overview

BarangayChain enables transparent project management through a distributed ledger system that tokenizes citizen participation via NFTs and uses milestone-based consensus for fund releases to contractors. The platform ensures accountability in public spending while empowering citizens to verify project completion.

## Features

- **Transparent Project Management**: Create and track public projects with defined milestones and budgets
- **Milestone-Based Fund Release**: Vendors submit completed work; funds release only after citizen verification
- **Citizen Governance**: NFT-based voting system allows citizens to verify milestone completion
- **Vendor Management**: Whitelisting system for approved contractors with performance tracking
- **Category-Based Treasury**: Budget allocations across infrastructure, health, education, environment, and more
- **Decentralized Storage**: IPFS integration via Pinata for immutable document storage
- **Role-Based Access Control**: Hierarchical permissions for officials, citizens, and vendors

## Tech Stack

### Blockchain
- **Platform**: Ethereum (Solidity 0.8.28)
- **Networks**: Sepolia Testnet, Arbitrum Sepolia
- **Development**: Hardhat 3.0.7
- **Libraries**: OpenZeppelin Contracts v5.4.0
- **Testing**: Mocha + Chai

### Frontend
- **Framework**: Next.js 15.5.5 with React 19.1.0
- **Web3**: Wagmi v2.18.1 + Viem v2.38.2
- **UI**: Material-UI v7.3.4 + Tailwind CSS v4
- **State Management**: TanStack React Query v5
- **Forms**: React Hook Form + Yup
- **Storage**: Pinata (IPFS)

## Project Structure

```
barangay-chain/
├── packages/
│   ├── contracts/           # Smart contracts package
│   │   ├── contracts/
│   │   │   ├── BarangayChain.sol         # Main protocol
│   │   │   ├── Treasury.sol              # Fund management
│   │   │   ├── CitizenNFT.sol            # Governance NFT
│   │   │   └── BarangayAccessManager.sol # Access control
│   │   ├── test/            # Contract tests
│   │   └── ignition/        # Deployment scripts
│   └── app/                 # Next.js frontend
│       └── src/
│           ├── app/         # Routes and pages
│           ├── components/  # React components
│           └── hooks/       # Custom Web3 hooks
```

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- MetaMask or compatible Web3 wallet
- Infura API key (for Ethereum RPC)
- Pinata API keys (for IPFS storage)

### Installation

```bash
# Install dependencies
pnpm install
```

### Smart Contracts

```bash
# Compile contracts
pnpm contracts:build

# Run tests
pnpm contracts:test

# Deploy to network
pnpm contracts:deploy

# Verify contracts
pnpm contracts:verify
```

### Frontend Application

```bash
# Development server
pnpm dev
# or
pnpm app:dev

# Production build
pnpm app:build

# Start production server
pnpm app:start
```

### Environment Variables

Create `.env` files in the respective packages:

**contracts/.env**
```
SEPOLIA_RPC_URL=your_infura_or_alchemy_url
PRIVATE_KEY=your_deployment_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**app/.env.local**
```
NEXT_PUBLIC_INFURA_API_KEY=your_infura_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
```

## Smart Contracts

### BarangayChain.sol
Main protocol contract handling:
- Project creation and management
- Milestone submission and verification
- Vendor whitelisting
- Fund release orchestration

### Treasury.sol
Financial management with:
- Category-based budgeting (Infrastructure, Health, Education, etc.)
- ERC20 token custody (USDT-compatible)
- Overspending prevention
- Emergency withdrawal

### CitizenNFT.sol
ERC721 governance token for:
- Citizen identification
- Voting rights in milestone verification
- Metadata storage on IPFS

### BarangayAccessManager.sol
Access control implementing:
- OFFICIAL_ROLE for barangay officials
- Role-based function authorization

## Key Workflows

### 1. Project Creation
1. Official creates project with milestones
2. Treasury allocates budget from category
3. Project becomes available for vendors

### 2. Milestone Completion
1. Vendor submits milestone with documentation (IPFS)
2. Citizens vote to verify completion (5 votes required)
3. Official finalizes milestone
4. Treasury releases funds to vendor

### 3. Citizen Governance
1. Citizen receives NFT from official
2. Citizen can vote on active project milestones
3. One vote per milestone per citizen

## Budget Categories

- Infrastructure: 28%
- Health: 14%
- Education: 13%
- Environment: 13%
- Livelihood: 10%
- Emergency: 9%
- Community Events: 9%
- Administration: 8%

## Development

### Running Tests

```bash
# All tests
pnpm test

# Watch mode (in contracts package)
cd packages/contracts
pnpm test --watch
```

### Building for Production

```bash
# Build all packages
pnpm build
```

## Deployment

The project uses Hardhat Ignition for reproducible deployments:

1. Configure network in [hardhat.config.ts](packages/contracts/hardhat.config.ts)
2. Set deployment parameters
3. Run deployment script
4. Verify contracts on Etherscan/Blockscout

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under MIT for contracts and UNLICENSED for the application.

## Support

For issues or questions, please open an issue in the repository.

---

Built with transparency and accountability in mind for better barangay governance.
