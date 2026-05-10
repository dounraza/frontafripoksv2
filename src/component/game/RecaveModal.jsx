import React from 'react';
import './RecaveModal.scss';

const RecaveModal = ({ isOpen, onClose, onRecave }) => {
    if (!isOpen) return null;

    return (
        <div className="recave-modal-overlay">
            <div className="recave-modal-content">
                <h2>Solde insuffisant</h2>
                <p>Votre solde est à 0. Voulez-vous effectuer une recave ?</p>
                <div className="recave-actions">
                    <button className="cancel-btn" onClick={onClose}>Quitter</button>
                    <button className="confirm-btn" onClick={onRecave}>Recaver</button>
                </div>
            </div>
        </div>
    );
};

export default RecaveModal;
