import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  preferences?: {
    theme?: 'dark' | 'light';
    defaultCurrency?: string;
    strictMode?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    preferences: {
      theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
      defaultCurrency: { type: String, default: 'INR' },
      strictMode: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Analysis Schema
export interface IAnalysis extends Document {
  userId: string;
  inputType: 'url' | 'image' | 'text';
  originalInput?: string;
  productName: string;
  advertisedPrice: number;
  currency: string;
  structuredAnalysis: any;
  overallRiskLevel: string;
  recommendation: string;
  createdAt: Date;
}

export const AnalysisSchema = new Schema<IAnalysis>(
  {
    userId: { type: String, required: true, index: true },
    inputType: { type: String, enum: ['url', 'image', 'text'], required: true },
    originalInput: { type: String },
    productName: { type: String, default: 'Online Product' },
    advertisedPrice: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    structuredAnalysis: { type: Schema.Types.Mixed, required: true },
    overallRiskLevel: { type: String, required: true, index: true },
    recommendation: { type: String, required: true },
  },
  { timestamps: true }
);

// Purchase Rule Schema
export interface IPurchaseRule extends Document {
  userId: string;
  name: string;
  conditions: any;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const PurchaseRuleSchema = new Schema<IPurchaseRule>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    conditions: { type: Schema.Types.Mixed, required: true },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Transaction Schema
export interface ITransaction extends Document {
  userId: string;
  analysisId?: string;
  productName: string;
  amount: number;
  currency: string;
  paypalOrderId: string;
  paypalCaptureId?: string;
  status: string;
  isSandbox: boolean;
  createdAt: Date;
}

export const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: String, required: true, index: true },
    analysisId: { type: String, index: true },
    productName: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    paypalOrderId: { type: String, required: true, unique: true },
    paypalCaptureId: { type: String },
    status: { type: String, default: 'COMPLETED' },
    isSandbox: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Activity Schema
export interface IActivity extends Document {
  userId: string;
  type: string;
  description: string;
  metadata?: any;
  createdAt: Date;
}

export const ActivitySchema = new Schema<IActivity>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const AnalysisModel =
  mongoose.models.Analysis || mongoose.model<IAnalysis>('Analysis', AnalysisSchema);
export const PurchaseRuleModel =
  mongoose.models.PurchaseRule ||
  mongoose.model<IPurchaseRule>('PurchaseRule', PurchaseRuleSchema);
export const TransactionModel =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>('Transaction', TransactionSchema);
export const ActivityModel =
  mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
