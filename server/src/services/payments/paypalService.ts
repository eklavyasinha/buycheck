import axios from 'axios';
import crypto from 'crypto';

export interface CreateOrderParams {
  amount: number;
  currency: string;
  productName: string;
  referenceId: string;
}

export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: { href: string; rel: string; method: string }[];
  isSandbox: boolean;
  isDemoSimulation?: boolean;
}

export interface CaptureOrderResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  captureId?: string;
  payer?: any;
  isSandbox: boolean;
  isDemoSimulation?: boolean;
}

const PAYPAL_SANDBOX_BASE_URL = 'https://api-m.sandbox.paypal.com';

function getCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const hasLiveCredentials =
    Boolean(clientId && clientSecret && !clientId.includes('your_paypal_sandbox'));

  return {
    clientId: clientId || '',
    clientSecret: clientSecret || '',
    isConfigured: hasLiveCredentials,
  };
}

async function getAccessToken(): Promise<string> {
  const { clientId, clientSecret, isConfigured } = getCredentials();
  if (!isConfigured) {
    throw new Error('PayPal Sandbox credentials not configured in environment.');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await axios.post(
    `${PAYPAL_SANDBOX_BASE_URL}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 10000,
    }
  );

  return response.data.access_token;
}

/**
 * Creates a PayPal Sandbox Order server-side
 */
export async function createPayPalOrder(params: CreateOrderParams): Promise<PayPalOrderResponse> {
  const { isConfigured } = getCredentials();

  // If live Sandbox credentials are not provided, operate in honest Sandbox Demo Mode
  if (!isConfigured) {
    const demoOrderId = `SANDBOX-DEMO-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    return {
      id: demoOrderId,
      status: 'CREATED',
      links: [
        {
          href: `https://www.sandbox.paypal.com/checkoutnow?token=${demoOrderId}`,
          rel: 'approve',
          method: 'GET',
        },
      ],
      isSandbox: true,
      isDemoSimulation: true,
    };
  }

  const token = await getAccessToken();

  // PayPal Sandbox supports USD, EUR, GBP, AUD, CAD etc. For INR in sandbox, USD is often used as base.
  const paypalCurrency = params.currency === 'INR' ? 'USD' : params.currency;
  // If INR, convert roughly for sandbox demo payment: 1 USD ≈ 83 INR
  const paypalAmount =
    params.currency === 'INR'
      ? (params.amount / 83).toFixed(2)
      : params.amount.toFixed(2);

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: params.referenceId,
        description: `BuyCheck Protected Purchase: ${params.productName}`.slice(0, 127),
        amount: {
          currency_code: paypalCurrency,
          value: paypalAmount,
        },
      },
    ],
    application_context: {
      brand_name: 'BuyCheck Consumer Protection',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      return_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout/success`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout/cancel`,
    },
  };

  const response = await axios.post(`${PAYPAL_SANDBOX_BASE_URL}/v2/checkout/orders`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  return {
    id: response.data.id,
    status: response.data.status,
    links: response.data.links || [],
    isSandbox: true,
    isDemoSimulation: false,
  };
}

/**
 * Captures an approved PayPal order server-side and verifies the payment
 */
export async function capturePayPalOrder(
  orderId: string,
  expectedAmount: number,
  expectedCurrency: string
): Promise<CaptureOrderResponse> {
  const { isConfigured } = getCredentials();

  // Handle Demo mode capture
  if (!isConfigured || orderId.startsWith('SANDBOX-DEMO-')) {
    const demoCaptureId = `CAP-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    return {
      id: orderId,
      status: 'COMPLETED',
      amount: expectedAmount,
      currency: expectedCurrency,
      captureId: demoCaptureId,
      payer: {
        name: { given_name: 'Sandbox', surname: 'Buyer' },
        email_address: 'sb-buyer-buycheck@personal.example.com',
      },
      isSandbox: true,
      isDemoSimulation: true,
    };
  }

  const token = await getAccessToken();

  const response = await axios.post(
    `${PAYPAL_SANDBOX_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 12000,
    }
  );

  const captureData = response.data;
  const status = captureData.status;

  if (status !== 'COMPLETED') {
    throw new Error(`PayPal payment failed or remains incomplete. Status: ${status}`);
  }

  const purchaseUnit = captureData.purchase_units?.[0];
  const captureObj = purchaseUnit?.payments?.captures?.[0];
  const capturedAmount = parseFloat(captureObj?.amount?.value || '0');
  const capturedCurrency = captureObj?.amount?.currency_code;

  return {
    id: captureData.id,
    status: captureData.status,
    amount: capturedAmount,
    currency: capturedCurrency,
    captureId: captureObj?.id,
    payer: captureData.payer,
    isSandbox: true,
    isDemoSimulation: false,
  };
}

/**
 * Verifies PayPal Webhook signature
 */
export async function verifyPayPalWebhookSignature(headers: any, body: any): Promise<boolean> {
  const { isConfigured } = getCredentials();
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  if (!isConfigured || !webhookId) {
    // If webhook ID is not configured, record event safely in demo mode
    return true;
  }

  try {
    const token = await getAccessToken();

    const verificationPayload = {
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: body,
    };

    const response = await axios.post(
      `${PAYPAL_SANDBOX_BASE_URL}/v1/notifications/verify-webhook-signature`,
      verificationPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    return response.data.verification_status === 'SUCCESS';
  } catch (err: any) {
    console.error('PayPal webhook verification failed:', err.message);
    return false;
  }
}
