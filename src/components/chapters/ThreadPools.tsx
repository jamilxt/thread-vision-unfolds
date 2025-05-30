
import React, { useState, useEffect } from 'react';
import { Play, Pause, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Task {
  id: number;
  name: string;
  duration: number;
  progress: number;
  status: 'queued' | 'running' | 'completed';
  assignedWorker?: number;
}

interface Worker {
  id: number;
  status: 'idle' | 'busy';
  currentTask?: Task;
}

export const ThreadPools = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [poolSize, setPoolSize] = useState(3);
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, name: 'Task-1', duration: 100, progress: 0, status: 'queued' },
    { id: 2, name: 'Task-2', duration: 80, progress: 0, status: 'queued' },
    { id: 3, name: 'Task-3', duration: 120, progress: 0, status: 'queued' },
    { id: 4, name: 'Task-4', duration: 90, progress: 0, status: 'queued' },
    { id: 5, name: 'Task-5', duration: 110, progress: 0, status: 'queued' }
  ]);
  const [workers, setWorkers] = useState<Worker[]>(
    Array.from({ length: poolSize }, (_, i) => ({ id: i + 1, status: 'idle' }))
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTasks(prevTasks => {
          return prevTasks.map(task => {
            if (task.status === 'running') {
              const newProgress = Math.min(task.progress + 10, 100);
              return {
                ...task,
                progress: newProgress,
                status: newProgress >= 100 ? 'completed' as const : 'running' as const
              };
            }
            return task;
          });
        });

        // Assign queued tasks to idle workers
        setWorkers(prevWorkers => {
          return prevWorkers.map(worker => {
            if (worker.status === 'idle') {
              const queuedTask = tasks.find(t => t.status === 'queued');
              if (queuedTask) {
                const updatedTask: Task = {
                  ...queuedTask,
                  status: 'running' as const,
                  assignedWorker: worker.id
                };
                
                // Update the task status
                setTasks(prev => prev.map(t => 
                  t.id === queuedTask.id ? updatedTask : t
                ));
                
                return {
                  ...worker,
                  status: 'busy' as const,
                  currentTask: updatedTask
                };
              }
            } else if (worker.currentTask && worker.currentTask.progress >= 100) {
              return { ...worker, status: 'idle' as const, currentTask: undefined };
            }
            return worker;
          });
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isRunning, tasks]);

  const reset = () => {
    setIsRunning(false);
    setTasks(prev => prev.map(task => ({ 
      ...task, 
      progress: 0, 
      status: 'queued' as const,
      assignedWorker: undefined
    })));
    setWorkers(prev => prev.map(worker => ({ 
      ...worker, 
      status: 'idle' as const, 
      currentTask: undefined 
    })));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 7: Thread Pools</h1>
        <p className="text-gray-600 leading-relaxed">
          Learn how thread pools manage a fixed number of worker threads to execute tasks efficiently,
          reducing the overhead of thread creation and destruction.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Thread Pool Execution</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Worker Threads ({poolSize})
            </h4>
            {workers.map((worker) => (
              <div key={worker.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  worker.status === 'busy' ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <span className="font-medium">Worker-{worker.id}</span>
                <div className="flex-1 text-sm text-gray-600">
                  {worker.status === 'busy' && worker.currentTask ? (
                    <div>
                      Executing {worker.currentTask.name}
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className="bg-green-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${worker.currentTask.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    'Idle'
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Task Queue
            </h4>
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  task.status === 'completed' ? 'bg-blue-500' :
                  task.status === 'running' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span className="font-medium">{task.name}</span>
                <div className="flex-1 text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    task.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                    task.status === 'running' ? 'bg-green-100 text-green-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {task.status}
                  </span>
                  {task.assignedWorker && (
                    <span className="ml-2 text-gray-500">
                      (Worker-{task.assignedWorker})
                    </span>
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

// Create thread pool with fixed number of threads
ExecutorService executor = Executors.newFixedThreadPool(3);

// Submit tasks to the pool
for (int i = 1; i <= 10; i++) {
    final int taskId = i;
    executor.submit(() -> {
        System.out.println("Task " + taskId + " executed by " + 
                          Thread.currentThread().getName());
        try {
            Thread.sleep(2000); // Simulate work
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    });
}

// Shutdown the executor
executor.shutdown();
try {
    if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
        executor.shutdownNow();
    }
} catch (InterruptedException e) {
    executor.shutdownNow();
}`}
        </pre>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-600">Benefits</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Reduced thread creation overhead</li>
            <li>• Better resource management</li>
            <li>• Controlled concurrent execution</li>
            <li>• Improved application performance</li>
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-600">Types</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• <code className="bg-gray-100 px-1 rounded">newFixedThreadPool(n)</code></li>
            <li>• <code className="bg-gray-100 px-1 rounded">newCachedThreadPool()</code></li>
            <li>• <code className="bg-gray-100 px-1 rounded">newSingleThreadExecutor()</code></li>
            <li>• <code className="bg-gray-100 px-1 rounded">newScheduledThreadPool(n)</code></li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
