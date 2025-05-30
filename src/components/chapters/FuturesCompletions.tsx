
import React, { useState, useEffect } from 'react';
import { Play, Pause, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAnimation } from '@/contexts/AnimationContext';

interface FutureTask {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  result?: string;
  duration: number;
}

export const FuturesCompletions = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { getInterval } = useAnimation();
  const [tasks, setTasks] = useState<FutureTask[]>([
    { id: '1', name: 'Database Query', status: 'pending', progress: 0, duration: 3000 },
    { id: '2', name: 'API Call', status: 'pending', progress: 0, duration: 2000 },
    { id: '3', name: 'File Processing', status: 'pending', progress: 0, duration: 4000 },
    { id: '4', name: 'Computation Task', status: 'pending', progress: 0, duration: 1500 }
  ]);
  const [completionStage, setCompletionStage] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTasks(prev => prev.map(task => {
          if (task.status === 'pending') {
            return { ...task, status: 'running' as const };
          } else if (task.status === 'running') {
            const newProgress = Math.min(task.progress + 10, 100);
            if (newProgress >= 100) {
              const success = Math.random() > 0.2; // 80% success rate
              return {
                ...task,
                progress: 100,
                status: success ? 'completed' as const : 'failed' as const,
                result: success ? `Result-${task.id}` : 'Error occurred'
              };
            }
            return { ...task, progress: newProgress };
          }
          return task;
        }));

        setCompletionStage(prev => (prev + 1) % 4);
      }, getInterval(300));
    }
    return () => clearInterval(interval);
  }, [isRunning, getInterval]);

  const reset = () => {
    setIsRunning(false);
    setTasks(prev => prev.map(task => ({
      ...task,
      status: 'pending' as const,
      progress: 0,
      result: undefined
    })));
    setCompletionStage(0);
  };

  const getStatusIcon = (status: FutureTask['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-400" />;
      case 'running':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-orange-500" />;
    }
  };

  const getStatusColor = (status: FutureTask['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 border-gray-300';
      case 'running':
        return 'bg-blue-100 border-blue-300';
      case 'completed':
        return 'bg-green-100 border-green-300';
      case 'failed':
        return 'bg-red-100 border-red-300';
      case 'cancelled':
        return 'bg-orange-100 border-orange-300';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 11: Futures & CompletableFuture</h1>
        <p className="text-gray-600 leading-relaxed">
          Learn how to handle asynchronous programming with Futures and CompletableFuture for non-blocking operations.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Asynchronous Task Execution</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {tasks.map((task) => (
            <div key={task.id} className={`p-4 rounded-lg border-2 ${getStatusColor(task.status)}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <span className="font-medium">{task.name}</span>
                </div>
                <span className="text-sm text-gray-600">{task.status.toUpperCase()}</span>
              </div>
              
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  Progress: {task.progress}%
                  {task.result && (
                    <div className="mt-1 font-mono text-xs">
                      Result: {task.result}
                    </div>
                  )}
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
            {isRunning ? 'Pause' : 'Start'} Execution
          </Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gray-50">
        <h3 className="text-xl font-semibold mb-4">Java Code Example</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import java.util.concurrent.*;

// Basic Future usage
ExecutorService executor = Executors.newFixedThreadPool(4);

Future<String> future = executor.submit(() -> {
    Thread.sleep(2000); // Simulate long-running task
    return "Task completed!";
});

// Non-blocking check
if (future.isDone()) {
    String result = future.get(); // Get result
}

// CompletableFuture - more powerful
CompletableFuture<String> completableFuture = CompletableFuture
    .supplyAsync(() -> {
        // Async computation
        return "Hello";
    })
    .thenApply(result -> result + " World")
    .thenApply(String::toUpperCase)
    .thenCompose(result -> 
        CompletableFuture.supplyAsync(() -> result + "!")
    );

// Combining multiple futures
CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> "Hello");
CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> "World");

CompletableFuture<String> combined = future1.thenCombine(future2, 
    (s1, s2) -> s1 + " " + s2);

// Exception handling
CompletableFuture<String> futureWithError = CompletableFuture
    .supplyAsync(() -> {
        if (Math.random() > 0.5) {
            throw new RuntimeException("Random error");
        }
        return "Success";
    })
    .exceptionally(throwable -> "Default value")
    .thenApply(result -> "Final: " + result);`}
        </pre>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-600">Future Methods</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• <code className="bg-gray-100 px-1 rounded">get()</code> - Blocking wait</li>
            <li>• <code className="bg-gray-100 px-1 rounded">isDone()</code> - Check completion</li>
            <li>• <code className="bg-gray-100 px-1 rounded">cancel()</code> - Cancel task</li>
            <li>• <code className="bg-gray-100 px-1 rounded">isCancelled()</code> - Check cancellation</li>
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-600">CompletableFuture</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• <code className="bg-gray-100 px-1 rounded">thenApply()</code> - Transform</li>
            <li>• <code className="bg-gray-100 px-1 rounded">thenCompose()</code> - Chain</li>
            <li>• <code className="bg-gray-100 px-1 rounded">thenCombine()</code> - Combine</li>
            <li>• <code className="bg-gray-100 px-1 rounded">exceptionally()</code> - Handle errors</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-purple-600">Benefits</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Non-blocking execution</li>
            <li>• Composable operations</li>
            <li>• Better resource utilization</li>
            <li>• Elegant error handling</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
