import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { BackgroundWrapper } from './BackgroundWrapper';
import { Header } from './Header';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Store, Package, TrendingUp, History, LogOut, Plus, DollarSign, QrCode, Link, Camera, Loader2, CheckCircle, Eye } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { blockchainService, Product, formatEther } from '../services/blockchainService';
import { qrCodeService, QRCodeData } from '../services/qrCodeService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';

interface RetailerDashboardProps {
  onLogout: () => void;
}

interface BlockchainSale {
  id: number;
  productId: string;
  product?: Product;
  cropName: string;
  weight: number;
  purchaseDate: string;
  retailMargin: number;
  storeDetails: string;
  retailerId: string;
  status: 'draft' | 'registered' | 'error';
  transactionHash?: string;
}

export function RetailerDashboard({ onLogout }: RetailerDashboardProps) {
  const [sales, setSales] = useState<BlockchainSale[]>([]);

  const [newSale, setNewSale] = useState({
    productId: '',
    purchaseDate: '',
    retailMargin: '',
    storeDetails: ''
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

      if (product.status !== 'In Transit') {
        toast.error(`Product status is "${product.status}", not available for retail`);
        return;
      }

      setScannedProduct(product);
      setNewSale(prev => ({ ...prev, productId: normalizedId }));
      setShowQRScanner(false);
      toast.success(`Product scanned: ${product.name}`);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to fetch product from blockchain');
    }
  };

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let product = scannedProduct;
      const normalizedId = newSale.productId.trim().toUpperCase();
      if (!product) {
        product = await blockchainService.getProduct(normalizedId);
        if (!product || !product.exists) {
          toast.error('Product not found on blockchain. Please scan or enter a valid Product ID.');
          return;
        }
      }

      const sale: BlockchainSale = {
        id: sales.length + 1,
        productId: normalizedId,
        product: product,
        cropName: product.name,
        weight: Number(product.quantity),
        purchaseDate: newSale.purchaseDate,
        retailMargin: parseInt(newSale.retailMargin),
        storeDetails: newSale.storeDetails,
        retailerId: `RET${String(sales.length + 3).padStart(3, '0')}`,
        status: 'draft'
      };

      setSales([...sales, sale]);
      setNewSale({ productId: '', purchaseDate: '', retailMargin: '', storeDetails: '' });
      setScannedProduct(null);
      setShowAddForm(false);
      toast.info('Sale added to draft. Click "Update Blockchain" to make it permanent.');
    } catch (err) {
      toast.error('Unable to add sale. Please try again.');
    }
  };

  // Update blockchain with retailer information
  const updateBlockchain = async (sale: BlockchainSale) => {
    if (!isBlockchainConnected) {
      toast.error('Please connect your blockchain wallet first');
      return;
    }

    setIsLoading(true);
    try {
      const txHash = await blockchainService.updateAsRetailer(
        sale.productId.trim().toUpperCase(),
        sale.retailMargin,
        sale.storeDetails
      );

      // Update sale with blockchain info
      const updatedSales = sales.map(s => 
        s.id === sale.id 
          ? { ...s, transactionHash: txHash, status: 'registered' as const }
          : s
      );
      setSales(updatedSales);

      toast.success(`Sale "${sale.cropName}" updated on blockchain successfully!`);
    } catch (error) {
      console.error('Failed to update blockchain:', error);
      const updatedSales = sales.map(s => 
        s.id === sale.id 
          ? { ...s, status: 'error' as const }
          : s
      );
      setSales(updatedSales);
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

  const marginData = sales.map(sale => ({
    name: sale.cropName,
    margin: sale.retailMargin,
    weight: sale.weight
  }));

  const pieData = [
    { name: 'Margin', value: sales.reduce((sum, sale) => sum + sale.retailMargin, 0), color: '#138808' },
    { name: 'Weight', value: sales.reduce((sum, sale) => sum + sale.weight, 0), color: '#ff6b35' }
  ];

  return (
    <BackgroundWrapper type="retailer">
      <Header />
      
      <div className="pt-20 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('retailer')} {t('dashboard')}</h1>
              <p className="text-muted-foreground">Manage inventory and track sales performance</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card/90 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold text-foreground">{sales.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/90 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">Total Margin</p>
                    <p className="text-2xl font-bold text-foreground">
                      ₹{sales.reduce((sum, sale) => sum + sale.retailMargin, 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-secondary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/90 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">Total Weight</p>
                    <p className="text-2xl font-bold text-foreground">
                      {sales.reduce((sum, sale) => sum + sale.weight, 0).toLocaleString()} kg
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-lime-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/90 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">Avg Margin</p>
                    <p className="text-2xl font-bold text-foreground">
                      ₹{Math.round(sales.reduce((sum, sale) => sum + sale.retailMargin, 0) / sales.length || 0)}
                    </p>
                  </div>
                  <Store className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Add Sale Form */}
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
                  <form onSubmit={handleAddSale} className="space-y-4">
                    <div>
                      <Label>Product Identification</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newSale.productId}
                          onChange={(e) => setNewSale(prev => ({ ...prev, productId: e.target.value }))}
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
                        value={newSale.purchaseDate}
                        onChange={(e) => setNewSale(prev => ({ ...prev, purchaseDate: e.target.value }))}
                        required
                        className="bg-input-background"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="retailMargin">Retail Margin (₹)</Label>
                      <Input
                        id="retailMargin"
                        type="number"
                        value={newSale.retailMargin}
                        onChange={(e) => setNewSale(prev => ({ ...prev, retailMargin: e.target.value }))}
                        placeholder="Additional margin for retail"
                        required
                        className="bg-input-background"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="storeDetails">Store Details</Label>
                      <Input
                        id="storeDetails"
                        value={newSale.storeDetails}
                        onChange={(e) => setNewSale(prev => ({ ...prev, storeDetails: e.target.value }))}
                        placeholder="Aisle, storage conditions, expiry date"
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

            {/* Profit/Cost Distribution */}
            <Card className="bg-card/90 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        border: '1px solid var(--border)',
                        borderRadius: '6px'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm text-muted-foreground">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

            {/* Margin Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="bg-card/90 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Retail Margin Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={marginData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        border: '1px solid var(--border)',
                        borderRadius: '6px'
                      }} 
                    />
                    <Bar dataKey="margin" fill="var(--primary)" name="Retail Margin" />
                    <Bar dataKey="weight" fill="var(--secondary)" name="Weight (kg)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sales History Table */}
            <Card className="bg-card/90 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Margin</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{sale.cropName}</TableCell>
                        <TableCell>{sale.weight} kg</TableCell>
                        <TableCell className="text-secondary">₹{sale.retailMargin}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            sale.status === 'registered' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : sale.status === 'error'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {sale.status === 'registered' ? 'On Blockchain' : 
                             sale.status === 'error' ? 'Failed' : 'Draft'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Complete Sales History */}
          <Card className="bg-card/90 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Complete Sales History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Retailer ID</TableHead>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Weight (kg)</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Retail Margin (₹)</TableHead>
                    <TableHead>Store Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono text-primary">{sale.retailerId}</TableCell>
                      <TableCell className="font-mono text-secondary">{sale.productId}</TableCell>
                      <TableCell>{sale.cropName}</TableCell>
                      <TableCell>{sale.weight}</TableCell>
                      <TableCell>{sale.purchaseDate}</TableCell>
                      <TableCell>₹{sale.retailMargin}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{sale.storeDetails}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          sale.status === 'registered' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : sale.status === 'error'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {sale.status === 'registered' ? 'On Blockchain' : 
                           sale.status === 'error' ? 'Failed' : 'Draft'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {sale.status === 'draft' && (
                            <Button
                              onClick={() => updateBlockchain(sale)}
                              disabled={!isBlockchainConnected || isLoading}
                              variant="outline"
                              size="sm"
                              className="bg-green-50 hover:bg-green-100 border-green-200"
                            >
                              <Link className="w-3 h-3 mr-1" />
                              Update Blockchain
                            </Button>
                          )}
                          {sale.transactionHash && (
                            <Button
                              onClick={() => window.open(`https://etherscan.io/tx/${sale.transactionHash}`, '_blank')}
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