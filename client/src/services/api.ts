import axios from 'axios';
import {
  StructuredAnalysis,
  PurchaseRuleItem,
  CheckoutEvaluation,
  ProtectionEvaluation,
  TransactionRecord,
} from '../types/analysis.js';

const api = axios.create({
  baseURL: '/api',
  timeout: 25000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('buycheck_token');
  const isGuest = localStorage.getItem('buycheck_is_guest') === 'true';

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (isGuest) {
    config.headers['x-guest-mode'] = 'true';
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      'An unexpected network error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

// Auth API
export const AuthAPI = {
  async register(data: { name: string; email: string; password: string }) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(data: { email: string; password: string }) {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async startGuestSession() {
    const res = await api.get('/auth/guest-session');
    return res.data;
  },
};

// Analysis API
export const AnalysisAPI = {
  async analyzeUrl(url: string, preferences?: any) {
    const res = await api.post('/analysis/url', { url, preferences });
    return res.data.analysis as StructuredAnalysis;
  },

  async analyzeImage(file: File, preferences?: any) {
    const formData = new FormData();
    formData.append('image', file);
    if (preferences) {
      formData.append('preferences', JSON.stringify(preferences));
    }
    const res = await api.post('/analysis/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.analysis as StructuredAnalysis;
  },

  async analyzeText(text: string, productName?: string, preferences?: any) {
    const res = await api.post('/analysis/text', { text, productName, preferences });
    return res.data.analysis as StructuredAnalysis;
  },

  async getAll() {
    const res = await api.get('/analysis');
    return res.data.analyses as any[];
  },

  async getById(id: string) {
    const res = await api.get(`/analysis/${id}`);
    return res.data.analysis as StructuredAnalysis;
  },

  async delete(id: string) {
    const res = await api.delete(`/analysis/${id}`);
    return res.data;
  },

  async askAssistant(question: string, analysis?: StructuredAnalysis, analysisId?: string) {
    const res = await api.post('/analysis/assistant', { question, analysis, analysisId });
    return res.data.answer as string;
  },

  async getProtection(id: string) {
    const res = await api.get(`/analysis/${id}/protection`);
    return res.data.evaluation as ProtectionEvaluation;
  },
};

// Rules API
export const RulesAPI = {
  async getAll() {
    const res = await api.get('/rules');
    return res.data.rules as PurchaseRuleItem[];
  },

  async create(data: { name: string; conditions: any; enabled?: boolean }) {
    const res = await api.post('/rules', data);
    return res.data.rule as PurchaseRuleItem;
  },

  async update(id: string, data: Partial<PurchaseRuleItem>) {
    const res = await api.put(`/rules/${id}`, data);
    return res.data.rule as PurchaseRuleItem;
  },

  async delete(id: string) {
    const res = await api.delete(`/rules/${id}`);
    return res.data;
  },

  async interpret(prompt: string) {
    const res = await api.post('/rules/interpret', { prompt });
    return res.data.interpreted;
  },
};

// Checkout API
export const CheckoutAPI = {
  async evaluate(analysisId: string) {
    const res = await api.post('/checkout/evaluate', { analysisId });
    return res.data as {
      evaluation: CheckoutEvaluation;
      activeRulesCount: number;
      productName: string;
      advertisedPrice: number;
      confirmedTotal: number;
      currency: string;
    };
  },

  async approve(data: {
    analysisId: string;
    maxAuthorizedAmount: number;
    currency: string;
    acknowledgedRisks?: string[];
  }) {
    const res = await api.post('/checkout/approve', data);
    return res.data as {
      approvalToken: string;
      expiresAt: number;
      message: string;
    };
  },
};

// PayPal API
export const PayPalAPI = {
  async createOrder(approvalToken: string) {
    const res = await api.post('/paypal/create-order', { approvalToken });
    return res.data as {
      orderId: string;
      status: string;
      isSandbox: boolean;
      isDemoSimulation: boolean;
      amount: number;
      currency: string;
    };
  },

  async captureOrder(orderId: string, approvalToken: string) {
    const res = await api.post('/paypal/capture-order', { orderId, approvalToken });
    return res.data as {
      success: boolean;
      transaction: TransactionRecord;
    };
  },
};

// Dashboard API
export const DashboardAPI = {
  async getSummary() {
    const res = await api.get('/dashboard/summary');
    return res.data;
  },

  async getTransactions() {
    const res = await api.get('/dashboard/transactions');
    return res.data.transactions as TransactionRecord[];
  },

  async getSettings() {
    const res = await api.get('/dashboard/settings');
    return res.data;
  },

  async updateSettings(data: { theme?: string; defaultCurrency?: string; strictMode?: boolean }) {
    const res = await api.put('/dashboard/settings', data);
    return res.data;
  },
};

export default api;
