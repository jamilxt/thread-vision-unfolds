
import React, { useState, useEffect } from 'react';
import { Play, Pause, ArrowLeftRight, Layers, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAnimation } from '@/contexts/AnimationContext';

interface PhaserState {
  phase: number;
  parties: number;
  arrived: number;
  registered: string[];
  arrivedThreads: string[];
}

interface ExchangerState {
  thread1: { name: string; data: string; waiting: boolean };
  thread2: { name: string; data: string; waiting: boolean };
  isExchanging: boolean;
}

export const PhaserExchanger = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { getInterval } = useAnimation();
  const [phaser, setPhaser] = useState<PhaserState>({
    phase: 0,
    parties: 3,
    arrived: 0,
    registered: ['T1', 'T2', 'T3'],
    arrivedThreads: []
  });
  const [exchanger, setExchanger] = useState<ExchangerState>({
    thread1: { name: 'Producer', data: 'Data A', waiting: false },
    thread2: { name: 'Consumer', data: '', waiting: false },
    isExchanging: false
  });
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Threads register with Phaser',
    'Threads arrive at phase barrier',
    'Phase advances, threads proceed',
    'Exchanger threads meet',
    'Data exchange completes'
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = (prev + 1) % steps.length;
          
          switch (nextStep) {
            case 0:
              setPhaser({
                phase: 0,
                parties: 3,
                arrived: 0,
                registered: ['T1', 'T2', 'T3'],
                arrivedThreads: []
              });
              setExchanger({
                thread1: { name: 'Producer', data: 'Data A', waiting: false },
                thread2: { name: 'Consumer', data: '', waiting: false },
                isExchanging: false
              });
              break;
            case 1:
              setPhaser(prev => ({
                ...prev,
                arrived: 2,
                arrivedThreads: ['T1', 'T2']
              }));
              break;
            case 2:
              setPhaser(prev => ({
                ...prev,
                phase: 1,
                arrived: 3,
                arrivedThreads: ['T1', 'T2', 'T3']
              }));
              break;
            case 3:
              setExchanger(prev => ({
                ...prev,
                thread1: { ...prev.thread1, waiting: true },
                thread2: { ...prev.thread2, waiting: true },
                isExchanging: true
              }));
              break;
            case 4:
              setExchanger({
                thread1: { name: 'Producer', data: '', waiting: false },
                thread2: { name: 'Consumer', data: 'Data A', waiting: false },
                isExchanging: false
              });
              break;
          }
          
          return nextStep;
        });
      }, getInterval(2000));
    }
    return () => clearInterval(interval);
  }, [isRunning, getInterval]);

  const reset = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setPhaser({
      phase: 0,
      parties: 3,
      arrived: 0,
      registered: ['T1', 'T2', 'T3'],
      arrivedThreads: []
    });
    setExchanger({
      thread1: { name: 'Producer', data: 'Data A', waiting: false },
      thread2: { name: 'Consumer', data: '', waiting: false },
      isExchanging: false
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 18: Phaser & Exchanger</h1>
        <p className="text-gray-600 leading-relaxed">
          Advanced coordination utilities: Phaser for multi-phase coordination and Exchanger for bidirectional data exchange between threads.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Phaser & Exchanger Demo</h3>
        
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
          {/* Phaser */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Layers className="w-6 h-6 text-blue-600" />
              <h4 className="font-semibold text-gray-700">Phaser</h4>
            </div>

            {/* Phase Info */}
            <div className="p-4 bg-blue-100 rounded-lg border-2 border-blue-300">
              <div className="text-center">
                <div className="text-sm font-medium text-blue-700 mb-1">Current Phase</div>
                <div className="text-3xl font-bold text-blue-800">{phaser.phase}</div>
              </div>
            </div>

            {/* Parties Progress */}
            <div className="p-3 bg-purple-100 border-2 border-purple-300 rounded-lg">
              <div className="text-center mb-2">
                <div className="text-sm font-medium text-gray-700">Arrival Progress</div>
                <div className="text-lg font-semibold">
                  {phaser.arrived}/{phaser.parties} arrived
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(phaser.arrived / phaser.parties) * 100}%` }}
                />
              </div>
            </div>

            {/* Registered Threads */}
            <div className="p-3 bg-green-100 border-2 border-green-300 rounded-lg">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700 mb-1">Registered</div>
                <div className="text-sm">{phaser.registered.join(', ')}</div>
              </div>
            </div>

            {/* Arrived Threads */}
            <div className="p-3 bg-yellow-100 border-2 border-yellow-300 rounded-lg">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700 mb-1">Arrived at Barrier</div>
                <div className="text-sm">
                  {phaser.arrivedThreads.length > 0 
                    ? phaser.arrivedThreads.join(', ')
                    : 'None'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Exchanger */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ArrowLeftRight className="w-6 h-6 text-green-600" />
              <h4 className="font-semibold text-gray-700">Exchanger</h4>
            </div>

            {/* Exchange Status */}
            <div className={`p-4 rounded-lg border-2 ${
              exchanger.isExchanging 
                ? 'bg-orange-100 border-orange-300' 
                : 'bg-green-100 border-green-300'
            }`}>
              <div className="text-center">
                <div className="text-sm font-medium mb-1">Status</div>
                <div className="text-lg font-bold">
                  {exchanger.isExchanging ? 'Exchanging...' : 'Ready'}
                </div>
                {exchanger.isExchanging && (
                  <RefreshCw className="w-6 h-6 mx-auto mt-2 animate-spin text-orange-600" />
                )}
              </div>
            </div>

            {/* Thread 1 */}
            <div className={`p-3 rounded-lg border-2 ${
              exchanger.thread1.waiting 
                ? 'bg-yellow-100 border-yellow-300'
                : 'bg-blue-100 border-blue-300'
            }`}>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {exchanger.thread1.name}
                </div>
                <div className="text-sm font-bold">
                  Data: {exchanger.thread1.data || 'Empty'}
                </div>
                {exchanger.thread1.waiting && (
                  <div className="text-xs text-yellow-700 mt-1">Waiting to exchange</div>
                )}
              </div>
            </div>

            {/* Exchange Arrow */}
            <div className="flex justify-center">
              <ArrowLeftRight className={`w-8 h-8 ${
                exchanger.isExchanging ? 'text-orange-600 animate-pulse' : 'text-gray-400'
              }`} />
            </div>

            {/* Thread 2 */}
            <div className={`p-3 rounded-lg border-2 ${
              exchanger.thread2.waiting 
                ? 'bg-yellow-100 border-yellow-300'
                : 'bg-blue-100 border-blue-300'
            }`}>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {exchanger.thread2.name}
                </div>
                <div className="text-sm font-bold">
                  Data: {exchanger.thread2.data || 'Empty'}
                </div>
                {exchanger.thread2.waiting && (
                  <div className="text-xs text-yellow-700 mt-1">Waiting to exchange</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-2"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Pause' : 'Start'} Demo
          </Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gray-50">
        <h3 className="text-xl font-semibold mb-4">Code Examples</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import java.util.concurrent.*;

public class AdvancedCoordinationExample {
    private final Phaser phaser = new Phaser(3); // 3 parties
    private final Exchanger<String> exchanger = new Exchanger<>();
    
    public void phaserExample() throws InterruptedException {
        // Phase 0: Initialization
        System.out.println("Initializing...");
        phaser.arriveAndAwaitAdvance(); // Wait for all parties
        
        // Phase 1: Processing
        System.out.println("Processing...");
        phaser.arriveAndAwaitAdvance(); // Wait for all parties
        
        // Phase 2: Cleanup
        System.out.println("Cleaning up...");
        phaser.arriveAndDeregister(); // Finish and leave
    }
    
    public void exchangerProducer() throws InterruptedException {
        String data = "Important Data";
        System.out.println("Producer has: " + data);
        
        // Exchange data with consumer
        String received = exchanger.exchange(data);
        System.out.println("Producer received: " + received);
    }
    
    public void exchangerConsumer() throws InterruptedException {
        String ack = "ACK";
        System.out.println("Consumer ready with: " + ack);
        
        // Exchange acknowledgment for data
        String received = exchanger.exchange(ack);
        System.out.println("Consumer received: " + received);
    }
}`}
        </pre>
      </Card>
    </div>
  );
};
