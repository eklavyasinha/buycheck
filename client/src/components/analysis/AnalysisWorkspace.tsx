import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisAPI } from '../../services/api.js';
import {
  Link2,
  Image as ImageIcon,
  FileText,
  Sliders,
  Sparkles,
  ArrowRight,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  X,
} from 'lucide-react';

const ANALYSIS_STAGES = [
  'Inspecting merchant input & validating boundaries...',
  'Extracting advertised prices & currency context...',
  'Scanning checkout fees, shipping & tax clauses...',
  'Auditing subscription terms & auto-renewal clauses...',
  'Analyzing return window & restocking fee policies...',
  'Evaluating consumer dark patterns & missing facts...',
  'Computing True Cost & assembling purchase report...',
];

export const AnalysisWorkspace: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'url' | 'image' | 'text'>('url');
  const [urlInput, setUrlInput] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [productNameInput, setProductNameInput] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Purchasing Preferences
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const [expectedPrice, setExpectedPrice] = useState<string>('');
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP'>('INR');
  const [desiredReturnWindow, setDesiredReturnWindow] = useState<string>('14');
  const [maxExtraCharges, setMaxExtraCharges] = useState<string>('500');
  const [allowSubscription, setAllowSubscription] = useState<boolean>(false);
  const [requireFreeReturns, setRequireFreeReturns] = useState<boolean>(true);
  const [disallowRestocking, setDisallowRestocking] = useState<boolean>(true);

  // Execution states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [stageIndex, setStageIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File size exceeds the 10MB limit.');
        return;
      }
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const loadPreset = (type: 'headphones' | 'saas' | 'vpn') => {
    setErrorMessage(null);
    if (type === 'headphones') {
      setActiveTab('text');
      setProductNameInput('CloudAudio Pro ANC Wireless Headphones');
      setTextInput(
        `CloudAudio Pro Wireless ANC Headphones with 40-hour battery.
Advertised Price: ₹4,999.00 (MSRP ₹7,999).
Checkout Details:
- Standard GST (18%) and fragility handling surcharge (+₹149) added at final step.
- Includes 7-day VIP Concierge Audio Pass trial. Renews automatically at standard monthly rate of ₹999/month unless cancelled 48 hours prior to renewal date.
- Return Policy: 14 days from delivery. Unopened items eligible for return. Opened packages subject to a 15% restocking fee. Buyer is responsible for return postage tracking.`
      );
    } else if (type === 'saas') {
      setActiveTab('text');
      setProductNameInput('Fullstack AI Engineering Masterclass');
      setTextInput(
        `Fullstack AI Engineering Masterclass with 1-on-1 mentorship.
Advertised Price: $79 one-time access pass.
Terms of Service excerpt:
- Registration grants 7 days full platform access.
- Account automatically transitions to Pro Monthly Membership at $49/month after the 7-day period.
- Notice: Cancellations must be submitted in writing via postal mail or ticket at least 7 days before billing date.
- Digital materials are strictly non-refundable once first lesson is opened.`
      );
    } else if (type === 'vpn') {
      setActiveTab('url');
      setUrlInput('https://example.com/products/secureshield-vpn-pass');
    }
  };

  const startAnalysis = async () => {
    setErrorMessage(null);
    setIsAnalyzing(true);
    setStageIndex(0);

    // Build preferences payload
    const preferencesPayload: any = {
      currency,
      allowSubscription,
      requireFreeReturnShipping: requireFreeReturns,
      disallowRestockingFee: disallowRestocking,
    };
    if (expectedPrice) preferencesPayload.expectedPrice = parseFloat(expectedPrice);
    if (desiredReturnWindow) preferencesPayload.desiredReturnWindowDays = parseInt(desiredReturnWindow, 10);
    if (maxExtraCharges) preferencesPayload.maxAcceptableExtraCharges = parseFloat(maxExtraCharges);

    // Interval to step through the 7 real backend analysis phases
    const stageTimer = setInterval(() => {
      setStageIndex((prev) => (prev < ANALYSIS_STAGES.length - 1 ? prev + 1 : prev));
    }, 900);

    try {
      let result;
      if (activeTab === 'url') {
        if (!urlInput.trim()) throw new Error('Please enter a product URL to analyze.');
        result = await AnalysisAPI.analyzeUrl(urlInput.trim(), preferencesPayload);
      } else if (activeTab === 'image') {
        if (!selectedFile) throw new Error('Please choose or drag-and-drop a product screenshot.');
        result = await AnalysisAPI.analyzeImage(selectedFile, preferencesPayload);
      } else {
        if (!textInput.trim() || textInput.length < 10) {
          throw new Error('Please provide at least 10 characters of product or checkout text.');
        }
        result = await AnalysisAPI.analyzeText(textInput.trim(), productNameInput.trim(), preferencesPayload);
      }

      clearInterval(stageTimer);
      setStageIndex(ANALYSIS_STAGES.length - 1);

      // Brief transition delay
      setTimeout(() => {
        setIsAnalyzing(false);
        const reportId = result._id || result.id || 'sample-analysis-headphones';
        navigate(`/report/${reportId}`);
      }, 700);
    } catch (err: any) {
      clearInterval(stageTimer);
      setIsAnalyzing(false);
      setErrorMessage(err.message || 'Analysis could not be completed.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4">
      {/* Page Heading */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-lime/10 text-lime border border-lime/20 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          Consumer Protection Intelligence
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ivory tracking-tight">
          Analyze Any Online Purchase
        </h1>
        <p className="text-sm text-zinc-400 mt-2">
          Paste a merchant URL, upload a checkout screenshot, or paste terms to reveal hidden fees, renewal commitments, and dark patterns.
        </p>
      </div>

      {/* Quick Fill Samples */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <span className="text-xs text-zinc-400 font-mono">Sample Scenarios:</span>
        <button
          onClick={() => loadPreset('headphones')}
          className="text-xs px-3 py-1 rounded-full bg-surface border border-borderMuted hover:border-lime/40 text-zinc-300 hover:text-ivory transition-all"
        >
          🎧 ANC Headphones with Free Trial Trap
        </button>
        <button
          onClick={() => loadPreset('saas')}
          className="text-xs px-3 py-1 rounded-full bg-surface border border-borderMuted hover:border-lime/40 text-zinc-300 hover:text-ivory transition-all"
        >
          💻 Masterclass with Auto-Renewal
        </button>
      </div>

      {/* Main Workspace Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-borderMuted relative">
        {/* Input Method Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-graphite rounded-xl border border-borderMuted mb-6">
          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'url'
                ? 'bg-charcoal text-lime border border-lime/30 shadow-sm'
                : 'text-zinc-400 hover:text-ivory'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Product URL</span>
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'image'
                ? 'bg-charcoal text-lime border border-lime/30 shadow-sm'
                : 'text-zinc-400 hover:text-ivory'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Screenshot</span>
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'text'
                ? 'bg-charcoal text-lime border border-lime/30 shadow-sm'
                : 'text-zinc-400 hover:text-ivory'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Pasted Text</span>
          </button>
        </div>

        {/* Tab 1: Product URL */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <label className="block text-xs font-mono font-medium text-zinc-300">
              Merchant or Product Web Address (HTTP / HTTPS)
            </label>
            <div className="relative">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/product/anc-wireless-headphones"
                className="w-full bg-graphite text-ivory rounded-xl border border-borderMuted px-4 py-3.5 pl-10 text-sm focus:outline-none focus:border-lime/60 focus:ring-1 focus:ring-lime/40 placeholder-zinc-600 transition-all font-mono"
              />
              <Link2 className="w-4 h-4 text-zinc-500 absolute left-3.5 top-4" />
            </div>
            <p className="text-[11px] text-zinc-500">
              BuyCheck applies SSRF prevention filters, extracts public HTML, and never bypasses paywalls or CAPTCHAs.
            </p>
          </div>
        )}

        {/* Tab 2: Screenshot Upload */}
        {activeTab === 'image' && (
          <div className="space-y-4">
            <label className="block text-xs font-mono font-medium text-zinc-300">
              Upload Checkout, Pricing Table, or Terms Screenshot
            </label>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-borderMuted hover:border-lime/40 rounded-xl p-8 text-center cursor-pointer transition-all bg-graphite/40"
              onClick={() => document.getElementById('screenshot-upload')?.click()}
            >
              <input
                type="file"
                id="screenshot-upload"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {filePreview ? (
                <div className="space-y-3">
                  <img
                    src={filePreview}
                    alt="Uploaded screenshot preview"
                    className="max-h-56 mx-auto rounded-lg border border-borderMuted object-contain"
                  />
                  <div className="flex items-center justify-center gap-2 text-xs text-lime">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{selectedFile?.name} ready for Vision OCR</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-surface mx-auto flex items-center justify-center text-zinc-400">
                    <Upload className="w-6 h-6 text-lime" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-ivory">Click to upload</span>
                    <span className="text-sm text-zinc-400"> or drag and drop</span>
                  </div>
                  <p className="text-xs text-zinc-500">PNG, JPG or WEBP up to 10MB</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Pasted Text */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
                Product or Course Title (Optional)
              </label>
              <input
                type="text"
                value={productNameInput}
                onChange={(e) => setProductNameInput(e.target.value)}
                placeholder="e.g. CloudAudio Pro Wireless ANC Headphones"
                className="w-full bg-graphite text-ivory rounded-xl border border-borderMuted px-4 py-2.5 text-sm focus:outline-none focus:border-lime/60 focus:ring-1 focus:ring-lime/40 placeholder-zinc-600 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
                Pasted Terms, Pricing Table, or Checkout Excerpts
              </label>
              <textarea
                rows={5}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste the product details, checkout breakdown, subscription terms, or return policy clauses here..."
                className="w-full bg-graphite text-ivory rounded-xl border border-borderMuted px-4 py-3 text-sm focus:outline-none focus:border-lime/60 focus:ring-1 focus:ring-lime/40 placeholder-zinc-600 transition-all"
              />
            </div>
          </div>
        )}

        {/* Collapsible Personal Purchasing Preferences */}
        <div className="mt-6 pt-5 border-t border-borderMuted">
          <button
            type="button"
            onClick={() => setShowPreferences(!showPreferences)}
            className="flex items-center justify-between w-full text-xs font-mono font-medium text-zinc-300 hover:text-lime transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-lime" />
              Configure Personal Purchasing Rules & Limits (Optional)
            </span>
            <span className="text-zinc-500">{showPreferences ? '− Collapse' : '+ Expand'}</span>
          </button>

          <AnimatePresence>
            {showPreferences && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs overflow-hidden"
              >
                <div>
                  <label className="block text-zinc-400 mb-1">Max Price Limit</label>
                  <input
                    type="number"
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full bg-graphite rounded-lg border border-borderMuted px-3 py-2 text-ivory focus:border-lime"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e: any) => setCurrency(e.target.value)}
                    className="w-full bg-graphite rounded-lg border border-borderMuted px-3 py-2 text-ivory focus:border-lime"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Min Return Window (Days)</label>
                  <input
                    type="number"
                    value={desiredReturnWindow}
                    onChange={(e) => setDesiredReturnWindow(e.target.value)}
                    placeholder="14"
                    className="w-full bg-graphite rounded-lg border border-borderMuted px-3 py-2 text-ivory focus:border-lime"
                  />
                </div>

                <div className="sm:col-span-3 flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!allowSubscription}
                      onChange={(e) => setAllowSubscription(!e.target.checked)}
                      className="rounded bg-graphite border-borderMuted text-lime focus:ring-0"
                    />
                    <span>Block automatic recurring subscriptions</span>
                  </label>

                  <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requireFreeReturns}
                      onChange={(e) => setRequireFreeReturns(e.target.checked)}
                      className="rounded bg-graphite border-borderMuted text-lime focus:ring-0"
                    />
                    <span>Require free return shipping</span>
                  </label>

                  <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={disallowRestocking}
                      onChange={(e) => setDisallowRestocking(e.target.checked)}
                      className="rounded bg-graphite border-borderMuted text-lime focus:ring-0"
                    />
                    <span>Reject restocking deduction fees</span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Action */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={startAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-lime hover:bg-lime-hover disabled:opacity-50 text-graphite font-bold text-sm tracking-wide transition-all shadow-md tactile-btn"
          >
            {isAnalyzing ? (
              <>
                <Clock className="w-4 h-4 animate-spin text-graphite" />
                <span>Running BuyCheck Intelligence...</span>
              </>
            ) : (
              <>
                <span>Analyze Purchase</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Meaningful Real-Time Analysis Progress Overlay */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-graphite/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-8 z-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-charcoal border border-lime/40 flex items-center justify-center text-lime mb-5 shadow-lg lime-glow">
                <Sparkles className="w-8 h-8 animate-pulse text-lime" />
              </div>

              <h3 className="text-xl font-bold text-ivory mb-2">
                Analyzing Purchase Intelligence
              </h3>

              <p className="text-xs font-mono text-lime h-6 transition-all">
                {ANALYSIS_STAGES[stageIndex]}
              </p>

              {/* Progress bar */}
              <div className="w-full max-w-md h-2 bg-charcoal rounded-full overflow-hidden mt-6 border border-borderMuted">
                <motion.div
                  className="h-full bg-lime"
                  initial={{ width: '5%' }}
                  animate={{
                    width: `${Math.round(((stageIndex + 1) / ANALYSIS_STAGES.length) * 100)}%`,
                  }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              <span className="text-[11px] font-mono text-zinc-500 mt-2">
                Phase {stageIndex + 1} of {ANALYSIS_STAGES.length}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
