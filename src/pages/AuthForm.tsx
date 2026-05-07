import React, { useState } from 'react';
// @ts-ignore
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

interface AuthFormProps {
  onSuccess: (token: string, username: string, id: string) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { name, email, password };
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Erreur authentification');
      
      if (isLogin) {
        localStorage.setItem('poker_user', JSON.stringify({
          token: data.token,
          name: data.name,
          id: data.id
        }));
        onSuccess(data.token, data.name, data.id);
      } else {
        setIsLogin(true);
        setError('Compte créé, connectez-vous');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-black/80 p-8 rounded-2xl border border-white/10 w-96 shadow-2xl flex flex-col items-center">
        <img src="/font.png" alt="Logo" className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-black text-yellow-500 mb-6 uppercase tracking-widest text-center">
          {isLogin ? 'Connexion' : 'Inscription'}
        </h2>
        {error && <p className="text-red-500 text-xs mb-4 text-center">{error}</p>}
        {!isLogin && (
          <input className="w-full bg-gray-900 border border-white/10 p-3 rounded-lg mb-4 text-white" type="text" placeholder="Nom complet" value={name} onChange={e => setName(e.target.value)} required disabled={isLoading} />
        )}
        <input className="w-full bg-gray-900 border border-white/10 p-3 rounded-lg mb-4 text-white" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
        <input className="w-full bg-gray-900 border border-white/10 p-3 rounded-lg mb-6 text-white" type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
        <button 
          className="w-full bg-yellow-500 text-black font-black py-3 rounded-lg hover:bg-yellow-400 transition-all uppercase flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
        </button>
        <p className="mt-4 text-center text-xs text-gray-500 cursor-pointer hover:text-white" onClick={() => !isLoading && setIsLogin(!isLogin)}>
          {isLogin ? 'Pas de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
        </p>
      </form>
    </div>
  );
};
