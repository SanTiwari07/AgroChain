import React from 'react';

type BackgroundType = 'farmer' | 'distributor' | 'retailer' | 'customer' | 'default';

const backgroundImages = {
  farmer: 'https://images.unsplash.com/photo-1648995505971-da6e8a6aa6c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBjcm9wJTIwZmllbGQlMjBhZ3JpY3VsdHVyZSUyMGZhcm18ZW58MXx8fHwxNzU2ODg3MTcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
  distributor: 'https://images.unsplash.com/photo-1742349934917-c6932c49d067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3YXJlaG91c2UlMjBzdG9yYWdlJTIwZmFjaWxpdHl8ZW58MXx8fHwxNzU2ODg3MTcyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  retailer: 'https://images.unsplash.com/photo-1738687819001-2a0006a3b9de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjByZXRhaWwlMjBzaG9wJTIwbWFya2V0fGVufDF8fHx8MTc1Njg4NzE3Mnww&ixlib=rb-4.1.0&q=80&w=1080',
  customer: 'https://images.unsplash.com/photo-1630960411440-10f7b59717ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmcmVzaCUyMHByb2R1Y2UlMjBtYXJrZXQlMjB2ZWdldGFibGVzfGVufDF8fHx8MTc1Njg4NzE3M3ww&ixlib=rb-4.1.0&q=80&w=1080',
  default: 'https://images.unsplash.com/photo-1648995505971-da6e8a6aa6c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBjcm9wJTIwZmllbGQlMjBhZ3JpY3VsdHVyZSUyMGZhcm18ZW58MXx8fHwxNzU2ODg3MTcxfDA&ixlib=rb-4.1.0&q=80&w=1080'
};

interface BackgroundWrapperProps {
  type: BackgroundType;
  children: React.ReactNode;
  className?: string;
}

export function BackgroundWrapper({ type, children, className = '' }: BackgroundWrapperProps) {
  const backgroundImage = backgroundImages[type];

  return (
    <div 
      className={`min-h-screen relative ${className}`}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-background/60 dark:bg-background/70" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}