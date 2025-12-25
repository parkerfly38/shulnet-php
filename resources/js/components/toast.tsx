import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose?: () => void;
  duration?: number;
}

export default function Toast({ message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-black/90 text-white px-4 py-2 rounded shadow">{message}</div>
    </div>
  );
}
