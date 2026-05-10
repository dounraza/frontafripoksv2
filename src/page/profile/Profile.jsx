import React, { useState } from 'react';
import Nav from '../../component/nav/Nav';
import { updateProfile } from '../../services/profileService';
import './Profile.scss';

const avatars = Array.from({ length: 19 }, (_, i) => `/avatars/${i}.png`);

const Profile = () => {
    const userId = sessionStorage.getItem('userId');
    const [pseudo, setPseudo] = useState(sessionStorage.getItem('userName') || '');
    const [selectedAvatar, setSelectedAvatar] = useState(sessionStorage.getItem('avatar') || '/avatars/0.png');
    const [avatarFile, setAvatarFile] = useState(null);
    const [provider, setProvider] = useState('');
    const [number, setNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [showModal, setShowModal] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setSelectedAvatar(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const formData = new FormData();
            formData.append('pseudo', pseudo);
            formData.append('mobile_money_provider', provider);
            formData.append('mobile_money_number', number);
            formData.append('mobile_money_account_name', accountName);
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            } else {
                formData.append('avatar_url', selectedAvatar);
            }

            const response = await updateProfile(userId, formData);
            
            // Le backend renvoie { success: true, user: { ... } }
            const newAvatarUrl = response.user.avatar_url || selectedAvatar;
            
            sessionStorage.setItem('userName', pseudo);
            sessionStorage.setItem('avatar', newAvatarUrl);
            alert('Profil mis à jour avec succès !');
            setShowModal(false);
        } catch (error) {
            console.error(error);
            alert('Erreur lors de la mise à jour.');
        }
    };

    return (
        <div className="profile-container">
            <Nav />
            <div className="profile-content">
                <h2>Mon Profil</h2>
                <div className="profile-card">
                    <img src={selectedAvatar} alt="Avatar" className="profile-avatar" />
                    <div className="profile-info">
                        <h3>{pseudo}</h3>
                        <button className="edit-btn" onClick={() => setShowModal(true)}>Modifier Profil</button>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="profile-modal">
                        <h3>Modifier Profil</h3>
                        <input 
                            type="text" 
                            value={pseudo} 
                            onChange={(e) => setPseudo(e.target.value)} 
                            placeholder="Nouveau pseudo"
                        />
                        <input 
                            type="text" 
                            value={provider} 
                            onChange={(e) => setProvider(e.target.value)} 
                            placeholder="Fournisseur (ex: Orange, Airtel)"
                        />
                        <input 
                            type="text" 
                            value={number} 
                            onChange={(e) => setNumber(e.target.value)} 
                            placeholder="Numéro Mobile Money"
                        />
                        <input 
                            type="text" 
                            value={accountName} 
                            onChange={(e) => setAccountName(e.target.value)} 
                            placeholder="Nom du compte"
                        />
                        <label className="file-input-label">
                            Ou choisir une image locale :
                            <input type="file" onChange={handleFileChange} accept="image/*" />
                        </label>
                        <div className="avatar-selector">
                            {avatars.map(avatar => (
                                <img 
                                    key={avatar} 
                                    src={avatar} 
                                    alt="Avatar" 
                                    className={selectedAvatar === avatar ? 'active' : ''}
                                    onClick={() => setSelectedAvatar(avatar)}
                                />
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowModal(false)}>Annuler</button>
                            <button className="confirm-btn" onClick={handleUpdateProfile}>Enregistrer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;