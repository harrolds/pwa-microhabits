
import React from 'react';
import { usePanelHost } from './panelHost';
import './panel.css';

export const RightPanelHost: React.FC = () => {
  const { id } = usePanelHost();
  return <aside className={id ? 'panel-right open' : 'panel-right'}>{id}</aside>;
};
