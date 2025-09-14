import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Package, 
  User, 
  Truck, 
  Store, 
  CheckCircle, 
  Shield, 
  Clock, 
  MapPin, 
  IndianRupee,
  ExternalLink,
  Search,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { blockchainService, Product, Transaction, formatEther } from '../services/blockchainService';
import { toast } from 'sonner';

interface ProductTrackerProps {
  productId?: string;
  onBack?: () => void;
}

export function ProductTracker({ productId: initialProductId, onBack }: ProductTrackerProps) {
  const [productId, setProductId] = useState(initialProductId || '');
  const [product, setProduct] = useState<Product | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [verification, setVerification] = useState<{
    verified: boolean;
    totalSteps: number;
    actors: string[];
    actions: string[];
    timestamps: bigint[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initBlockchain = async () => {
      try {
        const connected = await blockchainService.connect();
        setIsConnected(connected);
      } catch (error) {
        console.error('Blockchain connection failed:', error);
      }
    };
    
    initBlockchain();
  }, []);

  useEffect(() => {
    if (initialProductId) {
      handleSearch();
    }
  }, [initialProductId]);

  const handleSearch = async () => {
    if (!productId.trim()) {
      toast.error('Please enter a product ID');
      return;
    }

    if (!isConnected) {
      toast.error('Please connect to blockchain first');
      return;
    }

    setIsLoading(true);
    try {
      // Get product details
      const productData = await blockchainService.getProduct(productId.trim().toUpperCase());
      if (!productData || !productData.exists) {
        toast.error('Product not found on blockchain');
        setProduct(null);
        setTransactions([]);
        setVerification(null);
        return;
      }

      // Get transaction history
      const txHistory = await blockchainService.getProductHistory(productId.trim().toUpperCase());
      
      // Get verification data
      const verificationData = await blockchainService.verifyProduct(productId.trim().toUpperCase());

      setProduct(productData);
      setTransactions(txHistory);
      setVerification(verificationData);
      
      toast.success('Product data loaded successfully!');
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to fetch product data');
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Registered')) return User;
    if (action.includes('Transportation')) return Truck;
    if (action.includes('Store')) return Store;
    if (action.includes('Delivered')) return Package;
    return Package;
  };

  const getActionColor = (action: string) => {
    if (action.includes('Registered')) return 'text-green-600 bg-green-100 dark:bg-green-900';
    if (action.includes('Transportation')) return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
    if (action.includes('Store')) return 'text-purple-600 bg-purple-100 dark:bg-purple-900';
    if (action.includes('Delivered')) return 'text-orange-600 bg-orange-100 dark:bg-orange-900';
    return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available for Distribution': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'In Transit': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Available for Consumers': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Delivered': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Tracker</h1>
          <p className="text-muted-foreground">Track products through the supply chain using blockchain</p>
        </div>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            Back
          </Button>
        )}
      </div>

      {/* Connection Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium">
              Blockchain: {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            {!isConnected && (
              <Button 
                onClick={() => blockchainService.connect()}
                size="sm" 
                variant="outline"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter Product ID (e.g., AGRI-1736109712345-ABC123XYZ)"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              disabled={isLoading || !isConnected}
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Product Details */}
      {product && (
        <div className="space-y-6">
          {/* Product Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <p className="text-muted-foreground">Product ID: {product.id}</p>
                </div>
                <Badge className={getStatusColor(product.status)}>
                  {product.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="w-4 h-4" />
                    Quantity
                  </div>
                  <p className="font-semibold">{product.quantity.toString()} kg</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IndianRupee className="w-4 h-4" />
                    Current Price
                  </div>
                  <p className="font-semibold">₹{formatEther(product.currentPrice)} ETH</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Harvest Date
                  </div>
                  <p className="font-semibold">{product.harvestDate}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    Location
                  </div>
                  <p className="font-semibold">{product.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Status */}
          {verification && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Blockchain Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-200">Verified</p>
                      <p className="text-sm text-muted-foreground">Product is authentic</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {verification.totalSteps}
                    </div>
                    <div>
                      <p className="font-semibold text-blue-800 dark:text-blue-200">Total Steps</p>
                      <p className="text-sm text-muted-foreground">Supply chain stages</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <User className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="font-semibold text-purple-800 dark:text-purple-200">Actors</p>
                      <p className="text-sm text-muted-foreground">{verification.actors.length} participants</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Supply Chain Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Supply Chain Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-6">
                  {transactions.map((tx, index) => {
                    const ActionIcon = getActionIcon(tx.action);
                    return (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${getActionColor(tx.action)}`}>
                            <ActionIcon className="w-6 h-6" />
                          </div>
                          {index < transactions.length - 1 && (
                            <div className="w-0.5 h-16 bg-gradient-to-b from-green-300 to-emerald-300 mt-2" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <Card className="border-l-4 border-l-primary">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h3 className="font-semibold text-lg">{tx.action}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    Actor: {tx.actor.substring(0, 6)}...{tx.actor.substring(38)}
                                  </p>
                                </div>
                                <div className="text-right text-sm text-muted-foreground">
                                  <p>{formatTimestamp(tx.timestamp)}</p>
                                  <p className="font-mono">Block #{tx.blockNumber.toString()}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <div className="bg-muted/50 rounded-lg p-3">
                                  <p className="text-xs text-muted-foreground mb-1">Price at this step</p>
                                  <p className="font-semibold">₹{formatEther(tx.newPrice)} ETH</p>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3">
                                  <p className="text-xs text-muted-foreground mb-1">Transaction Details</p>
                                  <p className="text-sm">{tx.details}</p>
                                </div>
                              </div>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`https://etherscan.io/address/${tx.actor}`, '_blank')}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View on Explorer
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                  <p>No transaction history available for this product</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Product Found */}
      {!product && !isLoading && productId && (
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Product Not Found</h3>
            <p className="text-muted-foreground">
              The product with ID "{productId}" was not found on the blockchain.
              Please check the ID and try again.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
