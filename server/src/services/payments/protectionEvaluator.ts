import { ProtectionEvaluation, StructuredAnalysis, ProtectionFactor } from '../../types/analysis.js';

export function evaluatePayPalProtection(analysis: StructuredAnalysis): ProtectionEvaluation {
  const factors: ProtectionFactor[] = [];
  const limitations: string[] = [];

  // Check 1: Physical vs Intangible / Service
  const lowerName = (analysis.productName || '').toLowerCase();
  const isDigitalOrService =
    lowerName.includes('course') ||
    lowerName.includes('software') ||
    lowerName.includes('license') ||
    lowerName.includes('membership') ||
    lowerName.includes('subscription') ||
    lowerName.includes('masterclass');

  if (isDigitalOrService) {
    factors.push({
      title: 'Digital Goods & Services Condition',
      status: 'supported',
      description:
        'PayPal Purchase Protection covers intangible goods, digital goods, and services, subject to proof of non-delivery or significantly not as described terms.',
      officialReference: 'PayPal User Agreement — Purchase Protection § Intangible Items',
    });
    limitations.push(
      'Digital items require verification of delivery details or access logs in the event of an item-not-received claim.'
    );
  } else {
    factors.push({
      title: 'Physical Tangible Item Coverage',
      status: 'supported',
      description:
        'Eligible physical goods shipped with proof of delivery from an authorized courier are covered under unauthorized payment and Item Not Received programs.',
      officialReference: 'PayPal User Agreement — Purchase Protection § Tangible Goods',
    });
  }

  // Check 2: Single Payment vs Recurring / Billing Agreements
  if (analysis.recurringCharges.length > 0) {
    factors.push({
      title: 'Recurring Automatic Billing Exclusions',
      status: 'uncertain',
      description:
        'Recurring subscription charges authorized via pre-approved billing agreements require separate dispute resolution for renewal cancellations.',
      officialReference: 'PayPal User Agreement § Automatic Payments & Preapproved Authorizations',
    });
    limitations.push(
      'Disputes regarding recurring fees must typically be initiated within applicable policy dispute windows (usually 180 days from transaction date).'
    );
  }

  // Check 3: Excluded Categories (Motor vehicles, custom industrial machinery, real estate)
  if (
    lowerName.includes('vehicle') ||
    lowerName.includes('car') ||
    lowerName.includes('real estate') ||
    lowerName.includes('gold') ||
    lowerName.includes('crypto')
  ) {
    factors.push({
      title: 'High-Risk / Excluded Category Warning',
      status: 'unsupported',
      description:
        'Motor vehicles, real estate, precious metals bullion, and cryptocurrency transfers are explicitly excluded from PayPal Purchase Protection.',
      officialReference: 'PayPal Ineligible Items List',
    });
    limitations.push('This item category appears on PayPal’s published list of ineligible transactions.');
  }

  // Check 4: Payment Channel & Currency
  factors.push({
    title: 'Standard PayPal Checkout Channel',
    status: 'supported',
    description:
      'Transaction must be completed through an authenticated PayPal checkout session (not Personal "Friends & Family" transfer).',
    officialReference: 'PayPal Purchase Protection § Qualified Payments',
  });

  return {
    eligibleCategory: factors.some((f) => f.status === 'unsupported') ? false : true,
    protectionFactors: factors,
    limitations,
    disclaimer:
      'Informational evaluation only. BuyCheck is not affiliated with or endorsed by PayPal. Actual Purchase Protection eligibility is determined solely by PayPal in accordance with its User Agreement and applicable regional terms at the time of claim filing. Merchant return policies and PayPal Purchase Protection are independent.',
    officialPolicyUrl: 'https://www.paypal.com/webapps/mpp/paypal-safety-and-security',
  };
}
