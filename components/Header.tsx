import React from 'react';
import { NavLink } from 'react-router-dom';
import { GlobeIcon } from './icons/GlobeIcon';

const Header: React.FC = () => {
  const linkBaseClasses = 'text-gray-300 transition-colors duration-300 font-semibold';

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
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `${linkBaseClasses} ${isActive ? 'text-indigo-400' : 'hover:text-indigo-400'}`
                  }
                >
                  대시보드
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/ai-studio"
                  className={({ isActive }) =>
                    `${linkBaseClasses} ${isActive ? 'text-indigo-400' : 'hover:text-indigo-400'}`
                  }
                >
                  AI Studio 페이지
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
