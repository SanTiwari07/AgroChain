import React from 'react';
import { CheckCircle, Clock, Circle } from 'lucide-react';

interface TimelineItem {
  title: string;
  date: string;
  status: 'completed' | 'in-progress' | 'pending';
  description?: string;
}

interface TimelineProps {
  data: TimelineItem[];
}

export function Timeline({ data }: TimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-secondary" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-primary" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-secondary bg-secondary/10';
      case 'in-progress':
        return 'border-primary bg-primary/10';
      default:
        return 'border-muted-foreground bg-muted';
    }
  };

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getStatusColor(item.status)}`}>
              {getStatusIcon(item.status)}
            </div>
            {index < data.length - 1 && (
              <div className="w-0.5 h-8 bg-border mt-2" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-medium text-foreground">{item.title}</h4>
              <span className="text-xs text-muted-foreground">{item.date}</span>
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}