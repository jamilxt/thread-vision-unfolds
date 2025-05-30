
import React, { useState, useEffect } from 'react';
import { Play, Pause, Lock, Unlock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAnimation } from '@/contexts/AnimationContext';

interface LockState {
  id: string;
  type: 'ReentrantLock' | 'ReadWriteLock';
  isLocked: boolean;
  owner: string | null;
  waitingThreads: string[];
  conditions: ConditionState[];
}

interface ConditionState {
  id: string;
  name: string;
  waitingThreads: string[];
}

export const LocksConditions = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { getInterval } = useAnimation();
  const [locks, setLocks] = useState<LockState[]>([
    {
      id: 'reentrant',
      type: 'ReentrantLock',
      isLocked: false,
      owner: null,
      waitingThreads: [],
      conditions: [
        { id: 'notEmpty', name: 'Not Empty', waitingThreads: [] },
        { id: 'notFull', name: 'Not Full', waitingThreads: [] }
      ]
    },
    {
      id: 'readwrite',
      type: 'ReadWriteLock',
      isLocked: false,
      owner: null,
      waitingThreads: [],
      conditions: []
    }
  ]);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Thread A acquires lock',
    'Thread B waits for lock',
    'Thread A awaits condition',
    'Thread C signals condition',
    'Lock is released and acquired'
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = (prev + 1) % steps.length;
          
          setLocks(current => current.map(lock => {
            if (lock.type === 'ReentrantLock') {
              switch (nextStep) {
                case 0:
                  return { ...lock, isLocked: true, owner: 'Thread A' };
                case 1:
                  return { ...lock, waitingThreads: ['Thread B'] };
                case 2:
                  return {
                    ...lock,
                    conditions: lock.conditions.map(cond => 
                      cond.id === 'notEmpty' 
                        ? { ...cond, waitingThreads: ['Thread A'] }
                        : cond
                    )
                  };
                case 3:
                  return {
                    ...lock,
                    conditions: lock.conditions.map(cond => 
                      cond.id === 'notEmpty' 
                        ? { ...cond, waitingThreads: [] }
                        : cond
                    )
                  };
                case 4:
                  return {
                    ...lock,
                    isLocked: true,
                    owner: 'Thread B',
                    waitingThreads: []
                  };
                default:
                  return lock;
              }
            }
            return lock;
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
    setLocks(prev => prev.map(lock => ({
      ...lock,
      isLocked: false,
      owner: null,
      waitingThreads: [],
      conditions: lock.conditions.map(cond => ({
        ...cond,
        waitingThreads: []
      }))
    })));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 16: Locks & Conditions</h1>
        <p className="text-gray-600 leading-relaxed">
          Explore advanced locking mechanisms including ReentrantLock, ReadWriteLock, and Condition variables for fine-grained synchronization control.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Lock & Condition Demonstration</h3>
        
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {locks.map((lock) => (
            <div key={lock.id} className="space-y-4">
              <div className="flex items-center gap-3">
                {lock.isLocked ? (
                  <Lock className="w-6 h-6 text-red-600" />
                ) : (
                  <Unlock className="w-6 h-6 text-green-600" />
                )}
                <h4 className="font-semibold text-gray-700">{lock.type}</h4>
              </div>

              {/* Lock Status */}
              <div className={`p-4 rounded-lg border-2 ${
                lock.isLocked 
                  ? 'bg-red-100 border-red-300' 
                  : 'bg-green-100 border-green-300'
              }`}>
                <div className="text-center">
                  <div className="text-sm font-medium mb-1">Lock Status</div>
                  <div className="text-lg font-bold">
                    {lock.isLocked ? `Locked by ${lock.owner}` : 'Available'}
                  </div>
                </div>
              </div>

              {/* Waiting Threads */}
              <div className="p-3 bg-yellow-100 border-2 border-yellow-300 rounded-lg">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    <Users className="w-4 h-4 inline mr-1" />
                    Waiting Threads
                  </div>
                  <div className="text-sm">
                    {lock.waitingThreads.length > 0 
                      ? lock.waitingThreads.join(', ')
                      : 'None'
                    }
                  </div>
                </div>
              </div>

              {/* Conditions */}
              {lock.conditions.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-700">Conditions:</h5>
                  {lock.conditions.map((condition) => (
                    <div key={condition.id} className="p-2 bg-blue-100 border border-blue-300 rounded">
                      <div className="text-sm font-medium">{condition.name}</div>
                      <div className="text-xs text-gray-600">
                        Waiting: {condition.waitingThreads.length > 0 
                          ? condition.waitingThreads.join(', ')
                          : 'None'
                        }
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
{`import java.util.concurrent.locks.*;

public class AdvancedLockingExample {
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition notEmpty = lock.newCondition();
    private final Condition notFull = lock.newCondition();
    
    private final ReadWriteLock rwLock = new ReentrantReadWriteLock();
    private final Lock readLock = rwLock.readLock();
    private final Lock writeLock = rwLock.writeLock();
    
    public void reentrantLockExample() {
        lock.lock();
        try {
            // Critical section
            while (isEmpty()) {
                notEmpty.await(); // Wait for condition
            }
            // Process data
            notFull.signalAll(); // Signal waiting threads
        } finally {
            lock.unlock();
        }
    }
    
    public void readWriteLockExample() {
        // Multiple readers can acquire read lock
        readLock.lock();
        try {
            // Read operation - thread-safe
            return data.get();
        } finally {
            readLock.unlock();
        }
        
        // Only one writer can acquire write lock
        writeLock.lock();
        try {
            // Write operation - exclusive access
            data.set(newValue);
        } finally {
            writeLock.unlock();
        }
    }
}`}
        </pre>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-600">Lock Types</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• ReentrantLock</li>
            <li>• ReadWriteLock</li>
            <li>• StampedLock</li>
            <li>• ReentrantReadWriteLock</li>
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-600">Condition Benefits</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Fine-grained waiting</li>
            <li>• Multiple conditions per lock</li>
            <li>• Interruptible waiting</li>
            <li>• Timed waiting</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-red-600">Best Practices</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Always use try-finally</li>
            <li>• Avoid nested locks</li>
            <li>• Use timeouts</li>
            <li>• Prefer higher-level constructs</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
