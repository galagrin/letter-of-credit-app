import { createPortal } from "react-dom";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
    if (!isOpen) return null;

    return createPortal(
        <div onClick={onClose} className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center">
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg p-8 shadow-lg max-w-lg w-full mx-4 transform transition-all duration-200
             animate-[fadeIn_0.4s_ease-out]"
            >
                {children}
            </div>
        </div>,
        document.body
    );
};
