
import React, { useState, useEffect } from 'react';
import { Play, Pause, Server, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAnimation } from '@/contexts/AnimationContext';

interface Service {
  id: string;
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  requestCount: number;
}

interface CircuitBreaker {
  service: string;
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  successCount: number;
  threshold: number;
}

export const MicroservicesPatterns = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { getInterval } = useAnimation();
  const [services, setServices] = useState<Service[]>([
    { id: 'user', name: 'User Service', status: 'healthy', responseTime: 150, requestCount: 0 },
    { id: 'order', name: 'Order Service', status: 'healthy', responseTime: 200, requestCount: 0 },
    { id: 'inventory', name: 'Inventory Service', status: 'healthy', responseTime: 100, requestCount: 0 },
    { id: 'payment', name: 'Payment Service', status: 'healthy', responseTime: 300, requestCount: 0 }
  ]);
  
  const [circuitBreakers, setCircuitBreakers] = useState<CircuitBreaker[]>([
    { service: 'user', state: 'closed', failureCount: 0, successCount: 0, threshold: 5 },
    { service: 'order', state: 'closed', failureCount: 0, successCount: 0, threshold: 5 },
    { service: 'inventory', state: 'closed', failureCount: 0, successCount: 0, threshold: 5 },
    { service: 'payment', state: 'closed', failureCount: 0, successCount: 0, threshold: 5 }
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setServices(prev => prev.map(service => {
          const newRequestCount = service.requestCount + Math.floor(Math.random() * 3) + 1;
          let newStatus = service.status;
          let newResponseTime = service.responseTime;
          
          // Simulate service degradation
          if (Math.random() < 0.1) {
            newStatus = Math.random() < 0.7 ? 'degraded' : 'unhealthy';
            newResponseTime = service.responseTime * (1 + Math.random() * 2);
          } else if (service.status !== 'healthy' && Math.random() < 0.3) {
            newStatus = 'healthy';
            newResponseTime = service.responseTime * 0.8;
          }
          
          return {
            ...service,
            status: newStatus,
            responseTime: Math.round(newResponseTime),
            requestCount: newRequestCount
          };
        }));

        setCircuitBreakers(prev => prev.map(cb => {
          const service = services.find(s => s.id === cb.service);
          if (!service) return cb;
          
          let newFailureCount = cb.failureCount;
          let newSuccessCount = cb.successCount;
          let newState = cb.state;
          
          if (service.status === 'unhealthy') {
            newFailureCount++;
          } else if (service.status === 'healthy') {
            newSuccessCount++;
            if (cb.state === 'open' && newSuccessCount > 2) {
              newState = 'half-open';
            }
          }
          
          // Circuit breaker logic
          if (cb.state === 'closed' && newFailureCount >= cb.threshold) {
            newState = 'open';
          } else if (cb.state === 'half-open' && newSuccessCount > 5) {
            newState = 'closed';
            newFailureCount = 0;
          }
          
          return {
            ...cb,
            state: newState,
            failureCount: newFailureCount,
            successCount: newSuccessCount
          };
        }));
      }, getInterval(1000));
    }
    return () => clearInterval(interval);
  }, [isRunning, getInterval, services]);

  const reset = () => {
    setIsRunning(false);
    setServices(prev => prev.map(service => ({
      ...service,
      status: 'healthy',
      responseTime: Math.floor(Math.random() * 200) + 100,
      requestCount: 0
    })));
    setCircuitBreakers(prev => prev.map(cb => ({
      ...cb,
      state: 'closed',
      failureCount: 0,
      successCount: 0
    })));
  };

  const getServiceColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 border-green-400 text-green-700';
      case 'degraded': return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'unhealthy': return 'bg-red-100 border-red-400 text-red-700';
      default: return 'bg-gray-100 border-gray-400 text-gray-700';
    }
  };

  const getCircuitBreakerColor = (state: string) => {
    switch (state) {
      case 'closed': return 'bg-green-500';
      case 'open': return 'bg-red-500';
      case 'half-open': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 24: Microservices Concurrency Patterns</h1>
        <p className="text-gray-600 leading-relaxed">
          Learn essential patterns for handling concurrency in distributed microservice architectures.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Microservices Health & Circuit Breakers</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {services.map((service) => {
            const circuitBreaker = circuitBreakers.find(cb => cb.service === service.id);
            return (
              <div key={service.id} className={`p-4 rounded-lg border-2 ${getServiceColor(service.status)}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    <span className="font-semibold">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {service.status === 'healthy' && <CheckCircle className="w-4 h-4" />}
                    {service.status !== 'healthy' && <AlertCircle className="w-4 h-4" />}
                    <span className="text-sm font-medium">{service.status.toUpperCase()}</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Response Time:</span>
                    <span className="font-medium">{service.responseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Requests:</span>
                    <span className="font-medium">{service.requestCount}</span>
                  </div>
                </div>
                
                {circuitBreaker && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Circuit Breaker</span>
                      <div className={`w-3 h-3 rounded-full ${getCircuitBreakerColor(circuitBreaker.state)}`} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>State: {circuitBreaker.state.toUpperCase()}</div>
                      <div>Failures: {circuitBreaker.failureCount}</div>
                      <div>Success: {circuitBreaker.successCount}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
        <h3 className="text-xl font-semibold mb-4">Java Microservices Patterns</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// Circuit Breaker Pattern
@Component
public class CircuitBreakerService {
    private final CircuitBreaker circuitBreaker;
    
    public CircuitBreakerService() {
        this.circuitBreaker = CircuitBreaker.ofDefaults("userService");
        circuitBreaker.getEventPublisher()
            .onStateTransition(event -> 
                log.info("Circuit breaker state transition: {}", event));
    }
    
    public CompletableFuture<User> getUserAsync(String userId) {
        Supplier<CompletableFuture<User>> decoratedSupplier = 
            CircuitBreaker.decorateSupplier(circuitBreaker, () -> 
                userServiceClient.fetchUser(userId));
        
        return decoratedSupplier.get()
            .exceptionally(throwable -> {
                log.warn("Circuit breaker fallback triggered", throwable);
                return getFallbackUser(userId);
            });
    }
}

// Bulkhead Pattern
@Configuration
public class BulkheadConfiguration {
    
    @Bean("userServiceExecutor")
    public ThreadPoolTaskExecutor userServiceExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(25);
        executor.setThreadNamePrefix("UserService-");
        return executor;
    }
    
    @Bean("orderServiceExecutor")
    public ThreadPoolTaskExecutor orderServiceExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(8);
        executor.setMaxPoolSize(15);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("OrderService-");
        return executor;
    }
}

// Saga Pattern for Distributed Transactions
@Service
public class OrderSagaOrchestrator {
    
    public CompletableFuture<OrderResult> processOrder(Order order) {
        return reserveInventory(order)
            .thenCompose(inventoryResult -> {
                if (inventoryResult.isSuccess()) {
                    return processPayment(order)
                        .thenCompose(paymentResult -> {
                            if (paymentResult.isSuccess()) {
                                return confirmOrder(order);
                            } else {
                                return compensateInventory(order)
                                    .thenApply(v -> OrderResult.failed("Payment failed"));
                            }
                        });
                } else {
                    return CompletableFuture.completedFuture(
                        OrderResult.failed("Inventory reservation failed"));
                }
            })
            .exceptionally(throwable -> {
                log.error("Order saga failed", throwable);
                compensateAll(order);
                return OrderResult.failed("System error");
            });
    }
}`}
        </pre>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-600">Circuit Breaker</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Prevents cascade failures</li>
            <li>• Fast failure detection</li>
            <li>• Automatic recovery testing</li>
            <li>• Fallback mechanisms</li>
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-600">Bulkhead Pattern</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Resource isolation</li>
            <li>• Fault containment</li>
            <li>• Independent thread pools</li>
            <li>• Performance guarantees</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-purple-600">Saga Pattern</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Distributed transactions</li>
            <li>• Compensation logic</li>
            <li>• Event-driven coordination</li>
            <li>• Eventual consistency</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
