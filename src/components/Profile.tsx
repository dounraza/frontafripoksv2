import React, { useState, useEffect } from 'react';
import { X, Image, Loader2, Save } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  avatar_url?: string | null;
  mobile_money_provider?: string | null;
  mobile_money_number?: string | null;
  mobile_money_account_name?: string | null;
  chips?: string | number;
}

interface ProfileProps {
  currentUser: { token: string; name: string; id: string };
  onClose: () => void;
  onProfileUpdate: (updatedUser: UserProfile) => void;
}

export const Profile: React.FC<ProfileProps> = ({ currentUser, onClose, onProfileUpdate }) => {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/user/profile`, {
          headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const userData = data.user || data;
          setProfileData(userData);
          if (userData.avatar_url) {
            const fullUrl = userData.avatar_url.startsWith('http') 
              ? userData.avatar_url 
              : `${API_URL}${userData.avatar_url}`;
            setPreviewUrl(fullUrl);
          }
        }
      } catch (err) {
        console.error("Erreur chargement profil", err);
      }
    };
    fetchProfile();
  }, [currentUser.token, API_URL]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('mobile_money_provider', profileData.mobile_money_provider || '');
      formData.append('mobile_money_number', profileData.mobile_money_number || '');
      formData.append('mobile_money_account_name', profileData.mobile_money_account_name || '');
      
      if (avatarFile) {
        // On envoie le fichier sous le nom 'avatar'
        formData.append('avatar', avatarFile);
      }

      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${currentUser.token}` },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        
        // On fusionne pour ne pas perdre les données si le serveur renvoie null
        const updatedUser = { 
          ...profileData, 
          ...(result.user || result) 
        };

        // Si le serveur a bien traité l'image, il renvoie un nouveau avatar_url
        if (result.user?.avatar_url || result.avatar_url) {
          const newUrl = result.user?.avatar_url || result.avatar_url;
          const fullUrl = newUrl.startsWith('http') ? newUrl : `${API_URL}${newUrl}`;
          setPreviewUrl(fullUrl);
        }

        setProfileData(updatedUser);
        onProfileUpdate(updatedUser);
        setSuccessMessage("Profil mis à jour !");
        setAvatarFile(null);
      } else {
        console.error("Erreur lors de la mise à jour");
      }
    } catch (err) {
      console.error("Erreur réseau", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[3000] flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-yellow-500/30 shadow-2xl w-full max-w-sm relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X /></button>
        <h2 className="text-xl font-black text-yellow-500 mb-6 uppercase text-center">Mon Profil</h2>

        {successMessage && (
          <div className="absolute top-16 left-0 right-0 mx-auto w-max bg-green-600 text-white px-4 py-1 rounded-full text-[10px] font-bold animate-fade-in-down z-50">
            {successMessage}
          </div>
        )}

        {profileData ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center relative group">
              <img 
                src={previewUrl || `https://api.dicebear.com/9.x/adventurer/svg?seed=${profileData.name}`} 
                alt="Avatar" 
                className="w-24 h-24 rounded-full border-2 border-yellow-500 object-cover" 
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Image className="text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>

            <div className="text-center">
              <p className="text-white font-black text-lg">{profileData.name}</p>
              <div className="text-yellow-500 font-bold text-sm">
                {Number(profileData.chips || 0).toLocaleString()} JETONS
              </div>
            </div>
            
            <div className="border-t border-white/10 pt-4">
              <label className="text-[10px] text-yellow-500/50 uppercase font-bold ml-1">Informations de Paiement</label>
              <input 
                placeholder="Fournisseur (ex: Orange, MTN)" 
                value={profileData.mobile_money_provider || ''} 
                onChange={(e) => setProfileData({...profileData, mobile_money_provider: e.target.value})} 
                className="w-full bg-black border border-white/10 p-3 rounded text-white mb-2 focus:border-yellow-500/50 outline-none text-sm" 
              />
              <input 
                placeholder="Numéro de téléphone" 
                value={profileData.mobile_money_number || ''} 
                onChange={(e) => setProfileData({...profileData, mobile_money_number: e.target.value})} 
                className="w-full bg-black border border-white/10 p-3 rounded text-white mb-2 focus:border-yellow-500/50 outline-none text-sm" 
              />
              <input 
                placeholder="Nom complet du titulaire" 
                value={profileData.mobile_money_account_name || ''} 
                onChange={(e) => setProfileData({...profileData, mobile_money_account_name: e.target.value})} 
                className="w-full bg-black border border-white/10 p-3 rounded text-white focus:border-yellow-500/50 outline-none text-sm" 
              />
            </div>

            <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all mt-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : <><Save size={16} /> Enregistrer</>}
            </button>
          </form>
        ) : (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-yellow-500" />
          </div>
        )}
      </div>
    </div>
  );
};