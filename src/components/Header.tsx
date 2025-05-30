
import React from 'react';
import { Code, Cpu } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-indigo-600">
            <Cpu className="w-8 h-8" />
            <Code className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Java Threads & Concurrency
            </h1>
            <p className="text-gray-600 mt-1">
              Interactive Visual Learning Platform
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
