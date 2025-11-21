import React, { useState, useRef } from 'react';
import { Sparkles, Send, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { AIParseResult, BudgetCategory } from '../types';

interface SmartEntryProps {
  onReview: (result: AIParseResult) => void; // Changed from onTransactionParsed to onReview
  categories: BudgetCategory[];
  className?: string;
}

export const SmartEntry: React.FC<SmartEntryProps> = ({ onReview, categories, className }) => {
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = async () => {
    if (!input.trim() && !imagePreview) return;

    setIsThinking(true);
    try {
      let result: AIParseResult;

      if (imagePreview) {
        result = await geminiService.parseTransactionImage(imagePreview, categories);
      } else {
        result = await geminiService.parseTransactionText(input, categories);
      }
      
      onReview(result); // Pass to parent for review modal
      setInput('');
      setImagePreview(null);
    } catch (error) {
      console.error(error);
      alert("AI couldn't understand that. Please try again.");
    } finally {
      setIsThinking(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`w-full group ${className || 'mb-8'}`}>
      <div className={`
        relative bg-white rounded-3xl p-2 shadow-lg shadow-purple-100/50 border border-purple-100
        transition-all duration-300 focus-within:shadow-purple-200 focus-within:border-purple-300 focus-within:ring-4 focus-within:ring-purple-50
      `}>
        <div className="flex flex-col gap-3">
          
          {/* Input Area */}
          <div className="relative flex items-start gap-3 p-2">
            <div className="mt-2 p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl text-white shadow-md">
                <Sparkles className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleTextSubmit();
                        }
                    }}
                    placeholder={imagePreview ? "Add a note about this image..." : "Ask AI: 'Spent ₹450 on Coffee at Starbucks'"}
                    className="w-full p-3 bg-transparent text-xl font-medium text-gray-800 placeholder:text-gray-400 border-none focus:ring-0 outline-none resize-none min-h-[60px]"
                    rows={1}
                />
                
                {/* Image Preview Badge */}
                {imagePreview && (
                    <div className="mt-2 relative inline-block">
                        <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <button 
                            onClick={() => setImagePreview(null)}
                            className="absolute -top-2 -right-2 bg-gray-800 text-white p-1 rounded-full shadow-md hover:bg-gray-900"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between px-4 pb-2">
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-purple-600 transition-colors text-sm font-medium"
                >
                    <ImageIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Upload Receipt</span>
                </button>
                <span className="hidden md:inline text-xs text-gray-300">|</span>
                <span className="hidden md:inline text-xs text-gray-400 font-medium">Auto-categorizes merchants</span>
            </div>

            <button 
              onClick={handleTextSubmit}
              disabled={isThinking || (!input && !imagePreview)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-md
                ${isThinking || (!input && !imagePreview) 
                    ? 'bg-gray-200 cursor-not-allowed text-gray-400 shadow-none' 
                    : 'bg-gray-900 hover:bg-black hover:scale-[1.02] active:scale-[0.98]'}
              `}
            >
              {isThinking ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                </>
              ) : (
                <>
                    <span>Add Transaction</span>
                    <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};