import React, { useState } from 'react';
import { User } from '../types';
import { ArrowRight, Lock, Mail, User as UserIcon, Sparkles } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      const mockUser: User = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        name: isLogin ? 'Alex Johnson' : name,
        email: email,
        currency: 'INR',
        joinedDate: new Date().toISOString(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}` // Generates a consistent avatar based on email
      };
      
      localStorage.setItem('pastel_user', JSON.stringify(mockUser));
      onLogin(mockUser);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
        
        {/* Left Side - Brand & Art */}
        <div className="relative hidden md:flex flex-col justify-between p-12 bg-gray-900 text-white overflow-hidden">
           <div className="relative z-10">
             <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">Val U Tracker</span>
             </div>
             <p className="text-gray-400 text-sm">Smart finance for smart people.</p>
           </div>

           <div className="relative z-10">
              <h2 className="text-4xl font-extrabold leading-tight mb-6">
                {isLogin ? "Welcome back to your financial freedom." : "Start your journey to better savings."}
              </h2>
              <p className="text-gray-400 leading-relaxed mb-12">
                Track expenses automatically using AI, split bills with friends, and visualize your financial health with clarity.
              </p>

              {/* Powered By Footer */}
              <div className="pt-6 border-t border-gray-800/50">
                 <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-3">Powered by</p>
                 <a href="https://www.valuminds.com" target="_blank" rel="noreferrer" className="group inline-block">
                    <div className="flex flex-col">
                       <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">VALUMINDS <span className="text-green-500">FINSPERITI</span></h3>
                       <p className="text-[8px] font-bold text-gray-500 tracking-[0.25em] mt-1 group-hover:text-gray-400 transition-colors">CONNECT &gt; COLLABORATE &gt; PROSPER</p>
                    </div>
                 </a>
              </div>
           </div>

           {/* Decorative Circles */}
           <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-20"></div>
           <div className="absolute bottom-[-20%] left-[-20%] w-80 h-80 bg-purple-600 rounded-full blur-3xl opacity-20"></div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
           <div className="max-w-md mx-auto w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {isLogin ? 'Sign In' : 'Create Account'}
              </h3>
              <p className="text-gray-500 mb-8">
                {isLogin ? 'Enter your details to access your wallet.' : 'It takes less than a minute to get started.'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                 {!isLogin && (
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                     <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="text" 
                          required 
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                          placeholder="John Doe"
                        />
                     </div>
                   </div>
                 )}

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                   <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                        placeholder="you@example.com"
                      />
                   </div>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                   <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="password" 
                        required 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                        placeholder="••••••••"
                      />
                   </div>
                 </div>

                 <button 
                   type="submit" 
                   disabled={loading}
                   className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 mt-4"
                 >
                   {loading ? (
                     <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                   ) : (
                     <>
                       {isLogin ? 'Sign In' : 'Create Account'}
                       <ArrowRight className="w-5 h-5" />
                     </>
                   )}
                 </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button 
                    onClick={() => setIsLogin(!isLogin)} 
                    className="ml-2 text-indigo-600 font-bold hover:underline"
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};