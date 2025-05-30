import React, { useState, useEffect } from 'react';
import { Play, Pause, Zap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAnimation } from '@/contexts/AnimationContext';

interface AtomicCounter {
  id: string;
  name: string;
  value: number;
  isAtomic: boolean;
  operations: number;
}

export const AtomicOperations = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { getInterval } = useAnimation();
  const [counters, setCounters] = useState<AtomicCounter[]>([
    { id: 'normal', name: 'Normal Counter', value: 0, isAtomic: false, operations: 0 },
    { id: 'atomic', name: 'Atomic Counter', value: 0, isAtomic: true, operations: 0 }
  ]);
  const [threadsActive, setThreadsActive] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setCounters(prev => prev.map(counter => {
          if (counter.isAtomic) {
            // Atomic operations are thread-safe
            return {
              ...counter,
              value: counter.value + 3, // 3 threads incrementing
              operations: counter.operations + 3
            };
          } else {
            // Non-atomic operations can have race conditions
            const racyIncrement = Math.random() < 0.3 ? 2 : 3; // Sometimes loses increments
            return {
              ...counter,
              value: counter.value + racyIncrement,
              operations: counter.operations + 3
            };
          }
        }));

        setThreadsActive(prev => (prev + 1) % 4);
      }, getInterval(400));
    }
    return () => clearInterval(interval);
  }, [isRunning, getInterval]);

  const reset = () => {
    setIsRunning(false);
    setCounters(prev => prev.map(counter => ({
      ...counter,
      value: 0,
      operations: 0
    })));
    setThreadsActive(0);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 9: Atomic Operations</h1>
        <p className="text-gray-600 leading-relaxed">
          Learn how atomic operations ensure thread-safe access to shared variables without explicit synchronization.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Atomic vs Non-Atomic Operations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {counters.map((counter) => (
            <div key={counter.id} className="space-y-4">
              <div className="flex items-center gap-3">
                {counter.isAtomic ? (
                  <Zap className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                )}
                <h4 className="font-semibold text-gray-700">{counter.name}</h4>
              </div>
              
              <div className={`p-6 rounded-lg border-2 ${
                counter.isAtomic ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {counter.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    Expected: {counter.operations} | Actual: {counter.value}
                  </div>
                  {!counter.isAtomic && counter.operations > 0 && counter.value < counter.operations && (
                    <div className="text-red-600 text-sm mt-2 flex items-center justify-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Race condition detected!
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">Active Threads:</div>
                <div className="flex gap-2">
                  {[1, 2, 3].map((threadId) => (
                    <div
                      key={threadId}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                        isRunning && threadsActive === threadId
                          ? counter.isAtomic ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      T{threadId}
                    </div>
                  ))}
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
{`import java.util.concurrent.atomic.*;

// Regular int - NOT thread-safe
private int normalCounter = 0;

// Atomic integer - thread-safe
private AtomicInteger atomicCounter = new AtomicInteger(0);

// Multiple threads accessing counters
Runnable task = () -> {
    for (int i = 0; i < 1000; i++) {
        // Race condition possible
        normalCounter++;
        
        // Thread-safe atomic operation
        atomicCounter.incrementAndGet();
    }
};

// Common atomic operations
AtomicInteger atomic = new AtomicInteger(0);
atomic.get();                    // Read value
atomic.set(10);                  // Set value
atomic.incrementAndGet();        // ++value
atomic.getAndIncrement();        // value++
atomic.addAndGet(5);             // value += 5
atomic.compareAndSet(10, 20);    // Compare and swap

// Other atomic classes
AtomicLong atomicLong = new AtomicLong();
AtomicBoolean atomicBool = new AtomicBoolean();
AtomicReference<String> atomicRef = new AtomicReference<>();`}
        </pre>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-600">Atomic Classes</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• <code className="bg-gray-100 px-1 rounded">AtomicInteger</code></li>
            <li>• <code className="bg-gray-100 px-1 rounded">AtomicLong</code></li>
            <li>• <code className="bg-gray-100 px-1 rounded">AtomicBoolean</code></li>
            <li>• <code className="bg-gray-100 px-1 rounded">AtomicReference</code></li>
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-600">Benefits</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Lock-free programming</li>
            <li>• Better performance than synchronized</li>
            <li>• No deadlock risk</li>
            <li>• Hardware-level guarantees</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-purple-600">Use Cases</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Counters and statistics</li>
            <li>• Flags and status variables</li>
            <li>• Reference updates</li>
            <li>• Lock-free data structures</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
