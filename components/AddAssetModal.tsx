import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AVAILABLE_TOKENS } from '../constants';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (symbol: string, amount: number) => void;
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [selectedToken, setSelectedToken] = useState(AVAILABLE_TOKENS[0].symbol);
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (val > 0) {
      onAdd(selectedToken, val);
      setAmount('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-crypto-card border border-white/10 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Add Transaction</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} className="text-crypto-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-crypto-muted mb-2">Select Asset</label>
            <select 
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="w-full bg-crypto-dark border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-crypto-primary appearance-none"
            >
              {AVAILABLE_TOKENS.map(t => (
                <option key={t.id} value={t.symbol}>{t.name} ({t.symbol})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-crypto-muted mb-2">Amount Bought</label>
            <input 
              type="number" 
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-crypto-dark border border-white/10 rounded-xl p-4 text-white text-lg font-mono focus:outline-none focus:border-crypto-primary"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-crypto-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-colors mt-4"
          >
            Add to Portfolio
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAssetModal;
