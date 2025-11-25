
import React from 'react';
import { useOverlayHost } from './overlayStore';
import './overlay.css';

export const OverlayHost: React.FC = () => {
  const { open } = useOverlayHost();
  return open ? <div className="overlay"></div> : null;
};
