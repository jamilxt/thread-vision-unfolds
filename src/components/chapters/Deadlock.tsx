
import React, { useState, useEffect } from 'react';
import { Play, Pause, AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Resource {
  id: string;
  name: string;
  lockedBy: string | null;
  color: string;
}

interface ThreadState {
  id: string;
  name: string;
  holding: string[];
  requesting: string | null;
  isDeadlocked: boolean;
}

export const Deadlock = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [deadlockDetected, setDeadlockDetected] = useState(false);
  
  const [resources, setResources] = useState<Resource[]>([
    { id: 'A', name: 'Resource A', lockedBy: null, color: 'bg-red-500' },
    { id: 'B', name: 'Resource B', lockedBy: null, color: 'bg-blue-500' }
  ]);

  const [threads, setThreads] = useState<ThreadState[]>([
    { id: '1', name: 'Thread-1', holding: [], requesting: null, isDeadlocked: false },
    { id: '2', name: 'Thread-2', holding: [], requesting: null, isDeadlocked: false }
  ]);

  const deadlockScenario = [
    { step: 'Initial state - both threads ready' },
    { step: 'Thread-1 acquires Resource A' },
    { step: 'Thread-2 acquires Resource B' },
    { step: 'Thread-1 requests Resource B (blocked)' },
    { step: 'Thread-2 requests Resource A (blocked)' },
    { step: 'DEADLOCK DETECTED!' }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setStep(prev => {
          const nextStep = Math.min(prev + 1, deadlockScenario.length - 1);
          
          switch (nextStep) {
            case 0:
              // Reset state
              setResources(prev => prev.map(r => ({ ...r, lockedBy: null })));
              setThreads(prev => prev.map(t => ({ 
                ...t, 
                holding: [], 
                requesting: null, 
                isDeadlocked: false 
              })));
              setDeadlockDetected(false);
              break;
            case 1:
              // Thread-1 gets Resource A
              setResources(prev => prev.map(r => 
                r.id === 'A' ? { ...r, lockedBy: '1' } : r
              ));
              setThreads(prev => prev.map(t => 
                t.id === '1' ? { ...t, holding: ['A'] } : t
              ));
              break;
            case 2:
              // Thread-2 gets Resource B
              setResources(prev => prev.map(r => 
                r.id === 'B' ? { ...r, lockedBy: '2' } : r
              ));
              setThreads(prev => prev.map(t => 
                t.id === '2' ? { ...t, holding: ['B'] } : t
              ));
              break;
            case 3:
              // Thread-1 requests Resource B
              setThreads(prev => prev.map(t => 
                t.id === '1' ? { ...t, requesting: 'B' } : t
              ));
              break;
            case 4:
              // Thread-2 requests Resource A
              setThreads(prev => prev.map(t => 
                t.id === '2' ? { ...t, requesting: 'A' } : t
              ));
              break;
            case 5:
              // Deadlock detected
              setDeadlockDetected(true);
              setThreads(prev => prev.map(t => ({ ...t, isDeadlocked: true })));
              break;
          }
          
          return nextStep;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const reset = () => {
    setIsRunning(false);
    setStep(0);
    setDeadlockDetected(false);
    setResources(prev => prev.map(r => ({ ...r, lockedBy: null })));
    setThreads(prev => prev.map(t => ({ 
      ...t, 
      holding: [], 
      requesting: null, 
      isDeadlocked: false 
    })));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 6: Deadlock</h1>
        <p className="text-gray-600 leading-relaxed">
          Understanding deadlock conditions and how threads can become permanently blocked waiting for each other.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Deadlock Scenario Visualization</h3>
        
        {deadlockDetected && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="flex items-center gap-3 text-red-700">
              <AlertTriangle className="w-6 h-6" />
              <div>
                <div className="font-semibold">DEADLOCK DETECTED!</div>
                <div className="text-sm">Both threads are permanently blocked waiting for each other.</div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-700">Current Step:</h4>
            <div className="text-lg font-medium text-indigo-600">{deadlockScenario[step]?.step}</div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                deadlockDetected ? 'bg-red-600' : 'bg-indigo-600'
              }`}
              style={{ width: `${((step + 1) / deadlockScenario.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Threads</h4>
            {threads.map((thread) => (
              <div 
                key={thread.id} 
                className={`p-4 rounded-lg border-2 ${
                  thread.isDeadlocked 
                    ? 'bg-red-50 border-red-300' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-4 h-4 rounded-full ${
                    thread.isDeadlocked ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <span className="font-medium">{thread.name}</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Holding:</span>
                    {thread.holding.length > 0 ? (
                      <div className="flex gap-1">
                        {thread.holding.map(resourceId => (
                          <div key={resourceId} className="px-2 py-1 bg-green-500 text-white rounded text-xs">
                            Resource {resourceId}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Requesting:</span>
                    {thread.requesting ? (
                      <div className="px-2 py-1 bg-yellow-500 text-white rounded text-xs animate-pulse">
                        Resource {thread.requesting}
                      </div>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Resources</h4>
            {resources.map((resource) => (
              <div key={resource.id} className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-6 h-6 rounded ${resource.color} text-white text-xs flex items-center justify-center font-bold`}>
                    {resource.id}
                  </div>
                  <span className="font-medium">{resource.name}</span>
                  {resource.lockedBy && <Lock className="w-4 h-4 text-gray-600" />}
                </div>
                
                <div className="text-sm text-gray-600">
                  Status: {resource.lockedBy ? (
                    <span className="text-red-600 font-medium">
                      Locked by Thread-{resource.lockedBy}
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium">Available</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-2"
            disabled={step >= deadlockScenario.length - 1 && !isRunning}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Pause' : 'Start'} Deadlock Demo
          </Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gray-50">
        <h3 className="text-xl font-semibold mb-4">Java Code Example (Deadlock-Prone)</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`class DeadlockExample {
    private final Object lock1 = new Object();
    private final Object lock2 = new Object();
    
    public void method1() {
        synchronized(lock1) {
            System.out.println("Thread 1: Holding lock 1...");
            try { Thread.sleep(100); } catch (InterruptedException e) {}
            
            synchronized(lock2) { // Request lock2 while holding lock1
                System.out.println("Thread 1: Acquired both locks!");
            }
        }
    }
    
    public void method2() {
        synchronized(lock2) {
            System.out.println("Thread 2: Holding lock 2...");
            try { Thread.sleep(100); } catch (InterruptedException e) {}
            
            synchronized(lock1) { // Request lock1 while holding lock2
                System.out.println("Thread 2: Acquired both locks!");
            }
        }
    }
}

// This will likely cause deadlock:
Thread t1 = new Thread(() -> example.method1());
Thread t2 = new Thread(() -> example.method2());
t1.start();
t2.start();`}
        </pre>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-red-600">Deadlock Conditions</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• <strong>Mutual Exclusion:</strong> Resources can't be shared</li>
            <li>• <strong>Hold and Wait:</strong> Thread holds while requesting</li>
            <li>• <strong>No Preemption:</strong> Resources can't be forcibly taken</li>
            <li>• <strong>Circular Wait:</strong> Circular dependency chain</li>
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-600">Prevention Strategies</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• <strong>Lock Ordering:</strong> Always acquire locks in same order</li>
            <li>• <strong>Timeout:</strong> Use tryLock() with timeout</li>
            <li>• <strong>Avoid Nested Locks:</strong> Minimize synchronized blocks</li>
            <li>• <strong>Detection:</strong> Monitor and break deadlock cycles</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
