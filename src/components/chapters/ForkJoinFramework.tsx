
import React, { useState, useEffect } from 'react';
import { Play, Pause, GitBranch, Merge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAnimation } from '@/contexts/AnimationContext';

interface WorkTask {
  id: string;
  level: number;
  start: number;
  end: number;
  status: 'pending' | 'forking' | 'computing' | 'joining' | 'completed';
  result?: number;
  children?: WorkTask[];
}

export const ForkJoinFramework = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { getInterval } = useAnimation();
  const [tasks, setTasks] = useState<WorkTask[]>([
    {
      id: 'root',
      level: 0,
      start: 0,
      end: 100,
      status: 'pending',
      children: []
    }
  ]);
  const [currentPhase, setCurrentPhase] = useState<'fork' | 'compute' | 'join'>('fork');

  const createSubtasks = (task: WorkTask): WorkTask[] => {
    const mid = Math.floor((task.start + task.end) / 2);
    return [
      {
        id: `${task.id}-L`,
        level: task.level + 1,
        start: task.start,
        end: mid,
        status: 'pending' as const,
        children: []
      },
      {
        id: `${task.id}-R`,
        level: task.level + 1,
        start: mid + 1,
        end: task.end,
        status: 'pending' as const,
        children: []
      }
    ];
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTasks(prev => {
          let newTasks = [...prev];
          let hasChanges = false;

          const updateTask = (task: WorkTask): WorkTask => {
            if (task.status === 'pending' && task.end - task.start > 10) {
              // Fork phase
              const children = createSubtasks(task);
              hasChanges = true;
              return {
                ...task,
                status: 'forking',
                children: children
              };
            } else if (task.status === 'pending' && task.end - task.start <= 10) {
              // Small enough to compute directly
              hasChanges = true;
              return {
                ...task,
                status: 'computing',
                result: task.end - task.start + 1
              };
            } else if (task.status === 'computing') {
              hasChanges = true;
              return {
                ...task,
                status: 'completed'
              };
            } else if (task.status === 'forking' && task.children) {
              // Update children
              const updatedChildren = task.children.map(updateTask);
              const allChildrenCompleted = updatedChildren.every(child => child.status === 'completed');
              
              if (allChildrenCompleted) {
                const totalResult = updatedChildren.reduce((sum, child) => sum + (child.result || 0), 0);
                hasChanges = true;
                return {
                  ...task,
                  status: 'joining',
                  children: updatedChildren,
                  result: totalResult
                };
              }
              
              return {
                ...task,
                children: updatedChildren
              };
            } else if (task.status === 'joining') {
              hasChanges = true;
              return {
                ...task,
                status: 'completed'
              };
            }
            
            return task;
          };

          newTasks = newTasks.map(updateTask);
          
          // Update phase based on task states
          const hasForking = JSON.stringify(newTasks).includes('forking');
          const hasJoining = JSON.stringify(newTasks).includes('joining');
          const hasComputing = JSON.stringify(newTasks).includes('computing');
          
          if (hasJoining) {
            setCurrentPhase('join');
          } else if (hasComputing) {
            setCurrentPhase('compute');
          } else if (hasForking) {
            setCurrentPhase('fork');
          }

          return newTasks;
        });
      }, getInterval(800));
    }
    return () => clearInterval(interval);
  }, [isRunning, getInterval]);

  const reset = () => {
    setIsRunning(false);
    setTasks([
      {
        id: 'root',
        level: 0,
        start: 0,
        end: 100,
        status: 'pending',
        children: []
      }
    ]);
    setCurrentPhase('fork');
  };

  const renderTask = (task: WorkTask, depth: number = 0): React.ReactNode => {
    const getStatusColor = () => {
      switch (task.status) {
        case 'pending': return 'bg-gray-100 border-gray-300';
        case 'forking': return 'bg-blue-100 border-blue-300';
        case 'computing': return 'bg-yellow-100 border-yellow-300';
        case 'joining': return 'bg-purple-100 border-purple-300';
        case 'completed': return 'bg-green-100 border-green-300';
      }
    };

    return (
      <div key={task.id} className="space-y-2" style={{ marginLeft: `${depth * 20}px` }}>
        <div className={`p-3 rounded-lg border-2 ${getStatusColor()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {task.status === 'forking' && <GitBranch className="w-4 h-4" />}
              {task.status === 'joining' && <Merge className="w-4 h-4" />}
              <span className="font-medium">
                Task [{task.start}-{task.end}]
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {task.status.toUpperCase()}
              {task.result !== undefined && (
                <span className="ml-2 font-bold">= {task.result}</span>
              )}
            </div>
          </div>
        </div>
        
        {task.children && task.children.map(child => renderTask(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 12: Fork/Join Framework</h1>
        <p className="text-gray-600 leading-relaxed">
          Understand how the Fork/Join framework enables parallel decomposition of tasks using work-stealing algorithms.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Divide and Conquer Visualization</h3>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-700">Current Phase:</h4>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentPhase === 'fork' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`}>
                Fork
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentPhase === 'compute' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
              }`}>
                Compute
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentPhase === 'join' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
              }`}>
                Join
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 max-h-96 overflow-y-auto">
          {tasks.map(task => renderTask(task))}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-2"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Pause' : 'Start'} Fork/Join
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

// RecursiveTask for tasks that return a result
class SumTask extends RecursiveTask<Long> {
    private final int[] array;
    private final int start, end;
    private static final int THRESHOLD = 1000;
    
    public SumTask(int[] array, int start, int end) {
        this.array = array;
        this.start = start;
        this.end = end;
    }
    
    @Override
    protected Long compute() {
        if (end - start <= THRESHOLD) {
            // Small enough - compute directly
            long sum = 0;
            for (int i = start; i < end; i++) {
                sum += array[i];
            }
            return sum;
        } else {
            // Too large - fork into subtasks
            int mid = (start + end) / 2;
            
            SumTask leftTask = new SumTask(array, start, mid);
            SumTask rightTask = new SumTask(array, mid, end);
            
            // Fork the left task
            leftTask.fork();
            
            // Compute right task directly
            long rightResult = rightTask.compute();
            
            // Join the left task
            long leftResult = leftTask.join();
            
            return leftResult + rightResult;
        }
    }
}

// Usage
int[] largeArray = new int[1000000];
// ... initialize array

ForkJoinPool pool = new ForkJoinPool();
SumTask task = new SumTask(largeArray, 0, largeArray.length);
Long result = pool.invoke(task);

// Or using parallel streams (internally uses Fork/Join)
long sum = Arrays.stream(largeArray)
    .parallel()
    .mapToLong(i -> i)
    .sum();`}
        </pre>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-600">Key Classes</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• <code className="bg-gray-100 px-1 rounded">ForkJoinPool</code></li>
            <li>• <code className="bg-gray-100 px-1 rounded">RecursiveTask&lt;T&gt;</code></li>
            <li>• <code className="bg-gray-100 px-1 rounded">RecursiveAction</code></li>
            <li>• <code className="bg-gray-100 px-1 rounded">ForkJoinTask&lt;T&gt;</code></li>
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-600">Work Stealing</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Idle threads steal work</li>
            <li>• Better load balancing</li>
            <li>• Reduces contention</li>
            <li>• Maximizes CPU utilization</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-purple-600">Use Cases</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Parallel algorithms</li>
            <li>• Large array processing</li>
            <li>• Tree traversals</li>
            <li>• Mathematical computations</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
