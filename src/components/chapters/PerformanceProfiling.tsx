
import React, { useState, useEffect } from 'react';
import { Play, Pause, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAnimation } from '@/contexts/AnimationContext';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

interface ThreadMetric {
  id: string;
  name: string;
  cpuUsage: number;
  memoryUsage: number;
  blockedTime: number;
  waitingTime: number;
}

export const PerformanceProfiling = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { getInterval } = useAnimation();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    { name: 'CPU Usage', value: 45, unit: '%', trend: 'stable', status: 'good' },
    { name: 'Memory Usage', value: 512, unit: 'MB', trend: 'up', status: 'warning' },
    { name: 'Thread Count', value: 24, unit: 'threads', trend: 'stable', status: 'good' },
    { name: 'Deadlocks', value: 0, unit: 'count', trend: 'stable', status: 'good' },
    { name: 'GC Frequency', value: 12, unit: '/min', trend: 'down', status: 'good' },
    { name: 'Response Time', value: 156, unit: 'ms', trend: 'up', status: 'warning' }
  ]);

  const [threadMetrics, setThreadMetrics] = useState<ThreadMetric[]>([
    { id: 'main', name: 'main', cpuUsage: 15, memoryUsage: 128, blockedTime: 5, waitingTime: 10 },
    { id: 'worker-1', name: 'worker-1', cpuUsage: 80, memoryUsage: 64, blockedTime: 15, waitingTime: 5 },
    { id: 'worker-2', name: 'worker-2', cpuUsage: 60, memoryUsage: 96, blockedTime: 25, waitingTime: 15 },
    { id: 'gc', name: 'GC Thread', cpuUsage: 5, memoryUsage: 32, blockedTime: 0, waitingTime: 90 }
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setMetrics(prev => prev.map(metric => {
          const change = (Math.random() - 0.5) * 20;
          const newValue = Math.max(0, metric.value + change);
          let newStatus: 'good' | 'warning' | 'critical' = 'good';
          let newTrend: 'up' | 'down' | 'stable' = 'stable';

          if (change > 5) newTrend = 'up';
          else if (change < -5) newTrend = 'down';

          // Determine status based on metric type and value
          if (metric.name === 'CPU Usage') {
            if (newValue > 80) newStatus = 'critical';
            else if (newValue > 60) newStatus = 'warning';
          } else if (metric.name === 'Memory Usage') {
            if (newValue > 800) newStatus = 'critical';
            else if (newValue > 600) newStatus = 'warning';
          } else if (metric.name === 'Response Time') {
            if (newValue > 300) newStatus = 'critical';
            else if (newValue > 200) newStatus = 'warning';
          } else if (metric.name === 'Deadlocks') {
            if (newValue > 0) newStatus = 'critical';
          }

          return {
            ...metric,
            value: Math.round(newValue),
            trend: newTrend,
            status: newStatus
          };
        }));

        setThreadMetrics(prev => prev.map(thread => ({
          ...thread,
          cpuUsage: Math.max(0, Math.min(100, thread.cpuUsage + (Math.random() - 0.5) * 20)),
          memoryUsage: Math.max(0, thread.memoryUsage + (Math.random() - 0.5) * 10),
          blockedTime: Math.max(0, Math.min(50, thread.blockedTime + (Math.random() - 0.5) * 10)),
          waitingTime: Math.max(0, Math.min(95, thread.waitingTime + (Math.random() - 0.5) * 15))
        })));
      }, getInterval(1000));
    }
    return () => clearInterval(interval);
  }, [isRunning, getInterval]);

  const reset = () => {
    setIsRunning(false);
    setMetrics([
      { name: 'CPU Usage', value: 45, unit: '%', trend: 'stable', status: 'good' },
      { name: 'Memory Usage', value: 512, unit: 'MB', trend: 'up', status: 'warning' },
      { name: 'Thread Count', value: 24, unit: 'threads', trend: 'stable', status: 'good' },
      { name: 'Deadlocks', value: 0, unit: 'count', trend: 'stable', status: 'good' },
      { name: 'GC Frequency', value: 12, unit: '/min', trend: 'down', status: 'good' },
      { name: 'Response Time', value: 156, unit: 'ms', trend: 'up', status: 'warning' }
    ]);
    setThreadMetrics([
      { id: 'main', name: 'main', cpuUsage: 15, memoryUsage: 128, blockedTime: 5, waitingTime: 10 },
      { id: 'worker-1', name: 'worker-1', cpuUsage: 80, memoryUsage: 64, blockedTime: 15, waitingTime: 5 },
      { id: 'worker-2', name: 'worker-2', cpuUsage: 60, memoryUsage: 96, blockedTime: 25, waitingTime: 15 },
      { id: 'gc', name: 'GC Thread', cpuUsage: 5, memoryUsage: 32, blockedTime: 0, waitingTime: 90 }
    ]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 border-green-300';
      case 'warning':
        return 'bg-yellow-100 border-yellow-300';
      case 'critical':
        return 'bg-red-100 border-red-300';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '→';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 15: Performance & Profiling</h1>
        <p className="text-gray-600 leading-relaxed">
          Learn how to monitor, profile, and optimize Java concurrent applications for maximum performance.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Real-time Performance Metrics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {metrics.map((metric) => (
            <div key={metric.name} className={`p-4 rounded-lg border-2 ${getStatusColor(metric.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  <span className="font-medium text-gray-700">{metric.name}</span>
                </div>
                <span className="text-lg">{getTrendIcon(metric.trend)}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metric.value} <span className="text-sm font-normal text-gray-600">{metric.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <h4 className="text-lg font-semibold mb-4">Thread-specific Metrics</h4>
        <div className="space-y-3 mb-6">
          {threadMetrics.map((thread) => (
            <div key={thread.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-700">{thread.name}</span>
                <span className="text-sm text-gray-600">Thread ID: {thread.id}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-600 mb-1">CPU Usage</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${thread.cpuUsage}%` }}
                    />
                  </div>
                  <div className="text-xs mt-1">{Math.round(thread.cpuUsage)}%</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-600 mb-1">Memory</div>
                  <div className="text-sm font-medium">{Math.round(thread.memoryUsage)} MB</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-600 mb-1">Blocked</div>
                  <div className="text-sm font-medium">{Math.round(thread.blockedTime)}%</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-600 mb-1">Waiting</div>
                  <div className="text-sm font-medium">{Math.round(thread.waitingTime)}%</div>
                </div>
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
            {isRunning ? 'Pause' : 'Start'} Monitoring
          </Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gray-50">
        <h3 className="text-xl font-semibold mb-4">Profiling Tools & Commands</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// JVM Profiling Tools

// 1. jstack - Thread dump analysis
jstack <pid>  // Get thread dump
jstack -l <pid>  // Include lock information

// 2. jstat - JVM statistics
jstat -gc <pid> 1s  // GC statistics every second
jstat -gccapacity <pid>  // Heap capacity info
jstat -gcutil <pid>  // GC utilization

// 3. jcmd - Multi-purpose diagnostic tool
jcmd <pid> Thread.print  // Thread dump
jcmd <pid> GC.run_finalization  // Force GC
jcmd <pid> VM.classloader_stats  // Classloader info

// 4. Java Flight Recorder (JFR)
java -XX:+FlightRecorder 
     -XX:StartFlightRecording=duration=60s,filename=profile.jfr
     MyApplication

// 5. Programmatic monitoring
ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
long[] threadIds = threadBean.getAllThreadIds();
ThreadInfo[] threadInfos = threadBean.getThreadInfo(threadIds);

for (ThreadInfo info : threadInfos) {
    System.out.println("Thread: " + info.getThreadName());
    System.out.println("State: " + info.getThreadState());
    System.out.println("Blocked Time: " + info.getBlockedTime());
    System.out.println("Wait Time: " + info.getWaitedTime());
}

// Memory monitoring
MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
System.out.println("Heap Used: " + heapUsage.getUsed());
System.out.println("Heap Max: " + heapUsage.getMax());

// Deadlock detection
long[] deadlocked = threadBean.findDeadlockedThreads();
if (deadlocked != null) {
    ThreadInfo[] deadlockInfo = threadBean.getThreadInfo(deadlocked);
    // Handle deadlock...
}`}
        </pre>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-600">Profiling Tools</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• JProfiler</li>
            <li>• VisualVM</li>
            <li>• Java Flight Recorder</li>
            <li>• JConsole</li>
            <li>• Async Profiler</li>
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-600">Key Metrics</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Thread states distribution</li>
            <li>• Lock contention</li>
            <li>• CPU utilization</li>
            <li>• Memory allocation</li>
            <li>• GC impact</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-purple-600">Optimization</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Reduce lock contention</li>
            <li>• Optimize thread pool sizes</li>
            <li>• Minimize object allocation</li>
            <li>• Use lock-free algorithms</li>
            <li>• Profile in production</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
