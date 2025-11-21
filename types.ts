export enum TransactionType {
    INCOME = 'income',
    EXPENSE = 'expense'
  }
  
  export enum Category {
    FOOD = 'Food & Dining',
    SHOPPING = 'Shopping',
    TRANSPORT = 'Transportation',
    BILLS = 'Bills & Utilities',
    ENTERTAINMENT = 'Entertainment',
    HEALTH = 'Health & Wellness',
    SALARY = 'Salary',
    INVESTMENT = 'Investment',
    OTHER = 'Other'
  }
  
  export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    category: string;
    description: string;
    date: string; // ISO String
  }
  
  export interface SavingsGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    color: string;
  }
  
  export interface AppSettings {
    dailyLimit: number;
    currency: string;
  }
  
  export interface AIInsight {
    title: string;
    message: string;
    tone: 'positive' | 'warning' | 'neutral';
  }