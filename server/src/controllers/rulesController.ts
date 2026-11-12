import { Request, Response, NextFunction } from 'express';
import { PurchaseRuleInputSchema } from '../validators/analysis.js';
import { PurchaseRuleRepository, ActivityRepository } from '../models/repository.js';
import { GoogleGenAI } from '@google/genai';

export async function getRules(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId || 'guest-demo-user-id';
    const rules = await PurchaseRuleRepository.findByUser(userId);
    return res.json({ success: true, rules });
  } catch (err) {
    next(err);
  }
}

export async function createRule(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId || 'guest-demo-user-id';
    const { name, conditions, enabled } = PurchaseRuleInputSchema.parse(req.body);

    const newRule = await PurchaseRuleRepository.create({
      userId,
      name,
      conditions,
      enabled: enabled ?? true,
    });

    await ActivityRepository.log(userId, 'RULE_CREATED', `Created purchase rule: "${name}".`);

    return res.status(201).json({
      success: true,
      rule: newRule,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateRule(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId || 'guest-demo-user-id';
    const ruleId = req.params.id as string;
    const updated = await PurchaseRuleRepository.update(ruleId, userId, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }

    return res.json({ success: true, rule: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteRule(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId || 'guest-demo-user-id';
    const ruleId = req.params.id as string;
    const deleted = await PurchaseRuleRepository.delete(ruleId, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }

    return res.json({ success: true, message: 'Purchase rule deleted' });
  } catch (err) {
    next(err);
  }
}

/**
 * Natural language rule parser: converts sentences like "Price must be below ₹25000 and have free returns"
 * into a structured PurchaseRuleConditions object.
 */
export async function interpretNaturalLanguageRule(req: Request, res: Response, next: NextFunction) {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, error: 'A natural language prompt is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

    if (apiKey && !apiKey.includes('your_gemini_api_key')) {
      try {
        const client = new GoogleGenAI({ apiKey });
        const aiPrompt = `Convert this purchasing rule sentence into JSON matching:
{
  "maxPrice": number or null,
  "currency": "INR | USD | EUR | GBP",
  "condition": "new | refurbished | any",
  "allowSubscription": boolean,
  "minimumReturnWindowDays": number or null,
  "maxExtraCharges": number or null,
  "requireFreeReturnShipping": boolean,
  "disallowRestockingFee": boolean,
  "suggestedRuleName": "string"
}

User Sentence: "${prompt}"
Return ONLY raw JSON.`;

        const resp = await client.interactions.create({
          model: modelName,
          input: aiPrompt,
        });

        const text = resp.output_text || '{}';
        const clean = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/, '$1').trim();
        const parsed = JSON.parse(clean);

        return res.json({
          success: true,
          interpreted: parsed,
        });
      } catch (err) {
        // Fallback to heuristic parser below
      }
    }

    // Heuristic natural language interpreter
    const lower = prompt.toLowerCase();
    const conditions: any = {
      currency: lower.includes('$') || lower.includes('usd') ? 'USD' : 'INR',
      allowSubscription: !lower.includes('no subscription') && !lower.includes('no recurring'),
      requireFreeReturnShipping: lower.includes('free return') || lower.includes('seller pays return'),
      disallowRestockingFee: lower.includes('no restocking') || lower.includes('zero restocking'),
    };

    // Extract price
    const priceMatch = prompt.match(/(?:under|below|less than|max(?:imum)?)\s*(?:₹|\$|inr|usd)?\s*([\d,]+)/i);
    if (priceMatch) {
      conditions.maxPrice = parseFloat(priceMatch[1].replace(/,/g, ''));
    }

    // Extract return window
    const returnMatch = prompt.match(/(\d+)\s*(?:day|days)\s*return/i);
    if (returnMatch) {
      conditions.minimumReturnWindowDays = parseInt(returnMatch[1], 10);
    }

    // Condition
    if (lower.includes('new only') || lower.includes('brand new')) {
      conditions.condition = 'new';
    } else if (lower.includes('refurbished')) {
      conditions.condition = 'refurbished';
    }

    return res.json({
      success: true,
      interpreted: {
        ...conditions,
        suggestedRuleName: `Custom Rule: ${prompt.slice(0, 35)}...`,
      },
    });
  } catch (err) {
    next(err);
  }
}
