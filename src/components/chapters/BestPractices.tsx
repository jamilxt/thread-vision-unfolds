
import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Lightbulb, Shield, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Practice {
  id: string;
  title: string;
  description: string;
  type: 'good' | 'bad' | 'tip';
  code?: string;
}

export const BestPractices = () => {
  const [selectedCategory, setSelectedCategory] = useState<'patterns' | 'performance' | 'safety'>('patterns');

  const practices = {
    patterns: [
      {
        id: 'immutable',
        title: 'Use Immutable Objects',
        description: 'Immutable objects are inherently thread-safe and eliminate many concurrency issues.',
        type: 'good' as const,
        code: `public final class ImmutableCounter {
    private final int value;
    
    public ImmutableCounter(int value) {
        this.value = value;
    }
    
    public int getValue() { return value; }
    
    public ImmutableCounter increment() {
        return new ImmutableCounter(value + 1);
    }
}`
      },
      {
        id: 'shared-mutable',
        title: 'Avoid Shared Mutable State',
        description: 'Sharing mutable state between threads leads to race conditions and synchronization complexity.',
        type: 'bad' as const,
        code: `// Bad: Shared mutable counter
public class BadCounter {
    private int count = 0; // Shared mutable state
    
    public void increment() {
        count++; // Race condition!
    }
}`
      },
      {
        id: 'higher-level',
        title: 'Prefer Higher-Level Constructs',
        description: 'Use ExecutorService, CountDownLatch, etc. instead of raw Thread and synchronized.',
        type: 'tip' as const,
        code: `// Good: Use ExecutorService
ExecutorService executor = Executors.newFixedThreadPool(4);
CompletableFuture<String> future = CompletableFuture
    .supplyAsync(() -> heavyComputation(), executor);`
      }
    ],
    performance: [
      {
        id: 'lock-free',
        title: 'Use Lock-Free Data Structures',
        description: 'AtomicInteger, ConcurrentHashMap, etc. often outperform synchronized alternatives.',
        type: 'good' as const,
        code: `// Good: Lock-free atomic operations
private final AtomicInteger counter = new AtomicInteger(0);

public int increment() {
    return counter.incrementAndGet();
}`
      },
      {
        id: 'excessive-sync',
        title: 'Avoid Excessive Synchronization',
        description: 'Over-synchronization can hurt performance more than help correctness.',
        type: 'bad' as const,
        code: `// Bad: Unnecessary synchronization
public synchronized String getName() {
    return this.name; // String is immutable!
}`
      },
      {
        id: 'batch-ops',
        title: 'Batch Operations When Possible',
        description: 'Reduce contention by batching multiple operations under a single lock.',
        type: 'tip' as const
      }
    ],
    safety: [
      {
        id: 'defensive-copy',
        title: 'Use Defensive Copying',
        description: 'Copy mutable objects when passing between threads to prevent shared access.',
        type: 'good' as const,
        code: `public List<String> getItems() {
    synchronized (items) {
        return new ArrayList<>(items); // Defensive copy
    }
}`
      },
      {
        id: 'static-fields',
        title: "Don't Synchronize on Public Fields",
        description: 'External code can interfere with synchronization on public objects.',
        type: 'bad' as const,
        code: `// Bad: Synchronizing on public field
public final Object lock = new Object();

public void method() {
    synchronized (lock) { // External interference possible
        // critical section
    }
}`
      },
      {
        id: 'timeouts',
        title: 'Always Use Timeouts',
        description: 'Prevent indefinite blocking by using timed versions of blocking operations.',
        type: 'tip' as const,
        code: `// Good: Use timeouts
if (lock.tryLock(5, TimeUnit.SECONDS)) {
    try {
        // critical section
    } finally {
        lock.unlock();
    }
} else {
    // Handle timeout
}`
      }
    ]
  };

  const getIcon = (type: Practice['type']) => {
    switch (type) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'bad':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'tip':
        return <Lightbulb className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getCardStyle = (type: Practice['type']) => {
    switch (type) {
      case 'good':
        return 'border-green-200 bg-green-50';
      case 'bad':
        return 'border-red-200 bg-red-50';
      case 'tip':
        return 'border-yellow-200 bg-yellow-50';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 20: Best Practices</h1>
        <p className="text-gray-600 leading-relaxed">
          Essential guidelines and patterns for writing safe, efficient, and maintainable concurrent Java code.
        </p>
      </div>

      {/* Category Selector */}
      <div className="flex gap-4">
        <Button
          variant={selectedCategory === 'patterns' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('patterns')}
          className="flex items-center gap-2"
        >
          <Shield className="w-4 h-4" />
          Design Patterns
        </Button>
        <Button
          variant={selectedCategory === 'performance' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('performance')}
          className="flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Performance
        </Button>
        <Button
          variant={selectedCategory === 'safety' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('safety')}
          className="flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Thread Safety
        </Button>
      </div>

      {/* Practices Grid */}
      <div className="grid grid-cols-1 gap-6">
        {practices[selectedCategory].map((practice) => (
          <Card key={practice.id} className={`p-6 border-2 ${getCardStyle(practice.type)}`}>
            <div className="flex items-start gap-4">
              {getIcon(practice.type)}
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{practice.title}</h3>
                <p className="text-gray-700 mb-4">{practice.description}</p>
                
                {practice.code && (
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">{practice.code}</pre>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-green-800 mb-2">Do's</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>Use immutable objects</li>
            <li>Prefer concurrent collections</li>
            <li>Use higher-level constructs</li>
            <li>Document thread safety</li>
          </ul>
        </Card>

        <Card className="p-6 text-center">
          <XCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
          <h3 className="font-semibold text-red-800 mb-2">Don'ts</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>Don't share mutable state</li>
            <li>Don't use Thread.stop()</li>
            <li>Don't ignore InterruptedException</li>
            <li>Don't synchronize on String literals</li>
          </ul>
        </Card>

        <Card className="p-6 text-center">
          <Zap className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-blue-800 mb-2">Performance</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>Minimize lock scope</li>
            <li>Use lock-free algorithms</li>
            <li>Avoid blocking operations</li>
            <li>Profile your code</li>
          </ul>
        </Card>

        <Card className="p-6 text-center">
          <Lightbulb className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
          <h3 className="font-semibold text-yellow-800 mb-2">Testing</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>Use stress testing</li>
            <li>Test with multiple threads</li>
            <li>Use tools like JMH</li>
            <li>Test edge cases</li>
          </ul>
        </Card>
      </div>

      {/* Final Recommendations */}
      <Card className="p-6 bg-indigo-50 border-indigo-200">
        <h3 className="text-xl font-semibold text-indigo-800 mb-4">Key Takeaways</h3>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>1. Start Simple:</strong> Begin with thread-safe designs and add complexity only when necessary.
          </p>
          <p>
            <strong>2. Measure Performance:</strong> Don't optimize prematurely. Profile your application to identify real bottlenecks.
          </p>
          <p>
            <strong>3. Use Modern APIs:</strong> Java's concurrent utilities (java.util.concurrent) are battle-tested and optimized.
          </p>
          <p>
            <strong>4. Document Everything:</strong> Clearly document thread safety guarantees and synchronization requirements.
          </p>
          <p>
            <strong>5. Test Thoroughly:</strong> Concurrent bugs are hard to reproduce. Use stress testing and proper tooling.
          </p>
        </div>
      </Card>
    </div>
  );
};
