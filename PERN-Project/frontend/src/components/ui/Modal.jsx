import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Reusable Jira-style Modal Component
 * Handles backdrop, centering, animations, and dismissal via ESC/outside click.
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  icon: Icon, 
  children, 
  maxWidth = "max-w-md" 
}) => {
  const modalRef = useRef(null);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Handle outside click to close
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={handleBackdropClick}
      />

      {/* Modal Container */}
      <div 
        ref={modalRef}
        className={`relative bg-white w-full ${maxWidth} rounded-2xl shadow-2xl border border-ads-border overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-ads-border flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-ads-primary" />
              </div>
            )}
            <h3 className="text-lg font-bold text-ads-text truncate">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ads-text-subtlest hover:text-ads-text hover:bg-ads-surface transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable if too long */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
