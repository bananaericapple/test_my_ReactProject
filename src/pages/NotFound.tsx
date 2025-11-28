import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg p-8 text-center">
      <h1 className="text-3xl font-bold text-white mb-2">페이지를 찾을 수 없습니다</h1>
      <p className="text-gray-300 mb-6">잘못된 경로이거나 삭제된 페이지입니다.</p>
      <Link
        to="/"
        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
      >
        대시보드로 돌아가기
      </Link>
    </div>
  );
};

export default NotFound;
