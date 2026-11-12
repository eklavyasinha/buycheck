import assert from 'assert';
import { calculateTrueCost } from '../src/services/analysis/calculator.js';
import { evaluatePurchaseRules } from '../src/services/rules/ruleEngine.js';
import { evaluatePayPalProtection } from '../src/services/payments/protectionEvaluator.js';
import { validateUrlForSSRF } from '../src/services/analysis/urlScraper.js';
import { GeminiStructuredAnalysisSchema } from '../src/validators/analysis.js';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res
        .then(() => {
          console.log(`  ✅ PASS: ${name}`);
          passed++;
        })
        .catch((err) => {
          console.error(`  ❌ FAIL: ${name}`, err.message);
          failed++;
        });
    }
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${name}`, err.message);
    failed++;
  }
}

async function runAllTests() {
  console.log('\n--- BUYCHECK SYSTEM TEST SUITE ---\n');

  // Test 1: True Cost Calculator
  test('Calculator: adds confirmed charges correctly without double-counting', () => {
    const calc = calculateTrueCost(
      10000,
      'INR',
      [
        { label: 'Shipping', amount: 200, type: 'shipping', evidenceQuote: 'Standard post' },
        { label: 'Tax', amount: 500, type: 'tax', evidenceQuote: 'GST' },
      ],
      [
        { label: 'Restocking', estimatedAmount: 300, condition: 'if opened', evidenceQuote: '15%' },
      ],
      [
        {
          billingCycle: 'monthly',
          amountAfterTrial: 499,
          trialPeriodDays: 7,
          autoRenewal: true,
          evidenceQuote: 'Renews',
        },
      ]
    );

    assert.strictEqual(calc.advertisedPrice, 10000);
    assert.strictEqual(calc.totalConfirmedCharges, 700);
    assert.strictEqual(calc.confirmedTotal, 10700);
    assert.strictEqual(calc.maximumEstimatedTotal, 11000);
    assert.strictEqual(calc.recurringMonthlyEquivalent, 499);
    assert.strictEqual(calc.recurringYearlyEquivalent, 5988);
  });

  // Test 2: Rule Engine BLOCKED outcome
  test('Rule Engine: BLOCKS when confirmed price exceeds maximum', () => {
    const sampleAnalysis: any = {
      productName: 'Gaming Laptop',
      advertisedPrice: 50000,
      currency: 'INR',
      confirmedCharges: [],
      possibleCharges: [],
      recurringCharges: [],
      returnPolicy: { returnWindowDays: 14, restockingFeePercent: 0, returnShippingPaidBy: 'seller' },
      darkPatterns: [],
      missingInformation: [],
      trueCost: { confirmedTotal: 50000, totalConfirmedCharges: 0 },
    };

    const rules = {
      maxPrice: 40000,
      currency: 'INR' as const,
      allowSubscription: true,
    };

    const evalResult = evaluatePurchaseRules(sampleAnalysis, rules);
    assert.strictEqual(evalResult.decision, 'BLOCKED');
    assert.ok(evalResult.checks.some((c) => c.status === 'FAILED'));
  });

  // Test 3: Rule Engine APPROVED outcome
  test('Rule Engine: APPROVES when all rules satisfied with verified info', () => {
    const sampleAnalysis: any = {
      productName: 'Mechanical Keyboard',
      advertisedPrice: 3500,
      currency: 'INR',
      confirmedCharges: [{ label: 'Tax', amount: 350, type: 'tax', evidenceQuote: '10%' }],
      possibleCharges: [],
      recurringCharges: [],
      returnPolicy: { returnWindowDays: 30, restockingFeePercent: null, returnShippingPaidBy: 'seller', evidenceQuote: 'Free returns within 30 days' },
      darkPatterns: [],
      missingInformation: [],
      trueCost: { confirmedTotal: 3850, totalConfirmedCharges: 350 },
    };

    const rules = {
      maxPrice: 5000,
      currency: 'INR' as const,
      allowSubscription: false,
      minimumReturnWindowDays: 14,
    };

    const evalResult = evaluatePurchaseRules(sampleAnalysis, rules);
    assert.strictEqual(evalResult.decision, 'APPROVED');
  });

  // Test 4: Rule Engine UNABLE_TO_VERIFY when crucial info is missing
  test('Rule Engine: UNABLE_TO_VERIFY when return window is completely unstated', () => {
    const sampleAnalysis: any = {
      productName: 'Mystery Gadget',
      advertisedPrice: 1200,
      currency: 'INR',
      confirmedCharges: [],
      possibleCharges: [],
      recurringCharges: [],
      returnPolicy: { returnWindowDays: null, restockingFeePercent: null, returnShippingPaidBy: 'unknown', evidenceQuote: null },
      darkPatterns: [],
      missingInformation: ['Return window not disclosed'],
      trueCost: { confirmedTotal: 1200, totalConfirmedCharges: 0 },
    };

    const rules = {
      maxPrice: 2000,
      minimumReturnWindowDays: 14,
    };

    const evalResult = evaluatePurchaseRules(sampleAnalysis, rules);
    assert.strictEqual(evalResult.decision, 'UNABLE_TO_VERIFY');
  });

  // Test 5: SSRF prevention
  await test('SSRF Prevention: blocks localhost and 127.0.0.1', async () => {
    let threw = false;
    try {
      await validateUrlForSSRF('http://localhost:8080/admin');
    } catch (e: any) {
      threw = true;
      assert.ok(e.message.includes('restricted') || e.message.includes('Security'));
    }
    assert.strictEqual(threw, true);
  });

  await test('SSRF Prevention: blocks AWS metadata IP', async () => {
    let threw = false;
    try {
      await validateUrlForSSRF('http://169.254.169.254/latest/meta-data/');
    } catch (e: any) {
      threw = true;
    }
    assert.strictEqual(threw, true);
  });

  // Test 6: PayPal Protection Evaluator
  test('PayPal Protection: detects digital exclusions & policy factors', () => {
    const analysis: any = {
      productName: 'Digital Masterclass Subscription',
      recurringCharges: [{ billingCycle: 'monthly', amountAfterTrial: 50 }],
    };

    const evalResult = evaluatePayPalProtection(analysis);
    assert.ok(evalResult.protectionFactors.length > 0);
    assert.ok(evalResult.disclaimer.includes('BuyCheck is not affiliated'));
  });

  // Test 7: Zod schema validation
  test('Zod Schema: validates structured analysis with defaults', () => {
    const valid = GeminiStructuredAnalysisSchema.parse({
      productName: 'Test Item',
      advertisedPrice: 199,
      currency: 'INR',
      confirmedCharges: [],
      possibleCharges: [],
      recurringCharges: [],
      returnPolicy: { returnShippingPaidBy: 'unknown' },
      cancellationPolicy: {},
      darkPatterns: [],
      missingInformation: [],
      overallRiskLevel: 'low',
      recommendation: 'buy',
      summary: 'Looks good.',
    });

    assert.strictEqual(valid.advertisedPrice, 199);
    assert.strictEqual(valid.currency, 'INR');
  });

  console.log(`\n========================================`);
  console.log(`Tests Completed: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();
