
import React, { useState, useEffect } from 'react';
import { Play, Pause, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAnimation } from '@/contexts/AnimationContext';

interface ThreadMetric {
  name: string;
  state: string;
  cpuUsage: number;
  memoryUsage: number;
  blockedTime: number;
}

interface PerformanceMetric {
  timestamp: number;
  throughput: number;
  latency: number;
  errors: number;
}

export const DebugMonitor = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { getInterval } = useAnimation();
  const [threads, setThreads] = useState<ThreadMetric[]>([
    { name: 'main', state: 'RUNNABLE', cpuUsage: 15, memoryUsage: 25, blockedTime: 0 },
    { name: 'pool-1-thread-1', state: 'WAITING', cpuUsage: 5, memoryUsage: 18, blockedTime: 1200 },
    { name: 'pool-1-thread-2', state: 'RUNNABLE', cpuUsage: 35, memoryUsage: 22, blockedTime: 0 },
    { name: 'pool-2-thread-1', state: 'BLOCKED', cpuUsage: 0, memoryUsage: 20, blockedTime: 3400 }
  ]);
  
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [deadlockDetected, setDeadlockDetected] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        // Update thread metrics
        setThreads(prev => prev.map(thread => ({
          ...thread,
          cpuUsage: Math.max(0, Math.min(100, thread.cpuUsage + (Math.random() - 0.5) * 20)),
          memoryUsage: Math.max(0, Math.min(100, thread.memoryUsage + (Math.random() - 0.5) * 10)),
          blockedTime: thread.state === 'BLOCKED' ? thread.blockedTime + 100 : 
                      thread.state === 'WAITING' ? thread.blockedTime + 50 : 0,
          state: Math.random() < 0.1 ? 
            ['RUNNABLE', 'WAITING', 'BLOCKED'][Math.floor(Math.random() * 3)] : 
            thread.state
        })));

        // Update performance metrics
        const newMetric: PerformanceMetric = {
          timestamp: Date.now(),
          throughput: Math.floor(Math.random() * 1000) + 500,
          latency: Math.floor(Math.random() * 200) + 50,
          errors: Math.floor(Math.random() * 10)
        };
        
        setMetrics(prev => [...prev.slice(-19), newMetric]);
        
        // Simulate deadlock detection
        setDeadlockDetected(Math.random() < 0.05);
      }, getInterval(1000));
    }
    return () => clearInterval(interval);
  }, [isRunning, getInterval]);

  const reset = () => {
    setIsRunning(false);
    setMetrics([]);
    setDeadlockDetected(false);
    setThreads(prev => prev.map(thread => ({
      ...thread,
      cpuUsage: Math.floor(Math.random() * 40) + 10,
      memoryUsage: Math.floor(Math.random() * 30) + 15,
      blockedTime: 0,
      state: 'RUNNABLE'
    })));
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'RUNNABLE': return 'text-green-600 bg-green-100';
      case 'WAITING': return 'text-yellow-600 bg-yellow-100';
      case 'BLOCKED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const avgLatency = metrics.length > 0 ? 
    Math.round(metrics.reduce((sum, m) => sum + m.latency, 0) / metrics.length) : 0;
  const avgThroughput = metrics.length > 0 ? 
    Math.round(metrics.reduce((sum, m) => sum + m.throughput, 0) / metrics.length) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 25: Debugging & Monitoring</h1>
        <p className="text-gray-600 leading-relaxed">
          Master tools and techniques for debugging concurrent applications and monitoring thread performance.
        </p>
      </div>

      {deadlockDetected && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Deadlock Detected!</h3>
              <p className="text-red-600 text-sm">Circular dependency detected between threads. Check thread dump for details.</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Thread Monitoring
          </h3>
          
          <div className="space-y-4">
            {threads.map((thread, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{thread.name}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStateColor(thread.state)}`}>
                    {thread.state}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="text-gray-600">CPU</div>
                    <div className="flex items-center gap-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${thread.cpuUsage}%` }}
                        />
                      </div>
                      <span className="font-medium">{Math.round(thread.cpuUsage)}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-600">Memory</div>
                    <div className="flex items-center gap-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${thread.memoryUsage}%` }}
                        />
                      </div>
                      <span className="font-medium">{Math.round(thread.memoryUsage)}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-600">Blocked</div>
                    <div className="font-medium">{thread.blockedTime}ms</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Metrics
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600">Avg Throughput</div>
              <div className="text-2xl font-bold text-blue-800">{avgThroughput}</div>
              <div className="text-xs text-blue-600">req/sec</div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600">Avg Latency</div>
              <div className="text-2xl font-bold text-green-800">{avgLatency}</div>
              <div className="text-xs text-green-600">ms</div>
            </div>
          </div>
          
          <div className="h-32 bg-gray-50 rounded-lg p-3 relative overflow-hidden">
            <div className="text-xs text-gray-600 mb-2">Latency Over Time</div>
            {metrics.length > 0 && (
              <svg className="w-full h-20">
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  points={metrics.map((metric, index) => 
                    `${(index / (metrics.length - 1)) * 100},${100 - (metric.latency / 300) * 100}`
                  ).join(' ')}
                />
              </svg>
            )}
          </div>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => setIsRunning(!isRunning)}
          className="flex items-center gap-2"
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? 'Pause' : 'Start'} Monitoring
        </Button>
        <Button variant="outline" onClick={reset}>
          Reset
        </Button>
      </div>

      <Card className="p-6 bg-gray-50">
        <h3 className="text-xl font-semibold mb-4">Java Debugging Tools & Techniques</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// JVM Monitoring and Debugging
public class ConcurrencyDebugger {
    
    // Thread dump analysis
    public void analyzeThreadDump() {
        ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
        
        // Get all thread info with stack traces
        ThreadInfo[] threadInfos = threadBean.getThreadInfo(
            threadBean.getAllThreadIds(), true, true);
        
        for (ThreadInfo info : threadInfos) {
            System.out.println("Thread: " + info.getThreadName());
            System.out.println("State: " + info.getThreadState());
            System.out.println("Blocked time: " + info.getBlockedTime());
            System.out.println("Wait time: " + info.getWaitedTime());
            
            if (info.getLockInfo() != null) {
                System.out.println("Waiting on: " + info.getLockInfo());
            }
        }
    }
    
    // Deadlock detection
    public void detectDeadlocks() {
        ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
        long[] deadlockedThreads = threadBean.findDeadlockedThreads();
        
        if (deadlockedThreads != null) {
            ThreadInfo[] threadInfos = threadBean.getThreadInfo(deadlockedThreads);
            System.out.println("Deadlock detected involving threads:");
            for (ThreadInfo info : threadInfos) {
                System.out.println("- " + info.getThreadName());
            }
        }
    }
    
    // Custom monitoring with JFR
    @JfrEvent(name = "CustomConcurrencyEvent")
    public static class ConcurrencyEvent extends Event {
        @Label("Thread Name")
        public String threadName;
        
        @Label("Operation Type")
        public String operationType;
        
        @Label("Duration")
        @Timespan(Timespan.MILLISECONDS)
        public long duration;
    }
    
    // Performance monitoring
    public void monitorThreadPool() {
        ThreadPoolExecutor executor = (ThreadPoolExecutor) 
            Executors.newFixedThreadPool(10);
        
        ScheduledExecutorService monitor = Executors.newScheduledThreadPool(1);
        monitor.scheduleAtFixedRate(() -> {
            System.out.println("Pool size: " + executor.getPoolSize());
            System.out.println("Active threads: " + executor.getActiveCount());
            System.out.println("Queue size: " + executor.getQueue().size());
            System.out.println("Completed tasks: " + executor.getCompletedTaskCount());
        }, 0, 5, TimeUnit.SECONDS);
    }
}`}
        </pre>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-600">Debugging Tools</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• jstack - Thread dumps</li>
            <li>• jconsole - JVM monitoring</li>
            <li>• VisualVM - Profiling</li>
            <li>• JProfiler - Advanced analysis</li>
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-600">Key Metrics</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Thread states and transitions</li>
            <li>• Lock contention</li>
            <li>• CPU utilization per thread</li>
            <li>• Memory allocation patterns</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-red-600">Common Issues</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Deadlocks and livelocks</li>
            <li>• Thread pool exhaustion</li>
            <li>• Memory leaks in threads</li>
            <li>• Excessive context switching</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
