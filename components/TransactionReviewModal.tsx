import React, { useState, useEffect } from 'react';
import { AIParseResult, CategoryType, SplitDetails, BudgetCategory } from '../types';
import { X, Check, Users, Share2, QrCode, Copy, Wallet } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (finalResult: AIParseResult, splitDetails?: SplitDetails) => void;
  initialData: AIParseResult | null;
  categories: BudgetCategory[];
}

export const TransactionReviewModal: React.FC<ReviewModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  initialData,
  categories
}) => {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState(0);
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState<CategoryType>('expense');
  
  // Split State
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [numPeople, setNumPeople] = useState(2);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (initialData) {
      setMerchant(initialData.merchant);
      setAmount(initialData.amount);
      setCategoryName(initialData.categoryName);
      setCategoryType(initialData.categoryType);
      setIsSplitMode(false);
      setShowQR(false);
      setNumPeople(2);
    }
  }, [initialData]);

  if (!isOpen || !initialData) return null;

  const handleConfirm = () => {
    const finalResult: AIParseResult = {
      merchant,
      amount, // We track the FULL amount in the ledger usually, or the user's share? 
              // Standard practice: Track full amount as user paid it, but track reimbursement.
              // For simplicity here: we track the full amount as expense.
      categoryName,
      categoryType,
      date: initialData.date,
      isRecurring: initialData.isRecurring
    };

    let splitDetails: SplitDetails | undefined;
    
    if (isSplitMode) {
      const perPerson = amount / numPeople;
      splitDetails = {
        totalAmount: amount,
        numberOfPeople: numPeople,
        amountPerPerson: perPerson,
        isSplit: true,
        // Dummy UPI link for QR
        shareLink: `upi://pay?pa=user@upi&pn=Val%20U%20Tracker&am=${perPerson}&cu=INR&tn=Split%20${merchant}` 
      };
    }

    onConfirm(finalResult, splitDetails);
  };

  const splitAmount = amount / numPeople;
  const qrData = `upi://pay?pa=user@upi&pn=Val%20U%20Tracker&am=${splitAmount}&cu=INR&tn=Split%20${merchant}`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
           <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
             <Wallet className="w-5 h-5 text-indigo-500" />
             Review Transaction
           </h3>
           <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Core Fields */}
          <div className="space-y-4">
             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Merchant / Description</label>
               <input 
                 type="text" 
                 value={merchant}
                 onChange={(e) => setMerchant(e.target.value)}
                 className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
               />
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Amount (₹)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
                  <select 
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    <option value={categoryName}>{categoryName} (New)</option>
                  </select>
                </div>
             </div>
          </div>

          {/* Split Feature */}
          <div className="pt-4 border-t border-gray-100">
             <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                   <div className={`w-12 h-7 rounded-full relative transition-colors ${isSplitMode ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                      <input type="checkbox" checked={isSplitMode} onChange={() => setIsSplitMode(!isSplitMode)} className="sr-only" />
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isSplitMode ? 'left-6' : 'left-1'}`}></div>
                   </div>
                   <span className="font-bold text-gray-700">Split with friends</span>
                </label>
                {isSplitMode && (
                   <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1">
                      <Users className="w-4 h-4 text-gray-500" />
                      <input 
                        type="number" 
                        min="2" 
                        max="20"
                        value={numPeople} 
                        onChange={(e) => setNumPeople(Number(e.target.value))}
                        className="w-10 bg-transparent text-center font-bold outline-none"
                      />
                   </div>
                )}
             </div>

             {isSplitMode && (
               <div className="bg-indigo-50 rounded-2xl p-4 animate-slideDown">
                  <div className="flex justify-between items-center mb-4">
                     <div className="text-sm text-indigo-800">
                        Your Share: <span className="font-bold">₹{splitAmount.toFixed(0)}</span>
                     </div>
                     <div className="text-sm text-indigo-800">
                        Per Friend: <span className="font-bold">₹{splitAmount.toFixed(0)}</span>
                     </div>
                  </div>
                  
                  {!showQR ? (
                    <button 
                      onClick={() => setShowQR(true)}
                      className="w-full bg-white text-indigo-600 border border-indigo-200 font-bold py-2 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <QrCode className="w-4 h-4" />
                      Generate Payment QR
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-4 bg-white p-4 rounded-xl border border-indigo-100">
                       <img 
                         src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}&color=4f46e5`} 
                         alt="Payment QR" 
                         className="w-32 h-32"
                       />
                       <p className="text-xs text-gray-400 text-center">Scan with any UPI app to pay ₹{splitAmount.toFixed(0)}</p>
                       <div className="flex gap-2 w-full">
                          <button className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2">
                             <Share2 className="w-3 h-3" /> Share Link
                          </button>
                          <button onClick={() => setShowQR(false)} className="flex-1 bg-gray-100 text-gray-600 text-xs font-bold py-2 rounded-lg">
                             Close
                          </button>
                       </div>
                    </div>
                  )}
               </div>
             )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
           <button onClick={onClose} className="px-5 py-2.5 text-gray-600 font-bold text-sm hover:bg-gray-200 rounded-xl transition-colors">
              Cancel
           </button>
           <button onClick={handleConfirm} className="px-6 py-2.5 bg-gray-900 text-white font-bold text-sm hover:bg-black rounded-xl shadow-lg shadow-gray-200 transition-all flex items-center gap-2">
              <Check className="w-4 h-4" />
              Confirm & Add
           </button>
        </div>

      </div>
    </div>
  );
};