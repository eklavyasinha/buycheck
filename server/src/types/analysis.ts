export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface ConfirmedCharge {
  label: string;
  amount: number;
  type: 'shipping' | 'tax' | 'handling' | 'fee';
  evidenceQuote: string | null;
}

export interface PossibleCharge {
  label: string;
  estimatedAmount: number | null;
  condition: string;
  evidenceQuote: string | null;
}

export interface RecurringCharge {
  billingCycle: 'monthly' | 'yearly' | 'other';
  amountAfterTrial: number | null;
  trialPeriodDays: number | null;
  autoRenewal: boolean | null;
  evidenceQuote: string | null;
}

export interface ReturnPolicy {
  returnWindowDays: number | null;
  restockingFeePercent: number | null;
  returnShippingPaidBy: 'seller' | 'buyer' | 'unknown';
  evidenceQuote: string | null;
}

export interface CancellationPolicy {
  cancellationNoticeDays: number | null;
  penaltyFee: number | null;
  evidenceQuote: string | null;
}

export interface DarkPatternFinding {
  title: string;
  severity: 'low' | 'medium' | 'high';
  evidenceQuote: string;
  explanation: string;
  potentialImpact: string;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'unknown';
export type Recommendation = 'buy' | 'review' | 'avoid';

export interface AnalysisMetadata {
  sourceType: 'url' | 'image' | 'text';
  sourceReference?: string;
  analyzedAt: string;
  modelUsed: string;
  confidenceScore: number;
  limitations: string[];
  isDemoAnalysis?: boolean;
}

export interface TrueCostCalculation {
  advertisedPrice: number;
  currency: Currency;
  totalConfirmedCharges: number;
  confirmedTotal: number;
  minimumPossibleTotal: number;
  maximumEstimatedTotal: number | null;
  hasUncertainCharges: boolean;
  recurringMonthlyEquivalent: number | null;
  recurringYearlyEquivalent: number | null;
  chargesBreakdown: {
    category: string;
    amount: number;
    confirmed: boolean;
  }[];
}

export interface StructuredAnalysis {
  productName: string | null;
  advertisedPrice: number;
  currency: Currency;
  confirmedCharges: ConfirmedCharge[];
  possibleCharges: PossibleCharge[];
  recurringCharges: RecurringCharge[];
  returnPolicy: ReturnPolicy;
  cancellationPolicy: CancellationPolicy;
  darkPatterns: DarkPatternFinding[];
  missingInformation: string[];
  overallRiskLevel: RiskLevel;
  recommendation: Recommendation;
  summary: string;
  trueCost?: TrueCostCalculation;
  metadata?: AnalysisMetadata;
}

export interface PurchaseRuleConditions {
  maxPrice?: number;
  currency?: Currency;
  condition?: 'new' | 'refurbished' | 'any';
  allowSubscription?: boolean;
  minimumReturnWindowDays?: number;
  maxExtraCharges?: number;
  requireFreeReturnShipping?: boolean;
  disallowRestockingFee?: boolean;
  customRequirements?: string[];
}

export type RuleEvaluationStatus = 'PASSED' | 'FAILED' | 'WARNING' | 'UNKNOWN';

export interface RuleCheckResult {
  ruleName: string;
  conditionDescription: string;
  status: RuleEvaluationStatus;
  evidenceOrReason: string;
  canOverride: boolean;
}

export type CheckoutDecision = 'APPROVED' | 'BLOCKED' | 'NEEDS_REVIEW' | 'UNABLE_TO_VERIFY';

export interface CheckoutEvaluation {
  decision: CheckoutDecision;
  overallReason: string;
  checks: RuleCheckResult[];
  requiresUserAcknowledgement: boolean;
  acknowledgementItems: string[];
  maxAuthorizedAmount: number;
  currency: Currency;
}

export interface ProtectionFactor {
  title: string;
  status: 'supported' | 'unsupported' | 'uncertain';
  description: string;
  officialReference: string;
}

export interface ProtectionEvaluation {
  eligibleCategory: boolean | 'uncertain';
  protectionFactors: ProtectionFactor[];
  limitations: string[];
  disclaimer: string;
  officialPolicyUrl: string;
}
