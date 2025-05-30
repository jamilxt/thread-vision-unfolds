
import React, { useState } from 'react';
import { ChapterNavigation } from '@/components/ChapterNavigation';
import { ChapterContent } from '@/components/ChapterContent';
import { Header } from '@/components/Header';
import { AnimationSpeedControl } from '@/components/AnimationSpeedControl';
import { AnimationProvider } from '@/contexts/AnimationContext';

const Index = () => {
  const [currentChapter, setCurrentChapter] = useState(1);

  return (
    <AnimationProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <ChapterNavigation 
                currentChapter={currentChapter}
                onChapterChange={setCurrentChapter}
              />
              <AnimationSpeedControl />
            </div>
            <div className="lg:col-span-3">
              <ChapterContent chapter={currentChapter} />
            </div>
          </div>
        </div>
      </div>
    </AnimationProvider>
  );
};

export default Index;
