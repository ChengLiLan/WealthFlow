import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, collection, query, onSnapshot, addDoc, deleteDoc, updateDoc, setDoc, serverTimestamp, where } from 'firebase/firestore';
import {
  ArrowDownRight as ArrowDownRightIcon,
  ArrowUpRight as ArrowUpRightIcon,
  Banknote as BanknoteIcon,
  Briefcase as BriefcaseIcon,
  Car as CarIcon,
  ChartPie as ChartPieIcon,
  CircleAlert as CircleAlertIcon,
  CircleHelp as QuestionIcon, // 修复：将 CircleQuestionMark 替换为 CircleHelp
  Film as FilmIcon,
  Heart as HeartIcon,
  Plus as PlusIcon,
  Settings as SettingsIcon,
  ShoppingBag as ShoppingBagIcon,
  Sparkles as SparklesIcon,
  Target as TargetIcon,
  Trash2 as TrashIcon,
  Utensils as UtensilsIcon,
  Wallet as WalletIcon,
  X as XIcon,
  Zap as ZapIcon,
  LayoutDashboard as DashboardIcon,
  ListOrdered as TransactionsIcon
} from 'lucide-react';

// Recharts Components for visualization (assuming environment provides these)
const ResponsiveContainer = (props) => <div style={{ width: '100%', height: '100%' }}>{props.children}</div>;
const PieChart = (props) => <div>{props.children}</div>; // Simplified mock
const Pie = (props) => <div>{props.children}</div>; // Simplified mock
const Cell = (props) => <div></div>; // Simplified mock
const Tooltip = (props) => <div></div>; // Simplified mock

// --- 1. Constants and Utility Functions ---

const Page = {
  COVER: 'COVER',
  DASHBOARD: 'DASHBOARD',
  TRANSACTIONS: 'TRANSACTIONS',
  GOALS: 'GOALS',
  SETTINGS: 'SETTINGS',
};

const TransactionType = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

const Categories = {
  FOOD: '餐饮',
  SHOPPING: '购物',
  TRANSPORT: '交通',
  BILLS: '账单与公用事业',
  ENTERTAINMENT: '娱乐',
  HEALTH: '健康与健身',
  SALARY: '工资',
  INVESTMENT: '投资',
  OTHER: '其他',
};

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6"];

const getCategoryIcon = (category) => {
  const t = category.toLowerCase();
  if (t.includes("餐饮") || t.includes("food")) return <UtensilsIcon size={18} />;
  if (t.includes("购物") || t.includes("shopping")) return <ShoppingBagIcon size={18} />;
  if (t.includes("交通") || t.includes("transport")) return <CarIcon size={18} />;
  if (t.includes("账单") || t.includes("bill") || t.includes("util")) return <ZapIcon size={18} />;
  if (t.includes("娱乐") || t.includes("entertain")) return <FilmIcon size={18} />;
  if (t.includes("健康") || t.includes("health")) return <HeartIcon size={18} />;
  if (t.includes("工资") || t.includes("salary")) return <BriefcaseIcon size={18} />;
  if (t.includes("投资") || t.includes("invest")) return <BanknoteIcon size={18} />;
  return <QuestionIcon size={18} />;
};

const CustomModal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleKeyDown = (l) => {
      l.key === 'Escape' && onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-800 text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200">
            <XIcon size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- 2. Modals (Controlled by App Component) ---

const AddTransactionModal = ({ isVisible, onClose, onSave, transaction, setTransaction, isCategorizing, handleInputBlur }) => {
  const isIncome = transaction.type === TransactionType.INCOME;

  return (
    <CustomModal isOpen={isVisible} onClose={onClose} title="添加交易">
      <div className="space-y-4">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isIncome ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setTransaction(t => ({ ...t, type: TransactionType.EXPENSE }))}
          >
            支出
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isIncome ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setTransaction(t => ({ ...t, type: TransactionType.INCOME }))}
          >
            收入
          </button>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500">金额</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
              <input
                type="number"
                value={transaction.amount}
                onChange={k => setTransaction(t => ({ ...t, amount: k.target.value }))}
                className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                placeholder="0.00"
                autoFocus={true}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500">描述</label>
            <input
              type="text"
              value={transaction.description}
              onChange={k => setTransaction(t => ({ ...t, description: k.target.value }))}
              onBlur={handleInputBlur} // 绑定 onBlur 事件以触发自动分类
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              placeholder="例如：杂货店购物，工资"
            />
            {isCategorizing && <p className="text-xs text-indigo-500 mt-1 flex items-center gap-1"><SparklesIcon size={10} /> AI 正在分类...</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500">类别</label>
            <select
              value={transaction.category}
              onChange={k => setTransaction(t => ({ ...t, category: k.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white"
            >
              {Object.values(Categories).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={onSave}
          disabled={!transaction.amount || isCategorizing}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg mt-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          保存交易
        </button>
      </div>
    </CustomModal>
  );
};

const AddGoalModal = ({ isVisible, onClose, onSave, goal, setGoal }) => (
  <CustomModal isOpen={isVisible} onClose={onClose} title="新建储蓄目标">
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-500">目标名称</label>
        <input
          type="text"
          value={goal.name}
          onChange={k => setGoal(g => ({ ...g, name: k.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
          placeholder="例如：新车、旅行"
          autoFocus={true}
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-500">目标金额</label>
        <input
          type="number"
          value={goal.target}
          onChange={k => setGoal(g => ({ ...g, target: k.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
          placeholder="10000"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-500">初始存款 (可选)</label>
        <input
          type="number"
          value={goal.current}
          onChange={k => setGoal(g => ({ ...g, current: k.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
          placeholder="0"
        />
      </div>
      <button
        onClick={onSave}
        disabled={!goal.name || !goal.target}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg mt-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        创建目标
      </button>
    </div>
  </CustomModal>
);

const SettingsModal = ({ isVisible, onClose, settings, onUpdateSettings }) => (
  <CustomModal isOpen={isVisible} onClose={onClose} title="设置">
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-500">货币符号</label>
        <input
          type="text"
          value={settings.currency}
          onChange={k => onUpdateSettings({ currency: k.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-500">每日支出限额</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{settings.currency}</span>
          <input
            type="number"
            value={settings.dailyLimit}
            onChange={k => onUpdateSettings({ dailyLimit: parseFloat(k.target.value) || 0 })}
            className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">如果您的每日支出超过此金额，您将收到警告。</p>
      </div>
      <div className="pt-4 border-t border-gray-100">
        <button onClick={onClose} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition-colors">
          完成
        </button>
      </div>
    </div>
  </CustomModal>
);

// --- 3. Screens ---

const DashboardScreen = ({ stats, breakdown, goals, settings, onNavigate, onAddGoal, onDepositGoal }) => {
  const { totalBalance, totalIncome, totalExpenses, dailyExpenses } = stats;
  const { currency, dailyLimit } = settings;
  const exceededLimit = dailyExpenses > dailyLimit;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {exceededLimit && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm animate-pulse flex items-start gap-3">
          <CircleAlertIcon className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-red-800 font-semibold">每日限额已超出</h4>
            <p className="text-red-600 text-sm">
              您今天已花费 {currency}{dailyExpenses.toFixed(2)}。您的限额是 {currency}{dailyLimit}。
            </p>
          </div>
        </div>
      )}

      {/* 余额概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium mb-1">总余额</p>
          <p className="text-3xl font-bold text-gray-900">{currency}{totalBalance.toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium mb-1">收入</p>
          <div className="flex items-center gap-2 text-emerald-600">
            <ArrowUpRightIcon size={20} className="bg-emerald-100 rounded-full p-0.5" />
            <p className="text-2xl font-bold">{currency}{totalIncome.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium mb-1">支出</p>
          <div className="flex items-center gap-2 text-rose-600">
            <ArrowDownRightIcon size={20} className="bg-rose-100 rounded-full p-0.5" />
            <p className="text-2xl font-bold">{currency}{totalExpenses.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 支出饼图 */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ChartPieIcon className="text-indigo-500" size={20} />
              支出明细
            </h3>
            <div className="h-[250px] w-full">
              {breakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${currency}${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">暂无支出数据可显示</div>
              )}
            </div>
            {breakdown.length > 0 && (
              <div className="mt-6 space-y-2">
                {breakdown.sort((a, b) => b.value - a.value).slice(0, 3).map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-medium text-gray-800">{currency}{item.value.toFixed(2)}</span>
                  </div>
                ))}
                <button 
                  onClick={() => onNavigate(Page.TRANSACTIONS)}
                  className="text-indigo-600 text-xs font-medium hover:underline pt-2 block"
                >
                  查看所有交易 →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 储蓄目标 (小部件) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <TargetIcon className="text-indigo-500" size={20} />
                储蓄目标
              </h3>
              <button onClick={onAddGoal} className="text-indigo-600 text-sm font-medium hover:bg-indigo-50 px-3 py-1 rounded-full transition-colors">
                + 新建目标
              </button>
            </div>
            {goals.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">暂未设置储蓄目标。</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {goals.slice(0, 3).map(k => {
                  const progress = Math.min(100, k.currentAmount / k.targetAmount * 100);
                  return (
                    <div key={k.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-700">{k.name}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{currency}{k.currentAmount.toFixed(2)}</span>
                        <span>{currency}{k.targetAmount.toFixed(2)}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-500 ease-out"
                          style={{ width: `${progress}%`, backgroundColor: k.color }}
                        ></div>
                      </div>
                      <button
                        onClick={() => onNavigate(Page.GOALS)}
                        className="text-indigo-500 text-xs font-medium hover:underline mt-2"
                      >
                        管理目标 →
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const GoalsScreen = ({ goals, settings, onAddGoal, onDepositGoal, onDeleteGoal }) => {
  const { currency } = settings;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">储蓄目标管理</h2>
        <button onClick={onAddGoal} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-md transition-colors">
          + 新建目标
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <TargetIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">您还没有设置任何储蓄目标。</p>
          <button onClick={onAddGoal} className="text-indigo-600 font-medium mt-3 hover:underline">立即创建第一个目标</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(k => {
            const progress = Math.min(100, k.currentAmount / k.targetAmount * 100);
            return (
              <div key={k.id} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 relative">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg text-gray-800">{k.name}</h3>
                  <button onClick={() => onDeleteGoal(k.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                    <TrashIcon size={18} />
                  </button>
                </div>

                <p className="text-2xl font-extrabold" style={{ color: k.color }}>
                  {progress.toFixed(0)}%
                </p>

                <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden mt-3 mb-1">
                  <div
                    className="h-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%`, backgroundColor: k.color }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>已存: {currency}{k.currentAmount.toFixed(2)}</span>
                  <span>目标: {currency}{k.targetAmount.toFixed(2)}</span>
                </div>

                <div className="mt-5 space-y-2">
                  <p className="text-sm font-medium text-gray-700">快速存款：</p>
                  <div className="flex gap-2">
                    {[10, 50, 100, 500].map(amount => (
                      <button
                        key={amount}
                        onClick={() => onDepositGoal(k.id, amount)}
                        className="flex-1 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"
                      >
                        +{amount}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const TransactionsScreen = ({ transactions, settings, onDeleteTransaction }) => {
  const { currency } = settings;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, INCOME, EXPENSE
  const [sortBy, setSortBy] = useState('date'); // date, amount

  const filteredTransactions = useMemo(() => {
    let list = transactions;

    // 1. Filter by Type
    if (filterType === TransactionType.INCOME) {
      list = list.filter(t => t.type === TransactionType.INCOME);
    } else if (filterType === TransactionType.EXPENSE) {
      list = list.filter(t => t.type === TransactionType.EXPENSE);
    }

    // 2. Filter by Search Term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(t =>
        t.description?.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term)
      );
    }

    // 3. Sort
    list.sort((a, b) => {
      if (sortBy === 'date') {
        // Latest date first (descending timestamp)
        // Ensure date field exists before calling getTime()
        const dateA = a.date?.toDate ? a.date.toDate().getTime() : 0;
        const dateB = b.date?.toDate ? b.date.toDate().getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === 'amount') {
        // Highest amount first
        return b.amount - a.amount;
      }
      return 0;
    });

    return list;
  }, [transactions, filterType, searchTerm, sortBy]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">所有交易记录</h2>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        {/* Search */}
        <div className="relative flex-grow">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input
            type="text"
            placeholder="搜索描述或类别..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Filter Type */}
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="md:w-40 px-4 py-2 border border-gray-200 rounded-xl bg-white"
        >
          <option value="ALL">所有类型</option>
          <option value={TransactionType.INCOME}>收入</option>
          <option value={TransactionType.EXPENSE}>支出</option>
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="md:w-40 px-4 py-2 border border-gray-200 rounded-xl bg-white"
        >
          <option value="date">按日期排序</option>
          <option value="amount">按金额排序</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>没有匹配的交易记录。</p>
            </div>
          ) : (
            filteredTransactions.map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${r.type === TransactionType.INCOME ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
                    {getCategoryIcon(r.category)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{r.description || r.category}</p>
                    <p className="text-xs text-gray-400">{r.category} &middot; {r.date?.toDate ? new Date(r.date.toDate()).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`flex items-center font-semibold ${r.type === TransactionType.INCOME ? "text-emerald-600" : "text-rose-600"}`}>
                    {r.type === TransactionType.INCOME ? "+" : "-"}
                    {currency}{r.amount.toFixed(2)}
                  </div>
                  <button
                    onClick={() => onDeleteTransaction(r.id)}
                    className="text-xs text-red-400 opacity-0 group-hover:opacity-100 hover:underline mt-1 transition-opacity"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const CoverScreen = ({ onStart }) => (
  <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
    <div className="text-center max-w-lg mx-auto p-8 bg-white rounded-2xl shadow-2xl space-y-6 border border-gray-100">
      <div className="flex flex-col items-center">
        <div className="bg-indigo-600 p-3 rounded-xl mb-4 shadow-xl shadow-indigo-500/50">
          <WalletIcon className="text-white w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">欢迎使用 Gemini WealthFlow</h2>
        <p className="text-gray-500 mt-2">
          一款智能记账应用，通过 AI 分析和储蓄目标帮助您管理财务。
        </p>
      </div>

      <button
        onClick={() => onStart(Page.DASHBOARD)}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-lg transition-colors shadow-lg shadow-indigo-500/40 transform hover:scale-[1.01] active:scale-[0.99]"
      >
        开始使用
      </button>

      <p className="text-xs text-gray-400">所有数据都安全地存储在您的专属数据库中。</p>
    </div>
  </div>
);

// --- 4. Navigation and Main App Component ---

const App = () => {
  const [currentPage, setCurrentPage] = useState(Page.COVER);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [isTransactionModalVisible, setTransactionModalVisible] = useState(false);
  const [isGoalModalVisible, setGoalModalVisible] = useState(false);
  const [isCategorizing, setCategorizing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAiLoading, setAiLoading] = useState(false);

  // --- Firebase/Data State ---
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setAuthReady] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [settings, setSettings] = useState({ dailyLimit: 1000, currency: '¥' });
  const [currentTransaction, setCurrentTransaction] = useState({ amount: '', description: '', type: TransactionType.EXPENSE, category: Categories.OTHER });
  const [currentGoal, setCurrentGoal] = useState({ name: '', target: '', current: '' });

  // --- Firebase Initialization and Auth ---
  useEffect(() => {
    try {
      const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
      if (Object.keys(firebaseConfig).length === 0) {
        console.error("Firebase config is missing.");
        setAuthReady(true);
        return;
      }
      
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const userAuth = getAuth(app);

      setDb(firestore);
      setAuth(userAuth);

      onAuthStateChanged(userAuth, async (user) => {
        if (!user) {
          try {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
              await signInWithCustomToken(userAuth, __initial_auth_token);
            } else {
              await signInAnonymously(userAuth);
            }
          } catch (error) {
            console.error("Firebase sign-in failed:", error);
          }
        }
        setUserId(userAuth.currentUser?.uid || 'anonymous');
        setAuthReady(true);
      });
    } catch (error) {
      console.error("Error initializing Firebase:", error);
      setAuthReady(true);
    }
  }, []);

  // --- Firestore Data Subscriptions (Transactions and Goals) ---
  useEffect(() => {
    if (!db || !userId || userId === 'anonymous') return;

    const path = `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/users/${userId}`;
    
    // 1. Transactions Subscription
    const transactionsQuery = query(collection(db, `${path}/transactions`));
    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        amount: parseFloat(doc.data().amount || 0),
      }));
      setTransactions(list);
    }, (error) => console.error("Error fetching transactions:", error));

    // 2. Goals Subscription
    const goalsQuery = query(collection(db, `${path}/goals`));
    const unsubscribeGoals = onSnapshot(goalsQuery, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        targetAmount: parseFloat(doc.data().targetAmount || 0),
        currentAmount: parseFloat(doc.data().currentAmount || 0),
      }));
      setGoals(list);
    }, (error) => console.error("Error fetching goals:", error));

    // 3. Settings Subscription (using doc for single settings object)
    const settingsDocRef = doc(db, `${path}/settings/config`);
    const unsubscribeSettings = onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      } else {
        // Initialize default settings if not present
        setDoc(settingsDocRef, settings, { merge: true }).catch(err => console.error("Setting init failed:", err));
      }
    }, (error) => console.error("Error fetching settings:", error));

    return () => {
      unsubscribeTransactions();
      unsubscribeGoals();
      unsubscribeSettings();
    };
  }, [db, userId, settings]);

  // --- Handlers (CRUD Operations) ---
  const transactionCollection = useCallback(() => {
    if (!db || !userId) return null;
    const path = `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/users/${userId}/transactions`;
    return collection(db, path);
  }, [db, userId]);

  const goalsCollection = useCallback(() => {
    if (!db || !userId) return null;
    const path = `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/users/${userId}/goals`;
    return collection(db, path);
  }, [db, userId]);

  const settingsDocRef = useCallback(() => {
    if (!db || !userId) return null;
    const path = `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/users/${userId}/settings/config`;
    return doc(db, path);
  }, [db, userId]);

  // 1. Transactions
  const handleAddTransaction = useCallback(async (t) => {
    if (!transactionCollection()) return;
    try {
      await addDoc(transactionCollection(), {
        ...t,
        amount: Number(t.amount),
        date: serverTimestamp(),
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }, [transactionCollection]);

  const handleDeleteTransaction = useCallback(async (id) => {
    if (!transactionCollection()) return;
    try {
      await deleteDoc(doc(transactionCollection(), id));
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  }, [transactionCollection]);

  // 2. Goals
  const handleAddGoal = useCallback(async (g) => {
    if (!goalsCollection()) return;
    try {
      await addDoc(goalsCollection(), {
        ...g,
        targetAmount: Number(g.target),
        currentAmount: Number(g.current || 0),
        color: COLORS[goals.length % COLORS.length],
      });
    } catch (e) {
      console.error("Error adding goal: ", e);
    }
  }, [goalsCollection, goals.length]);

  const handleDepositGoal = useCallback(async (id, amount) => {
    if (!goalsCollection()) return;
    const goalRef = doc(goalsCollection(), id);
    const goal = goals.find(g => g.id === id);
    if (goal) {
      const newAmount = Math.max(0, goal.currentAmount + amount);
      try {
        await updateDoc(goalRef, {
          currentAmount: newAmount,
        });
        // Deduct from transactions
        // For simplicity, we don't auto-create a transfer transaction here.
        // A more complex app would handle transfers.
      } catch (e) {
        console.error("Error updating goal:", e);
      }
    }
  }, [goalsCollection, goals]);

  const handleDeleteGoal = useCallback(async (id) => {
    if (!goalsCollection()) return;
    try {
      await deleteDoc(doc(goalsCollection(), id));
    } catch (e) {
      console.error("Error deleting goal:", e);
    }
  }, [goalsCollection]);
  
  // 3. Settings
  const handleUpdateSettings = useCallback(async (newSettings) => {
    if (!settingsDocRef()) return;
    try {
      await setDoc(settingsDocRef(), newSettings, { merge: true });
    } catch (e) {
      console.error("Error updating settings:", e);
    }
  }, [settingsDocRef]);

  // --- Calculations and AI Logic ---

  const stats = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
    const totalBalance = totalIncome - totalExpenses;

    const today = new Date().toISOString().split('T')[0];
    const dailyExpenses = transactions.filter(t => 
      t.type === TransactionType.EXPENSE && t.date?.toDate()?.toISOString().startsWith(today)
    ).reduce((sum, t) => sum + t.amount, 0);

    const breakdown = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

    const breakdownList = Object.entries(breakdown).map(([name, value]) => ({ name, value }));

    return { totalBalance, totalIncome, totalExpenses, dailyExpenses, breakdownList };
  }, [transactions]);

  // AI Categorization for expense descriptions
  const categorizeExpense = useCallback(async (description) => {
    // A$ is the placeholder for the API key. Since it's empty, we add a check.
    const A$ = "" 
    if (A$ === "") return Categories.OTHER; // Fallback if no API key
    if (!description) return Categories.OTHER;

    setCategorizing(true);
    let result = Categories.OTHER;

    const userQuery = `Categorize the following expense description into one of these categories: ${Object.values(Categories).join(', ')}. Only respond with the category name itself. Description: "${description}"`;
    
    // Call Gemini API for categorization
    const apiKey = ""
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: "You are an expert financial assistant. Analyze the user's expense description and strictly respond with the most suitable category name from the provided list, in the user's language. Do not add any extra text, explanations, or quotes." }] }
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const json = await response.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (text && Object.values(Categories).includes(text)) {
            result = text;
        }
    } catch (error) {
        console.error("AI categorization failed:", error);
    } finally {
        setCategorizing(false);
    }
    return result;
  }, []);
  
  const handleTransactionInputBlur = async () => {
    // Only categorize if it's an expense, description is set, and we're not already categorizing
    if (currentTransaction.description && currentTransaction.type === TransactionType.EXPENSE && !isCategorizing) {
      const newCategory = await categorizeExpense(currentTransaction.description);
      setCurrentTransaction(t => ({ ...t, category: newCategory }));
    }
  };

  // AI Financial Analysis
  useEffect(() => {
    const A$ = ""
    if (A$ === "") {
        setAiAnalysis({ title: "欢迎", message: "添加您的 API 密钥以启用 AI 洞察。", tone: "neutral" });
        return;
    }
    if (transactions.length === 0) {
      setAiAnalysis({ title: "等待数据", message: "请添加一些交易来开始分析。", tone: "neutral" });
      return;
    }

    const analyze = async () => {
        setAiLoading(true);
        const { totalBalance, dailyExpenses, breakdownList } = stats;
        const recentExpenses = transactions.filter(t => t.type === TransactionType.EXPENSE).slice(0, 5).map(t => `${t.description} (${t.amount.toFixed(2)})`).join(', ');

        const analysisQuery = `
          Current Balance: ${totalBalance.toFixed(2)} ${settings.currency}.
          Daily Limit: ${settings.dailyLimit} ${settings.currency}.
          Today's Spending: ${dailyExpenses.toFixed(2)} ${settings.currency}.
          Top Spending Categories: ${breakdownList.map(b => `${b.name}: ${b.value.toFixed(2)}`).join('; ')}.
          Recent Expenses: ${recentExpenses}.

          Act as a world-class financial advisor. Provide a concise, single-paragraph summary of the user's current financial health. Highlight any risks (like exceeding the daily limit) or strengths (like low spending in a key area) and offer one actionable, motivational tip. Write the response in Chinese.
        `;
        
        const apiKey = ""
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [{ parts: [{ text: analysisQuery }] }],
            systemInstruction: { parts: [{ text: "You are a world-class financial advisor. Provide a concise, single-paragraph summary of the user's current financial health and offer one actionable, motivational tip. Response must be in Chinese." }] }
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const json = await response.json();
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text;

            setAiAnalysis({
                title: dailyExpenses > settings.dailyLimit ? "🚨 支出超限警告" : "✅ 财务健康报告",
                message: text || "无法获取 AI 洞察。请稍后再试。",
                tone: dailyExpenses > settings.dailyLimit ? "negative" : "positive"
            });
        } catch (error) {
            console.error("AI analysis failed:", error);
            setAiAnalysis({ title: "AI 分析失败", message: "无法连接到 AI 服务。请检查网络或 API 密钥。", tone: "negative" });
        } finally {
            setAiLoading(false);
        }
    };
    // Debounce the analysis to avoid excessive calls
    const handler = setTimeout(analyze, 1000);
    return () => clearTimeout(handler);
  }, [transactions, settings, stats.dailyExpenses]);

  // --- UI Components ---
  const NavBar = () => {
    const navItems = [
      { page: Page.DASHBOARD, icon: DashboardIcon, label: '仪表盘' },
      { page: Page.TRANSACTIONS, icon: TransactionsIcon, label: '交易记录' },
      { page: Page.GOALS, icon: TargetIcon, label: '储蓄目标' },
    ];
    return (
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <WalletIcon className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">WealthFlow</h1>
            <span className="text-xs text-gray-400">
                {isAuthReady ? (userId === 'anonymous' ? '匿名用户' : `用户 ID: ${userId.slice(0, 4)}...`) : '连接中...'}
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map(item => (
              <button
                key={item.page}
                onClick={() => setCurrentPage(item.page)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${currentPage === item.page ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSettingsVisible(true)}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
          >
            <SettingsIcon size={20} />
          </button>
        </div>
        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-around border-t border-gray-100 bg-white/90 backdrop-blur-sm fixed bottom-0 left-0 right-0 z-40">
            {navItems.map(item => (
                <button
                    key={item.page}
                    onClick={() => setCurrentPage(item.page)}
                    className={`flex flex-col items-center gap-1 py-2 w-full transition-colors text-xs ${currentPage === item.page ? 'text-indigo-600 border-t-2 border-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
                >
                    <item.icon size={20} />
                    {item.label}
                </button>
            ))}
        </div>
      </div>
    );
  };

  // --- Conditional Render ---
  let content;
  switch (currentPage) {
    case Page.COVER:
      content = <CoverScreen onStart={setCurrentPage} />;
      break;
    case Page.DASHBOARD:
      content = <DashboardScreen
        stats={stats}
        breakdown={stats.breakdownList}
        goals={goals}
        settings={settings}
        onNavigate={setCurrentPage}
        onAddGoal={() => setGoalModalVisible(true)}
        onDepositGoal={handleDepositGoal}
      />;
      break;
    case Page.TRANSACTIONS:
      content = <TransactionsScreen
        transactions={transactions}
        settings={settings}
        onDeleteTransaction={handleDeleteTransaction}
      />;
      break;
    case Page.GOALS:
      content = <GoalsScreen
        goals={goals}
        settings={settings}
        onAddGoal={() => setGoalModalVisible(true)}
        onDeleteGoal={handleDeleteGoal}
      />;
      break;
    default:
      content = <div className="text-center p-8">页面未找到</div>;
      break;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 text-gray-800 font-sans">
      <NavBar />

      {/* AI 洞察卡片 (Fixed on Dashboard and Transactions/Goals/Settings screens) */}
      {currentPage !== Page.COVER && (
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><SparklesIcon size={100} /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <SparklesIcon size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">AI 财务顾问</span>
              </div>
              {isAiLoading ? (
                <div className="animate-pulse h-16 w-full bg-white/20 rounded-lg"></div>
              ) : (
                <div>
                  <h2 className="text-lg font-bold mb-1">{aiAnalysis?.title || "等待分析"}</h2>
                  <p className="text-indigo-100 text-sm leading-relaxed">{aiAnalysis?.message || "添加交易以获取 AI 洞察。"}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main>
        {content}
      </main>

      {/* Shared Modals */}
      <AddTransactionModal
        isVisible={isTransactionModalVisible}
        onClose={() => setTransactionModalVisible(false)}
        onSave={() => {
          if (currentTransaction.amount) {
            handleAddTransaction(currentTransaction);
            setTransactionModalVisible(false);
            setCurrentTransaction({ amount: '', description: '', type: TransactionType.EXPENSE, category: Categories.OTHER });
          }
        }}
        transaction={currentTransaction}
        setTransaction={setCurrentTransaction}
        isCategorizing={isCategorizing}
        handleInputBlur={handleTransactionInputBlur} // 传递新的 onBlur 处理器
      />
      <AddGoalModal
        isVisible={isGoalModalVisible}
        onClose={() => setGoalModalVisible(false)}
        onSave={() => {
          if (currentGoal.name && currentGoal.target) {
            handleAddGoal(currentGoal);
            setGoalModalVisible(false);
            setCurrentGoal({ name: '', target: '', current: '' });
          }
        }}
        goal={currentGoal}
        setGoal={setCurrentGoal}
      />
      <SettingsModal
        isVisible={isSettingsVisible}
        onClose={() => setSettingsVisible(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Add Transaction Button (Visible on Dashboard/Goals/Transactions) */}
      {currentPage !== Page.COVER && (
        <button
          onClick={() => setTransactionModalVisible(true)}
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg shadow-indigo-500/30 transition-transform hover:scale-105 active:scale-95 z-40"
        >
          <PlusIcon size={24} />
        </button>
      )}
    </div>
  );
};

export default App;