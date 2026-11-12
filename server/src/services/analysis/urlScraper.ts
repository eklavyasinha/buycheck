import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';
import dns from 'dns/promises';

export interface ScrapedProductContent {
  url: string;
  title: string;
  rawText: string;
  extractedPriceText: string | null;
  extractedCurrency: string | null;
  metaDescription: string;
  policyExcerpts: string[];
  pricingExcerpts: string[];
}

// Check if an IP address is private/internal/cloud-metadata
function isPrivateIp(ip: string): boolean {
  // IPv4 local/private/cloud metadata
  if (
    ip === '127.0.0.1' ||
    ip === '0.0.0.0' ||
    ip === 'localhost' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('169.254.') // AWS/GCP/Azure link-local metadata
  ) {
    return true;
  }

  // 172.16.0.0 - 172.31.255.255
  if (ip.startsWith('172.')) {
    const parts = ip.split('.');
    if (parts.length >= 2) {
      const secondOctet = parseInt(parts[1], 10);
      if (secondOctet >= 16 && secondOctet <= 31) {
        return true;
      }
    }
  }

  // IPv6 loopback / local
  if (
    ip === '::1' ||
    ip === '::' ||
    ip.toLowerCase().startsWith('fc00:') ||
    ip.toLowerCase().startsWith('fe80:')
  ) {
    return true;
  }

  return false;
}

export async function validateUrlForSSRF(urlString: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new Error('Invalid URL format. Please provide a standard HTTP or HTTPS web address.');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only HTTP and HTTPS URLs are permitted.');
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block obvious internal hosts
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.local') ||
    hostname === '169.254.169.254' ||
    hostname === 'metadata.google.internal'
  ) {
    throw new Error('Access to private or local network addresses is restricted for security.');
  }

  // Resolve DNS to verify IP addresses
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const addr of addresses) {
      if (isPrivateIp(addr.address)) {
        throw new Error(
          `Security restriction: The hostname resolves to a non-public IP range (${addr.address}).`
        );
      }
    }
  } catch (err: any) {
    if (err.message && err.message.includes('Security restriction')) {
      throw err;
    }
    throw new Error(`Unable to resolve host ${hostname}: ${err.message || 'DNS resolution failed'}`);
  }

  return parsed;
}

export async function scrapeProductPage(urlString: string): Promise<ScrapedProductContent> {
  const verifiedUrl = await validateUrlForSSRF(urlString);

  let response;
  try {
    response = await axios.get(verifiedUrl.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 BuyCheckBot/1.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 8000,
      maxContentLength: 5 * 1024 * 1024, // 5MB limit
      maxRedirects: 3,
      responseType: 'text',
    });
  } catch (error: any) {
    if (error.response?.status === 403 || error.response?.status === 401) {
      throw new Error(
        'Merchant page is protected by authentication or access restrictions. Please use Screenshot or Pasted Text analysis instead.'
      );
    }
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error(
        'Connection timed out while reaching the merchant page. Try again or paste the product text directly.'
      );
    }
    throw new Error(
      `Failed to retrieve page: ${error.message || 'Unknown network error'}. Please paste text or upload a screenshot.`
    );
  }

  const html = response.data;
  const $ = cheerio.load(html);

  // Strip script, style, svg, noscript
  $('script, style, svg, noscript, nav, footer, iframe').remove();

  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('h1').first().text().trim() ||
    $('title').text().trim() ||
    'Online Product';

  const metaDescription =
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    '';

  // Extract price clues
  const priceSelectors = [
    '[data-price]',
    '.price',
    '#price',
    '.product-price',
    '.offer-price',
    '.current-price',
    '.amount',
    '.a-price-whole',
    '.a-offscreen',
  ];

  let extractedPriceText: string | null = null;
  let extractedCurrency: string | null = null;

  for (const sel of priceSelectors) {
    const text = $(sel).first().text().trim();
    if (text && /\d/.test(text)) {
      extractedPriceText = text;
      if (text.includes('₹') || text.includes('INR') || text.includes('Rs')) extractedCurrency = 'INR';
      else if (text.includes('$') || text.includes('USD')) extractedCurrency = 'USD';
      else if (text.includes('€') || text.includes('EUR')) extractedCurrency = 'EUR';
      else if (text.includes('£') || text.includes('GBP')) extractedCurrency = 'GBP';
      break;
    }
  }

  // Extract policy and pricing snippets
  const policyExcerpts: string[] = [];
  const pricingExcerpts: string[] = [];

  $('p, div, li, span').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text.length > 25 && text.length < 300) {
      if (/return|refund|restocking|exchange|cancel/i.test(text)) {
        if (policyExcerpts.length < 5 && !policyExcerpts.includes(text)) {
          policyExcerpts.push(text);
        }
      }
      if (/shipping|tax|handling|fee|delivery|billing|subscription|renewal|trial/i.test(text)) {
        if (pricingExcerpts.length < 5 && !pricingExcerpts.includes(text)) {
          pricingExcerpts.push(text);
        }
      }
    }
  });

  // Extract clean text body up to ~5000 characters for Gemini
  const bodyText = $('body')
    .text()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 5000);

  return {
    url: verifiedUrl.toString(),
    title,
    rawText: bodyText,
    extractedPriceText,
    extractedCurrency,
    metaDescription,
    policyExcerpts,
    pricingExcerpts,
  };
}
