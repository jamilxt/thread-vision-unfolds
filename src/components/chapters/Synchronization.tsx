
import React, { useState, useEffect } from 'react';
import { Play, Pause, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ThreadAccess {
  id: string;
  name: string;
  hasLock: boolean;
  waiting: boolean;
  progress: number;
}

export const Synchronization = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [sharedResource, setSharedResource] = useState(0);
  const [currentLockHolder, setCurrentLockHolder] = useState<string | null>(null);
  const [threads, setThreads] = useState<ThreadAccess[]>([
    { id: '1', name: 'Thread-1', hasLock: false, waiting: false, progress: 0 },
    { id: '2', name: 'Thread-2', hasLock: false, waiting: false, progress: 0 },
    { id: '3', name: 'Thread-3', hasLock: false, waiting: false, progress: 0 }
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setThreads(prev => {
          const updated = prev.map(thread => {
            if (thread.hasLock) {
              // Thread with lock makes progress
              const newProgress = thread.progress + 20;
              if (newProgress >= 100) {
                // Release lock when task complete
                setCurrentLockHolder(null);
                return { ...thread, hasLock: false, progress: 0, waiting: false };
              }
              return { ...thread, progress: newProgress };
            } else if (!currentLockHolder && !thread.waiting) {
              // Try to acquire lock
              return { ...thread, waiting: true };
            }
            return thread;
          });

          // Assign lock to first waiting thread
          if (!currentLockHolder) {
            const waitingThread = updated.find(t => t.waiting);
            if (waitingThread) {
              setCurrentLockHolder(waitingThread.id);
              setSharedResource(prev => prev + 1);
              return updated.map(t => 
                t.id === waitingThread.id 
                  ? { ...t, hasLock: true, waiting: false }
                  : { ...t, waiting: t.id !== waitingThread.id && !t.hasLock }
              );
            }
          }

          return updated;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isRunning, currentLockHolder]);

  const reset = () => {
    setIsRunning(false);
    setSharedResource(0);
    setCurrentLockHolder(null);
    setThreads(prev => prev.map(thread => ({ 
      ...thread, 
      hasLock: false, 
      waiting: false, 
      progress: 0 
    })));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 3: Synchronization</h1>
        <p className="text-gray-600 leading-relaxed">
          Learn how synchronization prevents race conditions by ensuring only one thread can access shared resources at a time.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Synchronized Access Visualization</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Thread Status</h4>
            {threads.map((thread) => (
              <div key={thread.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {thread.hasLock ? (
                    <Lock className="w-5 h-5 text-green-600" />
                  ) : thread.waiting ? (
                    <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Unlock className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="font-medium">{thread.name}</span>
                </div>
                <div className="flex-1">
                  {thread.hasLock && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${thread.progress}%` }}
                      />
                    </div>
                  )}
                  {thread.waiting && (
                    <span className="text-yellow-600 text-sm">Waiting for lock...</span>
                  )}
                  {!thread.hasLock && !thread.waiting && (
                    <span className="text-gray-500 text-sm">Ready</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Shared Resource</h4>
            <div className="p-6 bg-indigo-50 rounded-lg border-2 border-indigo-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {sharedResource}
                </div>
                <div className="text-sm text-gray-600">
                  Resource Counter
                </div>
                {currentLockHolder && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-green-600">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Locked by {threads.find(t => t.id === currentLockHolder)?.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-2"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Pause' : 'Start'} Simulation
          </Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gray-50">
        <h3 className="text-xl font-semibold mb-4">Java Code Example</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`class Counter {
    private int count = 0;
    
    // Synchronized method - only one thread can execute at a time
    public synchronized void increment() {
        count++; // Critical section
        System.out.println(Thread.currentThread().getName() + ": " + count);
    }
    
    // Synchronized block - finer control
    public void incrementWithBlock() {
        synchronized(this) {
            count++; // Critical section
        }
    }
    
    public synchronized int getCount() {
        return count;
    }
}

// Usage
Counter counter = new Counter();

Runnable task = () -> {
    for (int i = 0; i < 10; i++) {
        counter.increment(); // Thread-safe operation
    }
};

Thread t1 = new Thread(task, "Thread-1");
Thread t2 = new Thread(task, "Thread-2");
t1.start();
t2.start();`}
        </pre>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-red-600">Without Synchronization</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Race conditions can occur</li>
            <li>• Unpredictable results</li>
            <li>• Data corruption possible</li>
            <li>• Non-deterministic behavior</li>
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-600">With Synchronization</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Mutual exclusion guaranteed</li>
            <li>• Predictable, consistent results</li>
            <li>• Data integrity maintained</li>
            <li>• Thread-safe operations</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
