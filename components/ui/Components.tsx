import React, { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  className = '', 
  children, 
  ...props 
}) => {
  const baseStyles = "w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-pink-600 hover:bg-pink-700 text-white focus:ring-pink-500",
    secondary: "bg-gray-800 hover:bg-gray-900 text-white focus:ring-gray-600",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
    outline: "border-2 border-pink-600 text-pink-600 hover:bg-pink-50 focus:ring-pink-500"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors ${className}`}
        {...props}
      />
    </div>
  );
};

export const Card: React.FC<{ children: ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 ${className}`}>
      {title && <h3 className="text-lg font-bold text-gray-800 mb-3">{title}</h3>}
      {children}
    </div>
  );
};

export const ResultCard: React.FC<{ label: string; value: string; icon?: ReactNode; highlight?: boolean }> = ({ label, value, icon, highlight }) => {
  return (
    <div className={`rounded-lg p-4 flex flex-col items-start justify-between ${highlight ? 'bg-pink-50 border border-pink-200' : 'bg-gray-50 border border-gray-200'}`}>
      <div className="text-sm text-gray-500 font-medium mb-1 flex items-center gap-2">
        {icon}
        {label}
      </div>
      <div className={`text-xl font-bold ${highlight ? 'text-pink-700' : 'text-gray-900'}`}>
        {value}
      </div>
    </div>
  );
};