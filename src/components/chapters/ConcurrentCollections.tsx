
import React, { useState, useEffect } from 'react';
import { Play, Pause, Database, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Operation {
  id: number;
  thread: string;
  operation: 'add' | 'remove' | 'get';
  value: number;
  timestamp: number;
  success: boolean;
}

export const ConcurrentCollections = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [collection, setCollection] = useState<number[]>([]);
  const [threadActivity, setThreadActivity] = useState<Record<string, boolean>>({});

  const threads = ['Thread-1', 'Thread-2', 'Thread-3'];
  const operationTypes: Array<'add' | 'remove' | 'get'> = ['add', 'remove', 'get'];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        const thread = threads[Math.floor(Math.random() * threads.length)];
        const operation = operationTypes[Math.floor(Math.random() * operationTypes.length)];
        const value = Math.floor(Math.random() * 100);

        setThreadActivity(prev => ({ ...prev, [thread]: true }));
        setTimeout(() => {
          setThreadActivity(prev => ({ ...prev, [thread]: false }));
        }, 300);

        let success = true;
        
        setCollection(prev => {
          let newCollection = [...prev];
          
          switch (operation) {
            case 'add':
              if (!newCollection.includes(value)) {
                newCollection.push(value);
                newCollection.sort((a, b) => a - b);
              } else {
                success = false;
              }
              break;
            case 'remove':
              const index = newCollection.indexOf(value);
              if (index > -1) {
                newCollection.splice(index, 1);
              } else {
                success = false;
              }
              break;
            case 'get':
              success = newCollection.includes(value);
              break;
          }
          
          return newCollection;
        });

        const newOperation: Operation = {
          id: Date.now(),
          thread,
          operation,
          value,
          timestamp: Date.now(),
          success
        };

        setOperations(prev => [newOperation, ...prev].slice(0, 15));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const reset = () => {
    setIsRunning(false);
    setOperations([]);
    setCollection([]);
    setThreadActivity({});
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'add': return 'text-green-600';
      case 'remove': return 'text-red-600';
      case 'get': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getOperationBg = (operation: string) => {
    switch (operation) {
      case 'add': return 'bg-green-50 border-green-200';
      case 'remove': return 'bg-red-50 border-red-200';
      case 'get': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 8: Concurrent Collections</h1>
        <p className="text-gray-600 leading-relaxed">
          Explore thread-safe collections that allow multiple threads to safely access and modify data structures concurrently.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold">Collection Size</h3>
          </div>
          <div className="text-2xl font-bold text-indigo-600">
            {collection.length}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Thread Safety</h3>
          </div>
          <div className="text-lg font-bold text-green-600">
            ✓ Guaranteed
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-5 h-5 bg-purple-600 rounded" />
            <h3 className="font-semibold">Operations</h3>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {operations.length}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Concurrent Collection Operations</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Thread Activity</h4>
            {threads.map((thread) => (
              <div 
                key={thread} 
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  threadActivity[thread] 
                    ? 'bg-indigo-50 border-indigo-300 shadow-md' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    threadActivity[thread] ? 'bg-indigo-500 animate-pulse' : 'bg-gray-400'
                  }`} />
                  <span className="font-medium">{thread}</span>
                  <span className={`text-sm px-2 py-1 rounded transition-all duration-300 ${
                    threadActivity[thread] 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {threadActivity[thread] ? 'Active' : 'Idle'}
                  </span>
                </div>
              </div>
            ))}

            <div className="mt-6">
              <h4 className="font-semibold text-gray-700 mb-3">Collection Contents</h4>
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 min-h-[100px]">
                <div className="flex flex-wrap gap-2">
                  {collection.map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="px-3 py-1 bg-indigo-500 text-white rounded text-sm font-medium animate-fade-in"
                    >
                      {item}
                    </div>
                  ))}
                  {collection.length === 0 && (
                    <div className="text-gray-500 text-sm">Collection is empty</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Recent Operations</h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {operations.map((op) => (
                <div key={op.id} className={`p-3 rounded-lg border ${getOperationBg(op.operation)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{op.thread}</span>
                      <span className={`font-medium ${getOperationColor(op.operation)}`}>
                        {op.operation.toUpperCase()}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      op.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {op.success ? 'SUCCESS' : 'FAILED'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Value: {op.value}
                  </div>
                </div>
              ))}
              {operations.length === 0 && (
                <div className="text-gray-500 text-center py-4">
                  No operations yet
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-2"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Pause' : 'Start'} Concurrent Operations
          </Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gray-50">
        <h3 className="text-xl font-semibold mb-4">Java Code Example</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// Concurrent Collections Examples
import java.util.concurrent.*;

// ConcurrentHashMap - Thread-safe HashMap
ConcurrentHashMap<String, Integer> concurrentMap = new ConcurrentHashMap<>();
concurrentMap.put("key1", 100);                    // Thread-safe put
Integer value = concurrentMap.get("key1");         // Thread-safe get
concurrentMap.putIfAbsent("key2", 200);           // Atomic operation

// CopyOnWriteArrayList - Thread-safe ArrayList for read-heavy scenarios
CopyOnWriteArrayList<String> cowList = new CopyOnWriteArrayList<>();
cowList.add("item1");                              // Creates new copy
cowList.add("item2");                              // Safe for concurrent reads

// BlockingQueue - Producer-Consumer pattern
BlockingQueue<String> queue = new LinkedBlockingQueue<>(10);
queue.put("task1");                                // Blocks if queue is full
String task = queue.take();                        // Blocks if queue is empty

// ConcurrentLinkedQueue - Lock-free queue
ConcurrentLinkedQueue<String> lockFreeQueue = new ConcurrentLinkedQueue<>();
lockFreeQueue.offer("element");                    // Non-blocking add
String element = lockFreeQueue.poll();             // Non-blocking remove

// Thread-safe operations
concurrentMap.compute("counter", (key, val) -> (val == null) ? 1 : val + 1);
concurrentMap.merge("sum", 10, Integer::sum);

// Atomic operations
AtomicInteger atomicCounter = new AtomicInteger(0);
atomicCounter.incrementAndGet();                   // Thread-safe increment
atomicCounter.compareAndSet(5, 10);               // Atomic compare-and-swap`}
        </pre>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3 text-blue-600">ConcurrentHashMap</h3>
          <ul className="space-y-1 text-gray-700 text-sm">
            <li>• Lock-free reads</li>
            <li>• Segmented locking for writes</li>
            <li>• No null keys/values</li>
            <li>• Atomic operations</li>
          </ul>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3 text-green-600">CopyOnWriteArrayList</h3>
          <ul className="space-y-1 text-gray-700 text-sm">
            <li>• Best for read-heavy scenarios</li>
            <li>• Creates copy on modification</li>
            <li>• Iterator never throws ConcurrentModificationException</li>
            <li>• Memory overhead on writes</li>
          </ul>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3 text-purple-600">BlockingQueue</h3>
          <ul className="space-y-1 text-gray-700 text-sm">
            <li>• Producer-Consumer pattern</li>
            <li>• Blocking put/take operations</li>
            <li>• Built-in capacity management</li>
            <li>• Multiple implementations</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
