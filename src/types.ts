// Quick Summary
export interface QuickSummary {
  searcherName: string;
  homeBase: string;
  targetCloseWindow: string;
  primaryThesis: string;
  rightToWin: string[]; // 3 bullets
  nonNegotiables: string[]; // max 5
  goNoGo: 'go' | 'conditional' | 'no-go';
}

// Background & Edge
export interface ExperienceMap {
  functionalStrengths: string;
  industryFamiliarity: number; // 1-5
  dealExposure: string;
  operatingSuperpowers: string[]; // 3
  knownGaps: string[]; // 3
}

export interface CredibilityAnchors {
  logosRoles: string;
  regulatoryDomains: string;
  audienceTrusted: string;
}

export interface BackgroundEdge {
  experienceMap: ExperienceMap;
  credibilityAnchors: CredibilityAnchors;
}

// Deal Scorecard - Pre-built factors
export interface ScorecardFactor {
  id: string;
  name: string;
  definition: string;
  weight: number; // percentage
  score: number; // 0-5
  weighted: number; // calculated
}

// Priorities & Non-Negotiables
export interface PriorityStack {
  growthRate: number;
  profitability: number;
  recurringRevenue: number;
  lowPeopleIntensity: number;
  regSimplicity: number;
  ownerSuccessionTiming: number;
  geography: number;
  missionValues: number;
}

export interface NonNegotiables {
  industryExclusions: string[];
  businessModelExclusions: string[];
  customerMixExclusions: string[];
  contractRevExclusions: string[];
  peopleRiskExclusions: string[];
}

// Search Constraints
export interface SearchConstraints {
  revenueMin: number;
  revenueMax: number;
  ebitdaMin: number;
  ebitdaMax: number;
  ebitdaMarginMin: number;
  ebitdaMarginMax: number;
  headcountMin: number;
  headcountMax: number;
  geographyMustHave: string[];
  geographyNiceToHave: string[];
  ownerAge: string;
  ownerIntent: string;
  dealStructures: {
    sba: boolean;
    cash: boolean;
    sellerNote: boolean;
    earnout: boolean;
    minority: boolean;
  };
}

// Right-to-Win Mechanics
export interface RightToWinMechanics {
  existingChannels: string;
  referrersAdvisors: string;
  proofPoints: string;
  synergies: string;
  ninetyDayAdvantages: string;
}

// ICP & Buying Motion
export interface ICPBuyingMotion {
  primaryICP: string;
  budgetOwners: string;
  buyingTriggers: string;
  whereTheyHangOut: string;
  salesCycleLength: string;
}

// Risk Areas & Mitigations
export interface RiskMitigation {
  risk: string;
  howItShowsUp: string;
  likelihood: 'L' | 'M' | 'H';
  impact: 'L' | 'M' | 'H';
  mitigation: string;
}

// Sub-Niche Identification
export interface AdjacencyMatrixRow {
  subNiche: string;
  sameBuyer: boolean;
  sameDeliverable: boolean;
  sameChannel: boolean;
  marginUpside: boolean;
  priority: 'H' | 'M' | 'L';
}

export interface SubNicheIdentification {
  coreNicheCandidates: string[]; // top 3
  adjacencyMatrix: AdjacencyMatrixRow[];
  keywordClusterA: string;
  keywordClusterB: string;
  similarToSeedList: string[];
}

// Deal Flow Sufficiency Test
export interface DealFlowSufficiency {
  queryReadiness: {
    clearKeywordSet: boolean;
    exclusionsDefined: boolean;
    naicsSicMapped: boolean;
    geoFocusWorkable: boolean;
  };
  volumeQuality: {
    estTAM: string;
    qualifyingAfterExclusions: string;
    topQuartileFitCount: string;
    conclusion: 'sufficient' | 'borderline' | 'insufficient';
  };
  remediation: {
    widenGeo: boolean;
    expandAdjacencies: boolean;
    loosenRevenueBand: boolean;
    addChannelsPartners: boolean;
  };
}

// Operating Plan Hooks
export interface OperatingPlanHooks {
  hundredDayValuePlan: string[]; // 3 moves
  retentionPlan: string;
  pricingUpliftLevers: string;
  crossSellAssets: string;
}

// Funnel & KPI
export interface SearchKPIs {
  weeklyTargetsAdded: number;
  newConvosPerWeek: number;
  ioIsPerMonth: number;
}

export interface PostCloseKPIs {
  mrrRetainerPercent: number;
  grossMargin: number;
  utilization: number;
  nrrExpansion: number;
  pipelineCoverageMonths: number;
}

export interface FunnelKPI {
  searchKPIs: SearchKPIs;
  postCloseKPIs: PostCloseKPIs;
}

// Decision Gate
export interface DecisionGate {
  fitVerdict: 'proceed' | 'fix-reevaluate' | 'pass';
  rationale: string;
  nextActions: string;
}

// Main Onboarding Data
export interface OnboardingData {
  email: string;
  quickSummary: QuickSummary;
  backgroundEdge: BackgroundEdge;
  scorecard: ScorecardFactor[];
  prioritiesNonNegotiables: {
    priorityStack: PriorityStack;
    nonNegotiables: NonNegotiables;
  };
  searchConstraints: SearchConstraints;
  rightToWinMechanics: RightToWinMechanics;
  icpBuyingMotion: ICPBuyingMotion;
  riskMitigations: RiskMitigation[];
  subNicheIdentification: SubNicheIdentification;
  dealFlowSufficiency: DealFlowSufficiency;
  operatingPlanHooks: OperatingPlanHooks;
  funnelKPI: FunnelKPI;
  decisionGate: DecisionGate;
}

// Pre-built scorecard factors
export const PRE_BUILT_SCORECARD_FACTORS: Omit<ScorecardFactor, 'weight' | 'score' | 'weighted'>[] = [
  {
    id: 'right-to-win',
    name: 'Right-to-Win',
    definition: 'Clear advantage vs. other buyers (relationships, domain, ops playbook)',
  },
  {
    id: 'market-health',
    name: 'Market Health',
    definition: 'Growing niche, fragmentation, budget durability',
  },
  {
    id: 'quality-of-revenue',
    name: 'Quality of Revenue',
    definition: 'Recurring, multi-year contracts, low churn, prepay',
  },
  {
    id: 'service-productization',
    name: 'Service Productization',
    definition: 'Repeatable scope, templates, SOPs, automation potential',
  },
  {
    id: 'customer-concentration',
    name: 'Customer Concentration',
    definition: 'Top client < 20% revenue; diversified ICP',
  },
  {
    id: 'margin-unit-economics',
    name: 'Margin & Unit Economics',
    definition: '20–30% EBITDA typical; pricing power',
  },
  {
    id: 'sales-engine-fit',
    name: 'Sales Engine Fit',
    definition: 'Can your sales motion 2–3× qualified pipeline in 12 months?',
  },
  {
    id: 'integration-risk',
    name: 'Integration Risk',
    definition: 'Team retention, IP portability, tooling, data access',
  },
  {
    id: 'reg-compliance-simplicity',
    name: 'Reg/Compliance Simplicity',
    definition: 'Licensing, data handling, contracts risk',
  },
  {
    id: 'exit-path-clarity',
    name: 'Exit Path Clarity',
    definition: 'PE roll-up, strategic adjacency, 4–6×+ EBITDA potential',
  },
];