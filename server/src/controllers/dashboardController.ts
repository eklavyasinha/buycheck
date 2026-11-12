import { Request, Response, NextFunction } from 'express';
import {
  AnalysisRepository,
  PurchaseRuleRepository,
  TransactionRepository,
  ActivityRepository,
  UserRepository,
} from '../models/repository.js';
import { isDbConnected } from '../config/db.js';

export async function getDashboardSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId || 'guest-demo-user-id';

    const [analyses, rules, transactions, activities] = await Promise.all([
      AnalysisRepository.findByUser(userId, 10),
      PurchaseRuleRepository.findByUser(userId),
      TransactionRepository.findByUser(userId),
      ActivityRepository.findByUser(userId, 8),
    ]);

    const totalAnalyses = analyses.length;
    let totalTrapsDetected = 0;
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;

    for (const a of analyses) {
      const darkPatterns = a.structuredAnalysis?.darkPatterns || [];
      totalTrapsDetected += darkPatterns.length;

      const risk = a.overallRiskLevel || 'unknown';
      if (risk === 'high') highRiskCount++;
      else if (risk === 'medium') mediumRiskCount++;
      else if (risk === 'low') lowRiskCount++;
    }

    return res.json({
      success: true,
      summary: {
        totalAnalyses,
        totalTrapsDetected,
        activeRulesCount: rules.filter((r) => r.enabled !== false).length,
        completedTransactionsCount: transactions.filter((t) => t.status === 'COMPLETED').length,
        riskDistribution: [
          { name: 'Low Risk', value: lowRiskCount, color: '#D4FF00' },
          { name: 'Medium Risk', value: mediumRiskCount, color: '#EAB308' },
          { name: 'High Risk', value: highRiskCount, color: '#EF4444' },
        ],
      },
      recentAnalyses: analyses.slice(0, 5),
      recentActivities: activities,
    });
  } catch (err) {
    next(err);
  }
}

export async function getTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId || 'guest-demo-user-id';
    const transactions = await TransactionRepository.findByUser(userId);
    return res.json({ success: true, transactions });
  } catch (err) {
    next(err);
  }
}

export async function getSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId || 'guest-demo-user-id';
    const user = await UserRepository.findById(userId);

    const hasGeminiKey = Boolean(
      process.env.GEMINI_API_KEY &&
        process.env.GEMINI_API_KEY.trim() !== '' &&
        !process.env.GEMINI_API_KEY.includes('your_gemini_api_key')
    );

    const hasPayPalCredentials = Boolean(
      process.env.PAYPAL_CLIENT_ID &&
        process.env.PAYPAL_CLIENT_SECRET &&
        !process.env.PAYPAL_CLIENT_ID.includes('your_paypal_sandbox')
    );

    return res.json({
      success: true,
      user: {
        name: user?.name || 'Guest User',
        email: user?.email || 'guest@buycheck.local',
        preferences: user?.preferences || { theme: 'dark', defaultCurrency: 'INR' },
      },
      integrations: {
        gemini: {
          configured: hasGeminiKey,
          model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
          status: hasGeminiKey ? 'Active (Live Frontier AI)' : 'Demo Analysis Mode (Add GEMINI_API_KEY to activate)',
        },
        paypal: {
          configured: hasPayPalCredentials,
          mode: 'sandbox',
          status: hasPayPalCredentials ? 'Active (PayPal Sandbox Live)' : 'Demo Simulation Mode (Add Sandbox Credentials to activate)',
        },
        database: {
          type: isDbConnected() ? 'MongoDB Atlas' : 'In-Memory Local Persistence',
          status: isDbConnected() ? 'Connected' : 'Active (Local Session)',
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId || 'guest-demo-user-id';
    const { theme, defaultCurrency, strictMode } = req.body;

    const updated = await UserRepository.updatePreferences(userId, {
      theme,
      defaultCurrency,
      strictMode,
    });

    return res.json({
      success: true,
      preferences: updated?.preferences,
    });
  } catch (err) {
    next(err);
  }
}
