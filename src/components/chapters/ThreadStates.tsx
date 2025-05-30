
import React, { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type ThreadState = 'NEW' | 'RUNNABLE' | 'BLOCKED' | 'WAITING' | 'TIMED_WAITING' | 'TERMINATED';

interface ThreadVisualization {
  id: string;
  name: string;
  state: ThreadState;
  position: number;
}

const stateColors: Record<ThreadState, string> = {
  NEW: 'bg-gray-400',
  RUNNABLE: 'bg-green-500',
  BLOCKED: 'bg-red-500',
  WAITING: 'bg-yellow-500',
  TIMED_WAITING: 'bg-orange-500',
  TERMINATED: 'bg-black'
};

export const ThreadStates = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [threads, setThreads] = useState<ThreadVisualization[]>([
    { id: '1', name: 'Thread-1', state: 'NEW', position: 0 },
    { id: '2', name: 'Thread-2', state: 'NEW', position: 0 },
    { id: '3', name: 'Thread-3', state: 'NEW', position: 0 }
  ]);

  const stateTransitions: ThreadState[] = ['NEW', 'RUNNABLE', 'BLOCKED', 'RUNNABLE', 'WAITING', 'RUNNABLE', 'TERMINATED'];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setThreads(prev => prev.map(thread => {
          const nextPosition = Math.min(thread.position + 1, stateTransitions.length - 1);
          return {
            ...thread,
            position: nextPosition,
            state: stateTransitions[nextPosition]
          };
        }));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const reset = () => {
    setIsRunning(false);
    setThreads(prev => prev.map(thread => ({ 
      ...thread, 
      state: 'NEW', 
      position: 0 
    })));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 2: Thread States</h1>
        <p className="text-gray-600 leading-relaxed">
          Understand the complete lifecycle of a Java thread and how threads transition between different states.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Thread State Transitions</h3>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            {stateTransitions.map((state, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full ${stateColors[state]} text-white text-xs flex items-center justify-center font-semibold shadow-lg`}>
                  {state}
                </div>
                {index < stateTransitions.length - 1 && (
                  <div className="w-8 h-1 bg-gray-300 mt-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {threads.map((thread) => (
            <div key={thread.id} className="flex items-center gap-4">
              <div className="w-20 text-sm font-medium">{thread.name}</div>
              <div className="flex-1 relative">
                <div className="w-full h-2 bg-gray-200 rounded-full" />
                <div 
                  className={`absolute top-0 w-6 h-6 rounded-full ${stateColors[thread.state]} -mt-2 transition-all duration-1000 ease-in-out shadow-lg border-2 border-white`}
                  style={{ 
                    left: `${(thread.position / (stateTransitions.length - 1)) * 100}%`,
                    transform: 'translateX(-50%)'
                  }}
                />
              </div>
              <div className="w-24 text-sm font-medium text-right">
                {thread.state}
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
            {isRunning ? 'Pause' : 'Start'} Animation
          </Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(stateColors).map(([state, color]) => (
          <Card key={state} className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-4 h-4 rounded-full ${color}`} />
              <h3 className="font-semibold">{state}</h3>
            </div>
            <p className="text-sm text-gray-600">
              {state === 'NEW' && 'Thread created but not started'}
              {state === 'RUNNABLE' && 'Thread executing or ready to execute'}
              {state === 'BLOCKED' && 'Thread blocked waiting for monitor lock'}
              {state === 'WAITING' && 'Thread waiting indefinitely'}
              {state === 'TIMED_WAITING' && 'Thread waiting for specified time'}
              {state === 'TERMINATED' && 'Thread has completed execution'}
            </p>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-gray-50">
        <h3 className="text-xl font-semibold mb-4">Java Code Example</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`Thread thread = new Thread(() -> {
    System.out.println("State: " + Thread.currentThread().getState()); // RUNNABLE
    
    try {
        Thread.sleep(1000); // TIMED_WAITING
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
    
    synchronized(someObject) { // May become BLOCKED
        // Critical section
    }
});

System.out.println("State: " + thread.getState()); // NEW
thread.start();
System.out.println("State: " + thread.getState()); // RUNNABLE
thread.join(); // Wait for completion
System.out.println("State: " + thread.getState()); // TERMINATED`}
        </pre>
      </Card>
    </div>
  );
};
