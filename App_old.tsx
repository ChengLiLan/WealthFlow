import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  TrendingUp, 
  PieChart, 
  Settings, 
  Wallet, 
  AlertCircle, 
  Sparkles,
  Target,
  Trash2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from 'recharts';
import { Transaction, TransactionType, Category, AppSettings, SavingsGoal, AIInsight } from './types';
import { suggestCategory, analyzeFinances } from './services/geminiService';
import { Modal } from './components/Modal';
import { TransactionList } from './components/TransactionList';

// --- Constants ---
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];
const INITIAL_SETTINGS: AppSettings = { dailyLimit: 100, currency: '¥' };

const App: React.FC = () => {
  // --- State ---
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('savingsGoals');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Modals State
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Form State
  const [newTx, setNewTx] = useState<{ amount: string, desc: string, type: TransactionType, category: string }>({
    amount: '', desc: '', type: TransactionType.EXPENSE, category: 'Other'
  });
  const [newGoal, setNewGoal] = useState<{ name: string, target: string, current: string }>({
    name: '', target: '', current: ''
  });
  const [isAutoCategorizing, setIsAutoCategorizing] = useState(false);

  // Insights State
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  // Get AI Insight on significant changes (debounced effectively by user action)
  useEffect(() => {
    const fetchInsight = async () => {
      setLoadingInsight(true);
      const result = await analyzeFinances(transactions, settings.dailyLimit, settings.currency);
      setInsight(result);
      setLoadingInsight(false);
    };
    // Only run if we have some data and it's been modified significantly, 
    // for demo purposes we run on mount if data exists or when modal closes after add.
    if (transactions.length > 0) {
        fetchInsight();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions.length, settings.dailyLimit, settings.currency]);

  // --- Derived State ---
  const balance = useMemo(() => {
    return transactions.reduce((acc, t) => t.type === TransactionType.INCOME ? acc + t.amount : acc - t.amount, 0);
  }, [transactions]);

  const income = useMemo(() => transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const expenses = useMemo(() => transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0), [transactions]);

  const todayExpenses = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return transactions
      .filter(t => t.type === TransactionType.EXPENSE && t.date.startsWith(today))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const chartData = useMemo(() => {
    const data: Record<string, number> = {};
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        data[t.category] = (data[t.category] || 0) + t.amount;
      });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // --- Handlers ---
  const handleAddTransaction = () => {
    if (!newTx.amount) return;
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: newTx.type,
      amount: parseFloat(newTx.amount),
      description: newTx.desc,
      category: newTx.category,
      date: new Date().toISOString()
    };
    setTransactions([transaction, ...transactions]);
    setIsTxModalOpen(false);
    setNewTx({ amount: '', desc: '', type: TransactionType.EXPENSE, category: 'Other' });
  };

  const handleDescriptionBlur = async () => {
    if (newTx.desc && newTx.type === TransactionType.EXPENSE && !isAutoCategorizing) {
      setIsAutoCategorizing(true);
      const suggested = await suggestCategory(newTx.desc);
      setNewTx(prev => ({ ...prev, category: suggested }));
      setIsAutoCategorizing(false);
    }
  };

  const handleAddSavingsGoal = () => {
    if (!newGoal.name || !newGoal.target) return;
    const goal: SavingsGoal = {
      id: Date.now().toString(),
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.target),
      currentAmount: parseFloat(newGoal.current || '0'),
      color: COLORS[savingsGoals.length % COLORS.length]
    };
    setSavingsGoals([...savingsGoals, goal]);
    setIsSavingsModalOpen(false);
    setNewGoal({ name: '', target: '', current: '' });
  };

  const updateSavings = (id: string, amount: number) => {
    setSavingsGoals(goals => goals.map(g => {
        if (g.id === id) {
            const newAmount = Math.max(0, g.currentAmount + amount);
            return { ...g, currentAmount: newAmount };
        }
        return g;
    }));
  };
  
  const deleteSavingsGoal = (id: string) => {
      setSavingsGoals(goals => goals.filter(g => g.id !== id));
  }

  // --- Render Helpers ---
  const isOverLimit = todayExpenses > settings.dailyLimit;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 text-gray-800 font-sans">
      {/* Top Navigation / Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Wallet className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Gemini WealthFlow</h1>
          </div>
          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* Daily Limit Alert */}
        {isOverLimit && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm animate-pulse flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-red-800 font-semibold">Daily Limit Exceeded</h4>
              <p className="text-red-600 text-sm">
                You have spent {settings.currency}{todayExpenses.toFixed(2)} today. 
                Your limit is {settings.currency}{settings.dailyLimit}.
              </p>
            </div>
          </div>
        )}

        {/* Gemini Insight Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
               <Sparkles size={100} />
           </div>
           <div className="relative z-10">
               <div className="flex items-center gap-2 mb-2 opacity-90">
                   <Sparkles size={16} />
                   <span className="text-xs font-bold uppercase tracking-wider">AI Financial Advisor</span>
               </div>
               {loadingInsight ? (
                   <div className="animate-pulse h-16 w-full bg-white/20 rounded-lg"></div>
               ) : (
                   <div>
                       <h2 className="text-lg font-bold mb-1">{insight?.title || "Analyzing..."}</h2>
                       <p className="text-indigo-100 text-sm leading-relaxed">{insight?.message || "Add transactions to get started."}</p>
                   </div>
               )}
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium mb-1">Total Balance</p>
            <p className="text-3xl font-bold text-gray-900">{settings.currency}{balance.toFixed(2)}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
             <p className="text-sm text-gray-500 font-medium mb-1">Income</p>
             <div className="flex items-center gap-2 text-emerald-600">
                 <ArrowUpRight size={20} className="bg-emerald-100 rounded-full p-0.5" />
                 <p className="text-2xl font-bold">{settings.currency}{income.toFixed(2)}</p>
             </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium mb-1">Expenses</p>
            <div className="flex items-center gap-2 text-rose-600">
                 <ArrowDownRight size={20} className="bg-rose-100 rounded-full p-0.5" />
                 <p className="text-2xl font-bold">{settings.currency}{expenses.toFixed(2)}</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
                {/* Savings Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Target className="text-indigo-500" size={20} />
                            Savings Goals
                        </h3>
                        <button 
                            onClick={() => setIsSavingsModalOpen(true)}
                            className="text-indigo-600 text-sm font-medium hover:bg-indigo-50 px-3 py-1 rounded-full transition-colors"
                        >
                            + New Goal
                        </button>
                    </div>
                    
                    {savingsGoals.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-500 text-sm">No savings goals set yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {savingsGoals.map(goal => {
                                const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                                return (
                                    <div key={goal.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-medium text-gray-700">{goal.name}</span>
                                            <button onClick={() => deleteSavingsGoal(goal.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>{settings.currency}{goal.currentAmount}</span>
                                            <span>{settings.currency}{goal.targetAmount}</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full transition-all duration-500 ease-out" 
                                                style={{ width: `${progress}%`, backgroundColor: goal.color }}
                                            />
                                        </div>
                                        <div className="mt-3 flex gap-2">
                                            <button onClick={() => updateSavings(goal.id, 10)} className="flex-1 py-1 bg-white text-xs font-medium rounded shadow-sm hover:bg-gray-50 border border-gray-200 text-gray-600">
                                                +10
                                            </button>
                                            <button onClick={() => updateSavings(goal.id, 100)} className="flex-1 py-1 bg-white text-xs font-medium rounded shadow-sm hover:bg-gray-50 border border-gray-200 text-gray-600">
                                                +100
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Transactions List */}
                <TransactionList 
                  transactions={transactions} 
                  onDelete={(id) => setTransactions(t => t.filter(x => x.id !== id))}
                  currency={settings.currency}
                />
            </div>

            {/* Sidebar / Chart */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <PieChart className="text-gray-400" size={18} />
                        Spending Breakdown
                    </h3>
                    <div className="h-[250px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <ReTooltip 
                                        formatter={(value: number) => `${settings.currency}${value.toFixed(2)}`}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                </RePieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                No expense data to display
                            </div>
                        )}
                    </div>
                    {chartData.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {chartData.sort((a,b) => b.value - a.value).slice(0, 3).map((item, idx) => (
                                <div key={item.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                        <span className="text-gray-600">{item.name}</span>
                                    </div>
                                    <span className="font-medium text-gray-800">{settings.currency}{item.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Floating Action Button for Mobile/Desktop */}
        <button 
            onClick={() => setIsTxModalOpen(true)}
            className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg shadow-indigo-500/30 transition-transform hover:scale-105 active:scale-95 z-40"
        >
            <Plus size={24} />
        </button>

        {/* --- MODALS --- */}

        {/* Add Transaction Modal */}
        <Modal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} title="Add Transaction">
            <div className="space-y-4">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${newTx.type === TransactionType.EXPENSE ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setNewTx({...newTx, type: TransactionType.EXPENSE})}
                    >
                        Expense
                    </button>
                    <button 
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${newTx.type === TransactionType.INCOME ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setNewTx({...newTx, type: TransactionType.INCOME})}
                    >
                        Income
                    </button>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{settings.currency}</span>
                        <input 
                            type="number" 
                            value={newTx.amount} 
                            onChange={(e) => setNewTx({...newTx, amount: e.target.value})}
                            className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            placeholder="0.00"
                            autoFocus
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                    <input 
                        type="text" 
                        value={newTx.desc} 
                        onChange={(e) => setNewTx({...newTx, desc: e.target.value})}
                        onBlur={handleDescriptionBlur}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        placeholder="e.g., Grocery Store, Salary"
                    />
                    {isAutoCategorizing && <p className="text-xs text-indigo-500 mt-1 flex items-center gap-1"><Sparkles size={10}/> AI is categorizing...</p>}
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                    <select 
                        value={newTx.category}
                        onChange={(e) => setNewTx({...newTx, category: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white"
                    >
                        {Object.values(Category).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <button 
                    onClick={handleAddTransaction}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg mt-2 transition-colors"
                >
                    Save Transaction
                </button>
            </div>
        </Modal>

        {/* Add Savings Modal */}
        <Modal isOpen={isSavingsModalOpen} onClose={() => setIsSavingsModalOpen(false)} title="New Savings Goal">
             <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Goal Name</label>
                    <input 
                        type="text" 
                        value={newGoal.name} 
                        onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                        placeholder="e.g., New Car, Vacation"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Target Amount</label>
                    <input 
                        type="number" 
                        value={newGoal.target} 
                        onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                        placeholder="1000"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Initial Deposit (Optional)</label>
                    <input 
                        type="number" 
                        value={newGoal.current} 
                        onChange={(e) => setNewGoal({...newGoal, current: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                        placeholder="0"
                    />
                </div>
                <button 
                    onClick={handleAddSavingsGoal}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg mt-2 transition-colors"
                >
                    Create Goal
                </button>
             </div>
        </Modal>

        {/* Settings Modal */}
        <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Settings">
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Currency Symbol</label>
                    <input 
                        type="text" 
                        value={settings.currency}
                        onChange={(e) => setSettings({...settings, currency: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Daily Spending Limit</label>
                    <div className="relative">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{settings.currency}</span>
                        <input 
                            type="number" 
                            value={settings.dailyLimit}
                            onChange={(e) => setSettings({...settings, dailyLimit: parseFloat(e.target.value) || 0})}
                            className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">You will be alerted if your daily expenses exceed this amount.</p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                    <button 
                        onClick={() => setIsSettingsModalOpen(false)}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </Modal>
      </main>
    </div>
  );
};

export default App;