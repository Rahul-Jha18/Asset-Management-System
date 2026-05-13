import React, { useEffect, useRef } from "react";


const NL_BLUE    = "#0760b967";
const NL_BLUE2   = "#1474F3";
const NL_RED     = "#ee06198e";
const NL_GRADIENT = `linear-gradient(135deg, ${NL_BLUE} 0%, ${NL_BLUE2} 55%, ${NL_RED} 100%)`;
const NL_GRADIENT_90 = `linear-gradient(90deg, ${NL_BLUE} 70%, ${NL_RED} 30%)`;

export const Modal = ({
  isOpen,
  title,
  children,
  onClose,
  actions,
  size = "medium",
  closeButton = false,
}) => {
  const bodyRef = useRef(null);

  useEffect(() => {
    if (isOpen && bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (isOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const sizeMap = {
    small: "420px",
    medium: "720px",
    large: "960px",
    xlarge: "1140px",
  };

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(21, 26, 36, 0.75)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        style={{
          width: "100%",
          maxWidth: sizeMap[size] || sizeMap.medium,
          maxHeight: "90vh",
          overflow: "hidden",
          borderRadius: "18px",
          background: NL_GRADIENT_90,
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.22)",
          boxShadow: "0 20px 60px rgba(2, 6, 23, 0.28)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {closeButton && (
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 34,
              height: 34,
              border: "none",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.18)",
              color: "#fff",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
              display: "grid",
              placeItems: "center",
              zIndex: 5,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            ×
          </button>
        )}

        {title && (
          <div
            className="modal-header"
            style={{
              padding: 0,
              margin: 0,
              flexShrink: 0,
            }}
          >
            {title}
          </div>
        )}

        <div
          ref={bodyRef}
          className="modal-body"
          style={{
            padding: 0,
            margin: 0,
            overflowY: "auto",
            flex: 1,
          }}
        >
          {children}
        </div>

        {actions && (
          <div
            className="modal-footer"
            style={{
              padding: 0,
              margin: 0,
              flexShrink: 0,
            }}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;