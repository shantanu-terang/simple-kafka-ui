import { useEffect } from "react";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    customStyle?: React.CSSProperties;
};

export function Modal({ isOpen, onClose, title, children, customStyle }: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: { key: string; }) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = (e: { target: unknown; currentTarget: unknown; }) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={`modal ${!isOpen ? 'hidden' : ''}`} onClick={handleBackdropClick}>
            <div className="modal-content" style={{ maxWidth: '500px', margin: 'auto', ...customStyle }}>
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};