import { Request, Response, NextFunction } from 'express';
import { UrlAnalysisInputSchema, TextAnalysisInputSchema } from '../validators/analysis.js';
import { scrapeProductPage } from '../services/analysis/urlScraper.js';
import {
  analyzeTextWithGemini,
  analyzeImageWithGemini,
  askAssistantAboutReport,
} from '../services/ai/gemini.js';
import { evaluatePayPalProtection } from '../services/payments/protectionEvaluator.js';
import { AnalysisRepository, ActivityRepository } from '../models/repository.js';

export async function analyzeUrl(req: Request, res: Response, next: NextFunction) {
  try {
    const { url, preferences } = UrlAnalysisInputSchema.parse(req.body);
    const userId = req.user?.userId || 'guest-demo-user-id';

    // Step 1: Scrape SSRF-safe page content
    const scraped = await scrapeProductPage(url);

    // Step 2: Formulate analysis input combining extracted excerpts
    const combinedContent = `
PAGE TITLE: ${scraped.title}
PAGE URL: ${scraped.url}
META DESCRIPTION: ${scraped.metaDescription}
EXTRACTED PRICE CANDIDATE: ${scraped.extractedPriceText || 'Undisclosed'}
DETECTED CURRENCY: ${scraped.extractedCurrency || 'Unknown'}

PRICING & FEE EXCERPTS FOUND:
${scraped.pricingExcerpts.join('\n---\n')}

RETURN & CANCELLATION EXCERPTS FOUND:
${scraped.policyExcerpts.join('\n---\n')}

PAGE TEXT EXTRACT:
${scraped.rawText}
`;

    // Step 3: Run Gemini AI analysis
    const structuredAnalysis = await analyzeTextWithGemini(
      combinedContent,
      'url',
      url,
      preferences
    );

    // Fallback product name from scraped title if AI left null
    if (!structuredAnalysis.productName && scraped.title) {
      structuredAnalysis.productName = scraped.title;
    }

    // Step 4: Persist in database
    const savedDoc = await AnalysisRepository.create({
      userId,
      inputType: 'url',
      originalInput: url,
      productName: structuredAnalysis.productName || 'Analyzed Product',
      advertisedPrice: structuredAnalysis.advertisedPrice,
      currency: structuredAnalysis.currency,
      structuredAnalysis,
      overallRiskLevel: structuredAnalysis.overallRiskLevel,
      recommendation: structuredAnalysis.recommendation,
    });

    await ActivityRepository.log(
      userId,
      'URL_ANALYSIS',
      `Analyzed "${structuredAnalysis.productName}" from ${new URL(url).hostname} with ${structuredAnalysis.overallRiskLevel} risk.`,
      { analysisId: savedDoc._id }
    );

    return res.status(201).json({
      success: true,
      analysis: {
        ...structuredAnalysis,
        _id: savedDoc._id.toString(),
        id: savedDoc._id.toString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function analyzeImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an image file (PNG, JPG, or WEBP).',
      });
    }

    const userId = req.user?.userId || 'guest-demo-user-id';
    let preferences: any;
    if (req.body.preferences) {
      try {
        preferences = typeof req.body.preferences === 'string'
          ? JSON.parse(req.body.preferences)
          : req.body.preferences;
      } catch {
        // ignore malformed preference JSON
      }
    }

    const structuredAnalysis = await analyzeImageWithGemini(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname,
      preferences
    );

    const savedDoc = await AnalysisRepository.create({
      userId,
      inputType: 'image',
      originalInput: req.file.originalname,
      productName: structuredAnalysis.productName || 'Screenshot Analysis',
      advertisedPrice: structuredAnalysis.advertisedPrice,
      currency: structuredAnalysis.currency,
      structuredAnalysis,
      overallRiskLevel: structuredAnalysis.overallRiskLevel,
      recommendation: structuredAnalysis.recommendation,
    });

    await ActivityRepository.log(
      userId,
      'IMAGE_ANALYSIS',
      `Analyzed screenshot "${req.file.originalname}" (${structuredAnalysis.overallRiskLevel} risk).`,
      { analysisId: savedDoc._id }
    );

    return res.status(201).json({
      success: true,
      analysis: {
        ...structuredAnalysis,
        _id: savedDoc._id.toString(),
        id: savedDoc._id.toString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function analyzeText(req: Request, res: Response, next: NextFunction) {
  try {
    const { text, productName, preferences } = TextAnalysisInputSchema.parse(req.body);
    const userId = req.user?.userId || 'guest-demo-user-id';

    const structuredAnalysis = await analyzeTextWithGemini(
      text,
      'text',
      productName || 'Pasted Product Content',
      preferences
    );

    if (productName && !structuredAnalysis.productName) {
      structuredAnalysis.productName = productName;
    }

    const savedDoc = await AnalysisRepository.create({
      userId,
      inputType: 'text',
      originalInput: text.slice(0, 200),
      productName: structuredAnalysis.productName || 'Pasted Content',
      advertisedPrice: structuredAnalysis.advertisedPrice,
      currency: structuredAnalysis.currency,
      structuredAnalysis,
      overallRiskLevel: structuredAnalysis.overallRiskLevel,
      recommendation: structuredAnalysis.recommendation,
    });

    await ActivityRepository.log(
      userId,
      'TEXT_ANALYSIS',
      `Analyzed pasted text for "${structuredAnalysis.productName}".`,
      { analysisId: savedDoc._id }
    );

    return res.status(201).json({
      success: true,
      analysis: {
        ...structuredAnalysis,
        _id: savedDoc._id.toString(),
        id: savedDoc._id.toString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAnalyses(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId || 'guest-demo-user-id';
    const list = await AnalysisRepository.findByUser(userId, 30);
    return res.json({ success: true, analyses: list });
  } catch (err) {
    next(err);
  }
}

export async function getAnalysisById(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId || 'guest-demo-user-id';
    const id = req.params.id as string;
    const doc = await AnalysisRepository.findById(id, userId);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Analysis report not found.' });
    }

    return res.json({
      success: true,
      analysis: {
        ...(doc.structuredAnalysis || {}),
        _id: doc._id.toString(),
        id: doc._id.toString(),
        createdAt: doc.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAnalysis(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId || 'guest-demo-user-id';
    const id = req.params.id as string;
    const success = await AnalysisRepository.delete(id, userId);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Report not found or already deleted.' });
    }
    return res.json({ success: true, message: 'Report removed successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function askAssistant(req: Request, res: Response, next: NextFunction) {
  try {
    const { question, analysisId } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ success: false, error: 'Question is required.' });
    }

    const userId = req.user?.userId || 'guest-demo-user-id';
    let analysisObj = req.body.analysis;

    if (!analysisObj && analysisId) {
      const doc = await AnalysisRepository.findById(analysisId, userId);
      if (doc) {
        analysisObj = doc.structuredAnalysis;
      }
    }

    if (!analysisObj) {
      return res.status(400).json({
        success: false,
        error: 'Valid analysis context or analysisId is required for this question.',
      });
    }

    const answer = await askAssistantAboutReport(analysisObj, question);
    return res.json({ success: true, answer });
  } catch (err) {
    next(err);
  }
}

export async function getProtectionEligibility(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId || 'guest-demo-user-id';
    const id = req.params.id as string;
    const doc = await AnalysisRepository.findById(id, userId);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Analysis report not found.' });
    }

    const evaluation = evaluatePayPalProtection(doc.structuredAnalysis);
    return res.json({ success: true, evaluation });
  } catch (err) {
    next(err);
  }
}
