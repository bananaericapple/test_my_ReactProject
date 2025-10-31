import React from 'react';
import { GlobeIcon } from './icons/GlobeIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GlobeIcon />
            <h1 className="text-xl font-bold text-white tracking-wider">My Websites</h1>
          </div>
          <nav>
            <ul className="flex items-center gap-8">
              <li>
                <a href="#" className="text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-semibold">
                  게임
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-indigo-400 transition-colors duration-300 font-semibold">
                  음악
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
