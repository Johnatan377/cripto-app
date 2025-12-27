
import React, { useState } from 'react';
import { Asset, AnalysisResult } from '../types';
import { analyzePortfolio } from '../services/geminiService';
import { BrainCircuit, Loader2, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

interface AnalysisViewProps {
  assets: Asset[];
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ assets }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzePortfolio(assets);
      setResult(data);
    } catch (e) {
      setError("Failed to generate analysis. Please check your API key or try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 rounded-3xl p-6 text-center">
        <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <BrainCircuit size={32} className="text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">AI Portfolio Advisor</h2>
        <p className="text-indigo-200 mb-6 text-sm">
          {/* Updated text to reflect use of gemini-3-pro-preview */}
          Get personalized insights, risk assessment, and actionable tips powered by Gemini 3.
        </p>
        
        {!result && !loading && (
          <button 
            onClick={handleAnalyze}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
          >
            Analyze My Portfolio
          </button>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-3 text-indigo-300">
            <Loader2 className="animate-spin" />
            <span>Crunching the numbers...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-200 text-sm text-center">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Score Card */}
          <div className="bg-crypto-card border border-white/5 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-crypto-muted text-sm">Risk Score</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-bold ${result.riskScore > 7 ? 'text-red-400' : result.riskScore > 4 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {result.riskScore}
                </span>
                <span className="text-crypto-muted">/10</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-crypto-muted text-sm">Sentiment</p>
              <span className={`font-bold text-lg ${result.marketSentiment === 'Bullish' ? 'text-green-400' : result.marketSentiment === 'Bearish' ? 'text-red-400' : 'text-gray-400'}`}>
                {result.marketSentiment}
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-crypto-card border border-white/5 rounded-2xl p-5">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-crypto-primary" />
              Summary
            </h3>
            <p className="text-indigo-100/80 text-sm leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* Suggestions */}
          <div className="bg-crypto-card border border-white/5 rounded-2xl p-5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-crypto-accent" />
              Actionable Tips
            </h3>
            <div className="space-y-3">
              {result.suggestions.map((tip, idx) => (
                <div key={idx} className="flex gap-3 items-start bg-white/5 p-3 rounded-xl">
                  <span className="bg-crypto-accent/20 text-crypto-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-gray-300">{tip}</p>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={handleAnalyze}
            className="w-full py-3 text-sm text-crypto-muted hover:text-white transition-colors"
          >
            Regenerate Analysis
          </button>
        </div>
      )}
    </div>
  );
};

export default AnalysisView;
