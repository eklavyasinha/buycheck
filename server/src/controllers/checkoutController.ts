import { Request, Response, NextFunction } from 'express';
import { CheckoutApproveInputSchema } from '../validators/analysis.js';
import { evaluatePurchaseRules } from '../services/rules/ruleEngine.js';
import {
  AnalysisRepository,
  PurchaseRuleRepository,
  ActivityRepository,
} from '../models/repository.js';
import crypto from 'crypto';

// In-memory signed approval store (valid for 15 minutes to prevent stale payment authorizations)
interface ActiveApproval {
  token: string;
  analysisId: string;
  userId: string;
  productName: string;
  maxAuthorizedAmount: number;
  currency: string;
  decision: string;
  createdAt: number;
  expiresAt: number;
}

const activeApprovals = new Map<string, ActiveApproval>();

export async function evaluateCheckout(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId || 'guest-demo-user-id';
    const { analysisId } = req.body;

    if (!analysisId) {
      return res.status(400).json({ success: false, error: 'analysisId is required.' });
    }

    const analysisDoc = await AnalysisRepository.findById(analysisId, userId);
    if (!analysisDoc) {
      return res.status(404).json({ success: false, error: 'Analysis record not found.' });
    }

    // Load active purchase rules
    const userRules = await PurchaseRuleRepository.findByUser(userId);
    const enabledRules = userRules.filter((r) => r.enabled !== false);

    // Combine user rules into unified conditions set
    const mergedConditions: any = {};
    for (const rule of enabledRules) {
      const cond = rule.conditions || {};
      if (typeof cond.maxPrice === 'number') {
        mergedConditions.maxPrice = Math.min(
          mergedConditions.maxPrice || Infinity,
          cond.maxPrice
        );
      }
      if (typeof cond.maxExtraCharges === 'number') {
        mergedConditions.maxExtraCharges = Math.min(
          mergedConditions.maxExtraCharges || Infinity,
          cond.maxExtraCharges
        );
      }
      if (cond.allowSubscription === false) {
        mergedConditions.allowSubscription = false;
      }
      if (typeof cond.minimumReturnWindowDays === 'number') {
        mergedConditions.minimumReturnWindowDays = Math.max(
          mergedConditions.minimumReturnWindowDays || 0,
          cond.minimumReturnWindowDays
        );
      }
      if (cond.disallowRestockingFee) {
        mergedConditions.disallowRestockingFee = true;
      }
      if (cond.requireFreeReturnShipping) {
        mergedConditions.requireFreeReturnShipping = true;
      }
    }

    const evaluation = evaluatePurchaseRules(
      analysisDoc.structuredAnalysis,
      mergedConditions
    );

    return res.json({
      success: true,
      evaluation,
      activeRulesCount: enabledRules.length,
      productName: analysisDoc.productName,
      advertisedPrice: analysisDoc.advertisedPrice,
      confirmedTotal: analysisDoc.structuredAnalysis.trueCost?.confirmedTotal || analysisDoc.advertisedPrice,
      currency: analysisDoc.currency,
    });
  } catch (err) {
    next(err);
  }
}

export async function approveCheckout(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId || 'guest-demo-user-id';
    const { analysisId, maxAuthorizedAmount, currency } =
      CheckoutApproveInputSchema.parse(req.body);

    const analysisDoc = await AnalysisRepository.findById(analysisId, userId);
    if (!analysisDoc) {
      return res.status(404).json({ success: false, error: 'Analysis record not found.' });
    }

    const confirmedTotal =
      analysisDoc.structuredAnalysis.trueCost?.confirmedTotal || analysisDoc.advertisedPrice;

    // Verify authorized amount is sufficient and not tampered
    if (maxAuthorizedAmount < confirmedTotal) {
      return res.status(400).json({
        success: false,
        error: `Authorized amount (${currency} ${maxAuthorizedAmount}) is less than confirmed purchase total (${currency} ${confirmedTotal}).`,
      });
    }

    // Verify currency match
    if (currency !== analysisDoc.currency) {
      return res.status(400).json({
        success: false,
        error: `Currency mismatch: purchase is in ${analysisDoc.currency}, but authorization was requested in ${currency}.`,
      });
    }

    // Generate tamper-resistant approval token
    const token = `apr_${crypto.randomBytes(18).toString('hex')}`;
    const approvalRecord: ActiveApproval = {
      token,
      analysisId,
      userId,
      productName: analysisDoc.productName,
      maxAuthorizedAmount,
      currency,
      decision: 'USER_APPROVED',
      createdAt: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins validity
    };

    activeApprovals.set(token, approvalRecord);

    await ActivityRepository.log(
      userId,
      'CHECKOUT_APPROVED',
      `Authorized purchase for "${analysisDoc.productName}" up to ${currency} ${maxAuthorizedAmount}.`
    );

    return res.json({
      success: true,
      approvalToken: token,
      expiresAt: approvalRecord.expiresAt,
      message: 'Purchase approved by user. Proceed to PayPal Sandbox payment.',
    });
  } catch (err) {
    next(err);
  }
}

export function verifyActiveApproval(token: string, userId: string): ActiveApproval | null {
  const approval = activeApprovals.get(token);
  if (!approval) return null;
  if (approval.userId !== userId) return null;
  if (Date.now() > approval.expiresAt) {
    activeApprovals.delete(token);
    return null;
  }
  return approval;
}
