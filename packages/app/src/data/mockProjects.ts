import { Category, MilestoneStatus, Project } from "../models";
import { Address } from "viem";

export const mockProjects: Project[] = [
  {
    id: 1,
    title: "Road Rehabilitation Project",
    description:
      "Repair and upgrade 2.5km of main barangay roads to improve transportation and accessibility for residents.",
    proposer: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" as Address,
    vendor: "0x5B38Da6a701c568545dCfcB03FcB875f56bEdD40" as Address,
    startDate: 1704067200n, // Jan 1, 2024
    endDate: 1719792000n, // Jul 1, 2024
    budget: 5000000000000000000n, // 5 ETH
    category: Category.Infrastructure,
    currentMilestone: 2,
    metadataURI: "ipfs://QmXKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqV",
    milestones: [
      {
        upvotes: 12,
        downvotes: 2,
        metadataURI: "ipfs://QmYKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqA",
        releaseBps: 3000,
        index: 0,
        status: MilestoneStatus.Done,
      },
      {
        upvotes: 15,
        downvotes: 1,
        metadataURI: "ipfs://QmZKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqB",
        releaseBps: 4000,
        index: 1,
        status: MilestoneStatus.Done,
      },
      {
        upvotes: 8,
        downvotes: 3,
        metadataURI: "ipfs://QmAKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqC",
        releaseBps: 3000,
        index: 2,
        status: MilestoneStatus.ForVerification,
      },
    ],
  },
  {
    id: 2,
    title: "Community Health Center Expansion",
    description:
      "Expand the barangay health center to accommodate more patients and add essential medical equipment.",
    proposer: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2" as Address,
    vendor: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db" as Address,
    startDate: 1706745600n, // Feb 1, 2024
    endDate: 1722470400n, // Aug 1, 2024
    budget: 3000000000000000000n, // 3 ETH
    category: Category.Health,
    currentMilestone: 1,
    metadataURI: "ipfs://QmBKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqD",
    milestones: [
      {
        upvotes: 18,
        downvotes: 0,
        metadataURI: "ipfs://QmCKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqE",
        releaseBps: 4000,
        index: 0,
        status: MilestoneStatus.Done,
      },
      {
        upvotes: 5,
        downvotes: 2,
        metadataURI: "ipfs://QmDKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqF",
        releaseBps: 3500,
        index: 1,
        status: MilestoneStatus.ForVerification,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 2500,
        index: 2,
        status: MilestoneStatus.Pending,
      },
    ],
  },
  {
    id: 3,
    title: "Elementary School Library Renovation",
    description:
      "Modernize the school library with new books, computers, and reading spaces to enhance student learning.",
    proposer: "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB" as Address,
    vendor: "0x617F2E2fD72FD9D5503197092aC168c91465E7f2" as Address,
    startDate: 1709424000n, // Mar 1, 2024
    endDate: 1725148800n, // Sep 1, 2024
    budget: 7500000000000000000n, // 7.5 ETH
    category: Category.Education,
    currentMilestone: 0,
    metadataURI: "ipfs://QmEKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqG",
    milestones: [
      {
        upvotes: 9,
        downvotes: 4,
        metadataURI: "ipfs://QmFKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqH",
        releaseBps: 2500,
        index: 0,
        status: MilestoneStatus.ForVerification,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 3500,
        index: 1,
        status: MilestoneStatus.Pending,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 2000,
        index: 2,
        status: MilestoneStatus.Pending,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 2000,
        index: 3,
        status: MilestoneStatus.Pending,
      },
    ],
  },
  {
    id: 4,
    title: "Waste Segregation and Recycling Program",
    description:
      "Establish a comprehensive waste management system with recycling facilities and community education campaigns.",
    proposer: "0x17F6AD8Ef982297579C203069C1DbfFE4348c372" as Address,
    vendor: "0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5021678" as Address,
    startDate: 1712102400n, // Apr 1, 2024
    endDate: 1727827200n, // Oct 1, 2024
    budget: 2500000000000000000n, // 2.5 ETH
    category: Category.Environment,
    currentMilestone: 3,
    metadataURI: "ipfs://QmGKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqI",
    milestones: [
      {
        upvotes: 20,
        downvotes: 1,
        metadataURI: "ipfs://QmHKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqJ",
        releaseBps: 2000,
        index: 0,
        status: MilestoneStatus.Done,
      },
      {
        upvotes: 17,
        downvotes: 2,
        metadataURI: "ipfs://QmIKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqK",
        releaseBps: 2500,
        index: 1,
        status: MilestoneStatus.Done,
      },
      {
        upvotes: 14,
        downvotes: 3,
        metadataURI: "ipfs://QmJKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqL",
        releaseBps: 3000,
        index: 2,
        status: MilestoneStatus.Done,
      },
      {
        upvotes: 11,
        downvotes: 2,
        metadataURI: "ipfs://QmKKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqM",
        releaseBps: 2500,
        index: 3,
        status: MilestoneStatus.ForVerification,
      },
    ],
  },
  {
    id: 5,
    title: "Skills Training and Livelihood Center",
    description:
      "Build a training center for vocational skills development to help residents start small businesses and improve income.",
    proposer: "0x03C6FcED478cBbC9a4FAB34eF9f40767739D1Ff7" as Address,
    vendor: "0x1aE0EA34a72D944a8C7603FfB3eC30a6669E454C" as Address,
    startDate: 1714780800n, // May 1, 2024
    endDate: 1730505600n, // Nov 1, 2024
    budget: 4200000000000000000n, // 4.2 ETH
    category: Category.Livelihood,
    currentMilestone: 0,
    metadataURI: "ipfs://QmLKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqN",
    milestones: [
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 3500,
        index: 0,
        status: MilestoneStatus.Pending,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 3500,
        index: 1,
        status: MilestoneStatus.Pending,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 3000,
        index: 2,
        status: MilestoneStatus.Pending,
      },
    ],
  },
  {
    id: 6,
    title: "Flood Control and Drainage System",
    description:
      "Install drainage systems and flood barriers to protect homes and infrastructure during heavy rainfall.",
    proposer: "0x0A098Eda01Ce92ff4A4CCb7A4fFFb5A43EBC70DC" as Address,
    vendor: "0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c" as Address,
    startDate: 1717459200n, // Jun 1, 2024
    endDate: 1733184000n, // Dec 1, 2024
    budget: 8000000000000000000n, // 8 ETH
    category: Category.Emergency,
    currentMilestone: 1,
    metadataURI: "ipfs://QmMKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqO",
    milestones: [
      {
        upvotes: 25,
        downvotes: 0,
        metadataURI: "ipfs://QmNKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqP",
        releaseBps: 5000,
        index: 0,
        status: MilestoneStatus.Done,
      },
      {
        upvotes: 7,
        downvotes: 5,
        metadataURI: "ipfs://QmOKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqQ",
        releaseBps: 3000,
        index: 1,
        status: MilestoneStatus.ForVerification,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 2000,
        index: 2,
        status: MilestoneStatus.Pending,
      },
    ],
  },
  {
    id: 7,
    title: "Barangay Hall Digital Transformation",
    description:
      "Upgrade barangay office with modern computers, software, and digital records management system.",
    proposer: "0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C" as Address,
    vendor: "0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB" as Address,
    startDate: 1720137600n, // Jul 1, 2024
    endDate: 1735862400n, // Jan 1, 2025
    budget: 1800000000000000000n, // 1.8 ETH
    category: Category.Administration,
    currentMilestone: 2,
    metadataURI: "ipfs://QmPKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqR",
    milestones: [
      {
        upvotes: 13,
        downvotes: 1,
        metadataURI: "ipfs://QmQKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqS",
        releaseBps: 3000,
        index: 0,
        status: MilestoneStatus.Done,
      },
      {
        upvotes: 16,
        downvotes: 0,
        metadataURI: "ipfs://QmRKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqT",
        releaseBps: 4000,
        index: 1,
        status: MilestoneStatus.Done,
      },
      {
        upvotes: 10,
        downvotes: 1,
        metadataURI: "ipfs://QmSKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqU",
        releaseBps: 3000,
        index: 2,
        status: MilestoneStatus.ForVerification,
      },
    ],
  },
  {
    id: 8,
    title: "Annual Barangay Fiesta and Cultural Festival",
    description:
      "Organize community celebration with cultural performances, sports activities, and food fair to strengthen community bonds.",
    proposer: "0x583031D1113aD414F02576BD6afaBfb302140225" as Address,
    vendor: "0xdD870fA1b7C4700F2BD7f44238821C26f7392148" as Address,
    startDate: 1722816000n, // Aug 1, 2024
    endDate: 1738540800n, // Feb 1, 2025
    budget: 6300000000000000000n, // 6.3 ETH
    category: Category.CommunityEvents,
    currentMilestone: 0,
    metadataURI: "ipfs://QmTKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqV",
    milestones: [
      {
        upvotes: 4,
        downvotes: 8,
        metadataURI: "ipfs://QmUKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqW",
        releaseBps: 4000,
        index: 0,
        status: MilestoneStatus.ForVerification,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 3500,
        index: 1,
        status: MilestoneStatus.Pending,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 2500,
        index: 2,
        status: MilestoneStatus.Pending,
      },
    ],
  },
  {
    id: 9,
    title: "Multi-Purpose Covered Court Construction",
    description:
      "Build a covered basketball court that can also serve as evacuation center and venue for community gatherings.",
    proposer: "0x2546BcD3c84621e976D8185a91A922aE77ECEc30" as Address,
    vendor: "0x0Ac1dF02185025F65202660F8167210A80dD5086" as Address,
    startDate: 1725494400n, // Sep 1, 2024
    endDate: 1741219200n, // Mar 1, 2025
    budget: 9200000000000000000n, // 9.2 ETH
    category: Category.Infrastructure,
    currentMilestone: 1,
    metadataURI: "ipfs://QmVKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqX",
    milestones: [
      {
        upvotes: 22,
        downvotes: 1,
        metadataURI: "ipfs://QmWKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqY",
        releaseBps: 2000,
        index: 0,
        status: MilestoneStatus.Done,
      },
      {
        upvotes: 12,
        downvotes: 3,
        metadataURI: "ipfs://QmXKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqZ",
        releaseBps: 2500,
        index: 1,
        status: MilestoneStatus.ForVerification,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 3000,
        index: 2,
        status: MilestoneStatus.Pending,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 2500,
        index: 3,
        status: MilestoneStatus.Pending,
      },
    ],
  },
  {
    id: 10,
    title: "Free Medical Mission and Vaccination Program",
    description:
      "Conduct quarterly health checkups, free consultations, and vaccination drives for children and elderly residents.",
    proposer: "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E" as Address,
    vendor: "0x69e1CB5cFcA8A311586e3406ed0301C06fb839a2" as Address,
    startDate: 1728172800n, // Oct 1, 2024
    endDate: 1743897600n, // Apr 1, 2025
    budget: 3700000000000000000n, // 3.7 ETH
    category: Category.Health,
    currentMilestone: 0,
    metadataURI: "ipfs://QmYKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKq1",
    milestones: [
      {
        upvotes: 6,
        downvotes: 2,
        metadataURI: "ipfs://QmZKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKq2",
        releaseBps: 3500,
        index: 0,
        status: MilestoneStatus.ForVerification,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 4000,
        index: 1,
        status: MilestoneStatus.Pending,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 2500,
        index: 2,
        status: MilestoneStatus.Pending,
      },
    ],
  },
  {
    id: 11,
    title: "School Feeding Program and Nutrition Center",
    description:
      "Provide daily nutritious meals to undernourished students and establish a nutrition monitoring system.",
    proposer: "0xF17f52151EbEF6C7334FAD080c5704D77216b732" as Address,
    vendor: "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef" as Address,
    startDate: 1730851200n, // Nov 1, 2024
    endDate: 1746576000n, // May 1, 2025
    budget: 5500000000000000000n, // 5.5 ETH
    category: Category.Education,
    currentMilestone: 0,
    metadataURI: "ipfs://QmAKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKq3",
    milestones: [
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 3000,
        index: 0,
        status: MilestoneStatus.Pending,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 4000,
        index: 1,
        status: MilestoneStatus.Pending,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 3000,
        index: 2,
        status: MilestoneStatus.Pending,
      },
    ],
  },
  {
    id: 12,
    title: "Community Garden and Urban Farming Project",
    description:
      "Develop community gardens to promote organic farming, food security, and environmental awareness among residents.",
    proposer: "0x821aEa9a577a9b44299B9c15c88cf3087F3b5544" as Address,
    vendor: "0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2" as Address,
    startDate: 1733529600n, // Dec 1, 2024
    endDate: 1749254400n, // Jun 1, 2025
    budget: 4800000000000000000n, // 4.8 ETH
    category: Category.Environment,
    currentMilestone: 2,
    metadataURI: "ipfs://QmBKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKq4",
    milestones: [
      {
        upvotes: 19,
        downvotes: 2,
        metadataURI: "ipfs://QmCKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKq5",
        releaseBps: 2500,
        index: 0,
        status: MilestoneStatus.Done,
      },
      {
        upvotes: 18,
        downvotes: 1,
        metadataURI: "ipfs://QmDKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKq6",
        releaseBps: 3000,
        index: 1,
        status: MilestoneStatus.Done,
      },
      {
        upvotes: 13,
        downvotes: 4,
        metadataURI: "ipfs://QmEKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKq7",
        releaseBps: 2500,
        index: 2,
        status: MilestoneStatus.ForVerification,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 2000,
        index: 3,
        status: MilestoneStatus.Pending,
      },
    ],
  },
  {
    id: 13,
    title: "Women's Cooperative and Sewing Workshop",
    description:
      "Establish a cooperative for women to learn sewing skills and start a sustainable income-generating business.",
    proposer: "0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e" as Address,
    vendor: "0x9FC9C2DfBA3b6cF204C37a5F690619772b926e39" as Address,
    startDate: 1736208000n, // Jan 1, 2025
    endDate: 1751932800n, // Jul 1, 2025
    budget: 2100000000000000000n, // 2.1 ETH
    category: Category.Livelihood,
    currentMilestone: 1,
    metadataURI: "ipfs://QmFKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKq8",
    milestones: [
      {
        upvotes: 21,
        downvotes: 0,
        metadataURI: "ipfs://QmGKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKq9",
        releaseBps: 4500,
        index: 0,
        status: MilestoneStatus.Done,
      },
      {
        upvotes: 9,
        downvotes: 6,
        metadataURI: "ipfs://QmHKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqA",
        releaseBps: 3000,
        index: 1,
        status: MilestoneStatus.ForVerification,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 2500,
        index: 2,
        status: MilestoneStatus.Pending,
      },
    ],
  },
  {
    id: 14,
    title: "Emergency Response Equipment and Training",
    description:
      "Purchase fire trucks, rescue equipment, and provide emergency response training to barangay volunteers.",
    proposer: "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a" as Address,
    vendor: "0x1CBD3b2770909D4e10f157cABC84C7264073C9Ec" as Address,
    startDate: 1738886400n, // Feb 1, 2025
    endDate: 1754611200n, // Aug 1, 2025
    budget: 7800000000000000000n, // 7.8 ETH
    category: Category.Emergency,
    currentMilestone: 0,
    metadataURI: "ipfs://QmIKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqB",
    milestones: [
      {
        upvotes: 11,
        downvotes: 2,
        metadataURI: "ipfs://QmJKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqC",
        releaseBps: 5000,
        index: 0,
        status: MilestoneStatus.ForVerification,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 3000,
        index: 1,
        status: MilestoneStatus.Pending,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 2000,
        index: 2,
        status: MilestoneStatus.Pending,
      },
    ],
  },
  {
    id: 15,
    title: "Barangay ID System and Database",
    description:
      "Implement a digital ID system for residents with biometric registration and centralized database management.",
    proposer: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097" as Address,
    vendor: "0xcd3B766CCDd6AE721141F452C550Ca635964ce71" as Address,
    startDate: 1741564800n, // Mar 1, 2025
    endDate: 1757289600n, // Sep 1, 2025
    budget: 3300000000000000000n, // 3.3 ETH
    category: Category.Administration,
    currentMilestone: 0,
    metadataURI: "ipfs://QmKKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqD",
    milestones: [
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 3500,
        index: 0,
        status: MilestoneStatus.Pending,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 3500,
        index: 1,
        status: MilestoneStatus.Pending,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 3000,
        index: 2,
        status: MilestoneStatus.Pending,
      },
    ],
  },
  {
    id: 16,
    title: "Youth Sports League and Tournament Series",
    description:
      "Organize annual sports tournaments and establish youth leagues to promote healthy lifestyle and team building.",
    proposer: "0x2546BcD3c84621e976D8185a91A922aE77ECEc30" as Address,
    vendor: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199" as Address,
    startDate: 1744243200n, // Apr 1, 2025
    endDate: 1759968000n, // Oct 1, 2025
    budget: 6700000000000000000n, // 6.7 ETH
    category: Category.CommunityEvents,
    currentMilestone: 1,
    metadataURI: "ipfs://QmLKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqE",
    milestones: [
      {
        upvotes: 24,
        downvotes: 1,
        metadataURI: "ipfs://QmMKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqF",
        releaseBps: 3000,
        index: 0,
        status: MilestoneStatus.Done,
      },
      {
        upvotes: 8,
        downvotes: 4,
        metadataURI: "ipfs://QmNKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqG",
        releaseBps: 4000,
        index: 1,
        status: MilestoneStatus.ForVerification,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 3000,
        index: 2,
        status: MilestoneStatus.Pending,
      },
    ],
  },
  {
    id: 17,
    title: "Street Lighting and Solar Power Installation",
    description:
      "Install energy-efficient LED street lights and solar panels along major roads and public areas for safety.",
    proposer: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955" as Address,
    vendor: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f" as Address,
    startDate: 1746921600n, // May 1, 2025
    endDate: 1762646400n, // Nov 1, 2025
    budget: 8500000000000000000n, // 8.5 ETH
    category: Category.Infrastructure,
    currentMilestone: 0,
    metadataURI: "ipfs://QmOKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqH",
    milestones: [
      {
        upvotes: 3,
        downvotes: 1,
        metadataURI: "ipfs://QmPKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqI",
        releaseBps: 2500,
        index: 0,
        status: MilestoneStatus.ForVerification,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 2500,
        index: 1,
        status: MilestoneStatus.Pending,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 2500,
        index: 2,
        status: MilestoneStatus.Pending,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 2500,
        index: 3,
        status: MilestoneStatus.Pending,
      },
    ],
  },
  {
    id: 18,
    title: "Mother and Child Healthcare Program",
    description:
      "Provide prenatal care, birthing assistance, and postnatal checkups for mothers and infants in the community.",
    proposer: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db" as Address,
    vendor: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720" as Address,
    startDate: 1749600000n, // Jun 1, 2025
    endDate: 1765324800n, // Dec 1, 2025
    budget: 4500000000000000000n, // 4.5 ETH
    category: Category.Health,
    currentMilestone: 0,
    metadataURI: "ipfs://QmQKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqJ",
    milestones: [
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 4000,
        index: 0,
        status: MilestoneStatus.Pending,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 3500,
        index: 1,
        status: MilestoneStatus.Pending,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 2500,
        index: 2,
        status: MilestoneStatus.Pending,
      },
    ],
  },
  {
    id: 19,
    title: "Computer Literacy Program for Seniors",
    description:
      "Teach basic computer skills, internet usage, and digital literacy to senior citizens in the barangay.",
    proposer: "0xBcd4042DE499D14e55001CcbB24a551F3b954096" as Address,
    vendor: "0x71bE63f3384f5fb98995898A86B02Fb2426c5788" as Address,
    startDate: 1752278400n, // Jul 1, 2025
    endDate: 1768003200n, // Jan 1, 2026
    budget: 5900000000000000000n, // 5.9 ETH
    category: Category.Education,
    currentMilestone: 2,
    metadataURI: "ipfs://QmRKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqK",
    milestones: [
      {
        upvotes: 23,
        downvotes: 2,
        metadataURI: "ipfs://QmSKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqL",
        releaseBps: 3000,
        index: 0,
        status: MilestoneStatus.Done,
      },
      {
        upvotes: 20,
        downvotes: 1,
        metadataURI: "ipfs://QmTKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqM",
        releaseBps: 3500,
        index: 1,
        status: MilestoneStatus.Done,
      },
      {
        upvotes: 14,
        downvotes: 5,
        metadataURI: "ipfs://QmUKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqN",
        releaseBps: 2000,
        index: 2,
        status: MilestoneStatus.ForVerification,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 1500,
        index: 3,
        status: MilestoneStatus.Pending,
      },
    ],
  },
  {
    id: 20,
    title: "Mangrove Reforestation and Coastal Protection",
    description:
      "Plant mangrove trees along coastal areas to prevent erosion, protect marine life, and mitigate climate change effects.",
    proposer: "0x976EA74026E726554dB657fA54763abd0C3a0aa9" as Address,
    vendor: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc" as Address,
    startDate: 1754956800n, // Aug 1, 2025
    endDate: 1770681600n, // Feb 1, 2026
    budget: 10000000000000000000n, // 10 ETH
    category: Category.Environment,
    currentMilestone: 0,
    metadataURI: "ipfs://QmVKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqO",
    milestones: [
      {
        upvotes: 15,
        downvotes: 3,
        metadataURI: "ipfs://QmWKZ8FRY9vH5pJqRqGxLZ7VzPwQdHZK5Zm2hKxBJFjKqP",
        releaseBps: 2000,
        index: 0,
        status: MilestoneStatus.ForVerification,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 2000,
        index: 1,
        status: MilestoneStatus.Pending,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 3000,
        index: 2,
        status: MilestoneStatus.Pending,
      },
      {
        upvotes: 0,
        downvotes: 0,
        metadataURI: "",
        releaseBps: 3000,
        index: 3,
        status: MilestoneStatus.Pending,
      },
    ],
  },
];
