
import React from 'react';
import { useToastHost } from './toastStore';
import './toast.css';

export const ToastHost: React.FC = () => {
  const { items, remove } = useToastHost();
  return (
    <div className="toast-container">
      {items.map(t=>(
        <div key={t.id} className={'toast '+t.variant} onClick={()=>remove(t.id)}>
          {t.text}
        </div>
      ))}
    </div>
  );
};
