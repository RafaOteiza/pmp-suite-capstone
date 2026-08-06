import React from "react";
import { AlertCircle, CheckCircle, Info, XCircle, X } from "lucide-react";

export type ModalType = 'confirm' | 'error' | 'success' | 'info';

interface CustomModalProps {
    isOpen: boolean;
    type: ModalType;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

const modalStyles: { [key: string]: React.CSSProperties } = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: 'fadeIn 0.2s ease-out'
    },
    container: {
        backgroundColor: '#111827',
        border: '1px solid #374151',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '450px',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        animation: 'slideUp 0.3s ease-out'
    },
    iconSection: {
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'center'
    },
    title: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: '12px'
    },
    message: {
        fontSize: '0.95rem',
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: '28px',
        lineHeight: '1.5'
    },
    footer: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'center'
    }
};

const getIcon = (type: ModalType) => {
    switch (type) {
        case 'confirm': return <AlertCircle size={48} color="#F59E0B" />;
        case 'error': return <XCircle size={48} color="#EF4444" />;
        case 'success': return <CheckCircle size={48} color="#10B981" />;
        default: return <Info size={48} color="#3B82F6" />;
    }
};

const getConfirmBg = (type: ModalType) => {
    switch (type) {
        case 'confirm': return '#F59E0B';
        case 'error': return '#EF4444';
        case 'success': return '#10B981';
        default: return '#3B82F6';
    }
};

export default function CustomModal({ isOpen, type, title, message, onConfirm, onCancel, confirmText, cancelText }: CustomModalProps) {
    if (!isOpen) return null;

    return (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.container}>
                <button onClick={onCancel} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                    <X size={20} />
                </button>
                
                <div style={modalStyles.iconSection}>
                    {getIcon(type)}
                </div>

                <h3 style={modalStyles.title}>{title}</h3>
                <p style={modalStyles.message}>{message}</p>

                <div style={modalStyles.footer}>
                    {type === 'confirm' && (
                        <button className="btn ghost" onClick={onCancel} style={{ padding: '10px 24px', borderRadius: '10px' }}>
                            {cancelText || 'Cancelar'}
                        </button>
                    )}
                    <button 
                        className="btn" 
                        onClick={onConfirm} 
                        style={{ 
                            padding: '10px 24px', 
                            borderRadius: '10px', 
                            backgroundColor: getConfirmBg(type), 
                            color: 'white', 
                            border: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        {confirmText || (type === 'confirm' ? 'Aceptar' : 'Cerrar')}
                    </button>
                </div>
            </div>
            
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
        </div>
    );
}
