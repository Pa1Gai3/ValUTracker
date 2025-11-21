export type CategoryType = 'income' | 'bill' | 'expense' | 'savings' | 'debt';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string; // URL or base64
  currency: string;
  joinedDate: string;
}

export interface SplitDetails {
  totalAmount: number;
  numberOfPeople: number;
  amountPerPerson: number;
  shareLink: string;
  isSplit: boolean;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  categoryId: string;
  splitDetails?: SplitDetails;
}

export interface BudgetCategory {
  id: string;
  name: string;
  type: CategoryType;
  budgetedAmount: number;
  spentAmount: number;
  icon?: string;
  dueDate?: number;
  isRecurring?: boolean;
}

export interface AppData {
  categories: BudgetCategory[];
  transactions: Transaction[];
  currentMonth: string;
}

export interface AIParseResult {
  merchant: string;
  amount: number;
  categoryName: string;
  categoryType: CategoryType;
  date: string;
  isRecurring?: boolean;
}

export interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success';
  message: string;
  time: string;
  read: boolean;
}