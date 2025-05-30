
import React, { useState, useEffect } from 'react';
import { Play, Pause, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface WaitingThread {
  id: string;
  name: string;
  isWaiting: boolean;
  isNotified: boolean;
  message: string;
}

export const WaitNotify = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [sharedFlag, setSharedFlag] = useState(false);
  const [threads, setThreads] = useState<WaitingThread[]>([
    { id: '1', name: 'Consumer-1', isWaiting: false, isNotified: false, message: 'Ready' },
    { id: '2', name: 'Consumer-2', isWaiting: false, isNotified: false, message: 'Ready' },
    { id: '3', name: 'Producer', isWaiting: false, isNotified: false, message: 'Ready' }
  ]);
  const [step, setStep] = useState(0);

  const steps = [
    'Consumers start waiting',
    'Producer prepares data',
    'Producer notifies waiting threads',
    'Consumers wake up and process',
    'Cycle complete'
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setStep(prev => {
          const nextStep = (prev + 1) % steps.length;
          
          setThreads(current => {
            switch (nextStep) {
              case 0: // Consumers start waiting
                setSharedFlag(false);
                return current.map(t => 
                  t.name.includes('Consumer') 
                    ? { ...t, isWaiting: true, isNotified: false, message: 'Waiting for data...' }
                    : { ...t, isWaiting: false, isNotified: false, message: 'Ready to produce' }
                );
              case 1: // Producer prepares
                return current.map(t => 
                  t.name === 'Producer'
                    ? { ...t, message: 'Preparing data...' }
                    : t
                );
              case 2: // Producer notifies
                setSharedFlag(true);
                return current.map(t => 
                  t.name === 'Producer'
                    ? { ...t, message: 'Notifying consumers!' }
                    : { ...t, isNotified: true, message: 'Notification received!' }
                );
              case 3: // Consumers process
                return current.map(t => 
                  t.name.includes('Consumer')
                    ? { ...t, isWaiting: false, isNotified: false, message: 'Processing data...' }
                    : { ...t, message: 'Data sent successfully' }
                );
              case 4: // Complete
                return current.map(t => ({ 
                  ...t, 
                  isWaiting: false, 
                  isNotified: false, 
                  message: 'Cycle complete' 
                }));
              default:
                return current;
            }
          });
          
          return nextStep;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const reset = () => {
    setIsRunning(false);
    setStep(0);
    setSharedFlag(false);
    setThreads(prev => prev.map(thread => ({ 
      ...thread, 
      isWaiting: false, 
      isNotified: false, 
      message: 'Ready' 
    })));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 4: Wait & Notify</h1>
        <p className="text-gray-600 leading-relaxed">
          Learn how threads communicate using wait() and notify() methods for coordinated execution patterns.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Wait-Notify Communication Pattern</h3>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-700">Current Step:</h4>
            <div className="text-lg font-medium text-indigo-600">{steps[step]}</div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Thread States</h4>
            {threads.map((thread) => (
              <div key={thread.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {thread.isWaiting ? (
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                  ) : thread.isNotified ? (
                    <Bell className="w-5 h-5 text-green-600 animate-bounce" />
                  ) : (
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  )}
                  <span className="font-medium">{thread.name}</span>
                </div>
                <div className="flex-1 text-sm text-gray-600">
                  {thread.message}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Shared State</h4>
            <div className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  sharedFlag ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {sharedFlag ? '✓' : '○'}
                </div>
                <div className="text-sm font-medium">
                  Data Available: {sharedFlag ? 'Yes' : 'No'}
                </div>
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
            {isRunning ? 'Pause' : 'Start'} Communication
          </Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gray-50">
        <h3 className="text-xl font-semibold mb-4">Java Code Example</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`class SharedResource {
    private boolean dataAvailable = false;
    private String data;
    
    public synchronized void waitForData() throws InterruptedException {
        while (!dataAvailable) {
            System.out.println(Thread.currentThread().getName() + " waiting...");
            wait(); // Release lock and wait for notification
        }
        System.out.println(Thread.currentThread().getName() + " processing: " + data);
        dataAvailable = false; // Reset for next cycle
    }
    
    public synchronized void produceData(String newData) {
        this.data = newData;
        this.dataAvailable = true;
        System.out.println("Producer: Data ready!");
        notifyAll(); // Wake up all waiting threads
    }
}

// Consumer thread
class Consumer implements Runnable {
    private SharedResource resource;
    
    public void run() {
        try {
            resource.waitForData();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

// Producer thread  
class Producer implements Runnable {
    private SharedResource resource;
    
    public void run() {
        resource.produceData("Important data");
    }
}`}
        </pre>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-600">wait()</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Releases the lock</li>
            <li>• Thread enters WAITING state</li>
            <li>• Must be called in synchronized context</li>
            <li>• Can be interrupted</li>
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-600">notify()</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Wakes up one waiting thread</li>
            <li>• Does not release the lock immediately</li>
            <li>• Must be called in synchronized context</li>
            <li>• Which thread wakes up is not guaranteed</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-purple-600">notifyAll()</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Wakes up all waiting threads</li>
            <li>• All threads compete for the lock</li>
            <li>• Safer than notify() in most cases</li>
            <li>• Prevents potential deadlocks</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
