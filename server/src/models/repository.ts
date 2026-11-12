import {
  UserModel,
  AnalysisModel,
  PurchaseRuleModel,
  TransactionModel,
  ActivityModel,
} from './schemas.js';
import { isDbConnected } from '../config/db.js';
import crypto from 'crypto';

// In-Memory store fallback
const memoryUsers: any[] = [];
const memoryAnalyses: any[] = [];
const memoryRules: any[] = [];
const memoryTransactions: any[] = [];
const memoryActivities: any[] = [];

// Seed default guest user and sample items
function seedDemoData() {
  if (memoryUsers.length === 0) {
    const guestId = 'guest-demo-user-id';
    memoryUsers.push({
      _id: guestId,
      id: guestId,
      name: 'Guest Explorer',
      email: 'guest@buycheck.local',
      passwordHash: '$2a$10$demoHashedPasswordDummyForGuestModeOnly',
      preferences: { theme: 'dark', defaultCurrency: 'INR', strictMode: false },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Default rules
    memoryRules.push(
      {
        _id: 'rule-demo-1',
        id: 'rule-demo-1',
        userId: guestId,
        name: 'Budget Shield (Under ₹40,000)',
        conditions: {
          maxPrice: 40000,
          currency: 'INR',
          condition: 'new',
          allowSubscription: false,
          maxExtraCharges: 500,
        },
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: 'rule-demo-2',
        id: 'rule-demo-2',
        userId: guestId,
        name: 'Consumer Protection Guarantee',
        conditions: {
          minimumReturnWindowDays: 14,
          disallowRestockingFee: true,
          requireFreeReturnShipping: true,
        },
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );

    // Default sample analysis
    const sampleAnalysisId = 'sample-analysis-headphones';
    memoryAnalyses.push({
      _id: sampleAnalysisId,
      id: sampleAnalysisId,
      userId: guestId,
      inputType: 'text',
      originalInput: 'CloudAudio Pro Wireless ANC Headphones with 7-day trial pass',
      productName: 'CloudAudio Pro Wireless ANC Headphones',
      advertisedPrice: 4999,
      currency: 'INR',
      overallRiskLevel: 'medium',
      recommendation: 'review',
      structuredAnalysis: {
        productName: 'CloudAudio Pro Wireless ANC Headphones',
        advertisedPrice: 4999,
        currency: 'INR',
        confirmedCharges: [
          {
            label: 'Goods & Services Tax (GST 18%)',
            amount: 899.82,
            type: 'tax',
            evidenceQuote: 'Applicable GST/sales tax calculated at checkout.',
          },
          {
            label: 'Secure Courier Packaging Surcharge',
            amount: 149,
            type: 'handling',
            evidenceQuote: 'Handling surcharge applied to fragile electronics order.',
          },
        ],
        possibleCharges: [
          {
            label: 'Restocking Fee on Opened Items',
            estimatedAmount: 749,
            condition: 'Applies if retail seal broken.',
            evidenceQuote: 'A 15% restocking deduction applies on all processed customer returns.',
          },
        ],
        recurringCharges: [
          {
            billingCycle: 'monthly',
            amountAfterTrial: 999,
            trialPeriodDays: 7,
            autoRenewal: true,
            evidenceQuote: 'Renews automatically at monthly rate of ₹999 after 7-day trial period.',
          },
        ],
        returnPolicy: {
          returnWindowDays: 14,
          restockingFeePercent: 15,
          returnShippingPaidBy: 'buyer',
          evidenceQuote: 'Items may be returned within 14 days. Subject to 15% restocking deduction.',
        },
        cancellationPolicy: {
          cancellationNoticeDays: 2,
          penaltyFee: 0,
          evidenceQuote: 'Cancellations must be requested at least 48 hours before billing cycle renews.',
        },
        darkPatterns: [
          {
            title: 'Automatic Free-Trial to Paid Renewal',
            severity: 'high',
            evidenceQuote:
              'Start your 7-day risk-free trial today. Renews automatically at standard monthly rate unless cancelled 48 hours prior.',
            explanation:
              'The product advertises a free or low-cost initial trial, but locks the payment method into an automatic recurring charge without immediate re-authorization.',
            potentialImpact: 'Card will be automatically debited ₹999/month starting on day 7.',
          },
        ],
        missingInformation: [
          'Merchant support phone number undisclosed.',
          'Warranty claim process is not outlined on checkout page.',
        ],
        overallRiskLevel: 'medium',
        recommendation: 'review',
        summary:
          'Advertised price excludes handling fees and tax. Detected automatic monthly renewal subscription and a 15% restocking fee clause.',
        trueCost: {
          advertisedPrice: 4999,
          currency: 'INR',
          totalConfirmedCharges: 1048.82,
          confirmedTotal: 6047.82,
          minimumPossibleTotal: 6047.82,
          maximumEstimatedTotal: 6796.82,
          hasUncertainCharges: true,
          recurringMonthlyEquivalent: 999,
          recurringYearlyEquivalent: 11988,
          chargesBreakdown: [
            { category: 'Advertised Price', amount: 4999, confirmed: true },
            { category: 'Goods & Services Tax', amount: 899.82, confirmed: true },
            { category: 'Secure Courier Packaging', amount: 149, confirmed: true },
            { category: '[Est] Restocking Fee', amount: 749, confirmed: false },
          ],
        },
        metadata: {
          sourceType: 'text',
          sourceReference: 'Interactive Guided Demonstration',
          analyzedAt: new Date().toISOString(),
          modelUsed: 'buycheck-intelligence-v1',
          confidenceScore: 0.95,
          limitations: [
            'Demonstration dataset showcasing multi-charge analysis, recurring trap alerts, and rule checks.',
          ],
          isDemoAnalysis: true,
        },
      },
      createdAt: new Date(),
    });

    // Sample Transaction
    memoryTransactions.push({
      _id: 'tx-sample-1',
      id: 'tx-sample-1',
      userId: guestId,
      analysisId: sampleAnalysisId,
      productName: 'CloudAudio Pro Wireless ANC Headphones',
      amount: 6047.82,
      currency: 'INR',
      paypalOrderId: 'SANDBOX-DEMO-SAMPLE-ORD99',
      paypalCaptureId: 'CAP-DEMO-SAMPLE-CAP01',
      status: 'COMPLETED',
      isSandbox: true,
      createdAt: new Date(Date.now() - 3600000 * 24),
    });

    // Activity
    memoryActivities.push({
      _id: 'act-1',
      userId: guestId,
      type: 'ANALYSIS_COMPLETED',
      description: 'Analyzed CloudAudio Pro Wireless ANC Headphones with 1 risk detected.',
      createdAt: new Date(),
    });
  }
}

seedDemoData();

export const UserRepository = {
  async findByEmail(email: string) {
    if (isDbConnected()) {
      return await UserModel.findOne({ email: email.toLowerCase() });
    }
    return (
      memoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
    );
  },

  async findById(id: string) {
    if (isDbConnected()) {
      return await UserModel.findById(id);
    }
    return memoryUsers.find((u) => u._id === id || u.id === id) || null;
  },

  async create(data: { name: string; email: string; passwordHash: string; preferences?: any }) {
    if (isDbConnected()) {
      const user = new UserModel(data);
      return await user.save();
    }
    const newUser = {
      _id: `user-${crypto.randomBytes(8).toString('hex')}`,
      ...data,
      email: data.email.toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryUsers.push(newUser);
    return newUser;
  },

  async updatePreferences(userId: string, preferences: any) {
    if (isDbConnected()) {
      return await UserModel.findByIdAndUpdate(
        userId,
        { preferences, updatedAt: new Date() },
        { new: true }
      );
    }
    const user = memoryUsers.find((u) => u._id === userId || u.id === userId);
    if (user) {
      user.preferences = { ...user.preferences, ...preferences };
      user.updatedAt = new Date();
    }
    return user;
  },
};

export const AnalysisRepository = {
  async create(data: any) {
    if (isDbConnected()) {
      const doc = new AnalysisModel(data);
      return await doc.save();
    }
    const newDoc = {
      _id: `analysis-${crypto.randomBytes(8).toString('hex')}`,
      ...data,
      createdAt: new Date(),
    };
    memoryAnalyses.unshift(newDoc);
    return newDoc;
  },

  async findByUser(userId: string, limit = 20) {
    if (isDbConnected()) {
      return await AnalysisModel.find({ userId }).sort({ createdAt: -1 }).limit(limit);
    }
    return memoryAnalyses
      .filter((a) => a.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  },

  async findById(id: string, userId?: string) {
    if (isDbConnected()) {
      const q: any = { _id: id };
      if (userId) q.userId = userId;
      return await AnalysisModel.findOne(q);
    }
    return (
      memoryAnalyses.find(
        (a) => (a._id === id || a.id === id) && (!userId || a.userId === userId)
      ) || null
    );
  },

  async delete(id: string, userId: string) {
    if (isDbConnected()) {
      return await AnalysisModel.findOneAndDelete({ _id: id, userId });
    }
    const index = memoryAnalyses.findIndex(
      (a) => (a._id === id || a.id === id) && a.userId === userId
    );
    if (index !== -1) {
      memoryAnalyses.splice(index, 1);
      return true;
    }
    return false;
  },

  async count(userId: string) {
    if (isDbConnected()) {
      return await AnalysisModel.countDocuments({ userId });
    }
    return memoryAnalyses.filter((a) => a.userId === userId).length;
  },
};

export const PurchaseRuleRepository = {
  async create(data: any) {
    if (isDbConnected()) {
      const doc = new PurchaseRuleModel(data);
      return await doc.save();
    }
    const newDoc = {
      _id: `rule-${crypto.randomBytes(8).toString('hex')}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryRules.push(newDoc);
    return newDoc;
  },

  async findByUser(userId: string) {
    if (isDbConnected()) {
      return await PurchaseRuleModel.find({ userId }).sort({ createdAt: -1 });
    }
    return memoryRules.filter((r) => r.userId === userId);
  },

  async findById(id: string, userId: string) {
    if (isDbConnected()) {
      return await PurchaseRuleModel.findOne({ _id: id, userId });
    }
    return (
      memoryRules.find((r) => (r._id === id || r.id === id) && r.userId === userId) || null
    );
  },

  async update(id: string, userId: string, updateData: any) {
    if (isDbConnected()) {
      return await PurchaseRuleModel.findOneAndUpdate(
        { _id: id, userId },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );
    }
    const rule = memoryRules.find((r) => (r._id === id || r.id === id) && r.userId === userId);
    if (rule) {
      Object.assign(rule, updateData);
      rule.updatedAt = new Date();
    }
    return rule;
  },

  async delete(id: string, userId: string) {
    if (isDbConnected()) {
      return await PurchaseRuleModel.findOneAndDelete({ _id: id, userId });
    }
    const index = memoryRules.findIndex(
      (r) => (r._id === id || r.id === id) && r.userId === userId
    );
    if (index !== -1) {
      memoryRules.splice(index, 1);
      return true;
    }
    return false;
  },
};

export const TransactionRepository = {
  async create(data: any) {
    if (isDbConnected()) {
      const doc = new TransactionModel(data);
      return await doc.save();
    }
    // Check if order already exists (idempotency)
    const existing = memoryTransactions.find((t) => t.paypalOrderId === data.paypalOrderId);
    if (existing) {
      return existing;
    }
    const newDoc = {
      _id: `tx-${crypto.randomBytes(8).toString('hex')}`,
      ...data,
      createdAt: new Date(),
    };
    memoryTransactions.unshift(newDoc);
    return newDoc;
  },

  async findByUser(userId: string) {
    if (isDbConnected()) {
      return await TransactionModel.find({ userId }).sort({ createdAt: -1 });
    }
    return memoryTransactions.filter((t) => t.userId === userId);
  },

  async findById(id: string, userId: string) {
    if (isDbConnected()) {
      return await TransactionModel.findOne({ _id: id, userId });
    }
    return (
      memoryTransactions.find((t) => (t._id === id || t.id === id) && t.userId === userId) ||
      null
    );
  },
};

export const ActivityRepository = {
  async log(userId: string, type: string, description: string, metadata?: any) {
    if (isDbConnected()) {
      const doc = new ActivityModel({ userId, type, description, metadata });
      return await doc.save();
    }
    const newDoc = {
      _id: `act-${crypto.randomBytes(8).toString('hex')}`,
      userId,
      type,
      description,
      metadata,
      createdAt: new Date(),
    };
    memoryActivities.unshift(newDoc);
    return newDoc;
  },

  async findByUser(userId: string, limit = 15) {
    if (isDbConnected()) {
      return await ActivityModel.find({ userId }).sort({ createdAt: -1 }).limit(limit);
    }
    return memoryActivities
      .filter((a) => a.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  },
};
