import { useEffect } from 'react';

export default function Modal({
  isOpen,
  title,
  onClose,
  children,
  footer,
  maxWidthClassName = 'max-w-2xl',
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
      <div className={`w-full ${maxWidthClassName} rounded-2xl bg-white shadow-xl overflow-hidden my-auto`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="font-semibold text-slate-900">{title}</div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-xl leading-none">✕</button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>

        {footer ? <div className="px-5 py-4 border-t border-slate-200 bg-slate-50">{footer}</div> : null}
      </div>
    </div>
  );
}
