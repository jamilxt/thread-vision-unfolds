
import React, { useState, useEffect } from 'react';
import { Play, Pause, Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BufferItem {
  id: number;
  value: string;
  timestamp: number;
}

export const ProducerConsumer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [buffer, setBuffer] = useState<BufferItem[]>([]);
  const [producerCount, setProducerCount] = useState(0);
  const [consumerCount, setConsumerCount] = useState(0);
  const [producerActive, setProducerActive] = useState(false);
  const [consumerActive, setConsumerActive] = useState(false);
  
  const maxBufferSize = 5;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        // Producer logic
        if (Math.random() > 0.3) { // 70% chance to produce
          setBuffer(prev => {
            if (prev.length < maxBufferSize) {
              setProducerActive(true);
              setTimeout(() => setProducerActive(false), 300);
              setProducerCount(c => c + 1);
              return [...prev, {
                id: Date.now(),
                value: `Item-${prev.length + 1}`,
                timestamp: Date.now()
              }];
            }
            return prev;
          });
        }

        // Consumer logic
        if (Math.random() > 0.4) { // 60% chance to consume
          setBuffer(prev => {
            if (prev.length > 0) {
              setConsumerActive(true);
              setTimeout(() => setConsumerActive(false), 300);
              setConsumerCount(c => c + 1);
              return prev.slice(1);
            }
            return prev;
          });
        }
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const reset = () => {
    setIsRunning(false);
    setBuffer([]);
    setProducerCount(0);
    setConsumerCount(0);
    setProducerActive(false);
    setConsumerActive(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 5: Producer-Consumer Pattern</h1>
        <p className="text-gray-600 leading-relaxed">
          A classic concurrency pattern where producers create data items and consumers process them through a shared buffer.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Producer-Consumer Simulation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className={`p-4 transition-all duration-300 ${producerActive ? 'bg-green-50 border-green-300' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-3">
              <Package className={`w-6 h-6 ${producerActive ? 'text-green-600' : 'text-gray-600'}`} />
              <h4 className="font-semibold">Producer</h4>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">{producerCount}</div>
              <div className="text-sm text-gray-600">Items Produced</div>
              <div className={`text-sm ${buffer.length >= maxBufferSize ? 'text-red-600' : 'text-green-600'}`}>
                {buffer.length >= maxBufferSize ? 'Buffer Full - Waiting' : 'Producing...'}
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-blue-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                B
              </div>
              <h4 className="font-semibold">Buffer</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Size:</span>
                <span className="font-medium">{buffer.length}/{maxBufferSize}</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: maxBufferSize }, (_, i) => (
                  <div
                    key={i}
                    className={`h-8 rounded border-2 flex items-center justify-center text-xs font-medium ${
                      i < buffer.length 
                        ? 'bg-blue-500 text-white border-blue-600' 
                        : 'bg-gray-200 border-gray-300'
                    }`}
                  >
                    {i < buffer.length ? buffer[i].value.split('-')[1] : ''}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className={`p-4 transition-all duration-300 ${consumerActive ? 'bg-purple-50 border-purple-300' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-3">
              <ShoppingCart className={`w-6 h-6 ${consumerActive ? 'text-purple-600' : 'text-gray-600'}`} />
              <h4 className="font-semibold">Consumer</h4>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-600">{consumerCount}</div>
              <div className="text-sm text-gray-600">Items Consumed</div>
              <div className={`text-sm ${buffer.length === 0 ? 'text-red-600' : 'text-purple-600'}`}>
                {buffer.length === 0 ? 'Buffer Empty - Waiting' : 'Consuming...'}
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold mb-3">Buffer Contents (FIFO Queue)</h4>
          <div className="flex flex-wrap gap-2 min-h-[50px] p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            {buffer.map((item, index) => (
              <div
                key={item.id}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm font-medium animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {item.value}
              </div>
            ))}
            {buffer.length === 0 && (
              <div className="text-gray-500 text-sm">Buffer is empty</div>
            )}
          </div>
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
{`class BoundedBuffer<T> {
    private final Queue<T> buffer = new LinkedList<>();
    private final int capacity;
    
    public BoundedBuffer(int capacity) {
        this.capacity = capacity;
    }
    
    public synchronized void put(T item) throws InterruptedException {
        while (buffer.size() == capacity) {
            wait(); // Wait if buffer is full
        }
        buffer.offer(item);
        System.out.println("Produced: " + item);
        notifyAll(); // Notify waiting consumers
    }
    
    public synchronized T take() throws InterruptedException {
        while (buffer.isEmpty()) {
            wait(); // Wait if buffer is empty
        }
        T item = buffer.poll();
        System.out.println("Consumed: " + item);
        notifyAll(); // Notify waiting producers
        return item;
    }
}

class Producer implements Runnable {
    private final BoundedBuffer<String> buffer;
    
    public void run() {
        try {
            for (int i = 0; i < 10; i++) {
                buffer.put("Item-" + i);
                Thread.sleep(100); // Simulate production time
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

class Consumer implements Runnable {
    private final BoundedBuffer<String> buffer;
    
    public void run() {
        try {
            while (true) {
                String item = buffer.take();
                Thread.sleep(150); // Simulate processing time
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}`}
        </pre>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-600">Key Benefits</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Decouples production and consumption rates</li>
            <li>• Provides buffering for load balancing</li>
            <li>• Enables parallel processing</li>
            <li>• Handles varying workloads efficiently</li>
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-600">Common Issues</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Buffer overflow if producer too fast</li>
            <li>• Starvation if consumer too slow</li>
            <li>• Deadlock with improper synchronization</li>
            <li>• Memory leaks with unbounded buffers</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
