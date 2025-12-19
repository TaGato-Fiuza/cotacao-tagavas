import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc,
  deleteDoc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';
// import { Html5QrcodeScanner } from 'html5-qrcode'; // <--- DESCOMENTE ISSO NO SEU PC (npm install html5-qrcode)
import { 
  Plus, 
  Trash2, 
  Share2, 
  CheckCircle, 
  Store, 
  ShoppingCart, 
  ChevronRight, 
  ArrowLeft, 
  DollarSign,
  Loader2,
  Send,
  X,
  Lock,
  Unlock,
  LogOut,
  Filter,
  Download,
  MessageSquare,
  AlertCircle,
  Trophy,
  Copy,
  MessageCircle,
  Save,
  Edit3,
  User,
  Key,
  Pencil,
  Archive,
  Eye,
  EyeOff,
  RefreshCw,
  ScanBarcode,
  Camera 
} from 'lucide-react';

// --- Configuração Firebase ---
// Usa a config do ambiente se existir (Preview), senão usa a SUA oficial (Produção/Local)
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "AIzaSyCDPZvnsEmhTmncnEeShNCy7hAHDMMRQXA",
  authDomain: "cotacaotagavas.firebaseapp.com",
  projectId: "cotacaotagavas",
  storageBucket: "cotacaotagavas.firebasestorage.app",
  messagingSenderId: "907640755544",
  appId: "1:907640755544:web:bf6a6663f6e427a944412d"
};

// Se tiver Token do Cosmos, coloque aqui
const COSMOS_API_TOKEN = ""; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// GARANTIA: appId seguro e sem caracteres estranhos
const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'cotacao-tagavas';
const appId = rawAppId.replace(/[^a-zA-Z0-9-_]/g, ''); 

const ADMIN_USER_HASH = "TWVyY2FkbyBUYWdhdmFz";
const ADMIN_PASS_HASH = "VGFnYXZhc0AyMDI4NzQ=";

// --- Helpers de Banco de Dados ---
const getCollectionRef = (collectionName) => {
  return collection(db, 'artifacts', appId, 'public', 'data', collectionName);
};

const getDocRef = (collectionName, docId) => {
  return doc(db, 'artifacts', appId, 'public', 'data', collectionName, docId);
};


// --- Componentes UI Reutilizáveis ---

const Card = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = "", disabled = false, icon: Icon }) => {
  const baseStyle = "flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
    whatsapp: "bg-[#25D366] text-white hover:bg-[#128C7E] shadow-md shadow-green-100",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, placeholder, type = "text", className = "", onKeyDown }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && <label className="text-sm font-medium text-gray-600">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className="px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
    />
  </div>
);

// --- Componente de Scanner (SIMULADO PARA PREVIEW) ---
const BarcodeScanner = ({ onDetected, onClose }) => {
  // MOCK (Apenas para demonstração no Preview)
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-4 rounded-xl w-full max-w-sm text-center">
        <h3 className="font-bold mb-2">Câmera (Simulação)</h3>
        <div id="reader" className="w-full h-48 bg-gray-900 mb-4 flex items-center justify-center text-gray-500 rounded-lg">
           [Visualização da Câmera]
        </div>
        <p className="text-xs text-gray-500 mb-4">
            No preview, a câmera real está desativada para evitar erros.
            Abaixo, simule a leitura de um código real (ex: Coca-Cola).
        </p>
        <Button 
            className="w-full mb-2" 
            onClick={() => onDetected("7894900011517")} // Código EAN da Coca-Cola 2L
        >
            Simular Leitura (Coca-Cola)
        </Button>
        <Button variant="secondary" onClick={onClose} className="w-full">Cancelar</Button>
      </div>
    </div>
  );
};

// --- Helper para gerar IDs ---
const generateId = () => Math.random().toString(36).substring(2, 15);

// --- Telas do Aplicativo ---

// 1. Tela Inicial
const HomeScreen = ({ setView }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="text-blue-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Cotação Tagavas</h1>
          <p className="text-gray-500">Simplificando as compras do seu mercado.</p>
        </div>

        <div className="grid gap-4">
          <Card className="p-6 text-left hover:border-blue-300 transition-colors cursor-pointer group" onClick={() => setView('admin_login')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Store size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Sou o Dono</h3>
                  <p className="text-sm text-gray-500">Acesso restrito (Login/Senha)</p>
                </div>
              </div>
              <ChevronRight className="text-gray-300" />
            </div>
          </Card>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gradient-to-b from-blue-50 to-white px-2 text-gray-500">Ou se você é fornecedor</span>
            </div>
          </div>

          <Card className="p-6 text-left hover:border-green-300 transition-colors cursor-pointer group" onClick={() => setView('supplier_login')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <DollarSign size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Sou Fornecedor</h3>
                  <p className="text-sm text-gray-500">Entrar na cotação</p>
                </div>
              </div>
              <ChevronRight className="text-gray-300" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// 1.1 Login do Admin
const AdminLogin = ({ setView }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleLogin = () => {
    try {
      if (btoa(username) === ADMIN_USER_HASH && btoa(password) === ADMIN_PASS_HASH) {
        setView('admin_dashboard');
      } else {
        setError(true);
        setPassword("");
      }
    } catch (e) {
      setError(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <Card className="w-full max-w-sm p-8 space-y-6 text-center">
        <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center text-blue-600">
          <Lock size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Área do Dono</h2>
          <p className="text-sm text-gray-500">Entre com suas credenciais de administrador.</p>
        </div>
        <div className="space-y-4 text-left">
          <Input 
            label="Usuário" 
            placeholder="Digite seu usuário" 
            value={username} 
            onChange={e => {setError(false); setUsername(e.target.value)}} 
          />
          <Input 
            label="Senha" 
            type="password" 
            placeholder="••••" 
            value={password} 
            onChange={e => {setError(false); setPassword(e.target.value)}} 
          />
          {error && <p className="text-red-500 text-xs text-center font-medium">Usuário ou senha incorretos.</p>}
          
          <Button className="w-full" onClick={handleLogin}>Entrar</Button>
          <button onClick={() => setView('home')} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2">Voltar</button>
        </div>
      </Card>
    </div>
  );
};

// 1.2 Login do Fornecedor
const SupplierLogin = ({ setView, setSupplierAuth }) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!name.trim() || !password.trim() || !code.trim()) return alert("Preencha todos os campos");

    setLoading(true);
    try {
      const quoteRef = getDocRef('quotes', code.toUpperCase());
      const quoteSnap = await getDoc(quoteRef);

      if (!quoteSnap.exists()) {
        alert("Código da cotação inválido!");
        setLoading(false);
        return;
      }

      const q = query(
        getCollectionRef('responses'),
        where('quoteId', '==', code.toUpperCase()),
        where('supplierName', '==', name)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const responseData = querySnapshot.docs[0].data();
        if (responseData.password && responseData.password !== password) {
          alert("Senha incorreta para este fornecedor nesta cotação.");
          setLoading(false);
          return;
        }
        setSupplierAuth({
           name,
           password,
           quoteId: code.toUpperCase(),
           responseId: querySnapshot.docs[0].id,
           existingData: responseData
        });
      } else {
        setSupplierAuth({
            name,
            password,
            quoteId: code.toUpperCase(),
            responseId: null,
            existingData: null
         });
      }

      setView('supplier_view');
    } catch (e) {
      console.error(e);
      alert("Erro ao entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <Card className="w-full max-w-sm p-8 space-y-6 text-center">
        <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center text-green-600">
          <User size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Área do Fornecedor</h2>
          <p className="text-sm text-gray-500">Identifique-se para acessar a cotação.</p>
        </div>
        <div className="space-y-4 text-left">
           <Input 
            label="Nome da Empresa / Vendedor" 
            placeholder="Ex: Atacadão do Zé" 
            value={name} 
            onChange={e => setName(e.target.value)} 
          />
           <Input 
            label="Sua Senha (crie uma senha simples)" 
            type="password" 
            placeholder="Ex: 1234" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
           <div className="pt-2 border-t border-gray-100">
             <Input 
                label="Código da Cotação" 
                placeholder="Ex: X9B2A" 
                className="font-mono uppercase"
                value={code} 
                onChange={e => setCode(e.target.value)} 
            />
           </div>
          
          <Button className="w-full" variant="success" onClick={handleLogin} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Acessar Cotação'}
          </Button>
          <button onClick={() => setView('home')} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2">Voltar</button>
        </div>
      </Card>
    </div>
  );
};

// 2. Dashboard do Dono
const AdminDashboard = ({ userId, setView, setCurrentQuote }) => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null); 
  const [activeTab, setActiveTab] = useState('open'); 

  useEffect(() => {
    const unsub = onSnapshot(getCollectionRef('quotes'), (snapshot) => {
      const allQuotes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      allQuotes.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setQuotes(allQuotes);
      setLoading(false);
    }, (error) => {
      console.error("Erro no snapshot:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleCopy = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
       navigator.clipboard.writeText(text).then(() => alert("Código copiado!")).catch(() => fallbackCopy(text));
    } else {
       fallbackCopy(text);
    }
  };

  const fallbackCopy = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      alert("Código copiado!");
    } catch (err) {
      prompt("Não foi possível copiar automaticamente. Copie o código abaixo:", text);
    }
    document.body.removeChild(textArea);
  };

  const handleClone = async (quote) => {
      const confirmed = window.confirm(`Clonar cotação "${quote.title}"?`);
      if(!confirmed) return;

      setProcessing(quote.id);
      try {
          const shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
          const docRef = getDocRef('quotes', shortId);
          await setDoc(docRef, {
            title: `${quote.title} (Cópia)`,
            ownerId: userId,
            items: quote.items.map(i => ({...i, id: i.id || generateId()})), 
            status: 'open',
            createdAt: serverTimestamp()
          });
          alert("Cotação clonada com sucesso!");
      } catch (e) {
          alert("Erro ao clonar.");
      } finally {
          setProcessing(null);
      }
  };

  const handleToggleStatus = async (quote) => {
      const newStatus = quote.status === 'open' ? 'closed' : 'open';
      const action = newStatus === 'open' ? 'reabrir' : 'encerrar';
      
      setProcessing(quote.id); 
      
      try {
          const docRef = getDocRef('quotes', quote.id);
          await setDoc(docRef, { status: newStatus }, { merge: true });
      } catch (e) {
          console.error("Erro ao atualizar:", e);
          alert("Erro ao alterar status. Tente novamente.");
      } finally {
          setProcessing(null);
      }
  };

  const handleDelete = async (quote) => {
      if(!window.confirm(`Tem certeza que deseja EXCLUIR permanentemente a cotação "${quote.title}"?`)) return;
      
      setProcessing(quote.id);
      try {
          const docRef = getDocRef('quotes', quote.id);
          await deleteDoc(docRef);
      } catch (e) {
          console.error("Erro ao excluir:", e);
          alert("Erro ao excluir. Tente novamente.");
      } finally {
          setProcessing(null);
      }
  };

  const filteredQuotes = quotes.filter(q => {
      if (activeTab === 'open') return q.status === 'open';
      return q.status === 'closed';
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setView('home')} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full" title="Sair">
                <LogOut size={20} />
            </button>
            <h1 className="font-bold text-lg text-gray-900">Minhas Cotações</h1>
          </div>
          
          <button 
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:text-blue-600 rounded-full transition-colors"
            title="Recarregar Dados"
          >
            <RefreshCw size={20} />
          </button>
        </div>
        <div className="flex border-t border-gray-100">
            <button 
                onClick={() => setActiveTab('open')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'open' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                Abertas ({quotes.filter(q => q.status === 'open').length})
            </button>
            <button 
                onClick={() => setActiveTab('closed')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'closed' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                Encerradas ({quotes.filter(q => q.status === 'closed').length})
            </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : filteredQuotes.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            {activeTab === 'open' ? <Store size={48} className="mx-auto mb-4 opacity-20" /> : <Archive size={48} className="mx-auto mb-4 opacity-20" />}
            <p>Nenhuma cotação {activeTab === 'open' ? 'aberta' : 'encerrada'}.</p>
          </div>
        ) : (
          filteredQuotes.map(quote => (
            <Card key={quote.id} className={`p-4 hover:shadow-md transition-shadow cursor-pointer relative ${quote.status === 'closed' ? 'opacity-90 bg-gray-50' : ''}`} >
               <div className="absolute top-4 right-4 flex gap-2 z-20">
                  {quote.status === 'open' && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setCurrentQuote(quote); setView('edit_quote'); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors bg-white border border-gray-100 shadow-sm"
                        title="Editar Cotação"
                    >
                        <Pencil size={18} />
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleClone(quote); }}
                    disabled={processing === quote.id}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors bg-white border border-gray-100 shadow-sm"
                    title="Clonar Cotação"
                  >
                    {processing === quote.id && quote.status !== 'closed' ? <Loader2 size={18} className="animate-spin"/> : <Copy size={18} />}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(quote); }}
                    disabled={processing === quote.id}
                    className={`p-2 rounded-full transition-colors shadow-sm ${quote.status === 'open' ? 'text-gray-400 hover:text-red-600 hover:bg-red-50 bg-white border border-gray-100' : 'text-green-600 bg-green-50 hover:bg-green-100 border border-green-100'}`}
                    title={quote.status === 'open' ? "Encerrar Cotação" : "Reabrir Cotação"}
                  >
                    {processing === quote.id ? <Loader2 size={18} className="animate-spin"/> : (quote.status === 'open' ? <Lock size={18} /> : <Unlock size={18} />)}
                  </button>
                  {/* Botão de Excluir */}
                  {quote.status === 'closed' && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(quote); }}
                        disabled={processing === quote.id}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors bg-white border border-red-100 shadow-sm"
                        title="Excluir Cotação"
                    >
                        {processing === quote.id ? <Loader2 size={18} className="animate-spin"/> : <Trash2 size={18} />}
                    </button>
                  )}
               </div>

              <div onClick={() => { setCurrentQuote(quote); setView('admin_results'); }}>
                <div className="flex justify-between items-start mb-2 pr-32"> 
                  <h3 className={`font-bold text-lg ${quote.status === 'closed' ? 'text-gray-500' : 'text-gray-800'}`}>{quote.title}</h3>
                </div>
                <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${quote.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {quote.status === 'open' ? 'Aberta' : 'Fechada'}
                    </span>
                    <span className="text-sm text-gray-500">
                    • {new Date(quote.createdAt?.seconds * 1000).toLocaleDateString()} • {quote.items?.length || 0} itens
                    </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                {quote.status === 'open' && (
                    <div className="flex items-center bg-gray-50 p-2 rounded border border-gray-200">
                        <span className="text-xs text-gray-500 font-bold uppercase mr-2">Cód:</span>
                        <span className="font-mono font-bold text-gray-800 select-all">{quote.id}</span>
                    </div>
                )}
                <div className="flex gap-2">
                    {quote.status === 'open' ? (
                        <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            const text = `Olá! Cotação *${quote.title}*. Acesse o app e use o código: *${quote.id}*`;
                            handleCopy(text);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-blue-600 text-sm font-medium hover:bg-blue-50 rounded-lg transition-colors"
                        >
                        <Share2 size={16} />
                        Copiar Convite
                        </button>
                    ) : (
                        <div className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-400 text-sm font-medium bg-gray-50 rounded-lg cursor-not-allowed">
                            <Lock size={16} /> Fechada
                        </div>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentQuote(quote);
                        setView('admin_results');
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Ver Resultados
                    </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </main>

      <div className="fixed bottom-6 right-6 md:right-1/2 md:translate-x-48 z-50">
        <Button 
          className="rounded-full shadow-lg px-6 py-4" 
          onClick={() => setView('create_quote')}
          icon={Plus}
        >
          Nova Cotação
        </Button>
      </div>
    </div>
  );
};

// 3. Criar/Editar Cotação
const CreateQuote = ({ userId, setView, editingQuote }) => {
  const [title, setTitle] = useState(editingQuote ? editingQuote.title : '');
  const [items, setItems] = useState(
      editingQuote 
      ? editingQuote.items.map(i => ({...i, id: i.id || generateId()})) 
      : [{ id: generateId(), name: '', quantity: '1', unit: 'un' }]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [barcode, setBarcode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false); 

  const addItem = () => {
    setItems([...items, { id: generateId(), name: '', quantity: '', unit: 'un' }]);
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id) => {
    if(items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const fetchProductMetadata = async (code) => {
    if(COSMOS_API_TOKEN) {
      try {
        const response = await fetch(`https://api.cosmos.bluesoft.com.br/gtins/${code}`, {
          headers: { "X-Cosmos-Token": COSMOS_API_TOKEN }
        });
        if(response.ok) {
          const data = await response.json();
          return data.description || data.product_description; 
        }
      } catch(e) { console.log("Cosmos failed", e); }
    }

    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
      const data = await response.json();
      if(data.status === 1) return data.product.product_name;
    } catch(e) { console.log("OpenFood failed", e); }

    return null;
  };

  const handleBarcodeLookup = async (manualCode) => {
    const codeToSearch = manualCode || barcode.trim();
    if(!codeToSearch) return;

    setIsScanning(true);
    const productName = await fetchProductMetadata(codeToSearch);
    
    if(productName) {
        setItems(prev => [...prev, { 
            id: generateId(), 
            name: productName, 
            quantity: '1', 
            unit: 'un',
            barcode: codeToSearch 
        }]);
        setBarcode('');
        if(showCamera) setShowCamera(false);
        try { new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3').play(); } catch(e){}
    } else {
        if(!showCamera) alert("Produto não encontrado. Digite o nome.");
    }
    setIsScanning(false);
  };

  const handleKeyDown = (e) => {
    if(e.key === 'Enter') handleBarcodeLookup();
  }

  const handleSubmit = async () => {
    if (!title.trim()) return alert("Dê um nome para a cotação");
    if (items.some(i => !i.name.trim())) return alert("Preencha o nome de todos os itens");
    setIsSubmitting(true);
    try {
      const docRef = editingQuote 
        ? getDocRef('quotes', editingQuote.id)
        : getDocRef('quotes', Math.random().toString(36).substring(2, 8).toUpperCase());
      
      const dataToSave = {
          title,
          ownerId: userId,
          items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, unit: i.unit })),
      };

      if(!editingQuote) {
          dataToSave.status = 'open';
          dataToSave.createdAt = serverTimestamp();
      }

      await setDoc(docRef, dataToSave, { merge: true });
      
      setView('admin_dashboard');
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
       <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => setView('admin_dashboard')} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-lg text-gray-900">{editingQuote ? 'Editar Cotação' : 'Nova Lista de Compras'}</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        <Card className="p-4 space-y-4">
          <Input 
            label="Nome da Cotação (Ex: Semanal Hortifruti)" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Digite um nome..."
          />
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
             <div className="flex items-center gap-2 mb-2 text-blue-800 font-bold text-sm">
                <ScanBarcode size={18} />
                <span>Adicionar por Código de Barras</span>
             </div>
             <div className="flex gap-2">
                <input 
                    className="flex-1 px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Bipe ou digite o código"
                    value={barcode}
                    onChange={e => setBarcode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus={!editingQuote} 
                />
                <Button 
                    className="px-3" 
                    onClick={() => handleBarcodeLookup()} 
                    disabled={isScanning}
                >
                    <Plus size={18}/>
                </Button>
                <Button 
                    variant="secondary"
                    className="px-3 border-blue-200 text-blue-600" 
                    onClick={() => setShowCamera(true)}
                >
                    <Camera size={18}/>
                </Button>
             </div>
             <p className="text-xs text-blue-600 mt-2">Use o leitor ou a câmera para adicionar itens auto.</p>
          </div>
        </Card>

        {showCamera && (
          <BarcodeScanner 
            onDetected={(code) => handleBarcodeLookup(code)}
            onClose={() => setShowCamera(false)}
          />
        )}

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-1">Itens da Lista</h2>
          {items.map((item, index) => (
            <Card key={item.id} className="p-3 flex gap-2 items-start">
              <div className="w-16 flex-shrink-0">
                 <input 
                  type="text"
                  inputMode="numeric"
                  className="w-full px-2 py-3 rounded-lg border border-gray-200 text-center"
                  placeholder="Qtd"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                 />
              </div>
              <div className="flex-1">
                <input 
                  type="text"
                  className="w-full px-3 py-3 rounded-lg border border-gray-200"
                  placeholder="Nome do Produto"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                 />
              </div>
              <button 
                onClick={() => removeItem(item.id)}
                className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </Card>
          ))}
          <Button variant="secondary" onClick={addItem} className="w-full border-dashed" icon={Plus}>
            Adicionar Item Manualmente
          </Button>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50">
        <div className="max-w-3xl mx-auto">
          <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : (editingQuote ? 'Salvar Alterações' : 'Criar Cotação')}
          </Button>
        </div>
      </div>
    </div>
  );
};

// 4. Visão do Fornecedor
const SupplierView = ({ supplierAuth, setView }) => {
  const [quote, setQuote] = useState(null);
  const [prices, setPrices] = useState(supplierAuth.existingData?.prices || {});
  const [notes, setNotes] = useState(supplierAuth.existingData?.notes || {}); 
  const [status, setStatus] = useState(supplierAuth.existingData?.status || 'draft');
  const [loading, setLoading] = useState(true);
  const [expandedNote, setExpandedNote] = useState(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const docRef = getDocRef('quotes', supplierAuth.quoteId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setQuote({ id: docSnap.id, ...docSnap.data() });
          if(!supplierAuth.existingData) {
            const initialPrices = {};
            setPrices(initialPrices);
          }
        } else {
          alert("Erro ao carregar cotação.");
          setView('home');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, [supplierAuth, setView]);

  const getPriceValue = (item, index) => {
    if (prices[item.id] !== undefined) return prices[item.id];
    if (prices[index] !== undefined) return prices[index]; 
    return '';
  };

  const getNoteValue = (item, index) => {
    if (notes[item.id] !== undefined) return notes[item.id];
    if (notes[index] !== undefined) return notes[index]; 
    return '';
  };

  const handlePriceChange = (item, value) => {
    if(status === 'final') return;
    const cleanValue = value.replace(/[^0-9.,]/g, '');
    if(item.id) setPrices(prev => ({ ...prev, [item.id]: cleanValue }));
  };

  const handleNoteChange = (item, value) => {
    if(status === 'final') return;
    if(item.id) setNotes(prev => ({ ...prev, [item.id]: value }));
  };

  const handleSave = async (newStatus = 'draft') => {
    setLoading(true);
    try {
      const data = {
        quoteId: supplierAuth.quoteId,
        supplierName: supplierAuth.name,
        password: supplierAuth.password,
        prices, 
        notes, 
        status: newStatus,
        submittedAt: serverTimestamp()
      };

      if (supplierAuth.responseId) {
         await setDoc(getDocRef('responses', supplierAuth.responseId), data, { merge: true });
      } else {
         const docRef = await addDoc(getCollectionRef('responses'), data);
         supplierAuth.responseId = docRef.id; 
      }

      setStatus(newStatus);
      if(newStatus === 'final') {
        alert("Cotação finalizada e enviada!");
      } else {
        alert("Rascunho salvo com sucesso.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  if (quote && quote.status === 'closed') return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-100">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Lock className="text-red-600" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cotação Encerrada</h2>
        <p className="text-gray-600 mb-8">O prazo para envio acabou. Entre em contato com o administrador.</p>
        <Button variant="secondary" onClick={() => setView('home')}>Sair</Button>
    </div>
  );

  if (status === 'final') return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-green-50">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="text-green-600" size={40} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Tudo Certo!</h2>
      <p className="text-gray-600 mb-6">Sua cotação foi finalizada e enviada para o comprador.</p>
      <p className="text-sm text-gray-500 mb-8 bg-white p-4 rounded-lg shadow-sm">
         Deseja corrigir algo? Clique em "Reabrir" abaixo para editar.
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => setView('home')}>Sair</Button>
        <Button variant="outline" onClick={() => handleSave('draft')} icon={Edit3}>Reabrir Edição</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
       <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-2">
                <button onClick={() => setView('home')} className="text-gray-400">
                <ArrowLeft size={20} />
                </button>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Olá, {supplierAuth.name}</span>
             </div>
             <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">
                Rascunho
             </div>
          </div>
          <h1 className="font-bold text-xl text-gray-900">{quote.title}</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        <div className="space-y-3">
          {quote.items.map((item, index) => (
            <Card key={item.id || index} className="p-4">
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex-1">
                    <p className="font-bold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">Qtd: {item.quantity} {item.unit}</p>
                </div>
                <div className="w-32">
                    <label className="text-xs text-gray-500 mb-1 block">Preço Unit. (R$)</label>
                    <input 
                    type="text"
                    inputMode="decimal"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-right font-medium text-lg"
                    placeholder="0,00"
                    value={getPriceValue(item, index)}
                    onChange={(e) => handlePriceChange(item, e.target.value)}
                    />
                </div>
              </div>
              <div className="mt-2">
                {expandedNote === index || getNoteValue(item, index) ? (
                  <div className="relative animate-in fade-in slide-in-from-top-1">
                    <input 
                      className="w-full px-3 py-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-700 placeholder-yellow-400/70 focus:outline-none focus:border-yellow-400"
                      placeholder="Ex: Leve 2 pague R$ 5,00"
                      value={getNoteValue(item, index)}
                      onChange={(e) => handleNoteChange(item, e.target.value)}
                    />
                    <span className="absolute right-2 top-2 text-yellow-400"><MessageSquare size={14}/></span>
                  </div>
                ) : (
                  <button 
                    onClick={() => setExpandedNote(index)}
                    className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 font-medium"
                  >
                    + Adicionar observação/desconto
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg z-20">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Button className="flex-1" variant="secondary" onClick={() => handleSave('draft')} icon={Save}>
            Salvar
          </Button>
          <Button className="flex-[2]" variant="success" onClick={() => handleSave('final')} icon={Send}>
            Finalizar e Enviar
          </Button>
        </div>
      </div>
    </div>
  );
};

// 5. Resultados
const ResultsView = ({ quote, setView }) => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleSuppliers, setVisibleSuppliers] = useState([]); 
  const [showFilters, setShowFilters] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  useEffect(() => {
    if(!quote) return;
    const q = query(getCollectionRef('responses'));
    const unsub = onSnapshot(q, (snapshot) => {
      const allResponses = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const filtered = allResponses.filter(r => r.quoteId === quote.id);
      setResponses(filtered);
      if(loading) setVisibleSuppliers(filtered.map(r => r.supplierName));
      setLoading(false);
    });
    return () => unsub();
  }, [quote]); 

  const comparison = useMemo(() => {
    if (!quote || responses.length === 0) return [];

    return quote.items.map((item, idx) => {
      let minPrice = Infinity;
      let winner = null;

      const priceData = responses.map(r => {
        let raw = undefined;
        if (item.id && r.prices[item.id] !== undefined) raw = r.prices[item.id];
        else if (r.prices[idx] !== undefined) raw = r.prices[idx];
        
        let note = undefined;
        if (item.id && r.notes && r.notes[item.id]) note = r.notes[item.id];
        else if (r.notes && r.notes[idx]) note = r.notes[idx];
        
        if (!raw) return { supplier: r.supplierName, price: null, raw: '-', note };
        
        const val = parseFloat(raw.replace(',', '.'));
        if (!isNaN(val)) {
          if (val < minPrice) {
            minPrice = val;
            winner = r.supplierName;
          }
          return { supplier: r.supplierName, price: val, raw: raw, note };
        }
        return { supplier: r.supplierName, price: null, raw: raw, note };
      });

      return {
        item: item,
        prices: priceData,
        winner: winner,
        minPrice: minPrice === Infinity ? null : minPrice
      };
    });
  }, [quote, responses]);

  const basketTotals = useMemo(() => {
    const totals = {};
    const winnersCount = {}; 

    responses.forEach(r => {
      totals[r.supplierName] = 0;
      winnersCount[r.supplierName] = 0;
    });

    comparison.forEach(row => {
      if(row.winner) {
         winnersCount[row.winner] = (winnersCount[row.winner] || 0) + 1;
      }
      row.prices.forEach(p => {
        if (p.price && row.item.quantity) {
           const qty = parseFloat(row.item.quantity) || 1;
           totals[p.supplier] += (p.price * qty);
        }
      });
    });
    return { totals, winnersCount };
  }, [comparison, responses]);

  const handleWhatsApp = (supplierName) => {
    let msg = `RESULTADO COTAÇÃO TAGAVAS: ${quote.title}\n\n`;
    msg += `-----------------------------------\n`;
    msg += `PEDIDO PARA: ${supplierName.toUpperCase()}\n`;
    msg += `-----------------------------------\n`;
    
    let hasItems = false;
    comparison.forEach(row => {
        if(row.winner === supplierName) {
            hasItems = true;
            msg += `${row.item.name} - ${row.item.quantity}${row.item.unit} (R$ ${row.minPrice.toFixed(2)})\n`;
        }
    });

    if (!hasItems) return alert("Este fornecedor não venceu nenhum item.");
    
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleExport = () => {
    let exportText = `RESULTADO COTAÇÃO TAGAVAS: ${quote.title}\n\n`;
    const winsBySupplier = {};
    comparison.forEach(row => {
        if(row.winner) {
            if(!winsBySupplier[row.winner]) winsBySupplier[row.winner] = [];
            winsBySupplier[row.winner].push({
                name: row.item.name,
                qty: row.item.quantity,
                unit: row.item.unit,
                price: row.minPrice
            });
        }
    });
    Object.keys(winsBySupplier).forEach(supplier => {
        exportText += `-----------------------------------\n`;
        exportText += `PEDIDO PARA: ${supplier.toUpperCase()}\n`;
        exportText += `-----------------------------------\n`;
        winsBySupplier[supplier].forEach(item => {
            exportText += `${item.name} - ${item.qty}${item.unit} (R$ ${item.price.toFixed(2)})\n`;
        });
        exportText += `\n`;
    });
    const element = document.createElement("a");
    const file = new Blob([exportText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `pedido-${quote.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element);
  };

  const toggleSupplierVisibility = (name) => {
      setVisibleSuppliers(prev => 
        prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
      );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
       <header className="bg-white border-b sticky top-0 z-10 shadow-sm print:hidden">
        <div className="w-full px-4 py-4 flex flex-col gap-4">
           <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => setView('admin_dashboard')} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} />
                    </button>
                    <div>
                    <h1 className="font-bold text-lg text-gray-900">{quote?.title}</h1>
                    <p className="text-xs text-gray-500">{responses.length} fornecedores responderam</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Botão de Senhas */}
                    <Button variant="ghost" className="text-sm px-3" onClick={() => setShowCredentials(!showCredentials)} title="Ver Senhas dos Fornecedores">
                        {showCredentials ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                    <Button variant="secondary" className="text-sm px-3" onClick={() => setShowFilters(!showFilters)} icon={Filter}>
                         Filtros
                    </Button>
                    <Button variant="success" className="text-sm px-3 hidden sm:flex" onClick={handleExport} icon={Download}>
                        Exportar
                    </Button>
                </div>
           </div>
           
           {/* Área de Credenciais (Admin Only) */}
           {showCredentials && (
             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 animate-in slide-in-from-top-2">
               <h3 className="text-xs font-bold text-yellow-800 uppercase mb-2 flex items-center gap-2">
                 <Key size={14}/> Senhas dos Fornecedores (Uso Interno)
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                 {responses.map(r => (
                   <div key={r.id} className="text-sm bg-white p-2 rounded border border-yellow-100 flex justify-between">
                     <span className="font-medium text-gray-700">{r.supplierName}</span>
                     <span className="font-mono text-gray-500 bg-gray-100 px-1 rounded">{r.password || 'Sem senha'}</span>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {/* Filtros */}
           {showFilters && (
               <div className="flex gap-2 flex-wrap bg-gray-50 p-3 rounded-lg border border-gray-200 animate-in slide-in-from-top-2">
                   <span className="text-xs font-bold text-gray-500 w-full">Mostrar Colunas:</span>
                   {responses.map(r => (
                       <button 
                        key={r.id}
                        onClick={() => toggleSupplierVisibility(r.supplierName)}
                        className={`px-3 py-1 text-xs rounded-full border ${visibleSuppliers.includes(r.supplierName) ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500'}`}
                       >
                           {r.supplierName} {r.status === 'final' && '✅'}
                       </button>
                   ))}
               </div>
           )}
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 space-y-6">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
        ) : responses.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Store size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium">Ainda sem respostas</h3>
            <p>Envie o código <strong>{quote.id}</strong> para seus fornecedores.</p>
          </div>
        ) : (
          <div className="space-y-8">
             {/* Totals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(basketTotals.totals)
                .filter(([name]) => visibleSuppliers.includes(name))
                .map(([supplier, total]) => {
                  const response = responses.find(r => r.supplierName === supplier);
                  const isFinal = response?.status === 'final';
                  const isWinner = basketTotals.winnersCount[supplier] > 0;
                  
                  return (
                    <Card key={supplier} className={`p-4 border-l-4 ${isFinal ? 'border-l-green-500 bg-green-50/30' : 'border-l-blue-500'} relative overflow-visible group`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Total Cotação</p>
                            <h3 className="font-bold text-gray-800 truncate flex items-center gap-1">
                                {supplier}
                                {isFinal && <CheckCircle size={14} className="text-green-600" />}
                            </h3>
                        </div>
                        {isFinal ? 
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">Finalizado</span> :
                            <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold uppercase">Rascunho</span>
                        }
                    </div>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                        {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    
                    {/* Botão WhatsApp só aparece se venceu algo */}
                    {isWinner && (
                        <button 
                            onClick={() => handleWhatsApp(supplier)}
                            className="absolute -bottom-3 -right-3 bg-[#25D366] text-white p-2 rounded-full shadow-lg hover:bg-[#128C7E] transition-transform hover:scale-110 flex items-center gap-1 text-xs font-bold pr-3"
                            title="Enviar pedido no WhatsApp"
                        >
                            <MessageCircle size={16} /> Pedir
                        </button>
                    )}
                    </Card>
                  );
              })}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 font-bold border-b">
                  <tr>
                    <th className="p-4 min-w-[200px] sticky left-0 bg-gray-50 border-r z-10">Produto</th>
                    <th className="p-4 min-w-[150px] text-center bg-yellow-50 text-yellow-800 border-r border-yellow-100">🏆 Vencedor</th>
                    {responses.filter(r => visibleSuppliers.includes(r.supplierName)).map(r => (
                      <th key={r.id} className="p-4 min-w-[120px] text-center">
                          {r.supplierName}
                          {r.status === 'final' && <span className="ml-1 text-green-500" title="Finalizado">●</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {comparison.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="p-4 sticky left-0 bg-white border-r font-medium text-gray-800 z-10">
                        {row.item.name}
                        <div className="text-xs text-gray-400 font-normal">{row.item.quantity} {row.item.unit}</div>
                      </td>
                      <td className="p-4 text-center bg-yellow-50/30 border-r border-yellow-100">
                         {row.winner ? (
                             <div className="flex flex-col items-center">
                                 <span className="font-bold text-yellow-700">{row.winner}</span>
                                 <span className="text-xs font-bold bg-green-100 text-green-700 px-2 rounded-full">
                                     R$ {row.minPrice?.toFixed(2)}
                                 </span>
                             </div>
                         ) : <span className="text-gray-300">-</span>}
                      </td>
                      {row.prices
                        .filter(p => visibleSuppliers.includes(p.supplier))
                        .map((p, idx) => {
                        const isWinner = row.winner === p.supplier;
                        return (
                          <td key={idx} className={`p-4 text-center border-l relative ${isWinner ? 'bg-green-50' : ''}`}>
                            <div className={`font-medium ${isWinner ? 'text-green-700 font-bold' : 'text-gray-600'}`}>
                               {p.raw === '-' ? '-' : `R$ ${p.raw}`}
                            </div>
                            {p.note && (
                                <div className="group absolute top-1 right-1">
                                    <MessageSquare size={14} className="text-blue-400 cursor-help" />
                                    <div className="hidden group-hover:block absolute bottom-full right-0 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-20 mb-1 text-left">
                                        Obs: {p.note}
                                    </div>
                                </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- App Principal ---

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); 
  const [quoteIdToEnter, setQuoteIdToEnter] = useState(null);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [supplierAuth, setSupplierAuth] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const authInstance = getAuth(app);
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(authInstance, __initial_auth_token);
        } else {
          await signInAnonymously(authInstance);
        }
      } catch (e) {
        console.error("Auth error", e);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  if (!user) return <div className="flex h-screen items-center justify-center text-gray-400 text-sm">Conectando seguro...</div>;

  const renderView = () => {
    switch(view) {
      case 'home':
        return <HomeScreen setView={setView} setQuoteIdToEnter={setQuoteIdToEnter} />;
      case 'admin_login':
        return <AdminLogin setView={setView} />;
      case 'supplier_login':
        return <SupplierLogin setView={setView} setSupplierAuth={setSupplierAuth} />;
      case 'admin_dashboard':
        return <AdminDashboard userId={user.uid} setView={setView} setCurrentQuote={setCurrentQuote} />;
      case 'create_quote':
        return <CreateQuote userId={user.uid} setView={setView} />;
      case 'edit_quote': 
        return <CreateQuote userId={user.uid} setView={setView} editingQuote={currentQuote} />;
      case 'supplier_view':
        return <SupplierView supplierAuth={supplierAuth} setView={setView} />;
      case 'admin_results':
        return <ResultsView quote={currentQuote} setView={setView} />;
      default:
        return <HomeScreen setView={setView} />;
    }
  };

  return (
    <div className="font-sans text-gray-900 bg-gray-100 min-h-screen">
      {renderView()}
    </div>
  );
}
