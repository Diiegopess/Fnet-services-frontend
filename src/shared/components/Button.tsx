import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button {...props} style={{ padding: '8px 12px', borderRadius: 6 }}>
    {children}
  </button>
);

export default Button;
