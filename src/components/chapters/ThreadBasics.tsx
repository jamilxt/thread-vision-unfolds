
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAnimation } from '@/contexts/AnimationContext';

export const ThreadBasics = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { getInterval } = useAnimation();
  const [threads, setThreads] = useState([
    { id: 'main', name: 'Main Thread', progress: 0, color: 'bg-blue-500' },
    { id: 'worker1', name: 'Worker Thread 1', progress: 0, color: 'bg-green-500' },
    { id: 'worker2', name: 'Worker Thread 2', progress: 0, color: 'bg-purple-500' }
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setThreads(prev => prev.map(thread => ({
          ...thread,
          progress: Math.min(thread.progress + Math.random() * 10, 100)
        })));
      }, getInterval(200));
    }
    return () => clearInterval(interval);
  }, [isRunning, getInterval]);

  const reset = () => {
    setIsRunning(false);
    setThreads(prev => prev.map(thread => ({ ...thread, progress: 0 })));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 1: Thread Basics</h1>
        <p className="text-gray-600 leading-relaxed">
          Learn how to create and run threads in Java. Watch how multiple threads execute concurrently,
          each making independent progress on their tasks.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Thread Execution Visualization</h3>
        
        <div className="space-y-4 mb-6">
          {threads.map((thread) => (
            <div key={thread.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">{thread.name}</span>
                <span className="text-sm text-gray-500">{Math.round(thread.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${thread.color} transition-all duration-200 ease-out`}
                  style={{ width: `${thread.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-2"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Pause' : 'Start'} Threads
          </Button>
          <Button variant="outline" onClick={reset} className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gray-50">
        <h3 className="text-xl font-semibold mb-4">Java Code Example</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// Creating and starting threads
class WorkerThread extends Thread {
    private String threadName;
    
    public WorkerThread(String name) {
        this.threadName = name;
    }
    
    @Override
    public void run() {
        for (int i = 0; i < 100; i++) {
            System.out.println(threadName + ": " + i);
            try {
                Thread.sleep(100); // Simulate work
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
}

// Main method
public static void main(String[] args) {
    WorkerThread worker1 = new WorkerThread("Worker-1");
    WorkerThread worker2 = new WorkerThread("Worker-2");
    
    worker1.start(); // Start thread execution
    worker2.start();
}`}
        </pre>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-600">Key Concepts</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Threads run concurrently, not necessarily in parallel</li>
            <li>• Each thread has its own execution path</li>
            <li>• <code className="bg-gray-100 px-1 rounded">start()</code> method begins execution</li>
            <li>• <code className="bg-gray-100 px-1 rounded">run()</code> method contains thread logic</li>
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-600">Best Practices</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Always call <code className="bg-gray-100 px-1 rounded">start()</code>, never <code className="bg-gray-100 px-1 rounded">run()</code> directly</li>
            <li>• Handle <code className="bg-gray-100 px-1 rounded">InterruptedException</code> properly</li>
            <li>• Use meaningful thread names for debugging</li>
            <li>• Consider using Runnable interface for flexibility</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
