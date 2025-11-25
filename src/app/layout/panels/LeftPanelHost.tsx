
import React from 'react';
import { usePanelHost } from './panelHost';
import './panel.css';

export const LeftPanelHost: React.FC = () => {
  const { id } = usePanelHost();
  return <aside className={id ? 'panel-left open' : 'panel-left'}>{id}</aside>;
};
