import React, { useState } from 'react';
import { X, Check, AlertCircle, ShoppingBag, Globe, Key, ShieldCheck, RefreshCw, ExternalLink } from 'lucide-react';
import { getShopifyConfig, saveShopifyConfig } from '../services/shopify';

interface ShopifyConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: () => void;
}

export const ShopifyConnectModal: React.FC<ShopifyConnectModalProps> = ({
  isOpen,
  onClose,
  onConnected,
}) => {
  const currentConfig = getShopifyConfig();
  const [domain, setDomain] = useState(currentConfig.domain || '');
  const [token, setToken] = useState(currentConfig.storefrontAccessToken || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    let cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0].trim();
    if (cleanDomain && !cleanDomain.includes('.')) {
      cleanDomain = `${cleanDomain}.myshopify.com`;
    }
    const cleanToken = token.trim();

    if (!cleanDomain || !cleanToken) {
      setTestResult({ success: false, message: 'Please provide both your Shopify store domain and Public Storefront access token.' });
      setTesting(false);
      return;
    }

    try {
      // Test query
      const endpoint = `https://${cleanDomain}/api/2024-01/graphql.json`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': cleanToken,
        },
        body: JSON.stringify({
          query: '{ shop { name primaryDomain { host } } }',
        }),
      });

      const json = await res.json();
      if (json.data?.shop?.name) {
        saveShopifyConfig(cleanDomain, cleanToken);
        setTestResult({
          success: true,
          message: `Successfully connected to "${json.data.shop.name}" (${cleanDomain})!`,
        });
        setTimeout(() => {
          onConnected();
          onClose();
        }, 1200);
      } else {
        // Even if shop query has restrictions, try products query
        const testProducts = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': cleanToken,
          },
          body: JSON.stringify({
            query: '{ products(first: 1) { edges { node { id title } } } }',
          }),
        });
        const pJson = await testProducts.json();
        if (pJson.data?.products) {
          saveShopifyConfig(cleanDomain, cleanToken);
          setTestResult({
            success: true,
            message: `Successfully connected to ${cleanDomain}! Real products loaded.`,
          });
          setTimeout(() => {
            onConnected();
            onClose();
          }, 1200);
        } else {
          setTestResult({
            success: false,
            message: json.errors?.[0]?.message || 'Invalid domain or Storefront API token. Verify permissions in Shopify Admin.',
          });
        }
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Could not connect. Check the store domain and ensure CORS allows storefront requests.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = () => {
    saveShopifyConfig('', '');
    setDomain('');
    setToken('');
    setTestResult({ success: true, message: 'Disconnected. Restored curated catalog.' });
    onConnected();
  };

  return (
    <div 
      className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-inter animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl relative my-auto p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#95BF47]/15 border border-[#95BF47]/30 text-[#60871b] flex items-center justify-center shrink-0">
              <ShoppingBag size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#EC3460] block mb-0.5">
                HEADLESS ECOMMERCE
              </span>
              <h3 className="font-anton text-2xl uppercase tracking-tight text-slate-900">
                SHOPIFY STOREFRONT API
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Connection Status Badge */}
        <div className={`p-4 rounded-2xl mb-6 flex items-center justify-between border ${
          currentConfig.isConnected 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-[#FFF5FA] border-[#FFCDF2] text-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${currentConfig.isConnected ? 'bg-emerald-500' : 'bg-[#EC3460]'}`} />
            <div>
              <span className="text-xs font-bold uppercase block">
                {currentConfig.isConnected ? 'Connected to Shopify' : 'Demo Catalog Active'}
              </span>
              <span className="text-[11px] opacity-80 block font-mono">
                {currentConfig.isConnected ? currentConfig.domain : 'Ready for your Shopify credentials'}
              </span>
            </div>
          </div>

          {currentConfig.isConnected && (
            <button
              onClick={handleDisconnect}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer"
            >
              Disconnect
            </button>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleTestAndSave} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe size={13} className="text-slate-400" />
                Shopify Store Domain
              </span>
              <span className="text-[10px] text-slate-400 lowercase font-normal">
                e.g. li-fei-beauty.myshopify.com
              </span>
            </label>
            <input
              type="text"
              required
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="your-store.myshopify.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 outline-none focus:border-[#EC3460] font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key size={13} className="text-slate-400" />
                Public Storefront API Access Token
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">
                Public Token Only
              </span>
            </label>
            <input
              type="password"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="e.g. shpat_... or storefront access token"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 outline-none focus:border-[#EC3460] font-mono"
            />
          </div>

          {/* Security Note */}
          <div className="bg-[#FFF0F9] border border-[#FFCDF2] p-3 rounded-xl flex items-start gap-2.5 text-[11px] text-[#B31940]">
            <ShieldCheck size={16} className="text-[#EC3460] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Security Guarantee:</strong> Only your <em>Public Storefront Access Token</em> is accepted. Never share or paste private admin access tokens.
            </p>
          </div>

          {/* Test Result Banner */}
          {testResult && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {testResult.success ? <Check size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-rose-600" />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={testing}
              className="flex-1 bg-[#EC3460] hover:bg-[#D8224F] disabled:opacity-60 text-white font-semibold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-raspberry transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {testing ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Verifying Storefront API...</span>
                </>
              ) : (
                <>
                  <Check size={15} />
                  <span>Connect & Load Real Products</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Works with all Shopify Plans</span>
          <a
            href="https://shopify.dev/docs/api/storefront"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#EC3460] hover:underline"
          >
            <span>Storefront Docs</span>
            <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
};
