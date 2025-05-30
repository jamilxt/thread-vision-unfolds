
import React, { useState, useEffect } from 'react';
import { Play, Pause, Users, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAnimation } from '@/contexts/AnimationContext';

interface SemaphoreState {
  permits: number;
  maxPermits: number;
  waitingThreads: string[];
  activeThreads: string[];
}

interface BarrierState {
  waitingCount: number;
  totalThreads: number;
  waitingThreads: string[];
  isTripped: boolean;
}

export const SemaphoresBarriers = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { getInterval } = useAnimation();
  const [semaphore, setSemaphore] = useState<SemaphoreState>({
    permits: 3,
    maxPermits: 3,
    waitingThreads: [],
    activeThreads: []
  });
  const [barrier, setBarrier] = useState<BarrierState>({
    waitingCount: 0,
    totalThreads: 4,
    waitingThreads: [],
    isTripped: false
  });
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Threads acquire semaphore permits',
    'Semaphore becomes full',
    'Additional threads wait',
    'Threads reach barrier',
    'Barrier trips, all proceed'
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = (prev + 1) % steps.length;
          
          switch (nextStep) {
            case 0:
              setSemaphore({
                permits: 1,
                maxPermits: 3,
                waitingThreads: [],
                activeThreads: ['T1', 'T2']
              });
              setBarrier({
                waitingCount: 0,
                totalThreads: 4,
                waitingThreads: [],
                isTripped: false
              });
              break;
            case 1:
              setSemaphore(prev => ({
                ...prev,
                permits: 0,
                activeThreads: ['T1', 'T2', 'T3']
              }));
              break;
            case 2:
              setSemaphore(prev => ({
                ...prev,
                waitingThreads: ['T4', 'T5']
              }));
              break;
            case 3:
              setBarrier({
                waitingCount: 3,
                totalThreads: 4,
                waitingThreads: ['T1', 'T2', 'T3'],
                isTripped: false
              });
              break;
            case 4:
              setBarrier({
                waitingCount: 4,
                totalThreads: 4,
                waitingThreads: ['T1', 'T2', 'T3', 'T4'],
                isTripped: true
              });
              break;
          }
          
          return nextStep;
        });
      }, getInterval(2000));
    }
    return () => clearInterval(interval);
  }, [isRunning, getInterval]);

  const reset = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setSemaphore({
      permits: 3,
      maxPermits: 3,
      waitingThreads: [],
      activeThreads: []
    });
    setBarrier({
      waitingCount: 0,
      totalThreads: 4,
      waitingThreads: [],
      isTripped: false
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 17: Semaphores & Barriers</h1>
        <p className="text-gray-600 leading-relaxed">
          Learn about counting semaphores for resource management and cyclical barriers for thread coordination.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Semaphores & Barriers Demo</h3>
        
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
          {/* Semaphore */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <h4 className="font-semibold text-gray-700">Semaphore (3 permits)</h4>
            </div>

            {/* Available Permits */}
            <div className="p-4 bg-blue-100 rounded-lg border-2 border-blue-300">
              <div className="text-center">
                <div className="text-sm font-medium text-blue-700 mb-2">Available Permits</div>
                <div className="flex justify-center gap-2">
                  {Array.from({ length: semaphore.maxPermits }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full border-2 ${
                        i < semaphore.permits
                          ? 'bg-green-500 border-green-600'
                          : 'bg-gray-300 border-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-lg font-bold text-blue-800 mt-2">
                  {semaphore.permits}/{semaphore.maxPermits}
                </div>
              </div>
            </div>

            {/* Active Threads */}
            <div className="p-3 bg-green-100 border-2 border-green-300 rounded-lg">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700 mb-1">Active Threads</div>
                <div className="text-sm">
                  {semaphore.activeThreads.length > 0 
                    ? semaphore.activeThreads.join(', ')
                    : 'None'
                  }
                </div>
              </div>
            </div>

            {/* Waiting Threads */}
            <div className="p-3 bg-yellow-100 border-2 border-yellow-300 rounded-lg">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700 mb-1">Waiting for Permits</div>
                <div className="text-sm">
                  {semaphore.waitingThreads.length > 0 
                    ? semaphore.waitingThreads.join(', ')
                    : 'None'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Cyclical Barrier */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-purple-600" />
              <h4 className="font-semibold text-gray-700">CyclicBarrier</h4>
            </div>

            {/* Barrier Status */}
            <div className={`p-4 rounded-lg border-2 ${
              barrier.isTripped 
                ? 'bg-green-100 border-green-300' 
                : 'bg-orange-100 border-orange-300'
            }`}>
              <div className="text-center">
                <div className="text-sm font-medium mb-2">Barrier Status</div>
                <div className="text-lg font-bold">
                  {barrier.isTripped ? 'Tripped! ✓' : 'Waiting...'}
                </div>
                <div className="text-sm mt-1">
                  {barrier.waitingCount}/{barrier.totalThreads} threads
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="p-3 bg-purple-100 border-2 border-purple-300 rounded-lg">
              <div className="text-center mb-2">
                <div className="text-sm font-medium text-gray-700">Progress</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-purple-600 h-4 rounded-full transition-all duration-500 flex items-center justify-center"
                  style={{ width: `${(barrier.waitingCount / barrier.totalThreads) * 100}%` }}
                >
                  {barrier.waitingCount > 0 && (
                    <span className="text-white text-xs font-bold">
                      {barrier.waitingCount}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Waiting Threads */}
            <div className="p-3 bg-blue-100 border-2 border-blue-300 rounded-lg">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700 mb-1">Threads at Barrier</div>
                <div className="text-sm">
                  {barrier.waitingThreads.length > 0 
                    ? barrier.waitingThreads.join(', ')
                    : 'None'
                  }
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
{`import java.util.concurrent.*;

public class CoordinationExample {
    // Semaphore - limits concurrent access to resource
    private final Semaphore semaphore = new Semaphore(3);
    
    // CyclicBarrier - synchronizes threads at a barrier point
    private final CyclicBarrier barrier = new CyclicBarrier(4, () -> {
        System.out.println("All threads reached barrier!");
    });
    
    public void semaphoreExample() throws InterruptedException {
        semaphore.acquire(); // Acquire permit
        try {
            // Access limited resource (max 3 threads)
            System.out.println("Using resource...");
            Thread.sleep(1000);
        } finally {
            semaphore.release(); // Release permit
        }
    }
    
    public void barrierExample() throws InterruptedException, BrokenBarrierException {
        // Do some work
        System.out.println("Phase 1 complete");
        
        // Wait for all threads to reach this point
        barrier.await();
        
        // All threads proceed together
        System.out.println("Phase 2 starting");
    }
}`}
        </pre>
      </Card>
    </div>
  );
};
