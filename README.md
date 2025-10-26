# BarangayChain

A blockchain-powered accountability system for transparent barangay (Philippine village/district) governance, featuring milestone-based fund disbursement and community-driven verification.

## Overview

BarangayChain enables transparent project management through blockchain technology that tokenizes citizen participation via NFTs and uses milestone-based consensus for fund releases to contractors. The platform ensures accountability in public spending while empowering citizens to verify project completion.

## Features

- **Transparent Project Management**: Create and track public projects with defined milestones and budgets
- **Milestone-Based Fund Release**: Vendors submit completed work; funds release only after citizen verification
- **Citizen Governance**: NFT-based voting system allows citizens to verify milestone completion
- **Vendor Management**: Whitelisting system for approved contractors with performance tracking
- **PYUSD Treasury**: Stable treasury token (PayPal USD) for secure and transparent fund management
- **Real-Time Transaction Monitoring**: Blockscout integration for transaction status tracking and notifications
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

### Infrastructure & Monitoring
- **Transaction Explorer**: Blockscout for transaction status monitoring
- **Treasury Token**: PYUSD (PayPal USD) - ERC20 stablecoin on Sepolia
- **Real-Time Notifications**: Event-based notifications via Blockscout webhooks

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

Create `.env` files in the respective packages. Use the `.env.example` file as a reference.

**packages/contracts/.env**
```bash
# Contract Addresses
BARANGAY_CHAIN_ADDRESS="0x949C38F6E415B2Fa0504Ee24c0c04EFe09b24953"
OFFICIAL_ADDRESS="0xB0d33Aa069dD4F55765BFF8be757848622c6e85C"
CONTRACTOR_ADDRESS="0x630353A66400597880673e1D59Cc02dc3C52E29a"

# Assets
PYUSD_SEPOLIA_ADDRESS="0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9"

# PYUSD Transfer Settings
RECIPIENT_ADDRESS="0xF7aeDa478488aABa2a89eA1644A2CC3Edd509c50"
```

**packages/app/.env.local**
```bash
# Contracts
NEXT_PUBLIC_BARANGAY_CHAIN_ADDRESS="0x949C38F6E415B2Fa0504Ee24c0c04EFe09b24953"
NEXT_PUBLIC_CITIZEN_NFT_ADDRESS="0x658636531bEc8CA6bEB43aE0652Be7d4BB4D164d"
NEXT_PUBLIC_TREASURY_ADDRESS="0xF7aeDa478488aABa2a89eA1644A2CC3Edd509c50"
NEXT_PUBLIC_ACCESS_MANAGER_ADDRESS="0xfc5186bb2D37B3838b7A412CF5206797F776434E"

# Assets
NEXT_PUBLIC_PYUSD_ADDRESS="0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9"

# IPFS
NEXT_PUBLIC_GATEWAY_URL="scarlet-inc-buzzard-641.mypinata.cloud"
NEXT_PUBLIC_INFURA_API_KEY="your_infura_api_key"
PINATA_JWT="your_pinata_jwt_token"
```

**packages/app/.env.example** (Template for new setups)
```bash
# Contracts
NEXT_PUBLIC_BARANGAY_CHAIN_ADDRESS=
NEXT_PUBLIC_CITIZEN_NFT_ADDRESS=
NEXT_PUBLIC_TREASURY_ADDRESS=
NEXT_PUBLIC_ACCESS_MANAGER_ADDRESS=

# Assets
NEXT_PUBLIC_PYUSD_ADDRESS=

# IPFS
NEXT_PUBLIC_GATEWAY_URL=
NEXT_PUBLIC_INFURA_API_KEY=
PINATA_JWT=
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
- PYUSD token custody (PayPal USD stablecoin)
- Overspending prevention
- Emergency withdrawal
- Transparent fund tracking via Blockscout

### CitizenNFT.sol
ERC721 governance token for:
- Citizen identification
- Voting rights in milestone verification
- Metadata storage on IPFS

### BarangayAccessManager.sol
Access control implementing:
- OFFICIAL_ROLE for barangay officials
- Role-based function authorization

## Project Lifecycle

### 1. Project Creation
The lifecycle begins when a barangay official creates a new project through the BarangayChain protocol.

**Steps:**
1. Official defines project details (title, description, category)
2. Official sets total budget and timeline
3. Official creates milestones with individual budgets and descriptions
4. Treasury validates budget availability from the category allocation
5. Project is created and becomes visible to whitelisted vendors

**Contract Events:**
- `ProjectCreated(projectId, title, category, totalBudget)`
- `MilestoneCreated(projectId, milestoneId, budget)`

### 2. Milestone Submission
Once a vendor completes work on a milestone, they submit it for verification.

**Steps:**
1. Whitelisted vendor claims assignment to an active project
2. Vendor completes the milestone work off-chain
3. Vendor uploads supporting documentation (photos, reports) to IPFS via Pinata
4. Vendor submits milestone through the contract with IPFS hash
5. Milestone enters "Pending Verification" state
6. Citizens with governance NFTs can now vote on the submission

**Contract Events:**
- `MilestoneSubmitted(projectId, milestoneId, vendorAddress, ipfsHash)`

**Required Documentation:**
- Progress photos/videos
- Completion reports
- Quality assurance documents
- Any relevant certifications or approvals

### 3. Voting & Verification
Citizens participate in democratic verification of milestone completion.

**Steps:**
1. Citizens view submitted milestone with IPFS documentation
2. Citizens cast votes (approve/reject) based on evidence
3. Minimum of 5 citizen votes required for quorum
4. Each citizen can vote once per milestone
5. Voting remains open until official finalization
6. Real-time vote tallies displayed on the platform

**Contract Events:**
- `MilestoneVoted(projectId, milestoneId, citizenAddress, vote)`

**Voting Criteria:**
- Work matches milestone description
- Quality meets expected standards
- Documentation is sufficient and authentic
- Timeline adherence

### 4. Completion & Fund Release
After sufficient citizen verification, officials can finalize the milestone and trigger fund release.

**Steps:**
1. Official reviews citizen votes and verification results
2. Official performs final inspection (if needed)
3. Official calls `finalizeMilestone()` function
4. Contract verifies minimum vote threshold is met
5. Treasury automatically releases milestone budget to vendor
6. Milestone marked as "Completed"
7. If all milestones completed, project status updates to "Completed"

**Contract Events:**
- `MilestoneFinalized(projectId, milestoneId, approvalStatus)`
- `FundsReleased(projectId, milestoneId, vendorAddress, amount)`
- `ProjectCompleted(projectId)` (if final milestone)

**Fund Flow:**
```
Treasury (Category Budget) → Escrow (Project Creation) → Vendor (Milestone Completion)
```

### State Transitions

**Project States:**
- `Active` → Project created, accepting vendor assignments
- `InProgress` → Vendor assigned and working
- `Completed` → All milestones finalized
- `Cancelled` → Project terminated (emergency only)

**Milestone States:**
- `Pending` → Created, awaiting vendor submission
- `Submitted` → Vendor submitted, awaiting votes
- `UnderReview` → Has votes, awaiting official finalization
- `Completed` → Finalized and funds released
- `Rejected` → Failed verification, requires resubmission

## PYUSD Integration

BarangayChain uses **PYUSD (PayPal USD)** as the primary treasury token for all financial operations.

### Why PYUSD?

- **Stability**: Fully backed 1:1 by USD deposits and short-term US treasuries
- **Transparency**: On-chain attestations and regular third-party audits
- **Compliance**: Issued by Paxos Trust Company, regulated by NYDFS
- **Low Volatility**: Eliminates crypto price risk for public fund management
- **ERC20 Standard**: Seamlessly integrates with existing smart contract infrastructure

### Treasury Operations with PYUSD

1. **Budget Deposits**: Barangay treasury receives PYUSD allocations
2. **Category Allocation**: Funds distributed across budget categories
3. **Project Escrow**: Project budgets locked in contract upon creation
4. **Milestone Payments**: Automatic PYUSD transfers to vendors upon milestone completion
5. **Real-Time Balances**: Transparent on-chain tracking of all fund movements

**Contract Address (Sepolia):**
```
0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
```

## Blockscout Integration

BarangayChain integrates **Blockscout** for transparent transaction monitoring and real-time updates.

### Key Features

#### 1. Real-Time Transaction Status Tracking
- **In-App Notifications**: Get instant updates on transaction status (pending, confirmed, failed)
- **Live Status Updates**: Monitor transactions as they progress through the network
- **Transaction Details**: View gas costs, block confirmations, and execution status

#### 2. Wallet Transaction History
- **Complete Activity Log**: Access full transaction history for any wallet address
- **Address Monitoring**: Track all interactions for treasury, vendors, and citizens
- **Filter by Type**: View specific transaction types (transfers, contract calls, votes)
- **Export Capability**: Download transaction history for auditing purposes

#### 3. Contractor Accountability & Tracking
**The most powerful feature for transparency:**

- **Vendor Activity Monitoring**: Track every action taken by contractors on the platform
  - Milestone submissions with timestamps
  - Fund withdrawals and payment history
  - Project assignments and completions
  - Performance metrics across all projects

- **Transparency Dashboard**:
  - View all contractor wallet addresses and their transaction history
  - Audit trail of every contractor interaction with the smart contracts
  - Track payment flows from treasury to specific vendors
  - Monitor contractor participation in multiple projects

- **Accountability Features**:
  - Public record of all contractor activities
  - Immutable proof of work submissions via IPFS hashes in transactions
  - Historical performance data for vendor evaluation
  - Community-verified completion records

**Example Use Cases:**
- Citizens can verify if a contractor received payment for completed milestones
- Officials can review a vendor's entire project history before whitelisting
- Auditors can trace fund flows from budget allocation to contractor payments
- Community members can track contractor performance across multiple barangays

### Integration Points

- **Smart Contract Events**: All contract interactions logged and indexed
- **IPFS Hash Tracking**: Milestone documentation references stored on-chain
- **Payment Verification**: PYUSD transfers visible and traceable
- **Multi-Address Monitoring**: Track official, citizen, and contractor addresses simultaneously

**Blockscout Explorer:**
- Sepolia: https://sepolia.etherscan.io
- Arbitrum Sepolia: https://sepolia.arbiscan.io

## Development

### Running Tests

```bash
# All tests
pnpm test

# Watch mode (in contracts package)
cd packages/contracts
pnpm test --watch
```

### Testing the Live Application

You can explore the BarangayChain platform on the testnet deployment:

**Live App:** https://barangay-chain-app.vercel.app/

#### Test as a Barangay Official

To test official features (create projects, finalize milestones, mint citizen NFTs):

1. Import this private key into MetaMask or your Web3 wallet:
   ```
   f70870020f8ac2e9797a50f778f7aa13e9d977aa9e7df40d6d4494cbee00d655
   ```

2. Ensure your wallet is connected to **Sepolia Testnet**

3. Get test PYUSD tokens from the faucet:
   - **PYUSD Faucet:** https://cloud.google.com/application/web3/faucet/ethereum/sepolia/pyusd

4. Explore official capabilities:
   - Create new projects with milestones
   - Allocate budgets across categories
   - Whitelist vendors/contractors
   - Mint citizen NFTs for governance participation
   - Finalize citizen-verified milestones
   - Release funds to contractors

**Note:** This is a testnet environment with test tokens only. All transactions are on Sepolia testnet and have no real monetary value.

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
