
import React, { useState, useEffect } from 'react';
import { Play, Pause, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAnimation } from '@/contexts/AnimationContext';

interface MemoryLocation {
  id: string;
  name: string;
  mainMemoryValue: number;
  cacheValues: { [threadId: string]: number | null };
  isVolatile: boolean;
}

export const MemoryModel = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { getInterval } = useAnimation();
  const [variables, setVariables] = useState<MemoryLocation[]>([
    {
      id: 'normal',
      name: 'Normal Variable',
      mainMemoryValue: 0,
      cacheValues: { 'T1': null, 'T2': null },
      isVolatile: false
    },
    {
      id: 'volatile',
      name: 'Volatile Variable',
      mainMemoryValue: 0,
      cacheValues: { 'T1': null, 'T2': null },
      isVolatile: true
    }
  ]);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Thread 1 reads from main memory',
    'Thread 1 modifies cached value',
    'Thread 2 reads (sees stale data for normal var)',
    'Thread 1 writes back to main memory',
    'Cache synchronization occurs'
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = (prev + 1) % steps.length;
          
          setVariables(current => current.map(variable => {
            switch (nextStep) {
              case 0: // T1 reads
                return {
                  ...variable,
                  cacheValues: { ...variable.cacheValues, 'T1': variable.mainMemoryValue }
                };
              case 1: // T1 modifies cache
                return {
                  ...variable,
                  cacheValues: { 
                    ...variable.cacheValues, 
                    'T1': (variable.cacheValues['T1'] || 0) + 1 
                  }
                };
              case 2: // T2 reads
                if (variable.isVolatile) {
                  // Volatile variables always read from main memory
                  return {
                    ...variable,
                    cacheValues: { ...variable.cacheValues, 'T2': variable.mainMemoryValue }
                  };
                } else {
                  // Normal variables may use stale cached value
                  return {
                    ...variable,
                    cacheValues: { ...variable.cacheValues, 'T2': variable.mainMemoryValue }
                  };
                }
              case 3: // T1 writes back
                return {
                  ...variable,
                  mainMemoryValue: variable.isVolatile 
                    ? (variable.cacheValues['T1'] || 0)
                    : variable.mainMemoryValue + 1
                };
              case 4: // Cache sync
                if (!variable.isVolatile) {
                  return {
                    ...variable,
                    mainMemoryValue: variable.cacheValues['T1'] || variable.mainMemoryValue,
                    cacheValues: {
                      'T1': variable.cacheValues['T1'],
                      'T2': variable.cacheValues['T1'] // T2 sees updated value
                    }
                  };
                }
                return {
                  ...variable,
                  cacheValues: {
                    'T1': variable.mainMemoryValue,
                    'T2': variable.mainMemoryValue
                  }
                };
              default:
                return variable;
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
    setVariables(prev => prev.map(variable => ({
      ...variable,
      mainMemoryValue: 0,
      cacheValues: { 'T1': null, 'T2': null }
    })));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 10: Java Memory Model</h1>
        <p className="text-gray-600 leading-relaxed">
          Understand how the Java Memory Model governs visibility of shared variables between threads and the role of volatile keyword.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Memory Visibility Demonstration</h3>
        
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
          {variables.map((variable) => (
            <div key={variable.id} className="space-y-4">
              <div className="flex items-center gap-3">
                {variable.isVolatile ? (
                  <Eye className="w-6 h-6 text-green-600" />
                ) : (
                  <EyeOff className="w-6 h-6 text-orange-600" />
                )}
                <h4 className="font-semibold text-gray-700">{variable.name}</h4>
              </div>

              {/* Main Memory */}
              <div className="p-4 bg-blue-100 rounded-lg border-2 border-blue-300">
                <div className="text-center">
                  <div className="text-sm font-medium text-blue-700 mb-1">Main Memory</div>
                  <div className="text-2xl font-bold text-blue-800">
                    {variable.mainMemoryValue}
                  </div>
                </div>
              </div>

              {/* Thread Caches */}
              <div className="grid grid-cols-2 gap-3">
                {['T1', 'T2'].map((threadId) => (
                  <div key={threadId} className={`p-3 rounded-lg border-2 ${
                    variable.cacheValues[threadId] !== null
                      ? 'bg-yellow-100 border-yellow-300'
                      : 'bg-gray-100 border-gray-300'
                  }`}>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        {threadId} Cache
                      </div>
                      <div className="text-lg font-bold">
                        {variable.cacheValues[threadId] ?? '—'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Visibility Status */}
              <div className={`p-2 rounded text-center text-sm ${
                variable.isVolatile 
                  ? 'bg-green-100 text-green-700'
                  : variable.cacheValues['T1'] !== variable.cacheValues['T2']
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
              }`}>
                {variable.isVolatile 
                  ? 'Always Visible ✓'
                  : variable.cacheValues['T1'] !== variable.cacheValues['T2']
                    ? 'Visibility Issue ⚠️'
                    : 'Synchronized'}
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
{`public class MemoryVisibilityExample {
    // Normal variable - visibility not guaranteed
    private boolean running = true;
    
    // Volatile variable - visibility guaranteed
    private volatile boolean volatileRunning = true;
    
    public void normalExample() {
        // Thread 1 - May never see the change
        new Thread(() -> {
            while (running) {
                // This might loop forever even after
                // another thread sets running = false
            }
        }).start();
        
        // Thread 2 - Changes the flag
        new Thread(() -> {
            try { Thread.sleep(1000); } 
            catch (InterruptedException e) {}
            running = false; // Change might not be visible
        }).start();
    }
    
    public void volatileExample() {
        // Thread 1 - Will see the change immediately
        new Thread(() -> {
            while (volatileRunning) {
                // This will exit when volatileRunning becomes false
            }
        }).start();
        
        // Thread 2 - Changes the volatile flag
        new Thread(() -> {
            try { Thread.sleep(1000); } 
            catch (InterruptedException e) {}
            volatileRunning = false; // Change is immediately visible
        }).start();
    }
}`}
        </pre>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-600">Memory Areas</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Main Memory (Heap)</li>
            <li>• Thread Local Cache</li>
            <li>• CPU Registers</li>
            <li>• Stack Memory</li>
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-600">Volatile Guarantees</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Visibility guarantee</li>
            <li>• Prevents instruction reordering</li>
            <li>• Atomic read/write operations</li>
            <li>• Memory barrier insertion</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-red-600">Common Issues</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Stale data reads</li>
            <li>• Instruction reordering</li>
            <li>• Cache coherence problems</li>
            <li>• Infinite loops</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
