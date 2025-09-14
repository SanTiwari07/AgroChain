import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { BackgroundWrapper } from './BackgroundWrapper';
import { Header } from './Header';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, TrendingUp, Package, History, LogOut, IndianRupee, TrendingDown, Minus, Info, QrCode, Link, Download, Eye } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { getCropPriceRecommendation, searchCrops, CropPriceRecommendation } from './CropPriceService';
import { blockchainService, generateProductId, formatEther } from '../services/blockchainService';
import { qrCodeService, generateProductQRCode } from '../services/qrCodeService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';

interface FarmerDashboardProps {
  onLogout: () => void;
}

interface BlockchainCrop {
  id: number;
  name: string;
  weight: number;
  harvestDate: string;
  location: string;
  expectedPrice: number;
  blockchainId: string;
  transactionHash?: string;
  qrCode?: string;
  status: 'draft' | 'registered' | 'error';
}

export function FarmerDashboard({ onLogout }: FarmerDashboardProps) {
  const [crops, setCrops] = useState<BlockchainCrop[]>([]);
  
  const [newCrop, setNewCrop] = useState({
    name: '',
    weight: '',
    harvestDate: '',
    location: '',
    expectedPrice: ''
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [priceRecommendation, setPriceRecommendation] = useState<CropPriceRecommendation | null>(null);
  const [cropSuggestions, setCropSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isBlockchainConnected, setIsBlockchainConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<{ qrCode: string; crop: BlockchainCrop } | null>(null);
  const { t } = useLanguage();

  // Initialize blockchain connection on component mount
  useEffect(() => {
    const initBlockchain = async () => {
      try {
        const connected = await blockchainService.connect();
        setIsBlockchainConnected(connected);
        if (connected) {
          toast.success('Blockchain wallet connected successfully!');
        }
      } catch (error) {
        console.error('Failed to connect to blockchain:', error);
        toast.error('Failed to connect to blockchain wallet');
      }
    };
    
    initBlockchain();
  }, []);

  const marketPrices = [
    { name: 'Rice', currentPrice: 28, myPrice: 0 },
    { name: 'Wheat', currentPrice: 32, myPrice: 0 },
    { name: 'Corn', currentPrice: 22, myPrice: 0 },
    { name: 'Sugarcane', currentPrice: 35, myPrice: 0 },
    { name: 'Tomato', currentPrice: 45, myPrice: 0 },
    { name: 'Onion', currentPrice: 38, myPrice: 0 },
    { name: 'Potato', currentPrice: 25, myPrice: 0 },
    { name: 'Cotton', currentPrice: 65, myPrice: 0 }
  ];

  // Handle crop name change and get price recommendations
  const handleCropNameChange = (value: string) => {
    setNewCrop(prev => ({ ...prev, name: value }));
    
    if (value.length >= 2) {
      const suggestions = searchCrops(value);
      setCropSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
      
      const recommendation = getCropPriceRecommendation(value);
      if (recommendation) {
        setPriceRecommendation(recommendation);
        setNewCrop(prev => ({ 
          ...prev, 
          expectedPrice: Math.round(recommendation.recommendedPrice / 100).toString() 
        }));
      }
    } else {
      setShowSuggestions(false);
      setPriceRecommendation(null);
    }
  };

  const selectCropSuggestion = (cropName: string) => {
    setNewCrop(prev => ({ ...prev, name: cropName }));
    setShowSuggestions(false);
    
    const recommendation = getCropPriceRecommendation(cropName);
    if (recommendation) {
      setPriceRecommendation(recommendation);
      setNewCrop(prev => ({ 
        ...prev, 
        expectedPrice: Math.round(recommendation.recommendedPrice / 100).toString() 
      }));
    }
  };

  const handleAddCrop = (e: React.FormEvent) => {
    e.preventDefault();
    const productId = generateProductId().trim().toUpperCase();
    const crop: BlockchainCrop = {
      id: crops.length + 1,
      name: newCrop.name,
      weight: parseInt(newCrop.weight),
      harvestDate: newCrop.harvestDate,
      location: newCrop.location,
      expectedPrice: parseInt(newCrop.expectedPrice),
      blockchainId: productId,
      status: 'draft'
    };
    setCrops([...crops, crop]);
    setNewCrop({ name: '', weight: '', harvestDate: '', location: '', expectedPrice: '' });
    setPriceRecommendation(null);
    setShowAddForm(false);
    
    // Show notification about blockchain registration
    toast.info('Crop added to draft. Click "Register on Blockchain" to make it permanent.');
  };

  // Update market prices with farmer's actual prices
  const getUpdatedMarketPrices = () => {
    return marketPrices.map(marketPrice => {
      const farmerCrop = crops.find(crop => 
        crop.name.toLowerCase() === marketPrice.name.toLowerCase()
      );
      return {
        ...marketPrice,
        myPrice: farmerCrop ? farmerCrop.expectedPrice : 0
      };
    });
  };

  // Register crop on blockchain
  const registerCropOnBlockchain = async (crop: BlockchainCrop) => {
    if (!isBlockchainConnected) {
      toast.error('Please connect your blockchain wallet first');
      return;
    }

    setIsLoading(true);
    try {
      // Register product on blockchain
      const txHash = await blockchainService.registerProduct(
        crop.blockchainId.trim().toUpperCase(),
        crop.name,
        crop.weight,
        crop.expectedPrice,
        crop.harvestDate,
        'A', // Default quality grade
        crop.location
      );

      // Generate QR code
      const farmerAddress = await blockchainService.getAddress();
      const qrCode = await generateProductQRCode(
        crop.blockchainId,
        crop.name,
        farmerAddress,
        crop.harvestDate,
        crop.location,
        txHash
      );

      // Update crop with blockchain info
      const updatedCrops = crops.map(c => 
        c.id === crop.id 
          ? { ...c, transactionHash: txHash, qrCode, status: 'registered' as const }
          : c
      );
      setCrops(updatedCrops);

      toast.success(`Crop "${crop.name}" registered on blockchain successfully!`);
    } catch (error) {
      console.error('Failed to register crop on blockchain:', error);
      const updatedCrops = crops.map(c => 
        c.id === crop.id 
          ? { ...c, status: 'error' as const }
          : c
      );
      setCrops(updatedCrops);
      toast.error('Failed to register crop on blockchain. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Download QR code
  const downloadQRCode = (crop: BlockchainCrop) => {
    if (crop.qrCode) {
      qrCodeService.downloadQRCode(crop.qrCode, `${crop.name}-${crop.blockchainId}-QR.png`);
      toast.success('QR code downloaded successfully!');
    }
  };

  // Connect to blockchain wallet
  const connectWallet = async () => {
    try {
      const connected = await blockchainService.connect();
      setIsBlockchainConnected(connected);
      if (connected) {
        toast.success('Blockchain wallet connected successfully!');
      }
    } catch (error) {
      toast.error('Failed to connect to blockchain wallet');
    }
  };

  return (
    <BackgroundWrapper type="farmer">
      <Header />
      
      <div className="pt-20 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('farmer')} {t('dashboard')}</h1>
              <p className="text-muted-foreground">Manage your crops and track market prices</p>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${isBlockchainConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-muted-foreground">
                  Blockchain: {isBlockchainConnected ? 'Connected' : 'Disconnected'}
                </span>
                {!isBlockchainConnected && (
                  <Button onClick={connectWallet} variant="outline" size="sm">
                    <Link className="w-3 h-3 mr-1" />
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>
            <Button onClick={onLogout} variant="outline" className="bg-card/80">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card/90 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">Total Crops</p>
                    <p className="text-2xl font-bold text-foreground">{crops.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/90 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">Total Weight</p>
                    <p className="text-2xl font-bold text-foreground">
                      {crops.reduce((sum, crop) => sum + crop.weight, 0)} kg
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/90 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">Expected Revenue</p>
                    <p className="text-2xl font-bold text-foreground">
                      ₹{crops.reduce((sum, crop) => sum + (crop.weight * crop.expectedPrice), 0).toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-lime-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Add Crop Form */}
            <Card className="bg-card/90 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-green-600" />
                    {t('addCrop')}
                  </CardTitle>
                  <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    variant="outline"
                    size="sm"
                    className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800 hover:from-green-100 hover:to-emerald-100"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New
                  </Button>
                </div>
              </CardHeader>
              {showAddForm && (
                <CardContent>
                  <form onSubmit={handleAddCrop} className="space-y-4">
                    <div className="relative">
                      <Label htmlFor="cropName">{t('cropName')}</Label>
                      <Input
                        id="cropName"
                        value={newCrop.name}
                        onChange={(e) => handleCropNameChange(e.target.value)}
                        onFocus={(e) => handleCropNameChange(e.target.value)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        required
                        className="bg-input-background"
                        placeholder="Type crop name (e.g., Rice, Wheat, Tomato)"
                      />
                      {showSuggestions && cropSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {cropSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                              onClick={() => selectCropSuggestion(suggestion)}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {priceRecommendation && (
                      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                              <IndianRupee className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-green-800 dark:text-green-200">Price Recommendation for {priceRecommendation.cropName}</h4>
                                <div className="flex items-center gap-1 text-sm">
                                  {priceRecommendation.marketTrend === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
                                  {priceRecommendation.marketTrend === 'down' && <TrendingDown className="w-3 h-3 text-red-600" />}
                                  {priceRecommendation.marketTrend === 'stable' && <Minus className="w-3 h-3 text-gray-600" />}
                                  <span className={`font-medium ${
                                    priceRecommendation.marketTrend === 'up' ? 'text-green-600' :
                                    priceRecommendation.marketTrend === 'down' ? 'text-red-600' : 'text-gray-600'
                                  }`}>
                                    {priceRecommendation.marketTrend}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                  <p className="text-sm text-muted-foreground">Recommended Price</p>
                                  <p className="font-bold text-green-700 dark:text-green-300">
                                    ₹{priceRecommendation.recommendedPrice.toLocaleString()} {priceRecommendation.unit}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Current Market</p>
                                  <p className="font-semibold text-gray-700 dark:text-gray-300">
                                    ₹{priceRecommendation.marketPrice.toLocaleString()} {priceRecommendation.unit}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="text-xs text-muted-foreground mb-2">
                                <p>Price Range: ₹{priceRecommendation.priceRange.min} - ₹{priceRecommendation.priceRange.max} {priceRecommendation.unit}</p>
                              </div>
                              
                              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium mb-1">Market Factors:</p>
                                  <ul className="list-disc list-inside space-y-0.5">
                                    {priceRecommendation.factors.map((factor, index) => (
                                      <li key={index}>{factor}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    <div>
                      <Label htmlFor="weight">{t('totalWeight')} (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={newCrop.weight}
                        onChange={(e) => setNewCrop(prev => ({ ...prev, weight: e.target.value }))}
                        required
                        className="bg-input-background"
                        placeholder="Enter weight in kg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="harvestDate">{t('harvestDate')}</Label>
                      <Input
                        id="harvestDate"
                        type="date"
                        value={newCrop.harvestDate}
                        onChange={(e) => setNewCrop(prev => ({ ...prev, harvestDate: e.target.value }))}
                        required
                        className="bg-input-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newCrop.location}
                        onChange={(e) => setNewCrop(prev => ({ ...prev, location: e.target.value }))}
                        required
                        className="bg-input-background"
                        placeholder="Farm location (Village, District, State)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expectedPrice">{t('expectedPrice')} (₹/kg)</Label>
                      <Input
                        id="expectedPrice"
                        type="number"
                        value={newCrop.expectedPrice}
                        onChange={(e) => setNewCrop(prev => ({ ...prev, expectedPrice: e.target.value }))}
                        required
                        className="bg-input-background"
                        placeholder="Price per kg"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      {t('addCrop')}
                    </Button>
                  </form>
                </CardContent>
              )}
            </Card>

            {/* Market Prices Chart */}
            <Card className="bg-card/90 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  {t('marketPrices')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart data={getUpdatedMarketPrices()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="var(--muted-foreground)"
                      angle={-60}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      fontSize={12}
                    />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        border: '1px solid var(--border)',
                        borderRadius: '6px'
                      }} 
                    />
                    <Bar dataKey="currentPrice" fill="#16a34a" name="Market Price" />
                    <Bar dataKey="myPrice" fill="#22c55e" name="My Price" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Transaction History */}
          <Card className="bg-card/90 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-green-600" />
                {t('transactionHistory')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Blockchain ID</TableHead>
                    <TableHead>Crop</TableHead>
                    <TableHead>Weight (kg)</TableHead>
                    <TableHead>Harvest Date</TableHead>
                    <TableHead>Expected Price (₹/kg)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {crops.map((crop) => (
                    <TableRow key={crop.id}>
                      <TableCell className="font-mono text-primary">{crop.blockchainId}</TableCell>
                      <TableCell>{crop.name}</TableCell>
                      <TableCell>{crop.weight}</TableCell>
                      <TableCell>{crop.harvestDate}</TableCell>
                      <TableCell>₹{crop.expectedPrice}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          crop.status === 'registered' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : crop.status === 'error'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {crop.status === 'registered' ? 'On Blockchain' : 
                           crop.status === 'error' ? 'Failed' : 'Draft'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {crop.status === 'draft' && (
                            <Button
                              onClick={() => registerCropOnBlockchain(crop)}
                              disabled={!isBlockchainConnected || isLoading}
                              variant="outline"
                              size="sm"
                              className="bg-green-50 hover:bg-green-100 border-green-200"
                            >
                              <Link className="w-3 h-3 mr-1" />
                              Register
                            </Button>
                          )}
                          {crop.status === 'registered' && crop.qrCode && (
                            <>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <QrCode className="w-3 h-3 mr-1" />
                                    View QR
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Product QR Code - {crop.name}</DialogTitle>
                                  </DialogHeader>
                                  <div className="flex flex-col items-center space-y-4">
                                    <img src={crop.qrCode} alt="Product QR Code" className="w-64 h-64" />
                                    <div className="text-center space-y-2">
                                      <p className="text-sm font-medium">Product ID: {crop.blockchainId}</p>
                                      <p className="text-xs text-muted-foreground">Scan this QR code to track the product</p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button onClick={() => downloadQRCode(crop)} variant="outline">
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                      </Button>
                                      <Button onClick={() => qrCodeService.printQRCode(crop.qrCode!)} variant="outline">
                                        Print
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                onClick={() => downloadQRCode(crop)}
                                variant="outline"
                                size="sm"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                            </>
                          )}
                          {crop.transactionHash && (
                            <Button
                              onClick={() => window.open(`https://etherscan.io/tx/${crop.transactionHash}`, '_blank')}
                              variant="outline"
                              size="sm"
                              className="text-blue-600"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Tx
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </BackgroundWrapper>
  );
}