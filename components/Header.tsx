
import React from 'react';
import { MagicIcon } from './icons/MagicIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-lg sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <MagicIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              FormGenie
            </h1>
          </div>
          <p className="hidden md:block text-sm text-slate-500 dark:text-slate-400">
            Instantly convert text to forms with AI
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
