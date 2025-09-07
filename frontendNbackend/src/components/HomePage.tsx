import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { BackgroundWrapper } from './BackgroundWrapper';
import { Header } from './Header';
import { User, Truck, Store, QrCode } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

interface HomePageProps {
  onRoleSelect: (role: 'farmer' | 'distributor' | 'retailer' | 'customer') => void;
}

export function HomePage({ onRoleSelect }: HomePageProps) {
  const { t } = useLanguage();

  const roles = [
    {
      id: 'farmer' as const,
      icon: User,
      title: t('farmer'),
      description: 'Track your crops from field to market',
      color: 'from-green-600 to-green-700'
    },
    {
      id: 'distributor' as const,
      icon: Truck,
      title: t('distributor'),
      description: 'Manage supply chain logistics',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'retailer' as const,
      icon: Store,
      title: t('retailer'),
      description: 'Connect with distributors and customers',
      color: 'from-lime-500 to-green-600'
    },
    {
      id: 'customer' as const,
      icon: QrCode,
      title: t('customer'),
      description: 'Verify product authenticity',
      color: 'from-primary to-secondary'
    }
  ];

  return (
    <BackgroundWrapper type="default">
      <Header />
      
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              {t('KrishiChain')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Blockchain-powered transparency for agricultural supply chains. 
              Choose your role to get started.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role) => {
              const IconComponent = role.icon;
              return (
                <Card
                  key={role.id}
                  className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl bg-card/80 backdrop-blur-sm border-border/50"
                  onClick={() => onRoleSelect(role.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${role.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {role.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {role.description}
                    </p>
                    <Button 
                      className="w-full mt-4 bg-primary hover:bg-primary/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRoleSelect(role.id);
                      }}
                    >
                      {role.id === 'customer' ? t('scanQR') : t('continue')}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Empowering farmers, securing supply chains, building trust
            </p>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
}