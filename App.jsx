import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  collection, 
  onSnapshot, 
  updateDoc 
} from 'firebase/firestore';
import { 
  User, 
  QrCode, 
  Settings, 
  LogOut, 
  Plus, 
  Minus, 
  Users, 
  Star,
  Calendar,
  ChevronRight,
  Gem,
  Sparkles,
  Trophy,
  Gift,
  Bell,
  CreditCard
} from 'lucide-react';

// --- CONFIGURATION FIREBASE ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : { apiKey: "", authDomain: "", projectId: "", storageBucket: "", messagingSenderId: "", appId: "" };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = typeof __app_id !== 'undefined' ? __app_id : 'glowisme-v5-structured';

// --- COMPOSANTS DE STYLE ---

const GoldBorderCard = ({ children, className = "" }) => (
  <div className={`bg-[#FAF7F2] border-2 border-[#C5A059] rounded-[2rem] p-6 shadow-lg ${className}`}>
    {children}
  </div>
);

const GlowismeLogo = ({ className = "w-12 h-12" }) => (
  <div className={`${className} flex items-center justify-center rounded-full border-2 border-[#C5A059] bg-[#1A1A1A]`}>
    <span className="text-[#C5A059] font-serif text-2xl font-bold">G</span>
  </div>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home');

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) { console.error(error); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'data');
    const unsubscribe = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        setUserData(snap.data());
      } else {
        const newData = {
          uid: user.uid,
          name: "Invitée Privilège",
          points: 0,
          cagnotteAmbassadrice: 0,
          tier: 'Silver',
          isAdmin: false,
          memberSince: new Date().toISOString()
        };
        setDoc(userDocRef, newData);
        setUserData(newData);
      }
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (user && userData) {
      const publicDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'all_clients', user.uid);
      setDoc(publicDocRef, {
        name: userData.name,
        points: userData.points,
        tier: userData.tier,
        uid: user.uid
      }, { merge: true });
    }
    
    if (userData?.isAdmin) {
      const usersCol = collection(db, 'artifacts', APP_ID, 'public', 'data', 'all_clients');
      return onSnapshot(usersCol, (snap) => {
        setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }
  }, [userData, user]);

  const updatePoints = async (targetUserId, currentPoints, amount) => {
    const newPoints = Math.max(0, currentPoints + amount);
    const pubRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'all_clients', targetUserId);
    const privRef = doc(db, 'artifacts', APP_ID, 'users', targetUserId, 'profile', 'data');
    await updateDoc(pubRef, { points: newPoints });
    await updateDoc(privRef, { points: newPoints });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F4EFE6]">
        <GlowismeLogo className="w-20 h-20 animate-pulse" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1A1A1A] pb-32 font-sans">
      {/* HEADER AVEC LISERÉ DORÉ */}
      <header className="bg-[#1A1A1A] p-5 border-b-4 border-[#C5A059] sticky top-0 z-50 shadow-2xl">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <GlowismeLogo className="w-10 h-10" />
            <h1 className="text-xl font-serif font-black tracking-[0.2em] text-[#C5A059]">GLOWISME</h1>
          </div>
          <div className="flex gap-2">
            {userData?.isAdmin && (
              <button onClick={() => setView('admin')} className={`p-2 rounded-lg border border-[#C5A059] ${view === 'admin' ? 'bg-[#C5A059] text-black' : 'text-[#C5A059]'}`}>
                <Users size={20} />
              </button>
            )}
            <button className="p-2 border border-[#C5A059] text-[#C5A059] rounded-lg">
              <Bell size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-6 space-y-6">
        {view === 'home' && (
          <>
            {/* CARTE FIDÉLITÉ BIEN ENCADRÉE */}
            <div className="bg-[#1A1A1A] rounded-[2.5rem] border-2 border-[#C5A059] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <Sparkles size={24} className="text-[#C5A059] opacity-50" />
                </div>
                
                <div className="mb-6">
                    <span className="bg-[#C5A059] text-black text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-tighter">
                        Membre {userData?.tier}
                    </span>
                </div>

                <div className="space-y-1">
                    <p className="text-[#C5A059] text-[10px] uppercase tracking-[0.3em] font-bold">Crédit Disponible</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-serif font-black text-white">{userData?.points || 0}</span>
                        <span className="text-3xl font-serif text-[#C5A059] italic">€</span>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-[#C5A059]/30 flex justify-between items-center">
                    <p className="text-white font-bold text-xs uppercase tracking-widest">{userData?.name}</p>
                    <CreditCard size={20} className="text-[#C5A059]" />
                </div>
            </div>

            {/* DEUX BLOCS ENCADRÉS */}
            <div className="grid grid-cols-2 gap-4">
                <GoldBorderCard className="text-center space-y-2 flex flex-col items-center">
                    <Trophy size={20} className="text-[#C5A059]" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-stone-500">Cagnotte</p>
                    <p className="text-2xl font-serif font-black">{userData?.cagnotteAmbassadrice || 0}€</p>
                </GoldBorderCard>

                <button className="bg-white border-2 border-stone-200 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center gap-2 shadow-sm active:scale-95 transition-all">
                    <Gift size={20} className="text-[#1A1A1A]" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Offrir -20%</p>
                    <p className="text-[8px] text-[#C5A059] font-bold italic">Ambassadrice</p>
                </button>
            </div>

            {/* ACTION RÉSERVATION */}
            <button className="w-full bg-[#1A1A1A] border-2 border-[#C5A059] text-[#C5A059] py-5 rounded-2xl flex items-center justify-center gap-4 shadow-xl active:bg-[#C5A059] active:text-black transition-all">
              <Calendar size={20} />
              <span className="font-serif font-bold uppercase tracking-[0.2em]">Prendre Rendez-vous</span>
            </button>

            {/* QR CODE DANS UN CADRE BLANC ÉPURÉ */}
            <div className="bg-white border-4 border-[#1A1A1A] rounded-[2.5rem] p-8 text-center shadow-lg">
                <div className="mb-6 flex items-center justify-center gap-2">
                    <div className="h-[2px] w-6 bg-[#C5A059]"></div>
                    <h3 className="font-serif text-[#1A1A1A] uppercase tracking-[0.2em] text-xs font-black">Signature Scan</h3>
                    <div className="h-[2px] w-6 bg-[#C5A059]"></div>
                </div>
                <div className="inline-block p-4 border-2 border-stone-100 rounded-2xl bg-[#F9F9F9]">
                    <QrCode size={140} strokeWidth={1.5} className="text-[#1A1A1A]" />
                </div>
                <p className="mt-6 text-[9px] font-bold text-stone-400 uppercase tracking-widest leading-relaxed">
                    Présentez pour valider vos <span className="text-[#1A1A1A] underline">avantages</span>
                </p>
            </div>
          </>
        )}

        {view === 'admin' && (
          <div className="space-y-4 animate-in slide-in-from-right-5">
            <h2 className="text-center font-serif font-black uppercase text-[#1A1A1A] tracking-widest text-lg mb-6">Gestion Ambassadrices</h2>
            {allUsers.map((client) => (
              <div key={client.id} className="bg-white border-2 border-[#1A1A1A] p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-black uppercase text-xs tracking-widest">{client.name}</p>
                  <p className="text-[10px] text-[#C5A059] font-bold">{client.tier}</p>
                </div>
                <div className="flex items-center gap-2 bg-[#F4EFE6] p-1 rounded-xl">
                  <button onClick={() => updatePoints(client.uid, client.points, -5)} className="w-8 h-8 flex items-center justify-center"><Minus size={14}/></button>
                  <span className="font-serif font-black min-w-[30px] text-center">{client.points}€</span>
                  <button onClick={() => updatePoints(client.uid, client.points, 5)} className="w-8 h-8 bg-[#1A1A1A] text-[#C5A059] rounded-lg flex items-center justify-center"><Plus size={14}/></button>
                </div>
              </div>
            ))}
            <button onClick={() => setView('home')} className="w-full py-4 text-xs font-black uppercase tracking-widest text-stone-500 italic">Retour</button>
          </div>
        )}

        {view === 'profile' && (
            <div className="space-y-6">
                <div className="bg-[#1A1A1A] border-b-8 border-[#C5A059] rounded-t-[3rem] p-10 text-center">
                    <div className="flex justify-center mb-4">
                        <GlowismeLogo className="w-20 h-20" />
                    </div>
                    <h2 className="text-white font-serif text-2xl font-black uppercase tracking-widest">{userData?.name}</h2>
                    <p className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mt-2 italic">L'élégance à fleur de peau</p>
                </div>
                
                <div className="space-y-3">
                    {[
                        { icon: Star, label: "Mon Historique Glow" },
                        { icon: Gem, label: "Catalogue des Soins" },
                        { icon: Settings, label: "Paramètres" }
                    ].map((item, i) => (
                        <button key={i} className="w-full bg-white border-2 border-stone-100 p-5 rounded-2xl flex items-center justify-between group active:border-[#C5A059]">
                            <div className="flex items-center gap-4">
                                <item.icon size={18} className="text-[#C5A059]" />
                                <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
                            </div>
                            <ChevronRight size={16} />
                        </button>
                    ))}
                    
                    <button onClick={() => signOut(auth)} className="w-full p-5 mt-4 text-red-500 font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                        <LogOut size={16} /> Quitter la session
                    </button>
                </div>
            </div>
        )}
      </main>

      {/* NAVIGATION BASSE TYPE "LISERÉ" */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t-4 border-[#C5A059] px-10 py-6 flex justify-around items-center z-50 rounded-t-3xl">
        <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 transition-all ${view === 'home' ? 'text-[#C5A059] scale-110' : 'text-stone-500'}`}>
          <QrCode size={26} />
          <span className="text-[8px] font-black tracking-widest uppercase">Accueil</span>
        </button>
        <button onClick={() => setView('profile')} className={`flex flex-col items-center gap-1 transition-all ${view === 'profile' ? 'text-[#C5A059] scale-110' : 'text-stone-500'}`}>
          <User size={26} />
          <span className="text-[8px] font-black tracking-widest uppercase">Mon Profil</span>
        </button>
      </nav>
    </div>
  );
}
