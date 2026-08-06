import { useState, useCallback } from "react";
import { ModalType } from "../components/CustomModal";

export interface ModalState {
    isOpen: boolean;
    type: ModalType;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
}

export function useAlert() {
    const [modal, setModal] = useState<ModalState>({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
        onConfirm: () => {}
    });

    const showAlert = useCallback((type: ModalType, title: string, message: string, onConfirm?: () => void, confirmText?: string) => {
        setModal({
            isOpen: true,
            type,
            title,
            message,
            onConfirm: onConfirm || (() => {}),
            confirmText
        });
    }, []);

    const showConfirm = useCallback((title: string, message: string, onConfirm: () => void, confirmText?: string) => {
        setModal({
            isOpen: true,
            type: 'confirm',
            title,
            message,
            onConfirm,
            confirmText
        });
    }, []);

    const closeAlert = useCallback(() => {
        setModal(prev => ({ ...prev, isOpen: false }));
    }, []);

    return {
        modal,
        showAlert,
        showConfirm,
        closeAlert
    };
}
