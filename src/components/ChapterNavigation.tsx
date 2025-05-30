import React from 'react';
import { cn } from '@/lib/utils';

interface ChapterNavigationProps {
  currentChapter: number;
  onChapterChange: (chapter: number) => void;
}

const chapters = [
  { id: 1, title: "Thread Basics", subtitle: "Creating & Running Threads" },
  { id: 2, title: "Thread States", subtitle: "Lifecycle Visualization" },
  { id: 3, title: "Synchronization", subtitle: "Locks & Critical Sections" },
  { id: 4, title: "Wait & Notify", subtitle: "Thread Communication" },
  { id: 5, title: "Producer-Consumer", subtitle: "Classic Pattern" },
  { id: 6, title: "Deadlock", subtitle: "Detection & Prevention" },
  { id: 7, title: "Thread Pools", subtitle: "ExecutorService" },
  { id: 8, title: "Concurrent Collections", subtitle: "Thread-Safe Data Structures" },
  { id: 9, title: "Atomic Operations", subtitle: "Lock-Free Programming" },
  { id: 10, title: "Memory Model", subtitle: "Visibility & Volatile" },
  { id: 11, title: "Futures & Completions", subtitle: "Asynchronous Programming" },
  { id: 12, title: "Fork/Join Framework", subtitle: "Parallel Decomposition" },
  { id: 13, title: "Reactive Streams", subtitle: "Backpressure & Flow Control" },
  { id: 14, title: "Virtual Threads", subtitle: "Project Loom" },
  { id: 15, title: "Performance & Profiling", subtitle: "Optimization Techniques" }
];

export const ChapterNavigation = ({ currentChapter, onChapterChange }: ChapterNavigationProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Chapters</h2>
      <div className="space-y-2">
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            onClick={() => onChapterChange(chapter.id)}
            className={cn(
              "w-full text-left p-4 rounded-lg transition-all duration-200 hover:shadow-md",
              currentChapter === chapter.id
                ? "bg-indigo-600 text-white shadow-lg transform scale-105"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                currentChapter === chapter.id
                  ? "bg-white text-indigo-600"
                  : "bg-indigo-100 text-indigo-600"
              )}>
                {chapter.id}
              </div>
              <div>
                <div className="font-medium">{chapter.title}</div>
                <div className={cn(
                  "text-sm",
                  currentChapter === chapter.id ? "text-indigo-100" : "text-gray-500"
                )}>
                  {chapter.subtitle}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
