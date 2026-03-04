
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, CheckCircle, ArrowRight, Scan,
  Trash2, Info, X, Plus, Minus, Layers, Zap, Sparkles,
  ShieldCheck, Globe, Cpu, BookOpen, Fingerprint, Award,
  Bookmark, ShieldAlert, Hash, Binary, Microscope, Landmark,
  Atom, Calculator, Compass, PenTool, Wind, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BOOKS, LEGAL_PAGES } from './constants';
import { Book, CartItem, UserDetails, AppStep, Track, LegalContent } from './types';
import { identifyBookFromImage } from './services/gemini';

const COVER_THEMES: Record<string, { 
  primary: string, 
  secondary: string, 
  accent: string,
  symbol: string,
  art: React.ReactNode,
  bgPattern: string
}> = {
  chem: { 
    primary: '#0F172A', secondary: '#1E293B', accent: '#38BDF8', symbol: 'H2', 
    art: (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute w-16 h-16 border-[6px] border-sky-400/20 rounded-full animate-pulse"></div>
        <Atom size={32} className="text-sky-400 relative z-10" />
      </div>
    ),
    bgPattern: 'radial-gradient(circle at 50% 50%, rgba(56,189,248,0.1) 0%, transparent 80%)'
  },
  phys: { 
    primary: '#18181B', secondary: '#27272A', accent: '#F59E0B', symbol: 'Φ', 
    art: (
      <div className="relative w-full h-full flex items-center justify-center">
        <Zap size={32} className="text-amber-500 relative z-10" />
      </div>
    ),
    bgPattern: 'repeating-linear-gradient(45deg, rgba(245,158,11,0.05) 0px, rgba(245,158,11,0.05) 1px, transparent 1px, transparent 10px)'
  },
  bio: { 
    primary: '#064E3B', secondary: '#022C22', accent: '#10B981', symbol: '🧬', 
    art: (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <Activity size={32} className="text-emerald-400 relative z-10" />
      </div>
    ),
    bgPattern: 'url("https://www.transparenttextures.com/patterns/leaf.png")'
  },
  eng: { 
    primary: '#450A0A', secondary: '#7F1D1D', accent: '#F87171', symbol: '📐', 
    art: (
      <div className="relative w-full h-full flex items-center justify-center">
        <Compass size={32} className="text-red-400 relative z-10" />
      </div>
    ),
    bgPattern: 'linear-gradient(to right, rgba(248,113,113,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(248,113,113,0.05) 1px, transparent 1px)'
  },
  cs: { 
    primary: '#1E1B4B', secondary: '#312E81', accent: '#818CF8', symbol: '</>', 
    art: (
      <div className="relative w-full h-full flex flex-col items-center justify-center gap-2">
        <Binary size={32} className="text-indigo-400" />
      </div>
    ),
    bgPattern: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")'
  },
  'math-spec': { 
    primary: '#000000', secondary: '#171717', accent: '#FFFFFF', symbol: 'Σ', 
    art: (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-16 h-16 rotate-45 border-2 border-white/20 flex items-center justify-center text-xl font-black text-white">X</div>
      </div>
    ),
    bgPattern: 'linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)'
  },
  math1: { 
    primary: '#7C2D12', secondary: '#9A3412', accent: '#FB923C', symbol: 'π', 
    art: (
      <div className="relative w-full h-full flex items-center justify-center">
        <Calculator size={32} className="text-orange-400/80" />
      </div>
    ),
    bgPattern: 'radial-gradient(rgba(251,146,60,0.1) 2px, transparent 2px)'
  },
  geo: { 
    primary: '#164E63', secondary: '#155E75', accent: '#22D3EE', symbol: 'GPS', 
    art: (
      <div className="relative w-full h-full flex items-center justify-center">
        <Compass size={32} className="text-cyan-300" />
      </div>
    ),
    bgPattern: 'url("https://www.transparenttextures.com/patterns/grid-me.png")'
  },
  hist: { 
    primary: '#422006', secondary: '#713F12', accent: '#FBBF24', symbol: '🏛', 
    art: (
      <div className="relative w-full h-full flex items-center justify-center">
        <Landmark size={32} className="text-amber-400 drop-shadow-2xl" />
      </div>
    ),
    bgPattern: 'url("https://www.transparenttextures.com/patterns/paper.png")'
  },
  arabic: { 
    primary: '#1E3A8A', secondary: '#1E40AF', accent: '#60A5FA', symbol: 'ض', 
    art: (
      <div className="relative w-full h-full flex items-center justify-center">
        <PenTool size={32} className="text-blue-300 relative z-10" />
      </div>
    ),
    bgPattern: 'repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(96,165,250,0.05) 25px)'
  },
};

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('catalog');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTrack, setActiveTrack] = useState<Track>(Track.SCIENCE);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    fullName: '', phone: '', altPhone: '', address: ''
  });
  const [legalPage, setLegalPage] = useState<LegalContent | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<{ text: string, type: 'info' | 'success' | 'error' } | null>(null);

  const totalPrice = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  const addToCart = (book: Book) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === book.id);
      if (existing) return prev.map(item => item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...book, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) return { ...item, quantity: Math.max(1, item.quantity + delta) };
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    setScanMessage({ text: 'جاري المسح الضوئي للغلاف...', type: 'info' });
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const identified = await identifyBookFromImage(base64);
      if (identified) {
        const book = BOOKS.find(b => identified.toLowerCase().includes(b.title.toLowerCase()) || b.title.toLowerCase().includes(identified.toLowerCase()));
        if (book) {
          addToCart(book);
          setScanMessage({ text: `تم التعرف: ${book.title}`, type: 'success' });
        } else {
          setScanMessage({ text: 'الكتاب غير متوفر في مخزوننا', type: 'error' });
        }
      } else {
        setScanMessage({ text: 'لم نستطع تمييز الكتاب، جرب مرة أخرى', type: 'error' });
      }
      setIsScanning(false);
      setTimeout(() => setScanMessage(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-[#1A1A1C] font-['Cairo'] selection:bg-orange-500 selection:text-white overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-[999] bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')]"></div>
      <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-orange-600/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <nav className="fixed top-0 z-[100] w-full px-6 md:px-20 py-6 flex justify-between items-center bg-white/70 backdrop-blur-3xl border-b border-black/[0.04] shadow-sm">
        <div className="flex-1 lg:flex-none">
           <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-500/20">A</div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex p-1 bg-gray-100/50 rounded-[1.25rem] border border-black/5">
            <button onClick={() => setActiveTrack(Track.SCIENCE)} className={`px-8 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTrack === Track.SCIENCE ? 'bg-white text-orange-600 shadow-lg' : 'text-gray-400 hover:text-black'}`}>القسم العلمي</button>
            <button onClick={() => setActiveTrack(Track.LITERARY)} className={`px-8 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTrack === Track.LITERARY ? 'bg-white text-orange-600 shadow-lg' : 'text-gray-400 hover:text-black'}`}>القسم الأدبي</button>
          </div>
          
          <button 
            onClick={() => cart.length > 0 && setStep('details')}
            className={`relative flex items-center gap-4 px-8 py-4 rounded-[1.25rem] font-black text-[11px] transition-all ${cart.length > 0 ? 'bg-orange-600 text-white hover:bg-orange-500 hover:scale-105 shadow-xl shadow-orange-600/20 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">{totalPrice} ج</span>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 w-7 h-7 bg-white text-orange-600 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-orange-600 shadow-xl">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      <main className="pt-36 pb-32 px-6 md:px-12 max-w-[1600px] mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {step === 'catalog' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-32">
              <section className="text-center space-y-10 relative py-6">
                <div className="inline-flex items-center gap-4 px-6 py-2.5 bg-orange-50 rounded-full border border-orange-100 text-[10px] font-black text-orange-600 tracking-[0.2em] uppercase">
                   <Zap size={16} /> توصيل فوري وحصري لجميع أنحاء مصر 🇪🇬
                </div>
                <h1 className="text-5xl md:text-[8rem] font-black tracking-tighter leading-[0.8] text-[#1A1A1C]">
                  مستقبلك <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-600 to-orange-400 animate-pulse">يبدأ هنا.</span>
                </h1>
                <p className="text-gray-400 text-xl md:text-2xl font-bold max-w-2xl mx-auto leading-relaxed">سلسلة المريح الأصلية - طريقك نحو التفوق الأكاديمي.</p>
                <div className="pt-8">
                  <label className="group relative inline-flex items-center gap-6 px-12 py-7 bg-orange-600 text-white rounded-[2.5rem] font-black text-[13px] cursor-pointer hover:bg-orange-500 hover:scale-105 transition-all shadow-2xl shadow-orange-600/30">
                    <Scan size={28} className="group-hover:rotate-12 transition-transform" /> 
                    <span>اطلب عبر صورة الغلاف</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </section>

              <div className="space-y-24">
                <div className="flex justify-between items-end border-b-2 border-orange-100 pb-10">
                  <h2 className="text-4xl font-black tracking-tighter uppercase italic text-orange-600">The Collection</h2>
                  <div className="text-[10px] font-black text-orange-200 uppercase tracking-[0.5em]">Authentic Al-Mureeh</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                  {BOOKS.filter(b => b.track === activeTrack || b.id === 'arabic' || b.id === 'math1').map((book) => {
                    const theme = COVER_THEMES[book.id] || COVER_THEMES['chem'];
                    const inCart = cart.find(c => c.id === book.id);
                    return (
                      <motion.div 
                        key={book.id} 
                        initial={{ opacity: 0, y: 30 }} 
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="group flex flex-col h-full bg-white rounded-[2.5rem] p-4 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-black/[0.02] hover:border-orange-200"
                      >
                        <div className="relative aspect-[3/4.2] rounded-[2rem] overflow-hidden mb-6 shadow-xl transition-all duration-1000 group-hover:scale-[1.02]"
                          style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` }}>
                          
                          <div className="absolute left-0 top-0 bottom-0 w-8 bg-black/40 z-[35]"></div>
                          <div className="absolute left-8 top-0 bottom-0 w-[1px] bg-white/10 z-[35]"></div>
                          
                          <div className="absolute inset-0 z-[15] opacity-[0.2] mix-blend-overlay pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/linen.png')]"></div>

                          <div className="absolute inset-0 z-10 opacity-30 mix-blend-screen pointer-events-none" style={{ background: theme.bgPattern, backgroundSize: '60px 60px' }}></div>
                          <div className="absolute inset-0 z-20 flex items-center justify-center p-12 opacity-80 group-hover:scale-110 transition-transform duration-1000">
                             {theme.art}
                          </div>

                          <div className="absolute inset-0 p-8 pr-12 flex flex-col justify-between z-50">
                            <div className="flex justify-between items-start">
                               <div className="px-3 py-1 bg-white/5 backdrop-blur-2xl rounded-lg border border-white/10 text-[7px] font-black text-white tracking-[0.2em] uppercase">
                                 SUDAN 2025
                               </div>
                               <div className="text-white/20 font-black text-2xl tracking-tighter italic">
                                 {theme.symbol}
                               </div>
                            </div>

                            <div className="space-y-4">
                               <div className="w-10 h-0.5 bg-white/20 rounded-full mb-3"></div>
                               <h3 className="text-3xl font-black text-white leading-[0.85] tracking-tighter drop-shadow-lg">
                                 {book.title.split(' ').map((word, i) => (
                                   <div key={i} className={i === 0 ? 'text-white' : 'text-white/40'}>{word}</div>
                                 ))}
                               </h3>
                            </div>

                            <div className="flex justify-between items-end border-t border-white/5 pt-6">
                               <div className="space-y-0.5">
                                 <p className="text-white/30 text-[7px] font-black tracking-widest uppercase">Premium Gear</p>
                               </div>
                               <Hash size={16} className="text-white/10" />
                            </div>
                          </div>

                          <div className="absolute top-8 right-8 bg-orange-600 text-white px-4 py-2 rounded-xl text-[9px] font-black shadow-lg z-[60] border border-orange-400">
                             {book.price} ج
                          </div>
                        </div>

                        <div className="flex-grow space-y-8 px-4 pb-4">
                           <div className="flex justify-between items-start">
                             <div className="space-y-1">
                               <h4 className="text-xl font-black tracking-tighter leading-tight group-hover:text-orange-600 transition-colors">{book.title}</h4>
                               <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Original Series</p>
                             </div>
                           </div>
                           
                           <div className="pt-2">
                            {inCart ? (
                              <div className="flex items-center bg-orange-50 rounded-[1.5rem] p-1.5 gap-2 border border-orange-100 shadow-inner">
                                <button onClick={() => updateQuantity(book.id, -1)} className="w-10 h-10 bg-white text-orange-600 flex items-center justify-center rounded-xl transition-all shadow-sm active:scale-90 border border-orange-100"><Minus size={14}/></button>
                                <span className="flex-grow text-center text-lg font-black text-orange-700">{inCart.quantity}</span>
                                <button onClick={() => updateQuantity(book.id, 1)} className="w-10 h-10 bg-white text-orange-600 flex items-center justify-center rounded-xl transition-all shadow-sm active:scale-90 border border-orange-100"><Plus size={14}/></button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => addToCart(book)}
                                className="w-full bg-[#1A1A1C] text-white py-5 rounded-[1.5rem] text-[11px] font-black hover:bg-orange-600 transition-all shadow-xl active:scale-[0.97] flex items-center justify-center gap-3 uppercase tracking-[0.15em]"
                              >
                                أضف للحقيبة <ArrowRight size={16} strokeWidth={3}/>
                              </button>
                            )}
                           </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'details' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col lg:grid lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
              <div className="lg:col-span-7 space-y-12">
                <div className="space-y-4">
                  <h3 className="text-4xl font-black tracking-tighter">مكان الاستلام.</h3>
                  <p className="text-gray-400 font-bold text-lg leading-snug">نحن نغطي كافة مناطق القاهرة الكبرى وجميع أنحاء مصر.</p>
                </div>
                
                <div className="grid gap-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] px-4">الاسم الثلاثي</label>
                    <input type="text" placeholder="اكتب اسم المستلم الرباعي..." value={userDetails.fullName} onChange={e => setUserDetails({...userDetails, fullName: e.target.value})} className="w-full bg-white border border-black/[0.04] px-6 py-4 rounded-2xl outline-none text-lg font-bold focus:border-orange-500 transition-all shadow-sm"/>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] px-4">رقم الموبايل</label>
                      <div className="relative">
                        <input type="tel" placeholder="01xxxxxxxxx" value={userDetails.phone} onChange={e => setUserDetails({...userDetails, phone: e.target.value})} className="w-full bg-white border border-black/[0.04] px-6 py-4 pl-20 rounded-2xl outline-none text-lg font-bold ltr focus:border-orange-500 transition-all shadow-sm" dir="ltr"/>
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500 font-black text-base">+20</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] px-4">واتساب</label>
                      <input type="tel" placeholder="رقم واتساب للتواصل" value={userDetails.altPhone} onChange={e => setUserDetails({...userDetails, altPhone: e.target.value})} className="w-full bg-white border border-black/[0.04] px-6 py-4 rounded-2xl outline-none text-lg font-bold focus:border-orange-500 transition-all shadow-sm" dir="ltr"/>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] px-4">العنوان التفصيلي</label>
                    <textarea rows={4} placeholder="اسم المحافظة، الحي، الشارع، علامات مميزة..." value={userDetails.address} onChange={e => setUserDetails({...userDetails, address: e.target.value})} className="w-full bg-white border border-black/[0.04] px-6 py-4 rounded-2xl outline-none text-lg font-bold focus:border-orange-500 transition-all shadow-sm resize-none"/>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="sticky top-40 bg-[#1A1A1C] text-white rounded-[2.5rem] p-8 shadow-2xl space-y-8 border border-white/5">
                  <h4 className="text-xl font-black tracking-tighter uppercase text-orange-500">سجل الطلب</h4>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-3 custom-scrollbar">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center group border-b border-white/5 pb-4 last:border-0">
                        <div className="space-y-0.5">
                          <p className="font-black text-base">{item.title}</p>
                          <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{item.quantity} نسخة</p>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="font-black text-lg text-orange-400">{item.price * item.quantity} ج</span>
                           <button onClick={() => removeFromCart(item.id)} className="text-white/20 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-white/10">
                    <div className="flex justify-between items-end mb-8">
                      <span className="text-gray-500 font-black uppercase text-[10px] tracking-[0.3em]">صافي المبلغ</span>
                      <span className="text-3xl font-black tracking-tighter text-orange-500">{totalPrice} ج</span>
                    </div>
                    <button 
                      disabled={!userDetails.fullName || !userDetails.phone || !userDetails.address}
                      onClick={() => setStep('invoice')}
                      className="w-full py-6 rounded-2xl bg-orange-600 text-white font-black text-[12px] hover:bg-orange-500 transition-all shadow-xl shadow-orange-600/20 active:scale-95 uppercase tracking-[0.3em]"
                    >
                      إتمام الطلب
                    </button>
                    <button onClick={() => setStep('catalog')} className="w-full py-3 mt-4 text-[9px] font-black text-gray-600 hover:text-white transition-colors uppercase tracking-[0.5em]">رجوع للمتجر</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'invoice' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto space-y-8">
              <div className="bg-orange-600 p-8 rounded-[2.5rem] text-center shadow-2xl shadow-orange-600/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>
                <div className="w-16 h-16 bg-white text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"><CheckCircle size={32} /></div>
                <h2 className="text-3xl font-black tracking-tighter mb-3 text-white">تم تسجيل الطلب!</h2>
                <p className="text-orange-100 font-bold text-base max-w-xs mx-auto leading-relaxed">سنتواصل معك هاتفياً خلال ساعة لتأكيد موعد التسليم.</p>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-black/[0.03] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-orange-600"></div>
                <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                  <div className="space-y-1">
                    <h1 className="text-2xl font-black tracking-tighter">الفاتورة</h1>
                    <p className="text-[8px] font-black text-gray-300 tracking-[0.5em] uppercase">Sales Record</p>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-xl text-orange-600">#{Math.floor(8000 + Math.random() * 2000)}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-lg font-black">
                      <span>{item.title} <span className="text-orange-200 ml-4 text-xs font-bold italic tracking-widest">X{item.quantity}</span></span>
                      <span className="text-gray-400">{item.price * item.quantity} ج</span>
                    </div>
                  ))}
                  <div className="pt-6 border-t border-orange-600 border-dashed flex justify-between text-3xl font-black">
                    <span className="text-xl">الإجمالي</span>
                    <span className="text-orange-600">{totalPrice} ج</span>
                  </div>
                </div>

                <div className="bg-orange-50 p-6 rounded-2xl space-y-2 border border-orange-100">
                   <p className="font-black text-lg text-orange-900 leading-tight">{userDetails.fullName}</p>
                   <p className="text-orange-700 font-bold text-sm leading-relaxed">{userDetails.address}</p>
                </div>

                <div className="mt-10 text-center">
                  <button onClick={() => {setCart([]); setStep('catalog');}} className="px-12 py-5 bg-[#1A1A1C] text-white rounded-2xl font-black text-[11px] hover:bg-orange-600 transition-all shadow-xl uppercase tracking-[0.2em]">العودة للمتجر</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-16 px-6 md:px-20 border-t border-black/[0.04] bg-white no-print">
        <div className="max-w-[1600px] mx-auto flex flex-col items-center gap-10">
          <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">
            <button onClick={() => setLegalPage(LEGAL_PAGES.about)} className="hover:text-orange-600 transition-colors">من نحن</button>
            <button onClick={() => setLegalPage(LEGAL_PAGES.terms)} className="hover:text-orange-600 transition-colors">شروط البيع</button>
            <button onClick={() => setLegalPage(LEGAL_PAGES.privacy)} className="hover:text-orange-600 transition-colors">الخصوصية</button>
          </div>
          <p className="text-[10px] text-gray-300 font-black italic tracking-[0.3em] uppercase">جميع الحقوق محفوظة © 2025</p>
        </div>
      </footer>

      <AnimatePresence>
        {scanMessage && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="fixed bottom-10 left-6 right-6 md:left-auto md:right-10 z-[200]">
            <div className={`flex items-center gap-4 px-8 py-4 rounded-full shadow-2xl border backdrop-blur-3xl ${scanMessage.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-orange-50 border-orange-100 text-orange-600'}`}>
              {isScanning ? <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" /> : <Info size={20}/>}
              <span className="text-[11px] font-black tracking-tight uppercase tracking-widest">{scanMessage.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {legalPage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-4xl border border-black/[0.02] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-orange-600"></div>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black tracking-tighter text-orange-600">{legalPage.title}</h3>
                <button onClick={() => setLegalPage(null)} className="w-10 h-10 bg-gray-50 hover:bg-orange-600 hover:text-white rounded-full transition-all flex items-center justify-center shadow-sm"><X size={18}/></button>
              </div>
              <p className="text-gray-500 text-xl leading-relaxed font-bold mb-10">{legalPage.content}</p>
              <button onClick={() => setLegalPage(null)} className="w-full bg-orange-600 text-white py-6 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-orange-500 transition-all">إغلاق</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
