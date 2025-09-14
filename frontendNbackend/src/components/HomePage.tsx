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

  const content = (
    <>
      <Header />
      
      <div className="flex items-center justify-center min-h-screen px-4 pt-44 md:pt-48">
        <div className="w-full max-w-4xl">
          <div className="text-center mt-4 md:mt-6 mb-12">
            <div className="flex items-center justify-center gap-1 mb-4">
              <div className="w-[100px] h-[100px]">
                <img 
                  src="/KrishiSetu_logo.svg" 
                  alt="KrishiSetu Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to a simple placeholder if logo is not found
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center"><span class="text-white font-bold text-lg">K</span></div>';
                    }
                  }}
                />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                {t('KrishiSetu')}
              </h1>
            </div>
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
    </>
  );

  return (
    <BackgroundWrapper type="default" children={content} />
  );
}