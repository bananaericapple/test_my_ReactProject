import React, { useState, useCallback } from 'react';
import { Website, NewWebsiteData } from './types';
import Header from './components/Header';
import WebsiteCard from './components/WebsiteCard';
import AddWebsiteModal from './components/AddWebsiteModal';
import Footer from './components/Footer';
import { PlusIcon } from './components/icons/PlusIcon';

const initialWebsites: Website[] = [
  {
    id: '1',
    name: '나의 블로그',
    url: 'https://example-blog.com',
    description: '기술, 여행, 그리고 일상에 대한 생각을 기록하는 개인 블로그입니다.',
    imageUrl: 'https://picsum.photos/seed/1/600/400',
    tags: ['기술', '여행', '일상'],
  },
  {
    id: '2',
    name: '포트폴리오 사이트',
    url: 'https://example-portfolio.com',
    description: '프론트엔드 개발자로서 진행했던 프로젝트들을 모아놓은 곳입니다.',
    imageUrl: 'https://picsum.photos/seed/2/600/400',
    tags: ['포트폴리오', '프론트엔드', '프로젝트'],
  },
  {
    id: '3',
    name: '사이드 프로젝트: 맛집 지도',
    url: 'https://example-foodmap.com',
    description: '전국 맛집을 공유하고 평가할 수 있는 커뮤니티 기반의 웹 서비스입니다.',
    imageUrl: 'https://picsum.photos/seed/3/600/400',
    tags: ['사이드 프로젝트', '맛집', '커뮤니티'],
  },
];

const App: React.FC = () => {
  const [websites, setWebsites] = useState<Website[]>(initialWebsites);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddWebsite = useCallback((newWebsiteData: NewWebsiteData) => {
    const newWebsite: Website = {
      ...newWebsiteData,
      id: crypto.randomUUID(),
      imageUrl: `https://picsum.photos/seed/${crypto.randomUUID()}/600/400`,
    };
    setWebsites((prev) => [newWebsite, ...prev]);
    setIsModalOpen(false);
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100">나의 웹사이트 목록</h1>
          <button
            onClick={openModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-lg shadow-indigo-600/30"
          >
            <PlusIcon />
            웹사이트 추가
          </button>
        </div>

        {websites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {websites.map((website) => (
              <WebsiteCard key={website.id} website={website} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-300">웹사이트가 없습니다.</h2>
            <p className="text-gray-400 mt-2">새로운 웹사이트를 추가하여 목록을 채워보세요!</p>
            <button
              onClick={openModal}
              className="mt-6 flex items-center mx-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-lg shadow-indigo-600/30"
            >
              <PlusIcon />
              첫 웹사이트 추가하기
            </button>
          </div>
        )}
      </main>

      <Footer />

      <AddWebsiteModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onAdd={handleAddWebsite}
      />
    </div>
  );
};

export default App;