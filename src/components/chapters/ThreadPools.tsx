
import React, { useState, useEffect } from 'react';
import { Play, Pause, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Task {
  id: number;
  name: string;
  duration: number;
  status: 'queued' | 'running' | 'completed';
  assignedWorker?: number;
  progress: number;
}

interface Worker {
  id: number;
  status: 'idle' | 'busy';
  currentTask?: Task;
}

export const ThreadPools = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([
    { id: 1, status: 'idle' },
    { id: 2, status: 'idle' },
    { id: 3, status: 'idle' }
  ]);
  const [taskCounter, setTaskCounter] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  const addTask = () => {
    const newTask: Task = {
      id: taskCounter + 1,
      name: `Task-${taskCounter + 1}`,
      duration: Math.floor(Math.random() * 3000) + 1000,
      status: 'queued',
      progress: 0
    };
    setTasks(prev => [...prev, newTask]);
    setTaskCounter(prev => prev + 1);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        // Add new tasks randomly
        if (Math.random() > 0.7) {
          addTask();
        }

        // Update running tasks and assign new ones
        setTasks(prevTasks => {
          const updatedTasks = prevTasks.map(task => {
            if (task.status === 'running') {
              const newProgress = Math.min(task.progress + 10, 100);
              if (newProgress >= 100) {
                // Task completed
                setWorkers(prevWorkers => 
                  prevWorkers.map(worker => 
                    worker.id === task.assignedWorker 
                      ? { ...worker, status: 'idle', currentTask: undefined }
                      : worker
                  )
                );
                setCompletedTasks(prev => prev + 1);
                return { ...task, status: 'completed', progress: 100 };
              }
              return { ...task, progress: newProgress };
            }
            return task;
          });

          // Assign queued tasks to idle workers
          const queuedTasks = updatedTasks.filter(t => t.status === 'queued');
          const idleWorkers = workers.filter(w => w.status === 'idle');

          queuedTasks.slice(0, idleWorkers.length).forEach((task, index) => {
            const worker = idleWorkers[index];
            task.status = 'running';
            task.assignedWorker = worker.id;
            
            setWorkers(prevWorkers =>
              prevWorkers.map(w =>
                w.id === worker.id
                  ? { ...w, status: 'busy', currentTask: task }
                  : w
              )
            );
          });

          // Remove completed tasks after a delay
          return updatedTasks.filter(task => 
            task.status !== 'completed' || Date.now() - task.id < 2000
          );
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isRunning, workers]);

  const reset = () => {
    setIsRunning(false);
    setTasks([]);
    setTaskCounter(0);
    setCompletedTasks(0);
    setWorkers(prev => prev.map(w => ({ 
      ...w, 
      status: 'idle', 
      currentTask: undefined 
    })));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 7: Thread Pools</h1>
        <p className="text-gray-600 leading-relaxed">
          Learn how thread pools manage a fixed number of worker threads to execute tasks efficiently, 
          avoiding the overhead of constant thread creation and destruction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Tasks Queued</h3>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {tasks.filter(t => t.status === 'queued').length}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Active Workers</h3>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {workers.filter(w => w.status === 'busy').length}/{workers.length}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-5 h-5 bg-purple-600 rounded" />
            <h3 className="font-semibold">Completed</h3>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {completedTasks}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Thread Pool Execution</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Worker Threads</h4>
            {workers.map((worker) => (
              <div 
                key={worker.id} 
                className={`p-4 rounded-lg border-2 ${
                  worker.status === 'busy' 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${
                      worker.status === 'busy' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className="font-medium">Worker-{worker.id}</span>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded ${
                    worker.status === 'busy' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {worker.status}
                  </span>
                </div>
                
                {worker.currentTask && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      Executing: {worker.currentTask.name}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-200"
                        style={{ width: `${worker.currentTask.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Task Queue</h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {tasks.filter(t => t.status === 'queued').map((task) => (
                <div key={task.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{task.name}</span>
                    <span className="text-sm text-yellow-600">Waiting...</span>
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status === 'running').map((task) => (
                <div key={task.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{task.name}</span>
                    <span className="text-sm text-blue-600">Running</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full transition-all duration-200"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status === 'queued').length === 0 && 
               tasks.filter(t => t.status === 'running').length === 0 && (
                <div className="text-gray-500 text-center py-4">
                  No tasks in queue
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
            {isRunning ? 'Pause' : 'Start'} Thread Pool
          </Button>
          <Button variant="outline" onClick={addTask} disabled={!isRunning}>
            Add Task
          </Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gray-50">
        <h3 className="text-xl font-semibold mb-4">Java Code Example</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// Creating thread pools with ExecutorService
ExecutorService fixedPool = Executors.newFixedThreadPool(3);
ExecutorService cachedPool = Executors.newCachedThreadPool();
ScheduledExecutorService scheduledPool = Executors.newScheduledThreadPool(2);

// Submitting tasks
Future<String> future = fixedPool.submit(() -> {
    Thread.sleep(1000);
    return "Task completed";
});

// Using with Runnable
fixedPool.execute(() -> {
    System.out.println("Running in thread: " + Thread.currentThread().getName());
});

// Proper shutdown
fixedPool.shutdown();
try {
    if (!fixedPool.awaitTermination(60, TimeUnit.SECONDS)) {
        fixedPool.shutdownNow();
    }
} catch (InterruptedException e) {
    fixedPool.shutdownNow();
}

// Thread pool configuration
ThreadPoolExecutor customPool = new ThreadPoolExecutor(
    2,                          // corePoolSize
    4,                          // maximumPoolSize  
    60L,                        // keepAliveTime
    TimeUnit.SECONDS,           // time unit
    new LinkedBlockingQueue<>() // work queue
);`}
        </pre>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-600">Advantages</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Reuses threads, reducing creation overhead</li>
            <li>• Controls maximum concurrent threads</li>
            <li>• Built-in queue management</li>
            <li>• Automatic thread lifecycle management</li>
            <li>• Better resource utilization</li>
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-600">Pool Types</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• <strong>Fixed:</strong> Fixed number of threads</li>
            <li>• <strong>Cached:</strong> Creates threads as needed</li>
            <li>• <strong>Single:</strong> Single worker thread</li>
            <li>• <strong>Scheduled:</strong> Supports delayed/periodic tasks</li>
            <li>• <strong>Custom:</strong> Full configuration control</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
