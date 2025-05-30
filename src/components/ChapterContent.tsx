
import React from 'react';
import { ThreadBasics } from './chapters/ThreadBasics';
import { ThreadStates } from './chapters/ThreadStates';
import { Synchronization } from './chapters/Synchronization';
import { WaitNotify } from './chapters/WaitNotify';
import { ProducerConsumer } from './chapters/ProducerConsumer';
import { Deadlock } from './chapters/Deadlock';
import { ThreadPools } from './chapters/ThreadPools';
import { ConcurrentCollections } from './chapters/ConcurrentCollections';
import { AtomicOperations } from './chapters/AtomicOperations';
import { MemoryModel } from './chapters/MemoryModel';
import { FuturesCompletions } from './chapters/FuturesCompletions';
import { ForkJoinFramework } from './chapters/ForkJoinFramework';
import { ReactiveStreams } from './chapters/ReactiveStreams';
import { VirtualThreads } from './chapters/VirtualThreads';
import { PerformanceProfiling } from './chapters/PerformanceProfiling';

interface ChapterContentProps {
  chapter: number;
}

export const ChapterContent = ({ chapter }: ChapterContentProps) => {
  const renderChapter = () => {
    switch (chapter) {
      case 1:
        return <ThreadBasics />;
      case 2:
        return <ThreadStates />;
      case 3:
        return <Synchronization />;
      case 4:
        return <WaitNotify />;
      case 5:
        return <ProducerConsumer />;
      case 6:
        return <Deadlock />;
      case 7:
        return <ThreadPools />;
      case 8:
        return <ConcurrentCollections />;
      case 9:
        return <AtomicOperations />;
      case 10:
        return <MemoryModel />;
      case 11:
        return <FuturesCompletions />;
      case 12:
        return <ForkJoinFramework />;
      case 13:
        return <ReactiveStreams />;
      case 14:
        return <VirtualThreads />;
      case 15:
        return <PerformanceProfiling />;
      default:
        return <ThreadBasics />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {renderChapter()}
    </div>
  );
};
