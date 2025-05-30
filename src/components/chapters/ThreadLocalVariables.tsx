
import React, { useState, useEffect } from 'react';
import { Play, Pause, User, Database, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAnimation } from '@/contexts/AnimationContext';

interface ThreadLocalState {
  threadId: string;
  localValue: string;
  sharedValue: string;
  isActive: boolean;
}

export const ThreadLocalVariables = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { getInterval } = useAnimation();
  const [threads, setThreads] = useState<ThreadLocalState[]>([
    { threadId: 'T1', localValue: '', sharedValue: 'Global', isActive: false },
    { threadId: 'T2', localValue: '', sharedValue: 'Global', isActive: false },
    { threadId: 'T3', localValue: '', sharedValue: 'Global', isActive: false }
  ]);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Threads initialize ThreadLocal values',
    'Each thread sets unique local value',
    'Threads access their local values',
    'Shared variable is modified',
    'ThreadLocal values remain isolated'
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = (prev + 1) % steps.length;
          
          setThreads(current => current.map((thread, index) => {
            switch (nextStep) {
              case 0:
                return {
                  ...thread,
                  localValue: `Initial-${thread.threadId}`,
                  sharedValue: 'Global',
                  isActive: true
                };
              case 1:
                return {
                  ...thread,
                  localValue: `Local-${thread.threadId}-${Math.floor(Math.random() * 100)}`
                };
              case 2:
                return {
                  ...thread,
                  isActive: index === 1 // Only T2 is accessing
                };
              case 3:
                return {
                  ...thread,
                  sharedValue: 'Modified Global',
                  isActive: true
                };
              case 4:
                return {
                  ...thread,
                  isActive: false
                };
              default:
                return thread;
            }
          }));
          
          return nextStep;
        });
      }, getInterval(2000));
    }
    return () => clearInterval(interval);
  }, [isRunning, getInterval]);

  const reset = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setThreads([
      { threadId: 'T1', localValue: '', sharedValue: 'Global', isActive: false },
      { threadId: 'T2', localValue: '', sharedValue: 'Global', isActive: false },
      { threadId: 'T3', localValue: '', sharedValue: 'Global', isActive: false }
    ]);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 19: ThreadLocal Variables</h1>
        <p className="text-gray-600 leading-relaxed">
          Learn how ThreadLocal variables provide thread-specific storage, eliminating the need for synchronization in certain scenarios.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">ThreadLocal Variables Demo</h3>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-700">Current Step:</h4>
            <div className="text-lg font-medium text-indigo-600">{steps[currentStep]}</div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Shared Memory */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Database className="w-6 h-6 text-blue-600" />
            <h4 className="font-semibold text-gray-700">Shared Memory</h4>
          </div>
          <div className="p-4 bg-blue-100 border-2 border-blue-300 rounded-lg">
            <div className="text-center">
              <div className="text-sm font-medium text-blue-700 mb-1">Global Variable</div>
              <div className="text-xl font-bold text-blue-800">
                {threads[0]?.sharedValue || 'Global'}
              </div>
            </div>
          </div>
        </div>

        {/* Thread Local Storage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {threads.map((thread) => (
            <div key={thread.threadId} className="space-y-3">
              <div className="flex items-center gap-3">
                <User className={`w-5 h-5 ${
                  thread.isActive ? 'text-green-600' : 'text-gray-400'
                }`} />
                <h5 className="font-semibold text-gray-700">{thread.threadId}</h5>
                {thread.isActive && (
                  <Eye className="w-4 h-4 text-green-600" />
                )}
              </div>

              {/* Thread's Local Storage */}
              <div className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                thread.isActive 
                  ? 'bg-green-100 border-green-300 transform scale-105' 
                  : 'bg-gray-100 border-gray-300'
              }`}>
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-600 mb-1">ThreadLocal</div>
                  <div className="text-sm font-bold">
                    {thread.localValue || 'Uninitialized'}
                  </div>
                </div>
              </div>

              {/* Thread's View of Shared */}
              <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Shared View</div>
                  <div className="text-xs font-medium">
                    {thread.sharedValue}
                  </div>
                </div>
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
            {isRunning ? 'Pause' : 'Start'} Demo
          </Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gray-50">
        <h3 className="text-xl font-semibold mb-4">Code Examples</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`public class ThreadLocalExample {
    // ThreadLocal variable - each thread has its own copy
    private static final ThreadLocal<String> threadLocalValue = 
        new ThreadLocal<String>() {
            @Override
            protected String initialValue() {
                return "Initial-" + Thread.currentThread().getName();
            }
        };
    
    // Using ThreadLocal.withInitial() (Java 8+)
    private static final ThreadLocal<Integer> userSession = 
        ThreadLocal.withInitial(() -> 0);
    
    public void demonstrateThreadLocal() {
        // Each thread sees its own value
        System.out.println("Thread " + Thread.currentThread().getName() + 
                          " sees: " + threadLocalValue.get());
        
        // Set thread-specific value
        threadLocalValue.set("Custom-" + System.currentTimeMillis());
        
        // Only this thread sees the new value
        System.out.println("Updated value: " + threadLocalValue.get());
        
        // Important: Clean up when done
        threadLocalValue.remove(); // Prevents memory leaks
    }
    
    public static void main(String[] args) {
        ThreadLocalExample example = new ThreadLocalExample();
        
        // Create multiple threads
        for (int i = 0; i < 3; i++) {
            new Thread(() -> {
                example.demonstrateThreadLocal();
            }, "Thread-" + i).start();
        }
    }
    
    // Common use case: Database connections
    private static final ThreadLocal<Connection> connectionHolder = 
        new ThreadLocal<>();
    
    public static Connection getConnection() {
        Connection conn = connectionHolder.get();
        if (conn == null) {
            conn = DriverManager.getConnection(DB_URL);
            connectionHolder.set(conn);
        }
        return conn;
    }
    
    public static void closeConnection() {
        Connection conn = connectionHolder.get();
        if (conn != null) {
            conn.close();
            connectionHolder.remove();
        }
    }
}`}
        </pre>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-600">Use Cases</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Database connections</li>
            <li>• User sessions</li>
            <li>• Security contexts</li>
            <li>• Performance counters</li>
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-600">Benefits</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• No synchronization needed</li>
            <li>• Thread isolation</li>
            <li>• Simplified design</li>
            <li>• Better performance</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-red-600">Cautions</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Memory leaks possible</li>
            <li>• Call remove() when done</li>
            <li>• Not suitable for sharing</li>
            <li>• Thread pool considerations</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
