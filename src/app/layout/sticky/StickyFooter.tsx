
import React from 'react';
import './sticky.css';

export const StickyFooter: React.FC = ({ children }) => (
  <footer className="sticky-footer">{children}</footer>
);
