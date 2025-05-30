
import React, { useState, useEffect } from 'react';
import { Play, Pause, Cpu, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAnimation } from '@/contexts/AnimationContext';

interface ThreadInfo {
  id: string;
  type: 'platform' | 'virtual';
  status: 'running' | 'blocked' | 'waiting';
  task: string;
  carrierThread?: string;
}

export const VirtualThreads = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { getInterval } = useAnimation();
  const [platformThreads, setPlatformThreads] = useState<ThreadInfo[]>([
    { id: 'PT-1', type: 'platform', status: 'running', task: 'HTTP Request' },
    { id: 'PT-2', type: 'platform', status: 'running', task: 'Database Query' },
    { id: 'PT-3', type: 'platform', status: 'running', task: 'File I/O' },
    { id: 'PT-4', type: 'platform', status: 'running', task: 'Network Call' }
  ]);
  const [virtualThreads, setVirtualThreads] = useState<ThreadInfo[]>([]);
  const [threadCount, setThreadCount] = useState({ platform: 4, virtual: 0 });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        // Add new virtual threads periodically
        setVirtualThreads(prev => {
          if (prev.length < 20) {
            const newThread: ThreadInfo = {
              id: `VT-${prev.length + 1}`,
              type: 'virtual',
              status: 'running',
              task: ['HTTP Request', 'Database Query', 'File I/O', 'Network Call'][Math.floor(Math.random() * 4)],
              carrierThread: `PT-${Math.floor(Math.random() * 4) + 1}`
            };
            return [...prev, newThread];
          }
          return prev;
        });

        // Simulate thread state changes
        setPlatformThreads(prev => prev.map(thread => ({
          ...thread,
          status: Math.random() > 0.7 ? 'blocked' : 'running'
        })));

        setVirtualThreads(prev => prev.map(thread => ({
          ...thread,
          status: Math.random() > 0.8 ? 'waiting' : 'running',
          carrierThread: thread.status === 'waiting' ? undefined : `PT-${Math.floor(Math.random() * 4) + 1}`
        })));

        setThreadCount(prev => ({
          platform: 4,
          virtual: prev.virtual < 20 ? prev.virtual + 1 : 20
        }));
      }, getInterval(600));
    }
    return () => clearInterval(interval);
  }, [isRunning, getInterval]);

  const reset = () => {
    setIsRunning(false);
    setVirtualThreads([]);
    setThreadCount({ platform: 4, virtual: 0 });
    setPlatformThreads(prev => prev.map(thread => ({
      ...thread,
      status: 'running'
    })));
  };

  const getStatusColor = (status: string, type: string) => {
    if (type === 'platform') {
      return status === 'running' ? 'bg-blue-500' : 'bg-red-500';
    } else {
      return status === 'running' ? 'bg-green-500' : status === 'waiting' ? 'bg-yellow-500' : 'bg-gray-500';
    }
  };

  const runningVirtualThreads = virtualThreads.filter(t => t.status === 'running');
  const waitingVirtualThreads = virtualThreads.filter(t => t.status === 'waiting');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 14: Virtual Threads (Project Loom)</h1>
        <p className="text-gray-600 leading-relaxed">
          Explore Java's revolutionary virtual threads that enable millions of lightweight threads for better resource utilization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{threadCount.platform}</div>
          <div className="text-sm text-gray-600">Platform Threads</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{threadCount.virtual}</div>
          <div className="text-sm text-gray-600">Virtual Threads</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {Math.round((threadCount.virtual / threadCount.platform) * 10) / 10}:1
          </div>
          <div className="text-sm text-gray-600">Scaling Ratio</div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Thread Execution Model</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Platform Threads */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-700">Platform Threads (OS Threads)</h4>
            </div>
            
            <div className="space-y-2">
              {platformThreads.map((thread) => (
                <div key={thread.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(thread.status, thread.type)}`} />
                  <span className="font-medium">{thread.id}</span>
                  <span className="text-sm text-gray-600">{thread.task}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    thread.status === 'running' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {thread.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Virtual Threads */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-700">Virtual Threads</h4>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {runningVirtualThreads.map((thread) => (
                <div key={thread.id} className="flex items-center gap-3 p-2 bg-green-50 rounded">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">{thread.id}</span>
                  <span className="text-xs text-gray-600">{thread.task}</span>
                  {thread.carrierThread && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">
                      → {thread.carrierThread}
                    </span>
                  )}
                </div>
              ))}
              
              {waitingVirtualThreads.slice(0, 5).map((thread) => (
                <div key={thread.id} className="flex items-center gap-3 p-2 bg-yellow-50 rounded">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-sm font-medium">{thread.id}</span>
                  <span className="text-xs text-gray-600">Waiting (unmounted)</span>
                </div>
              ))}
              
              {waitingVirtualThreads.length > 5 && (
                <div className="text-xs text-gray-500 text-center py-2">
                  + {waitingVirtualThreads.length - 5} more waiting threads...
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
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
{`// Creating virtual threads (Java 19+)
Thread virtualThread = Thread.ofVirtual()
    .name("virtual-worker")
    .start(() -> {
        // This runs on a virtual thread
        System.out.println("Running on: " + Thread.currentThread());
    });

// Using virtual thread executor
try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
    // Submit millions of tasks - each gets its own virtual thread
    for (int i = 0; i < 1_000_000; i++) {
        executor.submit(() -> {
            try {
                // Simulate I/O operation
                Thread.sleep(Duration.ofSeconds(1));
                return "Task completed";
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return "Interrupted";
            }
        });
    }
} // Executor automatically shuts down

// Blocking operations are handled efficiently
Thread.ofVirtual().start(() -> {
    try {
        // Virtual thread will be unmounted during blocking I/O
        String response = httpClient.send(request, 
            HttpResponse.BodyHandlers.ofString());
        
        // Thread automatically remounted when I/O completes
        processResponse(response);
    } catch (Exception e) {
        handleError(e);
    }
});

// Structured concurrency (Preview feature)
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Future<String> task1 = scope.fork(() -> fetchFromDatabase());
    Future<String> task2 = scope.fork(() -> callExternalAPI());
    
    scope.join();           // Wait for all tasks
    scope.throwIfFailed();  // Propagate any failures
    
    // Both tasks completed successfully
    String result1 = task1.resultNow();
    String result2 = task2.resultNow();
}`}
        </pre>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-600">Benefits</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Millions of concurrent threads</li>
            <li>• Lightweight (few KB each)</li>
            <li>• Efficient blocking I/O</li>
            <li>• Better resource utilization</li>
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-600">Key Features</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Cooperative scheduling</li>
            <li>• Automatic mounting/unmounting</li>
            <li>• Compatible with existing APIs</li>
            <li>• No pooling required</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-purple-600">Use Cases</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• High-concurrency servers</li>
            <li>• I/O-intensive applications</li>
            <li>• Microservices</li>
            <li>• Event-driven systems</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
