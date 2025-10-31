import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800/50 mt-12 py-6">
      <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} 도8도8. All rights reserved.</p>
        <p className="mt-2">학교 주소 : 경기 분당구 하오개로 351번길 4</p>
      </div>
    </footer>
  );
};

export default Footer;
