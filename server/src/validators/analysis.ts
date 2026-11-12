import { z } from 'zod';

export const ConfirmedChargeSchema = z.object({
  label: z.string(),
  amount: z.number().nonnegative(),
  type: z.enum(['shipping', 'tax', 'handling', 'fee']),
  evidenceQuote: z.string().nullable().optional().default(null),
});

export const PossibleChargeSchema = z.object({
  label: z.string(),
  estimatedAmount: z.number().nullable().optional().default(null),
  condition: z.string(),
  evidenceQuote: z.string().nullable().optional().default(null),
});

export const RecurringChargeSchema = z.object({
  billingCycle: z.enum(['monthly', 'yearly', 'other']),
  amountAfterTrial: z.number().nullable().optional().default(null),
  trialPeriodDays: z.number().nullable().optional().default(null),
  autoRenewal: z.boolean().nullable().optional().default(null),
  evidenceQuote: z.string().nullable().optional().default(null),
});

export const ReturnPolicySchema = z.object({
  returnWindowDays: z.number().nullable().optional().default(null),
  restockingFeePercent: z.number().nullable().optional().default(null),
  returnShippingPaidBy: z.enum(['seller', 'buyer', 'unknown']).default('unknown'),
  evidenceQuote: z.string().nullable().optional().default(null),
});

export const CancellationPolicySchema = z.object({
  cancellationNoticeDays: z.number().nullable().optional().default(null),
  penaltyFee: z.number().nullable().optional().default(null),
  evidenceQuote: z.string().nullable().optional().default(null),
});

export const DarkPatternSchema = z.object({
  title: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  evidenceQuote: z.string(),
  explanation: z.string(),
  potentialImpact: z.string(),
});

export const GeminiStructuredAnalysisSchema = z.object({
  productName: z.string().nullable().optional().default(null),
  advertisedPrice: z.number().default(0),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).default('INR'),
  confirmedCharges: z.array(ConfirmedChargeSchema).default([]),
  possibleCharges: z.array(PossibleChargeSchema).default([]),
  recurringCharges: z.array(RecurringChargeSchema).default([]),
  returnPolicy: ReturnPolicySchema.default({
    returnWindowDays: null,
    restockingFeePercent: null,
    returnShippingPaidBy: 'unknown',
    evidenceQuote: null,
  }),
  cancellationPolicy: CancellationPolicySchema.default({
    cancellationNoticeDays: null,
    penaltyFee: null,
    evidenceQuote: null,
  }),
  darkPatterns: z.array(DarkPatternSchema).default([]),
  missingInformation: z.array(z.string()).default([]),
  overallRiskLevel: z.enum(['low', 'medium', 'high', 'unknown']).default('unknown'),
  recommendation: z.enum(['buy', 'review', 'avoid']).default('review'),
  summary: z.string().default(''),
});

export const UrlAnalysisInputSchema = z.object({
  url: z.string().url('A valid HTTP or HTTPS URL is required'),
  preferences: z
    .object({
      expectedPrice: z.number().optional(),
      currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional(),
      desiredReturnWindowDays: z.number().optional(),
      maxAcceptableExtraCharges: z.number().optional(),
      allowSubscription: z.boolean().optional(),
      customConditions: z.array(z.string()).optional(),
    })
    .optional(),
});

export const TextAnalysisInputSchema = z.object({
  text: z.string().min(10, 'Please provide at least 10 characters of product or checkout text'),
  productName: z.string().optional(),
  preferences: z
    .object({
      expectedPrice: z.number().optional(),
      currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional(),
      desiredReturnWindowDays: z.number().optional(),
      maxAcceptableExtraCharges: z.number().optional(),
      allowSubscription: z.boolean().optional(),
      customConditions: z.array(z.string()).optional(),
    })
    .optional(),
});

export const PurchaseRuleInputSchema = z.object({
  name: z.string().min(2, 'Rule name must be at least 2 characters'),
  conditions: z.object({
    maxPrice: z.number().positive().optional(),
    currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional().default('INR'),
    condition: z.enum(['new', 'refurbished', 'any']).optional().default('new'),
    allowSubscription: z.boolean().optional().default(false),
    minimumReturnWindowDays: z.number().nonnegative().optional(),
    maxExtraCharges: z.number().nonnegative().optional(),
    requireFreeReturnShipping: z.boolean().optional(),
    disallowRestockingFee: z.boolean().optional(),
    customRequirements: z.array(z.string()).optional(),
  }),
  enabled: z.boolean().optional().default(true),
});

export const CheckoutApproveInputSchema = z.object({
  analysisId: z.string(),
  acknowledgedRisks: z.array(z.string()).optional().default([]),
  maxAuthorizedAmount: z.number().positive('Authorized amount must be positive'),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']),
});
