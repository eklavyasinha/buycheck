import { ConfirmedCharge, PossibleCharge, RecurringCharge, TrueCostCalculation, Currency } from '../../types/analysis.js';

export function calculateTrueCost(
  advertisedPrice: number,
  currency: Currency,
  confirmedCharges: ConfirmedCharge[] = [],
  possibleCharges: PossibleCharge[] = [],
  recurringCharges: RecurringCharge[] = [],
  missingInformation: string[] = []
): TrueCostCalculation {
  // Ensure non-negative advertised price
  const basePrice = Math.max(0, advertisedPrice || 0);

  // Sum only confirmed charges
  const totalConfirmedExtra = confirmedCharges.reduce((acc, curr) => {
    return acc + Math.max(0, curr.amount || 0);
  }, 0);

  const confirmedTotal = Number((basePrice + totalConfirmedExtra).toFixed(2));

  // Calculate potential estimated extra charges
  let possibleAdditionalSum = 0;
  let hasIndeterminatePossibleCharges = false;

  possibleCharges.forEach((pc) => {
    if (typeof pc.estimatedAmount === 'number' && pc.estimatedAmount > 0) {
      possibleAdditionalSum += pc.estimatedAmount;
    } else {
      hasIndeterminatePossibleCharges = true;
    }
  });

  const maximumEstimatedTotal =
    possibleAdditionalSum > 0 || hasIndeterminatePossibleCharges
      ? Number((confirmedTotal + possibleAdditionalSum).toFixed(2))
      : null;

  // Recurring calculations
  let recurringMonthlyEquivalent: number | null = null;
  let recurringYearlyEquivalent: number | null = null;

  if (recurringCharges && recurringCharges.length > 0) {
    let monthlyTotal = 0;
    let foundRecurring = false;

    for (const rec of recurringCharges) {
      if (typeof rec.amountAfterTrial === 'number' && rec.amountAfterTrial > 0) {
        foundRecurring = true;
        if (rec.billingCycle === 'monthly') {
          monthlyTotal += rec.amountAfterTrial;
        } else if (rec.billingCycle === 'yearly') {
          monthlyTotal += rec.amountAfterTrial / 12;
        }
      }
    }

    if (foundRecurring) {
      recurringMonthlyEquivalent = Number(monthlyTotal.toFixed(2));
      recurringYearlyEquivalent = Number((monthlyTotal * 12).toFixed(2));
    }
  }

  // Check if there is missing tax/shipping disclosure
  const mentionsUnclearPricing = missingInformation.some((m) =>
    /shipping|tax|handling|fee|delivery|duty/i.test(m)
  );

  const hasUncertainCharges =
    possibleCharges.length > 0 || hasIndeterminatePossibleCharges || mentionsUnclearPricing;

  // Visual breakdown for charts
  const chargesBreakdown = [
    {
      category: 'Advertised Price',
      amount: basePrice,
      confirmed: true,
    },
    ...confirmedCharges.map((c) => ({
      category: c.label || `${c.type} fee`,
      amount: c.amount,
      confirmed: true,
    })),
    ...possibleCharges
      .filter((pc) => typeof pc.estimatedAmount === 'number' && pc.estimatedAmount > 0)
      .map((pc) => ({
        category: `[Est] ${pc.label}`,
        amount: pc.estimatedAmount as number,
        confirmed: false,
      })),
  ];

  return {
    advertisedPrice: basePrice,
    currency,
    totalConfirmedCharges: Number(totalConfirmedExtra.toFixed(2)),
    confirmedTotal,
    minimumPossibleTotal: confirmedTotal,
    maximumEstimatedTotal,
    hasUncertainCharges,
    recurringMonthlyEquivalent,
    recurringYearlyEquivalent,
    chargesBreakdown,
  };
}
