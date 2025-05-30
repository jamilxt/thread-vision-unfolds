
import React from 'react';
import { Gauge } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useAnimation } from '@/contexts/AnimationContext';

export const AnimationSpeedControl = () => {
  const { speed, setSpeed } = useAnimation();

  const speedLabels = {
    0.25: 'Very Slow',
    0.5: 'Slow',
    1: 'Normal',
    2: 'Fast',
    4: 'Very Fast'
  };

  const handleSpeedChange = (value: number[]) => {
    setSpeed(value[0]);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <Gauge className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-gray-800">Animation Speed</h3>
      </div>
      
      <div className="space-y-3">
        <Slider
          value={[speed]}
          onValueChange={handleSpeedChange}
          min={0.25}
          max={4}
          step={0.25}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>0.25x</span>
          <span className="font-medium text-indigo-600">
            {speed}x - {speedLabels[speed as keyof typeof speedLabels] || 'Custom'}
          </span>
          <span>4x</span>
        </div>
      </div>
    </Card>
  );
};
