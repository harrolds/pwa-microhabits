
import React from 'react';
import { useSheetHost } from './sheetStore';
import './sheet.css';

export const SheetHost: React.FC = () => {
  const { id } = useSheetHost();
  return <div className={id ? 'sheet open' : 'sheet'}>{id}</div>;
};
