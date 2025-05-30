
import React, { useState, useEffect } from 'react';
import { Play, Pause, ArrowDown, Zap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAnimation } from '@/contexts/AnimationContext';

interface StreamElement {
  id: number;
  value: number;
  position: number;
}

interface Subscriber {
  id: string;
  name: string;
  buffer: StreamElement[];
  bufferSize: number;
  processingSpeed: number;
  backpressure: boolean;
}

export const ReactiveStreams = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { getInterval } = useAnimation();
  const [elements, setElements] = useState<StreamElement[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([
    { id: 'fast', name: 'Fast Subscriber', buffer: [], bufferSize: 5, processingSpeed: 1, backpressure: false },
    { id: 'slow', name: 'Slow Subscriber', buffer: [], bufferSize: 3, processingSpeed: 3, backpressure: false }
  ]);
  const [publishedCount, setPublishedCount] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        // Publish new elements
        setElements(prev => {
          const newElement: StreamElement = {
            id: Date.now(),
            value: Math.floor(Math.random() * 100),
            position: 0
          };
          return [...prev, newElement].slice(-10); // Keep last 10 elements
        });

        setPublishedCount(prev => prev + 1);

        // Move elements down the stream
        setElements(prev => prev.map(el => ({
          ...el,
          position: el.position + 1
        })).filter(el => el.position < 5));

        // Update subscribers
        setSubscribers(prev => prev.map(subscriber => {
          let newBuffer = [...subscriber.buffer];
          let newBackpressure = subscriber.backpressure;

          // Add new elements if not under backpressure
          elements.forEach(element => {
            if (element.position === 2 && newBuffer.length < subscriber.bufferSize) {
              newBuffer.push({ ...element, position: 0 });
            } else if (element.position === 2 && newBuffer.length >= subscriber.bufferSize) {
              newBackpressure = true;
            }
          });

          // Process elements based on speed
          if (newBuffer.length > 0 && publishedCount % subscriber.processingSpeed === 0) {
            newBuffer = newBuffer.slice(1);
            newBackpressure = false;
          }

          return {
            ...subscriber,
            buffer: newBuffer,
            backpressure: newBackpressure
          };
        }));
      }, getInterval(500));
    }
    return () => clearInterval(interval);
  }, [isRunning, getInterval, elements, publishedCount]);

  const reset = () => {
    setIsRunning(false);
    setElements([]);
    setPublishedCount(0);
    setSubscribers(prev => prev.map(sub => ({
      ...sub,
      buffer: [],
      backpressure: false
    })));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 13: Reactive Streams</h1>
        <p className="text-gray-600 leading-relaxed">
          Learn about reactive programming with backpressure handling for asynchronous stream processing.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Stream Flow with Backpressure</h3>
        
        <div className="space-y-8">
          {/* Publisher */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-lg">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-700">Publisher</span>
              <span className="text-sm text-blue-600">({publishedCount} published)</span>
            </div>
          </div>

          {/* Stream Elements */}
          <div className="relative">
            <div className="flex justify-center">
              <div className="w-2 bg-gray-300 h-32 relative rounded">
                {elements.map((element) => (
                  <div
                    key={element.id}
                    className="absolute w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-500"
                    style={{
                      top: `${element.position * 25}%`,
                      left: '-12px'
                    }}
                  >
                    {element.value}
                  </div>
                ))}
                
                {/* Flow indicators */}
                <div className="absolute left-1/2 transform -translate-x-1/2 space-y-4">
                  {[0, 1, 2, 3].map((index) => (
                    <ArrowDown key={index} className="w-4 h-4 text-gray-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Subscribers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subscribers.map((subscriber) => (
              <div key={subscriber.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-700">{subscriber.name}</h4>
                  {subscriber.backpressure && (
                    <div className="flex items-center gap-1 text-red-600 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      Backpressure
                    </div>
                  )}
                </div>
                
                <div className={`p-4 rounded-lg border-2 ${
                  subscriber.backpressure 
                    ? 'bg-red-50 border-red-300' 
                    : 'bg-green-50 border-green-300'
                }`}>
                  <div className="text-sm text-gray-600 mb-2">
                    Buffer ({subscriber.buffer.length}/{subscriber.bufferSize})
                  </div>
                  
                  <div className="flex gap-2 mb-3">
                    {Array.from({ length: subscriber.bufferSize }, (_, index) => (
                      <div
                        key={index}
                        className={`w-10 h-10 rounded border-2 flex items-center justify-center text-xs font-bold ${
                          subscriber.buffer[index]
                            ? 'bg-blue-500 text-white border-blue-600'
                            : 'bg-gray-100 border-gray-300 text-gray-400'
                        }`}
                      >
                        {subscriber.buffer[index]?.value || '—'}
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    Processing Speed: {subscriber.processingSpeed === 1 ? 'Fast' : 'Slow'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-2"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Pause' : 'Start'} Stream
          </Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gray-50">
        <h3 className="text-xl font-semibold mb-4">Java Code Example</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import java.util.concurrent.Flow.*;
import java.util.concurrent.SubmissionPublisher;

// Publisher implementation
SubmissionPublisher<Integer> publisher = new SubmissionPublisher<>();

// Subscriber with backpressure handling
Subscriber<Integer> subscriber = new Subscriber<Integer>() {
    private Subscription subscription;
    private final int bufferSize = 5;
    
    @Override
    public void onSubscribe(Subscription subscription) {
        this.subscription = subscription;
        subscription.request(bufferSize); // Request initial items
    }
    
    @Override
    public void onNext(Integer item) {
        // Process item
        System.out.println("Processing: " + item);
        
        // Request more items (backpressure control)
        subscription.request(1);
    }
    
    @Override
    public void onError(Throwable throwable) {
        throwable.printStackTrace();
    }
    
    @Override
    public void onComplete() {
        System.out.println("Stream completed");
    }
};

// Subscribe and publish
publisher.subscribe(subscriber);

// Publish items
for (int i = 0; i < 100; i++) {
    publisher.submit(i);
}

publisher.close();

// Using RxJava for more advanced reactive streams
Observable<Integer> observable = Observable.range(1, 1000)
    .observeOn(Schedulers.computation())
    .map(i -> i * 2)
    .filter(i -> i % 3 == 0)
    .onBackpressureBuffer(100); // Handle backpressure

observable.subscribe(
    item -> System.out.println("Received: " + item),
    error -> error.printStackTrace(),
    () -> System.out.println("Completed")
);`}
        </pre>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-600">Core Interfaces</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• <code className="bg-gray-100 px-1 rounded">Publisher&lt;T&gt;</code></li>
            <li>• <code className="bg-gray-100 px-1 rounded">Subscriber&lt;T&gt;</code></li>
            <li>• <code className="bg-gray-100 px-1 rounded">Subscription</code></li>
            <li>• <code className="bg-gray-100 px-1 rounded">Processor&lt;T,R&gt;</code></li>
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-600">Backpressure</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Flow control mechanism</li>
            <li>• Prevents buffer overflow</li>
            <li>• Subscriber controls rate</li>
            <li>• Dynamic demand signaling</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-purple-600">Libraries</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• RxJava</li>
            <li>• Project Reactor</li>
            <li>• Akka Streams</li>
            <li>• Java 9+ Flow API</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
