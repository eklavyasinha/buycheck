import {
  StructuredAnalysis,
  PurchaseRuleConditions,
  CheckoutEvaluation,
  RuleCheckResult,
  CheckoutDecision,
} from '../../types/analysis.js';

export function evaluatePurchaseRules(
  analysis: StructuredAnalysis,
  rules: PurchaseRuleConditions
): CheckoutEvaluation {
  const checks: RuleCheckResult[] = [];
  const acknowledgementItems: string[] = [];

  const advertised = analysis.advertisedPrice || 0;
  const confirmedTotal = analysis.trueCost?.confirmedTotal || advertised;
  const extraCharges = analysis.trueCost?.totalConfirmedCharges || 0;

  // 1. Max Price Check
  if (typeof rules.maxPrice === 'number' && rules.maxPrice > 0) {
    if (confirmedTotal > rules.maxPrice) {
      checks.push({
        ruleName: 'Maximum Total Price',
        conditionDescription: `Must not exceed ${rules.currency || analysis.currency} ${rules.maxPrice}`,
        status: 'FAILED',
        evidenceOrReason: `Confirmed total of ${analysis.currency} ${confirmedTotal} exceeds maximum limit of ${rules.maxPrice}.`,
        canOverride: false,
      });
    } else {
      checks.push({
        ruleName: 'Maximum Total Price',
        conditionDescription: `Must not exceed ${rules.currency || analysis.currency} ${rules.maxPrice}`,
        status: 'PASSED',
        evidenceOrReason: `Confirmed total of ${analysis.currency} ${confirmedTotal} is within allowed limit.`,
        canOverride: true,
      });
    }
  }

  // 2. Extra Charges Limit Check
  if (typeof rules.maxExtraCharges === 'number') {
    if (extraCharges > rules.maxExtraCharges) {
      checks.push({
        ruleName: 'Maximum Additional Charges',
        conditionDescription: `Additional charges must not exceed ${rules.currency || analysis.currency} ${rules.maxExtraCharges}`,
        status: 'FAILED',
        evidenceOrReason: `Confirmed extra fees of ${analysis.currency} ${extraCharges} exceed threshold of ${rules.maxExtraCharges}.`,
        canOverride: false,
      });
    } else {
      checks.push({
        ruleName: 'Maximum Additional Charges',
        conditionDescription: `Additional charges within ${rules.currency || analysis.currency} ${rules.maxExtraCharges}`,
        status: 'PASSED',
        evidenceOrReason: `Extra fees of ${analysis.currency} ${extraCharges} are acceptable.`,
        canOverride: true,
      });
    }
  }

  // 3. Subscription Allowance Check
  if (rules.allowSubscription === false) {
    const hasActiveSubscription =
      analysis.recurringCharges.length > 0 &&
      analysis.recurringCharges.some((rc) => rc.autoRenewal !== false);

    if (hasActiveSubscription) {
      const rec = analysis.recurringCharges[0];
      checks.push({
        ruleName: 'No Unintended Subscriptions',
        conditionDescription: 'Product must not require an automatic recurring subscription',
        status: 'FAILED',
        evidenceOrReason: `Merchant mandates an automatic ${rec.billingCycle} subscription (${rec.amountAfterTrial ? `${analysis.currency} ${rec.amountAfterTrial}` : 'fee unstated'}).`,
        canOverride: false,
      });
    } else {
      checks.push({
        ruleName: 'No Unintended Subscriptions',
        conditionDescription: 'No mandatory automatic subscription renewal',
        status: 'PASSED',
        evidenceOrReason: 'No recurring subscription requirement detected.',
        canOverride: true,
      });
    }
  }

  // 4. Return Window Check
  if (typeof rules.minimumReturnWindowDays === 'number' && rules.minimumReturnWindowDays > 0) {
    const windowDays = analysis.returnPolicy?.returnWindowDays;
    if (windowDays === null || windowDays === undefined) {
      checks.push({
        ruleName: 'Minimum Return Window',
        conditionDescription: `Requires at least ${rules.minimumReturnWindowDays}-day return window`,
        status: 'UNKNOWN',
        evidenceOrReason: 'Merchant does not state a return window on the analyzed page.',
        canOverride: true,
      });
      acknowledgementItems.push(
        `Merchant return window is undisclosed. Your rule requested at least ${rules.minimumReturnWindowDays} days.`
      );
    } else if (windowDays < rules.minimumReturnWindowDays) {
      checks.push({
        ruleName: 'Minimum Return Window',
        conditionDescription: `Requires at least ${rules.minimumReturnWindowDays}-day return window`,
        status: 'FAILED',
        evidenceOrReason: `Merchant offers only ${windowDays} days return window (quote: "${analysis.returnPolicy.evidenceQuote}").`,
        canOverride: false,
      });
    } else {
      checks.push({
        ruleName: 'Minimum Return Window',
        conditionDescription: `Requires at least ${rules.minimumReturnWindowDays}-day return window`,
        status: 'PASSED',
        evidenceOrReason: `Merchant provides a ${windowDays}-day return window.`,
        canOverride: true,
      });
    }
  }

  // 5. Restocking Fee Check
  if (rules.disallowRestockingFee) {
    const fee = analysis.returnPolicy?.restockingFeePercent;
    if (typeof fee === 'number' && fee > 0) {
      checks.push({
        ruleName: 'No Restocking Fee',
        conditionDescription: 'Restocking deductions are prohibited',
        status: 'FAILED',
        evidenceOrReason: `Merchant charges a ${fee}% restocking fee upon return (quote: "${analysis.returnPolicy.evidenceQuote}").`,
        canOverride: false,
      });
    } else if (fee === null && analysis.returnPolicy?.evidenceQuote) {
      checks.push({
        ruleName: 'No Restocking Fee',
        conditionDescription: 'No restocking fee',
        status: 'PASSED',
        evidenceOrReason: 'No restocking fee mentioned in return terms.',
        canOverride: true,
      });
    }
  }

  // 6. Free Return Shipping Check
  if (rules.requireFreeReturnShipping) {
    const paidBy = analysis.returnPolicy?.returnShippingPaidBy;
    if (paidBy === 'buyer') {
      checks.push({
        ruleName: 'Free Return Shipping',
        conditionDescription: 'Return shipping must be covered by seller',
        status: 'WARNING',
        evidenceOrReason: 'Return shipping is paid by buyer. Extra return postal charges may apply.',
        canOverride: true,
      });
      acknowledgementItems.push('Return shipping is paid by the buyer, not the merchant.');
    } else if (paidBy === 'seller') {
      checks.push({
        ruleName: 'Free Return Shipping',
        conditionDescription: 'Seller covers return shipping',
        status: 'PASSED',
        evidenceOrReason: 'Free return shipping verified.',
        canOverride: true,
      });
    } else {
      checks.push({
        ruleName: 'Free Return Shipping',
        conditionDescription: 'Seller covers return shipping',
        status: 'UNKNOWN',
        evidenceOrReason: 'Return shipping payer is not clearly disclosed.',
        canOverride: true,
      });
      acknowledgementItems.push('Return shipping responsibility is unstated.');
    }
  }

  // 7. Dark Patterns Risk Assessment
  if (analysis.darkPatterns.length > 0) {
    const highSeverityPatterns = analysis.darkPatterns.filter((d) => d.severity === 'high');
    if (highSeverityPatterns.length > 0) {
      checks.push({
        ruleName: 'Dark Pattern Protection',
        conditionDescription: 'Free of high-severity deceptive checkout patterns',
        status: 'WARNING',
        evidenceOrReason: `Detected ${highSeverityPatterns.length} high-severity trap: ${highSeverityPatterns[0].title}.`,
        canOverride: true,
      });
      acknowledgementItems.push(
        `High-severity trap detected: ${highSeverityPatterns[0].title} (${highSeverityPatterns[0].potentialImpact})`
      );
    }
  }

  // Determine Overall Decision
  let decision: CheckoutDecision = 'APPROVED';
  let overallReason = 'All mandatory purchasing conditions are satisfied.';

  const hasFailed = checks.some((c) => c.status === 'FAILED');
  const hasUnknown = checks.some((c) => c.status === 'UNKNOWN');
  const hasWarning = checks.some((c) => c.status === 'WARNING');

  if (hasFailed) {
    decision = 'BLOCKED';
    const failedChecks = checks.filter((c) => c.status === 'FAILED');
    overallReason = `Blocked by rule violation: ${failedChecks.map((f) => f.evidenceOrReason).join(' ')}`;
  } else if (hasUnknown) {
    decision = 'UNABLE_TO_VERIFY';
    overallReason = 'Crucial purchase terms could not be verified from the merchant information.';
  } else if (hasWarning || acknowledgementItems.length > 0) {
    decision = 'NEEDS_REVIEW';
    overallReason = 'Purchase meets core requirements but contains warnings requiring explicit confirmation.';
  }

  return {
    decision,
    overallReason,
    checks,
    requiresUserAcknowledgement: acknowledgementItems.length > 0,
    acknowledgementItems,
    maxAuthorizedAmount: confirmedTotal,
    currency: analysis.currency,
  };
}
