import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { BackgroundWrapper } from './BackgroundWrapper';
import { Header } from './Header';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

interface SignupPageProps {
  role: 'farmer' | 'distributor' | 'retailer';
  onBack: () => void;
  onSignup: (data: any) => void;
  onLoginRedirect: () => void;
}

export function SignupPage({ role, onBack, onSignup, onLoginRedirect }: SignupPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    // Role-specific fields
    village: '',
    state: '',
    district: '',
    farmArea: '',
    warehouseLocation: '',
    shopName: '',
    shopAddress: ''
  });
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Call onSignup with the form data for proper handling (includes toast notifications)
    onSignup(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderRoleSpecificFields = () => {
    switch (role) {
      case 'farmer':
        return (
          <>
            <div>
              <Label htmlFor="village">{t('village')}</Label>
              <Input
                id="village"
                value={formData.village}
                onChange={(e) => handleInputChange('village', e.target.value)}
                required
                className="bg-input-background"
              />
            </div>
            <div>
              <Label htmlFor="state">{t('state')}</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                required
                className="bg-input-background"
              />
            </div>
            <div>
              <Label htmlFor="district">{t('district')}</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                required
                className="bg-input-background"
              />
            </div>
            <div>
              <Label htmlFor="farmArea">Area of Farm (acres)</Label>
              <Input
                id="farmArea"
                type="number"
                value={formData.farmArea}
                onChange={(e) => handleInputChange('farmArea', e.target.value)}
                required
                className="bg-input-background"
              />
            </div>
          </>
        );
      case 'distributor':
        return (
          <>
            <div>
              <Label htmlFor="warehouseLocation">Warehouse Address</Label>
              <Input
                id="warehouseLocation"
                value={formData.warehouseLocation}
                onChange={(e) => handleInputChange('warehouseLocation', e.target.value)}
                required
                className="bg-input-background"
              />
            </div>
            <div>
              <Label htmlFor="state">{t('state')}</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                required
                className="bg-input-background"
              />
            </div>
          </>
        );
      case 'retailer':
        return (
          <>
            <div>
              <Label htmlFor="shopName">Shop Name</Label>
              <Input
                id="shopName"
                value={formData.shopName}
                onChange={(e) => handleInputChange('shopName', e.target.value)}
                required
                className="bg-input-background"
              />
            </div>
            <div>
              <Label htmlFor="shopAddress">Shop Address</Label>
              <Input
                id="shopAddress"
                value={formData.shopAddress}
                onChange={(e) => handleInputChange('shopAddress', e.target.value)}
                required
                className="bg-input-background"
              />
            </div>
            <div>
              <Label htmlFor="state">{t('state')}</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                required
                className="bg-input-background"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <BackgroundWrapper type={role}>
      <Header />
      
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 text-foreground hover:bg-card/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card className="bg-card/90 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-center">{t('signup')}</CardTitle>
              <p className="text-center text-muted-foreground">
                Create your {t(role)} account
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">{t('name')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="bg-input-background"
                  />
                </div>

                <div>
                  <Label htmlFor="mobile">{t('mobile')}</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    required
                    className="bg-input-background"
                  />
                </div>

                <div>
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="bg-input-background"
                  />
                </div>

                <div>
                  <Label htmlFor="password">{t('password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    className="bg-input-background"
                  />
                </div>

                {renderRoleSpecificFields()}

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  {t('continue')}
                </Button>

                <div className="text-center">
                  <span className="text-muted-foreground">Already have an account? </span>
                  <Button
                    type="button"
                    variant="link"
                    onClick={onLoginRedirect}
                    className="text-primary p-0"
                  >
                    {t('login')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </BackgroundWrapper>
  );
}