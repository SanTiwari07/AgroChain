import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { TrendingUp, TrendingDown, X, IndianRupee, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CropPriceNotificationProps {
  isVisible: boolean;
  onClose: () => void;
}

export function CropPriceNotification({ isVisible, onClose }: CropPriceNotificationProps) {
  const [currentNotification, setCurrentNotification] = useState(0);
  
  const notifications = [
    {
      crop: 'Tomato',
      trend: 'up' as const,
      price: 2800,
      change: '+15%',
      message: 'Prices rising due to cold storage shortage. Good time to sell!',
      icon: '🍅'
    },
    {
      crop: 'Rice',
      trend: 'up' as const,
      price: 2650,
      change: '+8%',
      message: 'High demand in urban markets. Export opportunities available.',
      icon: '🌾'
    },
    {
      crop: 'Onion',
      trend: 'down' as const,
      price: 1100,
      change: '-5%',
      message: 'Oversupply in market. Consider cold storage options.',
      icon: '🧅'
    }
  ];

  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setCurrentNotification((prev) => (prev + 1) % notifications.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible, notifications.length]);

  const notification = notifications[currentNotification];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{notification.icon}</span>
                      <h4 className="font-semibold text-green-800 dark:text-green-200">
                        {notification.crop} Price Alert
                      </h4>
                      <div className="flex items-center gap-1">
                        {notification.trend === 'up' ? (
                          <TrendingUp className="w-3 h-3 text-green-600" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-600" />
                        )}
                        <span className={`text-xs font-medium ${
                          notification.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {notification.change}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <IndianRupee className="w-4 h-4 text-muted-foreground" />
                      <span className="font-bold text-lg text-foreground">
                        ₹{notification.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">per quintal</span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3">
                      {notification.message}
                    </p>
                    
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="flex-shrink-0 h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              
              {/* Progress indicator */}
              <div className="flex gap-1 mt-3">
                {notifications.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      index === currentNotification 
                        ? 'bg-green-600' 
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}