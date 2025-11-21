import React from 'react';
import { BudgetCategory, CategoryType } from '../types';
import { CheckCircle2, AlertCircle, Trash2, Plus, AlertTriangle } from 'lucide-react';

interface CategoryTableProps {
  title: string;
  categories: BudgetCategory[];
  type: CategoryType;
  onUpdateCategory: (id: string, field: keyof BudgetCategory, value: any) => void;
  onAddCategory: (type: CategoryType) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({ 
    title, 
    categories, 
    type,
    onUpdateCategory,
    onAddCategory,
    onDeleteCategory
}) => {
  const totalBudget = categories.reduce((sum, c) => sum + c.budgetedAmount, 0);
  const totalActual = categories.reduce((sum, c) => sum + c.spentAmount, 0);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      {/* Card Header */}
      <div className="px-6 py-5 border-b border-gray-50 bg-white flex justify-between items-center sticky top-0 z-10">
        <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">
                {categories.length} Items
            </p>
        </div>
        <div className="text-right">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">Total</p>
            <p className="text-lg font-bold text-gray-900">₹{totalActual.toLocaleString('en-IN')}</p>
        </div>
      </div>
      
      {/* Table Headers */}
      <div className="grid grid-cols-12 gap-4 px-6 py-2 bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
        <div className="col-span-5">Category Name</div>
        <div className="col-span-3 text-right">Budget Limit</div>
        <div className="col-span-3 text-right">Spent</div>
        <div className="col-span-1"></div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto max-h-[400px] no-scrollbar p-2 space-y-1">
        {categories.map((cat) => {
            const percentage = cat.budgetedAmount > 0 ? (cat.spentAmount / cat.budgetedAmount) * 100 : 0;
            const isOverBudget = type !== 'income' && type !== 'savings' && cat.spentAmount > cat.budgetedAmount;
            const isNearBudget = type !== 'income' && type !== 'savings' && percentage > 85 && !isOverBudget;
            
            let statusColor = 'bg-gray-200';
            if (type === 'income') statusColor = 'bg-green-400';
            else if (type === 'savings') statusColor = 'bg-emerald-400';
            else if (isOverBudget) statusColor = 'bg-red-500';
            else if (isNearBudget) statusColor = 'bg-yellow-400';
            else statusColor = 'bg-indigo-400';

            return (
                <div key={cat.id} className="group relative grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    
                    {/* Category Name Input */}
                    <div className="col-span-5 relative">
                         <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor}`}></div>
                            <input 
                                type="text" 
                                value={cat.name}
                                onChange={(e) => onUpdateCategory(cat.id, 'name', e.target.value)}
                                className="w-full bg-transparent font-semibold text-gray-700 placeholder-gray-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:text-indigo-900 rounded-md px-2 py-1 -ml-2 transition-all outline-none"
                                placeholder="Category Name"
                            />
                         </div>
                         {/* Tiny progress bar under name */}
                         <div className="mt-1.5 h-1 w-full bg-gray-100 rounded-full overflow-hidden ml-5 max-w-[80%]">
                            <div 
                                className={`h-full rounded-full ${statusColor} transition-all duration-500`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                         </div>
                    </div>

                    {/* Budget Input */}
                    <div className="col-span-3 text-right">
                        <div className="relative">
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium pl-2 pointer-events-none">₹</span>
                            <input 
                                type="number" 
                                value={cat.budgetedAmount || ''}
                                onChange={(e) => onUpdateCategory(cat.id, 'budgetedAmount', Number(e.target.value))}
                                className="w-full text-right bg-gray-50/50 hover:bg-white focus:bg-white font-medium text-gray-600 focus:text-indigo-600 focus:ring-2 focus:ring-indigo-100 rounded-lg px-2 py-1.5 transition-all outline-none text-sm"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Actual Amount (Read-only) */}
                    <div className={`col-span-3 text-right font-bold text-base ${isOverBudget ? 'text-red-500' : 'text-gray-800'}`}>
                        ₹{cat.spentAmount.toLocaleString('en-IN')}
                        {isOverBudget && <AlertCircle className="inline-block w-3 h-3 text-red-500 ml-1 mb-0.5" />}
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex justify-end">
                        <button 
                            onClick={() => onDeleteCategory(cat.id)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Delete Category"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            );
        })}
        
        {/* Add New Button */}
        <button 
            onClick={() => onAddCategory(type)}
            className="w-full py-3 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 hover:text-indigo-500 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2 font-semibold text-sm mt-2"
        >
            <Plus className="w-4 h-4" />
            Add {type === 'income' ? 'Income Source' : 'Category'}
        </button>
      </div>

      {/* Footer Status */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
         <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
            <span>
                {type === 'bill' ? 'Bills Due' : type === 'savings' ? 'Target Goal' : 'Monthly Budget'}: <span className="text-gray-800">₹{totalBudget.toLocaleString('en-IN')}</span>
            </span>
            <span>
                {Math.round((totalActual / (totalBudget || 1)) * 100)}% Used
            </span>
         </div>
      </div>
    </div>
  );
};