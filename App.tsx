import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  PieChart as PieChartIcon, 
  Plus,
  Settings,
  Bell,
  TrendingUp,
  TrendingDown,
  Target,
  ChevronRight,
  X,
  LogOut,
  Quote,
  User as UserIcon,
  Edit3,
  Mail,
  Save,
  Users,
  CheckCircle2
} from 'lucide-react';
import { BudgetCategory, AIParseResult, CategoryType, Notification, User, SplitDetails } from './types';
import { SmartEntry } from './components/SmartEntry';
import { CategoryTable } from './components/CategoryTable';
import { SpendLeftDonut, CashFlowBarChart, AllocationPieChart } from './components/Charts';
import { Auth } from './components/Auth';
import { TransactionReviewModal } from './components/TransactionReviewModal';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

const INITIAL_CATEGORIES: BudgetCategory[] = [
  { id: 'inc-1', name: 'Salary', type: 'income', budgetedAmount: 150000, spentAmount: 150000 },
  { id: 'bill-1', name: 'House Rent', type: 'bill', budgetedAmount: 35000, spentAmount: 35000, dueDate: 5 },
  { id: 'exp-1', name: 'Groceries', type: 'expense', budgetedAmount: 12000, spentAmount: 8500 },
  { id: 'exp-2', name: 'Dining Out', type: 'expense', budgetedAmount: 8000, spentAmount: 4200 },
  { id: 'exp-3', name: 'Uber/Ola', type: 'expense', budgetedAmount: 5000, spentAmount: 1200 },
  { id: 'sav-1', name: 'Mutual Funds', type: 'savings', budgetedAmount: 20000, spentAmount: 20000 },
  { id: 'debt-1', name: 'Credit Card', type: 'debt', budgetedAmount: 15000, spentAmount: 5000 },
];

const FINANCIAL_QUOTES = [
  "Do not save what is left after spending, but spend what is left after saving. – Warren Buffett",
  "A budget is telling your money where to go instead of wondering where it went. – Dave Ramsey",
  "Beware of little expenses. A small leak will sink a great ship. – Benjamin Franklin",
  "The art is not in making money, but in keeping it. – Proverb",
  "Financial freedom is available to those who learn about it and work for it. – Robert Kiyosaki",
  "It's not your salary that makes you rich, it's your spending habits. – Charles A. Jaffe"
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'warning', message: 'You have exceeded your "Dining Out" budget by ₹500.', time: '2h ago', read: false },
  { id: 'n2', type: 'info', message: 'Rent bill is due in 3 days.', time: '5h ago', read: false },
  { id: 'n3', type: 'success', message: 'Salary credited: ₹1,50,000', time: '1d ago', read: true },
];

type TabView = 'dashboard' | 'wallet' | 'analytics' | 'settings' | 'profile';

const Footer = () => (
  <footer className="mt-16 py-8 border-t border-gray-200 bg-white text-center">
    <div className="flex flex-col items-center justify-center gap-2 px-4">
      {/* Text representation of the Logo */}
      <div className="flex flex-col items-center">
         <h3 className="text-2xl font-bold text-slate-800 tracking-tight">VALUMINDS <span className="text-green-600">FINSPERITI</span></h3>
         <p className="text-[10px] font-bold text-gray-500 tracking-[0.25em] mt-1">CONNECT &gt; COLLABORATE &gt; PROSPER</p>
      </div>
      <p className="text-xs text-gray-400 mt-6">
        &copy; {new Date().getFullYear()} <a href="https://www.valuminds.com" target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition-colors font-medium">Valuminds Finsperiti</a>. All rights reserved.
      </p>
    </div>
  </footer>
);

export default function App() {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  
  // App Data State
  const [categories, setCategories] = useState<BudgetCategory[]>(INITIAL_CATEGORIES);
  const [activeTab, setActiveTab] = useState<TabView>('dashboard');
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  
  // UI State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // Review Modal State
  const [reviewData, setReviewData] = useState<AIParseResult | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Load user from local storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('pastel_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Memoize random quote so it doesn't change on re-renders
  const dailyQuote = useMemo(() => {
    const index = Math.floor(Math.random() * FINANCIAL_QUOTES.length);
    return FINANCIAL_QUOTES[index];
  }, []);

  // --- handlers ---

  const handleLogout = () => {
    localStorage.removeItem('pastel_user');
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  // 1. AI Parsed -> Opens Review Modal
  const handleAIResult = (result: AIParseResult) => {
    setReviewData(result);
    setIsReviewModalOpen(true);
    setIsAddModalOpen(false); // Close the input modal if open
  };

  // 2. User Confirms Review -> Updates State
  const handleReviewConfirm = (finalResult: AIParseResult, splitDetails?: SplitDetails) => {
    const { amount, categoryName, categoryType } = finalResult;
    
    // Check if category exists
    const existing = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    
    if (existing) {
      updateCategory(existing.id, 'spentAmount', existing.spentAmount + amount);
    } else {
      // Create new
      const newCat: BudgetCategory = {
        id: generateId(),
        name: categoryName,
        type: categoryType,
        budgetedAmount: 0,
        spentAmount: amount
      };
      setCategories(prev => [...prev, newCat]);
    }
    
    setIsReviewModalOpen(false);
    
    // Show success notification if split
    if (splitDetails) {
      const msg = `Split expense created! Share link generated for ${splitDetails.numberOfPeople - 1} friends.`;
      addNotification({ id: generateId(), type: 'success', message: msg, time: 'Just now', read: false });
    } else {
        addNotification({ id: generateId(), type: 'success', message: `Transaction added: ${finalResult.merchant}`, time: 'Just now', read: false });
    }
  };

  const updateCategory = (id: string, field: keyof BudgetCategory, value: any) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
  };

  const addCategory = (type: CategoryType) => {
    const newCat: BudgetCategory = {
      id: generateId(),
      name: 'New Category',
      type,
      budgetedAmount: 0,
      spentAmount: 0
    };
    setCategories(prev => [...prev, newCat]);
  };

  const deleteCategory = (id: string) => {
    if (confirm('Delete this category?')) {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };
  
  const addNotification = (notif: Notification) => {
      setNotifications(prev => [notif, ...prev]);
  };

  // Derived Stats
  const totalIncome = categories.filter(c => c.type === 'income').reduce((acc, c) => acc + c.spentAmount, 0);
  const totalExpenses = categories.filter(c => c.type === 'expense' || c.type === 'bill').reduce((acc, c) => acc + c.spentAmount, 0);
  const totalBudget = categories.filter(c => c.type === 'expense' || c.type === 'bill').reduce((acc, c) => acc + c.budgetedAmount, 0);
  const totalSavings = categories.filter(c => c.type === 'savings').reduce((acc, c) => acc + c.spentAmount, 0);
  const balance = totalIncome - totalExpenses - totalSavings;

  const getCategoryGroup = (type: CategoryType) => categories.filter(c => c.type === type);
  const unreadCount = notifications.filter(n => !n.read).length;

  // --- Views ---

  const DashboardView = () => (
    <div className="animate-fadeIn">
      {/* Hero / Smart Entry (Desktop Only) */}
      <div className="hidden md:block max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
              What did you spend on today?
          </h1>
          <p className="text-gray-500 mb-8 text-lg">Type or upload a receipt to auto-track expenses.</p>
          <SmartEntry onReview={handleAIResult} categories={categories} />
      </div>

      {/* Mobile Header (Simplified) */}
      <div className="md:hidden mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm">Hi, {user?.name.split(' ')[0]}</p>
          </div>
          <div className="text-right" onClick={() => setActiveTab('wallet')}>
             <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Balance</span>
             <p className="text-lg font-extrabold text-indigo-600">₹{balance.toLocaleString('en-IN')}</p>
          </div>
      </div>

      {/* Stats Grid - 2x2 on mobile, 4x1 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-10">
          {/* Income Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-green-100 shadow-sm">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                  <div className="p-1.5 md:p-2 bg-white/80 text-green-600 rounded-lg md:rounded-xl shadow-sm"><TrendingUp className="w-4 h-4 md:w-5 md:h-5" /></div>
                  <span className="font-bold text-gray-500 text-[10px] md:text-sm uppercase tracking-wider">Income</span>
              </div>
              <p className="text-xl md:text-3xl font-extrabold text-gray-900">₹{totalIncome.toLocaleString('en-IN')}</p>
          </div>

          {/* Spent Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-red-100 shadow-sm">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                  <div className="p-1.5 md:p-2 bg-white/80 text-red-600 rounded-lg md:rounded-xl shadow-sm"><TrendingDown className="w-4 h-4 md:w-5 md:h-5" /></div>
                  <span className="font-bold text-gray-500 text-[10px] md:text-sm uppercase tracking-wider">Spent</span>
              </div>
              <p className="text-xl md:text-3xl font-extrabold text-gray-900">₹{totalExpenses.toLocaleString('en-IN')}</p>
              <p className="text-[10px] md:text-xs text-gray-400 mt-1 font-medium">Limit: ₹{totalBudget.toLocaleString('en-IN')}</p>
          </div>

          {/* Savings Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-emerald-100 shadow-sm">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                  <div className="p-1.5 md:p-2 bg-white/80 text-emerald-600 rounded-lg md:rounded-xl shadow-sm"><Target className="w-4 h-4 md:w-5 md:h-5" /></div>
                  <span className="font-bold text-gray-500 text-[10px] md:text-sm uppercase tracking-wider">Savings</span>
              </div>
              <p className="text-xl md:text-3xl font-extrabold text-gray-900">₹{totalSavings.toLocaleString('en-IN')}</p>
          </div>

          {/* Left Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-indigo-100 shadow-sm">
               <div className="absolute right-0 top-0 h-full w-1/2 opacity-10">
                  <PieChartIcon className="w-full h-full" />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                      <div className="p-1.5 md:p-2 bg-white/80 text-indigo-600 rounded-lg md:rounded-xl shadow-sm"><Wallet className="w-4 h-4 md:w-5 md:h-5" /></div>
                      <span className="font-bold text-gray-500 text-[10px] md:text-sm uppercase tracking-wider">Left</span>
                  </div>
                  <p className="text-xl md:text-3xl font-extrabold text-indigo-600">₹{(totalBudget - totalExpenses).toLocaleString('en-IN')}</p>
               </div>
          </div>
      </div>

      {/* Dashboard Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 mb-6">
          {/* Spend Analysis - Compact on Mobile */}
          <div className="lg:col-span-2 bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg md:text-xl text-gray-900">Spend Analysis</h3>
                <button onClick={() => setActiveTab('analytics')} className="text-indigo-600 font-semibold text-xs md:text-sm hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors">More</button>
            </div>
            <div className="h-48 md:h-64 w-full">
                <CashFlowBarChart categories={categories} />
            </div>
          </div>
          
          {/* Budget Status - Compact on Mobile */}
          <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-4">Budget Status</h3>
              <div className="h-48 md:h-64">
                  <SpendLeftDonut totalBudget={totalBudget} totalSpent={totalExpenses} />
              </div>
          </div>
      </div>

      {/* Daily Quote Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-indigo-200">
         <Quote className="absolute top-4 left-4 w-8 h-8 md:w-12 md:h-12 text-white opacity-20 rotate-180" />
         <div className="relative z-10 text-center max-w-2xl mx-auto">
            <p className="text-sm md:text-base font-medium text-indigo-100 uppercase tracking-widest mb-2">Daily Wisdom</p>
            <h3 className="text-lg md:text-2xl font-serif font-medium leading-relaxed">"{dailyQuote}"</h3>
         </div>
      </div>
    </div>
  );

  const WalletView = () => (
    <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-2 gap-8">
       <div className="space-y-6 md:space-y-8">
            <div className="flex justify-between items-end px-2">
                <h2 className="text-2xl font-extrabold text-gray-900">Your Wallet</h2>
            </div>
            <CategoryTable 
                title="Monthly Expenses" 
                type="expense"
                categories={getCategoryGroup('expense')} 
                onUpdateCategory={updateCategory}
                onAddCategory={addCategory}
                onDeleteCategory={deleteCategory}
            />
            <CategoryTable 
                title="Recurring Bills" 
                type="bill"
                categories={getCategoryGroup('bill')} 
                onUpdateCategory={updateCategory}
                onAddCategory={addCategory}
                onDeleteCategory={deleteCategory}
            />
        </div>
        <div className="space-y-6 md:space-y-8 lg:pt-16">
             <CategoryTable 
                title="Income Sources" 
                type="income"
                categories={getCategoryGroup('income')} 
                onUpdateCategory={updateCategory}
                onAddCategory={addCategory}
                onDeleteCategory={deleteCategory}
            />
            
            <CategoryTable 
                title="Debt & EMI" 
                type="debt"
                categories={getCategoryGroup('debt')} 
                onUpdateCategory={updateCategory}
                onAddCategory={addCategory}
                onDeleteCategory={deleteCategory}
            />

            <CategoryTable 
                title="Savings Goals" 
                type="savings"
                categories={getCategoryGroup('savings')} 
                onUpdateCategory={updateCategory}
                onAddCategory={addCategory}
                onDeleteCategory={deleteCategory}
            />
        </div>
    </div>
  );

  const AnalyticsView = () => (
      <div className="animate-fadeIn space-y-6 md:space-y-8">
           <div className="flex justify-between items-end mb-2">
                <h2 className="text-2xl font-extrabold text-gray-900">Analytics & Reports</h2>
            </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm h-80 md:h-96">
                    <h3 className="font-bold text-xl text-gray-900 mb-4">Spending by Category</h3>
                    <AllocationPieChart categories={categories} />
                </div>
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm h-80 md:h-96">
                    <h3 className="font-bold text-xl text-gray-900 mb-4">Cash Flow Overview</h3>
                    <CashFlowBarChart categories={categories} />
                </div>
           </div>

           <div className="bg-indigo-900 rounded-3xl p-6 md:p-8 text-white overflow-hidden relative">
              <div className="relative z-10 max-w-lg">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">AI Financial Insights</h3>
                  <p className="text-indigo-200 text-sm md:text-lg mb-6">Based on your spending patterns, you could save approximately ₹4,500 next month by optimizing your 'Dining Out' and 'Uber/Ola' expenses.</p>
                  <button className="bg-white text-indigo-900 px-4 py-2 md:px-6 md:py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors text-sm md:text-base">
                      View Detailed Breakdown
                  </button>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-800 to-transparent opacity-50"></div>
              <SparklesIcon className="absolute right-10 top-10 w-64 h-64 text-indigo-800 opacity-20 rotate-12" />
           </div>
      </div>
  );

  const SettingsView = () => (
      <div className="animate-fadeIn max-w-lg mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Settings</h2>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-50">
                <div onClick={() => setActiveTab('profile')} className="p-5 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <UserIcon className="w-5 h-5" />
                       </div>
                       <span className="font-medium text-gray-700 text-lg">Account Profile</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                </div>
                <div className="p-5 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors">
                    <span className="font-medium text-gray-700 text-lg">Currency</span>
                    <span className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-lg">INR (₹)</span>
                </div>
                <div className="p-5 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors">
                     <span className="font-medium text-gray-700 text-lg">Notifications</span>
                     <div className="w-12 h-7 bg-green-400 rounded-full relative transition-all"><div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm"></div></div>
                </div>
                 <div className="p-5 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group">
                     <span className="font-medium text-gray-700 text-lg group-hover:text-indigo-600">Export Data</span>
                     <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                </div>
                <div onClick={handleLogout} className="p-5 flex items-center justify-between hover:bg-red-50 cursor-pointer transition-colors group">
                     <span className="font-medium text-red-500 text-lg">Sign Out</span>
                     <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-600" />
                </div>
              </div>
          </div>
          <p className="text-center text-gray-400 mt-8 text-sm">Val U Tracker v1.5.0</p>
      </div>
  );

  const ProfileView = () => {
      const [isEditing, setIsEditing] = useState(false);
      const [editName, setEditName] = useState(user?.name || '');
      const [editEmail, setEditEmail] = useState(user?.email || '');

      const handleSave = () => {
          if(user) {
            const updated = {...user, name: editName, email: editEmail};
            setUser(updated);
            localStorage.setItem('pastel_user', JSON.stringify(updated));
            setIsEditing(false);
            addNotification({id: generateId(), type: 'success', message: 'Profile updated successfully', time: 'Just now', read: false});
          }
      };

      return (
        <div className="animate-fadeIn max-w-lg mx-auto">
            <div className="flex items-center gap-2 mb-6 cursor-pointer text-gray-500 hover:text-gray-800 transition-colors" onClick={() => setActiveTab('settings')}>
                <ChevronRight className="w-5 h-5 rotate-180" />
                <span className="font-bold">Back to Settings</span>
            </div>
            
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden p-8 text-center">
                <div className="relative w-24 h-24 mx-auto mb-6">
                    <img src={user?.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover border-4 border-indigo-50" />
                    <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-md hover:bg-indigo-700">
                        <Edit3 className="w-4 h-4" />
                    </button>
                </div>

                {isEditing ? (
                    <div className="space-y-4 max-w-sm mx-auto">
                        <input 
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="w-full p-3 bg-gray-50 border rounded-xl"
                            placeholder="Name"
                        />
                        <input 
                            value={editEmail}
                            onChange={e => setEditEmail(e.target.value)}
                            className="w-full p-3 bg-gray-50 border rounded-xl"
                            placeholder="Email"
                        />
                        <div className="flex gap-2 justify-center mt-4">
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg flex items-center gap-2">
                                <Save className="w-4 h-4" /> Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">{user?.name}</h2>
                        <p className="text-gray-400 font-medium mb-6">{user?.email}</p>
                        <div className="inline-flex bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm mb-8">
                            Member since {new Date(user?.joinedDate || '').toLocaleDateString()}
                        </div>
                        <button onClick={() => setIsEditing(true)} className="w-full py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                            Edit Profile
                        </button>
                    </>
                )}
            </div>
        </div>
      );
  };

  // Mock Icon for decoration
  const SparklesIcon = ({className}: {className?: string}) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 3.214L13 21l-2.286-6.857L5 12l5.714-3.214L13 3z" />
    </svg>
  );

  // --- Main Render ---
  if (!user) {
      return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50/80 font-sans text-slate-800 pb-28 md:pb-24 flex flex-col">
      
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3" onClick={() => setActiveTab('dashboard')}>
            <div className="bg-indigo-600 text-white p-2 rounded-xl cursor-pointer">
                <Wallet className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 cursor-pointer">Val U <span className="text-indigo-600">Tracker</span></span>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
            <button 
                className="hidden md:block text-right mr-2 hover:bg-gray-50 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                onClick={() => setActiveTab('wallet')}
            >
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Available Balance</p>
                <p className="text-xl font-extrabold text-indigo-600">₹{balance.toLocaleString('en-IN')}</p>
            </button>

            {/* Notification Bell */}
            <div className="relative">
                <div 
                    className="relative p-2 hover:bg-gray-50 rounded-full cursor-pointer transition-colors"
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                >
                    <Bell className="w-6 h-6 text-gray-600" />
                    {unreadCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>}
                </div>

                {/* Notification Dropdown */}
                {isNotificationOpen && (
                    <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)}></div>
                    <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-slideUp origin-top-right">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                            <span className="font-bold text-gray-800">Notifications</span>
                            {unreadCount > 0 && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold">{unreadCount} New</span>}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">No new notifications</div>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}>
                                        <div className="flex gap-3">
                                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.type === 'warning' ? 'bg-red-400' : n.type === 'success' ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                                            <div>
                                                <p className="text-sm text-gray-800 font-medium leading-snug">{n.message}</p>
                                                <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    </>
                )}
            </div>

            {/* Profile Avatar */}
            <div 
                className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white shadow-md cursor-pointer overflow-hidden hover:ring-2 hover:ring-indigo-100 transition-all"
                onClick={() => setActiveTab('profile')}
            >
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 w-full">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'wallet' && <WalletView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'settings' && <SettingsView />}
        {activeTab === 'profile' && <ProfileView />}
      </main>
      
      {/* Valuminds Footer */}
      <Footer />

      {/* Review Modal */}
      <TransactionReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onConfirm={handleReviewConfirm}
        initialData={reviewData}
        categories={categories}
      />

      {/* Global Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsAddModalOpen(false)}></div>
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all animate-slideUp md:animate-fadeIn mb-20 md:mb-0">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-700 ml-2">Add New Transaction</h3>
                    <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-6 bg-gray-50/50">
                     <SmartEntry onReview={handleAIResult} categories={categories} className="mb-0" />
                     <p className="text-center text-xs text-gray-400 mt-4">
                        Try saying: "Paid internet bill of ₹999" or upload a receipt.
                     </p>
                </div>
            </div>
        </div>
      )}

      {/* Mobile Dock (Slimmer) */}
      <div className="fixed bottom-4 left-4 right-4 bg-gray-900 text-white rounded-2xl shadow-2xl shadow-indigo-900/20 px-4 py-2 md:hidden flex justify-between items-center z-40 backdrop-blur-xl bg-opacity-95 border border-gray-800 h-16">
        <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`flex flex-col items-center justify-center gap-0.5 px-2 rounded-xl transition-all ${activeTab === 'dashboard' ? 'text-indigo-400' : 'text-gray-500'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button 
            onClick={() => setActiveTab('wallet')} 
            className={`flex flex-col items-center justify-center gap-0.5 px-2 rounded-xl transition-all ${activeTab === 'wallet' ? 'text-indigo-400' : 'text-gray-500'}`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] font-medium">Wallet</span>
        </button>
        
        {/* Floating Add Button - Better Alignment */}
        <div className="relative -top-8">
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-indigo-500 hover:bg-indigo-400 rounded-full p-3.5 shadow-lg shadow-indigo-500/40 border-4 border-gray-100 transition-transform active:scale-95"
            >
                <Plus className="w-6 h-6 text-white" />
            </button>
        </div>

        <button 
            onClick={() => setActiveTab('analytics')} 
            className={`flex flex-col items-center justify-center gap-0.5 px-2 rounded-xl transition-all ${activeTab === 'analytics' ? 'text-indigo-400' : 'text-gray-500'}`}
        >
          <PieChartIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">Stats</span>
        </button>
        <button 
            onClick={() => setActiveTab('settings')} 
            className={`flex flex-col items-center justify-center gap-0.5 px-2 rounded-xl transition-all ${activeTab === 'settings' ? 'text-indigo-400' : 'text-gray-500'}`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium">Set</span>
        </button>
      </div>
    </div>
  );
}