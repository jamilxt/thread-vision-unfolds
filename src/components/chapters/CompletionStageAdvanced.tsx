
import React, { useState, useEffect } from 'react';
import { Play, Pause, GitBranch, Merge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAnimation } from '@/contexts/AnimationContext';

interface CompletionNode {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  dependencies: string[];
  position: { x: number; y: number };
}

export const CompletionStageAdvanced = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { getInterval } = useAnimation();
  const [nodes, setNodes] = useState<CompletionNode[]>([
    { id: 'fetchUser', name: 'Fetch User', status: 'pending', dependencies: [], position: { x: 50, y: 100 } },
    { id: 'fetchOrders', name: 'Fetch Orders', status: 'pending', dependencies: ['fetchUser'], position: { x: 200, y: 50 } },
    { id: 'fetchProfile', name: 'Fetch Profile', status: 'pending', dependencies: ['fetchUser'], position: { x: 200, y: 150 } },
    { id: 'combineData', name: 'Combine Data', status: 'pending', dependencies: ['fetchOrders', 'fetchProfile'], position: { x: 350, y: 100 } },
    { id: 'generateReport', name: 'Generate Report', status: 'pending', dependencies: ['combineData'], position: { x: 500, y: 100 } }
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setNodes(prev => {
          const updated = [...prev];
          
          // Find nodes that can start (all dependencies completed)
          const readyToStart = updated.filter(node => 
            node.status === 'pending' && 
            node.dependencies.every(dep => 
              updated.find(n => n.id === dep)?.status === 'completed'
            )
          );
          
          // Start ready nodes
          readyToStart.forEach(node => {
            node.status = 'running';
          });
          
          // Progress running nodes
          const runningNodes = updated.filter(node => node.status === 'running');
          runningNodes.forEach(node => {
            if (Math.random() > 0.3) { // 70% chance to complete each cycle
              node.status = 'completed';
              node.result = `Result from ${node.name}`;
            }
          });
          
          return updated;
        });
      }, getInterval(1000));
    }
    return () => clearInterval(interval);
  }, [isRunning, getInterval]);

  const reset = () => {
    setIsRunning(false);
    setNodes(prev => prev.map(node => ({
      ...node,
      status: 'pending',
      result: undefined
    })));
  };

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-200 border-gray-400';
      case 'running': return 'bg-blue-200 border-blue-400 animate-pulse';
      case 'completed': return 'bg-green-200 border-green-400';
      case 'failed': return 'bg-red-200 border-red-400';
      default: return 'bg-gray-200 border-gray-400';
    }
  };

  const allCompleted = nodes.every(node => node.status === 'completed');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 23: Advanced CompletionStage</h1>
        <p className="text-gray-600 leading-relaxed">
          Master complex asynchronous workflows with CompletionStage composition, error handling, and dependency management.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">CompletionStage Pipeline Visualization</h3>
        
        <div className="relative bg-gray-50 rounded-lg p-6 mb-6 h-80 overflow-hidden">
          {/* Render connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {nodes.map(node => 
              node.dependencies.map(depId => {
                const depNode = nodes.find(n => n.id === depId);
                if (!depNode) return null;
                
                return (
                  <line
                    key={`${depId}-${node.id}`}
                    x1={depNode.position.x + 60}
                    y1={depNode.position.y + 20}
                    x2={node.position.x}
                    y2={node.position.y + 20}
                    stroke="#6b7280"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })
            )}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
            </defs>
          </svg>
          
          {/* Render nodes */}
          {nodes.map(node => (
            <div
              key={node.id}
              className={`absolute w-24 h-10 rounded-lg border-2 flex items-center justify-center text-xs font-medium transition-all duration-300 ${getNodeColor(node.status)}`}
              style={{ 
                left: `${node.position.x}px`, 
                top: `${node.position.y}px`,
                transform: node.status === 'running' ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              {node.name}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 border-2 border-gray-400 rounded"></div>
            <span className="text-sm">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-200 border-2 border-blue-400 rounded"></div>
            <span className="text-sm">Running</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 border-2 border-green-400 rounded"></div>
            <span className="text-sm">Completed</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            disabled={allCompleted}
            className="flex items-center gap-2"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Pause' : 'Start'} Pipeline
          </Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gray-50">
        <h3 className="text-xl font-semibold mb-4">Java CompletionStage Example</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;

public class AdvancedCompletionStageExample {
    
    public CompletionStage<String> createComplexPipeline() {
        // Start with fetching user data
        CompletionStage<User> userStage = fetchUserAsync();
        
        // Branch into parallel operations
        CompletionStage<List<Order>> ordersStage = userStage
            .thenCompose(user -> fetchOrdersAsync(user.getId()));
            
        CompletionStage<UserProfile> profileStage = userStage
            .thenCompose(user -> fetchProfileAsync(user.getId()));
        
        // Combine results from parallel operations
        CompletionStage<UserData> combinedStage = ordersStage
            .thenCombine(profileStage, (orders, profile) -> 
                new UserData(orders, profile));
        
        // Transform and handle errors
        return combinedStage
            .thenApply(this::generateReport)
            .handle((result, exception) -> {
                if (exception != null) {
                    return "Error: " + exception.getMessage();
                }
                return result;
            });
    }
    
    // Timeout handling
    public CompletionStage<String> withTimeout() {
        CompletableFuture<String> future = new CompletableFuture<>();
        
        CompletableFuture<String> operation = fetchDataAsync()
            .thenApply(this::processData);
            
        CompletableFuture<String> timeout = new CompletableFuture<>();
        scheduler.schedule(() -> 
            timeout.complete("Timeout!"), 5, TimeUnit.SECONDS);
        
        return CompletableFuture.anyOf(operation, timeout)
            .thenApply(result -> (String) result);
    }
    
    // Exception handling patterns
    public CompletionStage<String> withErrorHandling() {
        return fetchDataAsync()
            .thenApply(this::processData)
            .exceptionally(throwable -> {
                log.error("Operation failed", throwable);
                return "Default value";
            })
            .thenCompose(result -> {
                if ("Default value".equals(result)) {
                    return fetchBackupDataAsync();
                }
                return CompletableFuture.completedFuture(result);
            });
    }
    
    private CompletionStage<User> fetchUserAsync() { /* ... */ }
    private CompletionStage<List<Order>> fetchOrdersAsync(String userId) { /* ... */ }
    private CompletionStage<UserProfile> fetchProfileAsync(String userId) { /* ... */ }
}`}
        </pre>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-600 flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Composition Patterns
          </h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• <code>thenCompose()</code> - Chain dependent operations</li>
            <li>• <code>thenCombine()</code> - Combine parallel results</li>
            <li>• <code>thenApply()</code> - Transform results</li>
            <li>• <code>allOf()</code> - Wait for all completions</li>
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-600 flex items-center gap-2">
            <Merge className="w-5 h-5" />
            Error Handling
          </h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• <code>exceptionally()</code> - Handle exceptions</li>
            <li>• <code>handle()</code> - Process result or error</li>
            <li>• <code>whenComplete()</code> - Cleanup actions</li>
            <li>• <code>completeExceptionally()</code> - Manual failure</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-purple-600">Best Practices</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Use appropriate thread pools</li>
            <li>• Handle timeouts explicitly</li>
            <li>• Avoid blocking operations</li>
            <li>• Implement proper error recovery</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
