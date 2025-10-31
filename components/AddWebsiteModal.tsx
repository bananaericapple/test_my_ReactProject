import React, { useState, useEffect } from 'react';
import type { NewWebsiteData } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface AddWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (websiteData: NewWebsiteData) => void;
}

const AddWebsiteModal: React.FC<AddWebsiteModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setName('');
      setUrl('');
      setDescription('');
      setTags('');
    }
  }, [isOpen]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url || !description) return;
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    onAdd({ name, url, description, tags: tagsArray });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md m-4 transform scale-95 hover:scale-100 transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">새 웹사이트 추가</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">웹사이트 이름</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="url" className="block text-gray-300 text-sm font-bold mb-2">웹사이트 URL</label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="https://example.com"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-300 text-sm font-bold mb-2">설명</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              required
            ></textarea>
          </div>
          <div className="mb-6">
            <label htmlFor="tags" className="block text-gray-300 text-sm font-bold mb-2">태그 (쉼표로 구분)</label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="예: 기술, 프로젝트, 디자인"
            />
          </div>
          <div className="flex items-center justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              취소
            </button>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              추가하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWebsiteModal;