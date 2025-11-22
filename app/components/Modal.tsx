import { createPortal } from "react-dom";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
};
// Стили для подложки
const OVERLAY_STYLES: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    zIndex: 1000, // Должно быть поверх всего
};

// Стили для самого окна
const MODAL_STYLES: React.CSSProperties = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)", // Центрируем окно
    backgroundColor: "#FFF",
    padding: "50px",
    zIndex: 1000,
    borderRadius: "8px",
};

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
    if (!isOpen) return null;

    return createPortal(
        <div onClick={onClose} style={OVERLAY_STYLES}>
            <div onClick={(e) => e.stopPropagation()} style={MODAL_STYLES}>
                {children}
            </div>
        </div>,
        document.body
    );
};
