import React from 'react';
import { Transaction, TransactionType } from '../types';
import { ArrowDownRight, ArrowUpRight, ShoppingBag, Utensils, Car, Zap, Film, Heart, Briefcase, Banknote, HelpCircle } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  currency: string;
}

const getIcon = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes('food')) return <Utensils size={18} />;
  if (normalized.includes('shopping')) return <ShoppingBag size={18} />;
  if (normalized.includes('transport')) return <Car size={18} />;
  if (normalized.includes('bill') || normalized.includes('util')) return <Zap size={18} />;
  if (normalized.includes('entertain')) return <Film size={18} />;
  if (normalized.includes('health')) return <Heart size={18} />;
  if (normalized.includes('salary')) return <Briefcase size={18} />;
  if (normalized.includes('invest')) return <Banknote size={18} />;
  return <HelpCircle size={18} />;
};

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, currency }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
        <p>No transactions yet.</p>
        <p className="text-sm">Add your first expense or income.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
        {transactions.map((t) => (
          <div key={t.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                t.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}>
                {getIcon(t.category)}
              </div>
              <div>
                <p className="font-medium text-gray-800">{t.description || t.category}</p>
                <p className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className={`flex items-center font-semibold ${
                t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {t.type === TransactionType.INCOME ? '+' : '-'}{currency}{t.amount.toFixed(2)}
                {t.type === TransactionType.INCOME ? <ArrowUpRight size={14} className="ml-1"/> : <ArrowDownRight size={14} className="ml-1"/>}
              </div>
              <button 
                onClick={() => onDelete(t.id)}
                className="text-xs text-red-400 opacity-0 group-hover:opacity-100 hover:underline mt-1 transition-opacity"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};