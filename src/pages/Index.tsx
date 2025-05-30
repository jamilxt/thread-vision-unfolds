
import React, { useState } from 'react';
import { ChapterNavigation } from '@/components/ChapterNavigation';
import { ChapterContent } from '@/components/ChapterContent';
import { Header } from '@/components/Header';

const Index = () => {
  const [currentChapter, setCurrentChapter] = useState(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <ChapterNavigation 
              currentChapter={currentChapter}
              onChapterChange={setCurrentChapter}
            />
          </div>
          <div className="lg:col-span-3">
            <ChapterContent chapter={currentChapter} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
