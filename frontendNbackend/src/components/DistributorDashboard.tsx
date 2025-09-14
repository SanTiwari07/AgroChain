import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { BackgroundWrapper } from './BackgroundWrapper';
import { Header } from './Header';
import { Timeline } from './ui/Timeline';
import { Truck, Package, TrendingUp, History, LogOut, Plus, QrCode, Link, Camera, Upload, Loader2, CheckCircle, Eye } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { blockchainService, Product, formatEther } from '../services/blockchainService';
import { qrCodeService, QRCodeData } from '../services/qrCodeService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';

interface DistributorDashboardProps {
  onLogout: () => void;
}

interface BlockchainPurchase {
  id: number;
  productId: string;
  product?: Product;
  cropName: string;
  weight: number;
  purchaseDate: string;
  handlingCost: number;
  transportDetails: string;
  distributorId: string;
  status: 'draft' | 'registered' | 'error';
  transactionHash?: string;
}

export function DistributorDashboard({ onLogout }: DistributorDashboardProps) {
  const [purchases, setPurchases] = useState<BlockchainPurchase[]>([]);

  const [newPurchase, setNewPurchase] = useState({
    productId: '',
    purchaseDate: '',
    handlingCost: '',
    transportDetails: ''
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [isBlockchainConnected, setIsBlockchainConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const { t } = useLanguage();

  // Initialize blockchain connection
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

  // Scan QR code to get product ID
  const handleQRCodeScanned = async (qrData: QRCodeData | { rawText: string }) => {
    let productId: string;
    
    if ('productId' in qrData) {
      productId = qrData.productId;
    } else if ('rawText' in qrData) {
      productId = qrData.rawText;
    } else {
      toast.error('Invalid QR code format');
      return;
    }

    try {
      const normalizedId = productId.trim().toUpperCase();
      const product = await blockchainService.getProduct(normalizedId);
      if (!product || !product.exists) {
        toast.error('Product not found on blockchain');
        return;
      }

      if (product.status !== 'Available for Distribution') {
        toast.error(`Product status is "${product.status}", not available for distribution`);
        return;
      }

      setScannedProduct(product);
      setNewPurchase(prev => ({ ...prev, productId: normalizedId }));
      setShowQRScanner(false);
      toast.success(`Product scanned: ${product.name}`);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to fetch product from blockchain');
    }
  };

  const handleAddPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let product = scannedProduct;
      const normalizedId = newPurchase.productId.trim().toUpperCase();
      if (!product) {
        product = await blockchainService.getProduct(normalizedId);
        if (!product || !product.exists) {
          toast.error('Product not found on blockchain. Please scan or enter a valid Product ID.');
          return;
        }
      }

      const purchase: BlockchainPurchase = {
        id: purchases.length + 1,
        productId: normalizedId,
        product: product,
        cropName: product.name,
        weight: Number(product.quantity),
        purchaseDate: newPurchase.purchaseDate,
        handlingCost: parseInt(newPurchase.handlingCost),
        transportDetails: newPurchase.transportDetails,
        distributorId: `DIST${String(purchases.length + 3).padStart(3, '0')}`,
        status: 'draft'
      };

      setPurchases([...purchases, purchase]);
      setNewPurchase({ productId: '', purchaseDate: '', handlingCost: '', transportDetails: '' });
      setScannedProduct(null);
      setShowAddForm(false);
      toast.info('Purchase added to draft. Click "Update Blockchain" to make it permanent.');
    } catch (err) {
      toast.error('Unable to add purchase. Please try again.');
    }
  };

  // Update blockchain with distributor information
  const updateBlockchain = async (purchase: BlockchainPurchase) => {
    if (!isBlockchainConnected) {
      toast.error('Please connect your blockchain wallet first');
      return;
    }

    setIsLoading(true);
    try {
      const txHash = await blockchainService.updateAsDistributor(
        purchase.productId.trim().toUpperCase(),
        purchase.handlingCost,
        purchase.transportDetails
      );

      // Update purchase with blockchain info
      const updatedPurchases = purchases.map(p => 
        p.id === purchase.id 
          ? { ...p, transactionHash: txHash, status: 'registered' as const }
          : p
      );
      setPurchases(updatedPurchases);

      toast.success(`Purchase "${purchase.cropName}" updated on blockchain successfully!`);
    } catch (error) {
      console.error('Failed to update blockchain:', error);
      const updatedPurchases = purchases.map(p => 
        p.id === purchase.id 
          ? { ...p, status: 'error' as const }
          : p
      );
      setPurchases(updatedPurchases);
      toast.error('Failed to update blockchain. Please try again.');
    } finally {
      setIsLoading(false);
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

  const timelineData: { title: string; date: string; status: string; description: string }[] = [];

  return (
    <BackgroundWrapper type="distributor">
      <Header />
      
      <div className="pt-20 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('distributor')} {t('dashboard')}</h1>
              <p className="text-muted-foreground">Manage supply chain logistics and track shipments</p>
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
                    <p className="text-muted-foreground">Total Purchases</p>
                    <p className="text-2xl font-bold text-foreground">{purchases.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/90 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">Total Weight Handled</p>
                    <p className="text-2xl font-bold text-foreground">
                      {purchases.reduce((sum, purchase) => sum + purchase.weight, 0)} kg
                    </p>
                  </div>
                  <Truck className="w-8 h-8 text-secondary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/90 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">Total Investment</p>
                    <p className="text-2xl font-bold text-foreground">
                      ₹{purchases.reduce((sum, purchase) => sum + purchase.handlingCost, 0).toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-lime-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Add Purchase Form */}
            <Card className="bg-card/90 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Record New Purchase</CardTitle>
                  <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Purchase
                  </Button>
                </div>
              </CardHeader>
              {showAddForm && (
                <CardContent>
                  <form onSubmit={handleAddPurchase} className="space-y-4">
                    <div>
                      <Label>Product Identification</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newPurchase.productId}
                          onChange={(e) => setNewPurchase(prev => ({ ...prev, productId: e.target.value }))}
                          placeholder="Product ID or scan QR code"
                          required
                          className="bg-input-background flex-1"
                        />
                        <Dialog open={showQRScanner} onOpenChange={setShowQRScanner}>
                          <DialogTrigger asChild>
                            <Button type="button" variant="outline">
                              <QrCode className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Scan QR Code</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Button
                                type="button"
                                className="w-full"
                                disabled
                              >
                                <Camera className="w-4 h-4 mr-2" />
                                Open Camera (Demo)
                              </Button>
                              <div className="text-center text-sm text-muted-foreground">
                                Camera scanning not available in demo.
                                Use manual entry with Product ID.
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      {scannedProduct && (
                        <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-medium">Product Found</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {scannedProduct.name} - {scannedProduct.quantity.toString()}kg
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="purchaseDate">Date of Purchase</Label>
                      <Input
                        id="purchaseDate"
                        type="date"
                        value={newPurchase.purchaseDate}
                        onChange={(e) => setNewPurchase(prev => ({ ...prev, purchaseDate: e.target.value }))}
                        required
                        className="bg-input-background"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="handlingCost">Handling Cost (₹)</Label>
                      <Input
                        id="handlingCost"
                        type="number"
                        value={newPurchase.handlingCost}
                        onChange={(e) => setNewPurchase(prev => ({ ...prev, handlingCost: e.target.value }))}
                        placeholder="Transportation and handling charges"
                        required
                        className="bg-input-background"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="transportDetails">Transport Details</Label>
                      <Input
                        id="transportDetails"
                        value={newPurchase.transportDetails}
                        onChange={(e) => setNewPurchase(prev => ({ ...prev, transportDetails: e.target.value }))}
                        placeholder="Vehicle, driver, route, storage conditions"
                        required
                        className="bg-input-background"
                      />
                    </div>
                    
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                      Record Purchase
                    </Button>
                  </form>
                </CardContent>
              )}
            </Card>

            {/* Supply Chain Timeline */}
            <Card className="bg-card/90 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Supply Chain Timeline</CardTitle>
                <p className="text-sm text-muted-foreground">Latest shipment: DIST001</p>
              </CardHeader>
              <CardContent>
                <Timeline data={timelineData} />
              </CardContent>
            </Card>
          </div>

          {/* Purchase History */}
          <Card className="bg-card/90 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Purchase History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Distributor ID</TableHead>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Crop</TableHead>
                    <TableHead>Weight (kg)</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Handling Cost (₹)</TableHead>
                    <TableHead>Transport Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-mono text-primary">{purchase.distributorId}</TableCell>
                      <TableCell className="font-mono text-secondary">{purchase.productId}</TableCell>
                      <TableCell>{purchase.cropName}</TableCell>
                      <TableCell>{purchase.weight}</TableCell>
                      <TableCell>{purchase.purchaseDate}</TableCell>
                      <TableCell>₹{purchase.handlingCost}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{purchase.transportDetails}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          purchase.status === 'registered' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : purchase.status === 'error'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {purchase.status === 'registered' ? 'On Blockchain' : 
                           purchase.status === 'error' ? 'Failed' : 'Draft'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {purchase.status === 'draft' && (
                            <Button
                              onClick={() => updateBlockchain(purchase)}
                              disabled={!isBlockchainConnected || isLoading}
                              variant="outline"
                              size="sm"
                              className="bg-green-50 hover:bg-green-100 border-green-200"
                            >
                              <Link className="w-3 h-3 mr-1" />
                              Update Blockchain
                            </Button>
                          )}
                          {purchase.transactionHash && (
                            <Button
                              onClick={() => window.open(`https://etherscan.io/tx/${purchase.transactionHash}`, '_blank')}
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