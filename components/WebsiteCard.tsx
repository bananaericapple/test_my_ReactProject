import React from 'react';
import { Link } from 'react-router-dom';
import type { Website } from '../types';

interface WebsiteCardProps {
  website: Website;
}

const WebsiteCard: React.FC<WebsiteCardProps> = ({ website }) => {
  const isInternal = website.linkType === 'internal' && website.route;

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <img className="w-full h-48 object-cover" src={website.imageUrl} alt={website.name} />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold mb-2 text-white">{website.name}</h3>
        <p className="text-gray-400 text-sm mb-4 h-20 overflow-hidden">{website.description}</p>
        <div className="flex-grow"></div>
        <div className="flex flex-wrap gap-2 mb-4">
          {website.tags.map((tag) => (
            <span key={tag} className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
        {isInternal ? (
          <Link
            to={website.route as string}
            className="inline-block self-start bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors duration-300"
          >
            내부 페이지 열기
          </Link>
        ) : (
          <a
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block self-start bg-gray-700 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors duration-300"
          >
            방문하기
          </a>
        )}
      </div>
    </div>
  );
};

export default WebsiteCard;
