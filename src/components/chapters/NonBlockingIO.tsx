
import React, { useState, useEffect } from 'react';
import { Play, Pause, Network, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAnimation } from '@/contexts/AnimationContext';

interface IOOperation {
  id: string;
  type: 'read' | 'write';
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
  channel: string;
  isBlocking: boolean;
}

export const NonBlockingIO = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isBlocking, setIsBlocking] = useState(true);
  const { getInterval } = useAnimation();
  const [operations, setOperations] = useState<IOOperation[]>([]);
  const [threadStatus, setThreadStatus] = useState<'free' | 'blocked' | 'busy'>('free');

  const addOperation = () => {
    const newOp: IOOperation = {
      id: `op-${Date.now()}`,
      type: Math.random() > 0.5 ? 'read' : 'write',
      status: 'pending',
      progress: 0,
      channel: `Channel-${Math.floor(Math.random() * 3) + 1}`,
      isBlocking
    };
    setOperations(prev => [...prev, newOp]);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setOperations(prev => {
          const updated = [...prev];
          
          if (isBlocking) {
            // Blocking I/O - process one at a time
            const inProgress = updated.find(op => op.status === 'in-progress');
            if (inProgress) {
              inProgress.progress = Math.min(inProgress.progress + 20, 100);
              if (inProgress.progress >= 100) {
                inProgress.status = 'completed';
                setThreadStatus('free');
              }
            } else {
              const pending = updated.find(op => op.status === 'pending');
              if (pending) {
                pending.status = 'in-progress';
                setThreadStatus('blocked');
              }
            }
          } else {
            // Non-blocking I/O - process multiple operations
            setThreadStatus('free');
            updated.forEach(op => {
              if (op.status === 'pending') {
                op.status = 'in-progress';
              }
              if (op.status === 'in-progress') {
                op.progress = Math.min(op.progress + 15, 100);
                if (op.progress >= 100) {
                  op.status = 'completed';
                }
              }
            });
          }
          
          return updated.filter(op => op.status !== 'completed' || op.progress < 100);
        });
      }, getInterval(300));
    }
    return () => clearInterval(interval);
  }, [isRunning, isBlocking, getInterval]);

  const reset = () => {
    setIsRunning(false);
    setOperations([]);
    setThreadStatus('free');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 22: Non-blocking I/O</h1>
        <p className="text-gray-600 leading-relaxed">
          Understand the difference between blocking and non-blocking I/O operations and how NIO.2 improves performance.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">I/O Operation Simulation</h3>
        
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => setIsBlocking(!isBlocking)}
            variant={isBlocking ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isBlocking ? <Clock className="w-4 h-4" /> : <Network className="w-4 h-4" />}
            {isBlocking ? 'Blocking I/O' : 'Non-blocking I/O'}
          </Button>
          
          <Button onClick={addOperation} disabled={!isRunning}>
            Add I/O Operation
          </Button>
          
          <div className="flex-1" />
          
          <div className={`px-3 py-1 rounded text-sm font-medium ${
            threadStatus === 'free' ? 'bg-green-100 text-green-700' :
            threadStatus === 'blocked' ? 'bg-red-100 text-red-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            Thread: {threadStatus.toUpperCase()}
          </div>
        </div>

        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
          {operations.map((operation) => (
            <div
              key={operation.id}
              className={`p-4 rounded-lg border-2 ${
                operation.status === 'completed'
                  ? 'bg-green-100 border-green-300'
                  : operation.status === 'in-progress'
                  ? 'bg-blue-100 border-blue-300'
                  : 'bg-gray-100 border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    operation.type === 'read' ? 'bg-blue-500' : 'bg-orange-500'
                  }`} />
                  <span className="font-medium">
                    {operation.type.toUpperCase()} - {operation.channel}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {operation.status.toUpperCase()}
                </span>
              </div>
              
              {operation.status !== 'pending' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-200 ${
                      operation.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${operation.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
          
          {operations.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No I/O operations. Click "Add I/O Operation" to start.
            </div>
          )}
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
        <h3 className="text-xl font-semibold mb-4">Java NIO.2 Example</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import java.nio.channels.*;
import java.nio.file.*;
import java.util.concurrent.Future;

public class NonBlockingIOExample {
    
    // Traditional blocking I/O
    public void blockingFileRead() throws IOException {
        Path path = Paths.get("large-file.txt");
        
        // This blocks until the entire file is read
        List<String> lines = Files.readAllLines(path);
        
        // Thread is blocked during the entire operation
        System.out.println("File read complete: " + lines.size());
    }
    
    // Non-blocking I/O with AsynchronousFileChannel
    public void nonBlockingFileRead() throws IOException {
        Path path = Paths.get("large-file.txt");
        AsynchronousFileChannel channel = AsynchronousFileChannel.open(
            path, StandardOpenOption.READ);
        
        ByteBuffer buffer = ByteBuffer.allocate(1024);
        
        // Non-blocking read operation
        Future<Integer> result = channel.read(buffer, 0);
        
        // Thread is free to do other work
        doOtherWork();
        
        // Check if operation completed
        if (result.isDone()) {
            int bytesRead = result.get();
            System.out.println("Bytes read: " + bytesRead);
        }
        
        channel.close();
    }
    
    // Asynchronous I/O with CompletionHandler
    public void asyncFileRead() throws IOException {
        Path path = Paths.get("large-file.txt");
        AsynchronousFileChannel channel = AsynchronousFileChannel.open(
            path, StandardOpenOption.READ);
        
        ByteBuffer buffer = ByteBuffer.allocate(1024);
        
        channel.read(buffer, 0, null, new CompletionHandler<Integer, Object>() {
            @Override
            public void completed(Integer result, Object attachment) {
                System.out.println("Read completed: " + result + " bytes");
                // Handle successful completion
            }
            
            @Override
            public void failed(Throwable exc, Object attachment) {
                System.err.println("Read failed: " + exc.getMessage());
                // Handle failure
            }
        });
    }
    
    private void doOtherWork() {
        // Thread can perform other tasks while I/O is in progress
        System.out.println("Doing other work...");
    }
}`}
        </pre>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-red-600">Blocking I/O Issues</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Thread blocked during I/O operations</li>
            <li>• Poor scalability with many connections</li>
            <li>• Wasted CPU cycles while waiting</li>
            <li>• One thread per connection model</li>
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-600">Non-blocking Benefits</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Thread free to handle other tasks</li>
            <li>• Better resource utilization</li>
            <li>• Higher concurrency with fewer threads</li>
            <li>• Asynchronous completion handlers</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
