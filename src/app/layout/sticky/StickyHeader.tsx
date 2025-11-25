
import React from 'react';
import './sticky.css';

export const StickyHeader: React.FC = ({ children }) => (
  <header className="sticky-header">{children}</header>
);
