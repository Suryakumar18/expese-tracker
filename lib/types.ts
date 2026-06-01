export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  currency: string;
}

export interface Transaction {
  _id: string;
  userId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  paymentMethod: string;
  transactionDate: string;
  notes?: string;
  createdAt: string;
}

export interface Budget {
  _id: string;
  userId: string;
  category: string;
  limitAmount: number;
  month: number;
  year: number;
  spent?: number;
  remaining?: number;
  exceeded?: boolean;
  percentage?: number;
}

export interface SavingsGoal {
  _id: string;
  userId: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  status: 'active' | 'completed' | 'cancelled';
  description?: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlySavings: number;
  recentTransactions: Transaction[];
  categoryBreakdown: { _id: string; total: number }[];
}

export const EXPENSE_CATEGORIES = [
  'Food','Transport','Shopping','Entertainment','Bills','Medical','Education','Travel','Other',
];

export const INCOME_CATEGORIES = [
  'Salary','Business','Freelance','Investments','Other',
];

export const PAYMENT_METHODS = [
  'Cash','Credit Card','Debit Card','UPI','Net Banking','Other',
];

export const CATEGORY_COLORS: Record<string, string> = {
  Food: '#FF6384',
  Transport: '#36A2EB',
  Shopping: '#FFCE56',
  Entertainment: '#4BC0C0',
  Bills: '#9966FF',
  Medical: '#FF9F40',
  Education: '#FF6384',
  Travel: '#36A2EB',
  Other: '#C9CBCF',
  Salary: '#4BC0C0',
  Business: '#9966FF',
  Freelance: '#FF9F40',
  Investments: '#36A2EB',
};
