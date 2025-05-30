
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAnimation } from '@/contexts/AnimationContext';

interface StreamElement {
  id: number;
  value: number;
  isProcessing: boolean;
  threadId: string;
  result?: number;
}

export const ParallelStreams = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isParallel, setIsParallel] = useState(false);
  const { getInterval } = useAnimation();
  const [elements, setElements] = useState<StreamElement[]>(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      value: Math.floor(Math.random() * 100) + 1,
      isProcessing: false,
      threadId: '',
      result: undefined
    }))
  );
  const [processedCount, setProcessedCount] = useState(0);

  const threadColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElements(prev => {
          let updated = [...prev];
          let newProcessedCount = 0;

          if (isParallel) {
            // Parallel processing - multiple elements at once
            updated = updated.map((element, index) => {
              if (!element.result && !element.isProcessing) {
                const threadId = `T${(index % 4) + 1}`;
                return { ...element, isProcessing: true, threadId };
              }
              if (element.isProcessing && !element.result) {
                const result = element.value * 2; // Simulate processing
                newProcessedCount++;
                return { ...element, isProcessing: false, result };
              }
              if (element.result) newProcessedCount++;
              return element;
            });
          } else {
            // Sequential processing - one at a time
            const nextIndex = updated.findIndex(el => !el.result && !el.isProcessing);
            if (nextIndex !== -1) {
              updated[nextIndex] = { 
                ...updated[nextIndex], 
                isProcessing: true, 
                threadId: 'Main' 
              };
            } else {
              const processingIndex = updated.findIndex(el => el.isProcessing);
              if (processingIndex !== -1) {
                const result = updated[processingIndex].value * 2;
                updated[processingIndex] = {
                  ...updated[processingIndex],
                  isProcessing: false,
                  result
                };
                newProcessedCount = updated.filter(el => el.result).length;
              }
            }
          }

          setProcessedCount(newProcessedCount);
          return updated;
        });
      }, getInterval(800));
    }
    return () => clearInterval(interval);
  }, [isRunning, isParallel, getInterval]);

  const reset = () => {
    setIsRunning(false);
    setProcessedCount(0);
    setElements(prev => prev.map(element => ({
      ...element,
      isProcessing: false,
      threadId: '',
      result: undefined,
      value: Math.floor(Math.random() * 100) + 1
    })));
  };

  const allProcessed = elements.every(el => el.result !== undefined);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 21: Parallel Streams</h1>
        <p className="text-gray-600 leading-relaxed">
          Learn how parallel streams can leverage multiple CPU cores to process data faster than sequential streams.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Stream Processing Comparison</h3>
        
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => setIsParallel(!isParallel)}
            variant={isParallel ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {isParallel ? 'Parallel Mode' : 'Sequential Mode'}
          </Button>
          
          <div className="flex-1" />
          
          <div className="text-sm text-gray-600">
            Processed: {processedCount}/{elements.length}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {elements.map((element) => (
            <div
              key={element.id}
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                element.result
                  ? 'bg-green-100 border-green-300'
                  : element.isProcessing
                  ? 'bg-yellow-100 border-yellow-300 animate-pulse'
                  : 'bg-gray-100 border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-lg font-bold mb-1">{element.value}</div>
                {element.isProcessing && (
                  <div className="text-xs text-gray-600 mb-1">
                    Processing on {element.threadId}
                  </div>
                )}
                {element.result && (
                  <div className="text-sm text-green-600 font-semibold">
                    → {element.result}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Element {element.id + 1}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            disabled={allProcessed}
            className="flex items-center gap-2"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Pause' : 'Start'} Processing
          </Button>
          <Button variant="outline" onClick={reset} className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gray-50">
        <h3 className="text-xl font-semibold mb-4">Java Code Example</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import java.util.List;
import java.util.stream.IntStream;

public class ParallelStreamExample {
    
    // Sequential stream processing
    public void sequentialProcessing() {
        List<Integer> numbers = IntStream.range(1, 1000000)
            .boxed()
            .toList();
            
        long start = System.currentTimeMillis();
        
        List<Integer> results = numbers.stream()
            .map(this::expensiveOperation)
            .filter(n -> n % 2 == 0)
            .collect(Collectors.toList());
            
        long duration = System.currentTimeMillis() - start;
        System.out.println("Sequential: " + duration + "ms");
    }
    
    // Parallel stream processing
    public void parallelProcessing() {
        List<Integer> numbers = IntStream.range(1, 1000000)
            .boxed()
            .toList();
            
        long start = System.currentTimeMillis();
        
        List<Integer> results = numbers.parallelStream()
            .map(this::expensiveOperation)
            .filter(n -> n % 2 == 0)
            .collect(Collectors.toList());
            
        long duration = System.currentTimeMillis() - start;
        System.out.println("Parallel: " + duration + "ms");
    }
    
    private Integer expensiveOperation(Integer n) {
        // Simulate CPU-intensive work
        return n * n + (int)(Math.random() * 100);
    }
}`}
        </pre>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-600">When to Use Parallel</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Large datasets (10,000+ elements)</li>
            <li>• CPU-intensive operations</li>
            <li>• Independent computations</li>
            <li>• Multi-core systems available</li>
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-600">Performance Benefits</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Utilizes multiple CPU cores</li>
            <li>• Automatic work distribution</li>
            <li>• Built-in load balancing</li>
            <li>• Fork/Join framework underneath</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-red-600">Considerations</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Thread overhead for small datasets</li>
            <li>• Shared mutable state issues</li>
            <li>• Non-associative operations</li>
            <li>• I/O bound operations</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
