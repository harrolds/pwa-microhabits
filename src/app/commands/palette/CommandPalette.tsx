
import React, { useState } from 'react';
import './palette.css';

export const CommandPalette:React.FC = ()=>{
  const [open,set]=useState(false);
  return (
    <>
      <button onClick={()=>set(true)}>Commands</button>
      {open && (
        <div className="palette">
          <input placeholder="Type command..." autoFocus />
        </div>
      )}
    </>
  );
};
