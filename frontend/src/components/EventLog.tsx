import React from 'react';
import { Activity } from 'lucide-react';
import { Card } from './Card';

interface LogEvent {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
}

interface EventLogProps {
  events: LogEvent[];
}

export const EventLog: React.FC<EventLogProps> = ({ events }) => {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Live Events</h3>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No events yet</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="p-3 bg-gray-50 rounded text-sm">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-blue-600">{event.type}</span>
                <span className="text-xs text-gray-500">
                  {event.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-700">{event.message}</p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
