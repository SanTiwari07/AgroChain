// Price conversion service for ETH to INR conversion
// This service handles converting Ethereum prices to Indian Rupees

// Current ETH to INR rate (as of December 2024)
// This should be updated periodically or fetched from an API
const ETH_TO_INR_RATE = 280000; // Approximate rate: 1 ETH = 280,000 INR

export interface PriceConversionResult {
  inr: number;
  eth: number;
  rate: number;
  formatted: string;
}

export class PriceConverterService {
  private static instance: PriceConverterService;
  private ethToInrRate: number = ETH_TO_INR_RATE;

  private constructor() {}

  public static getInstance(): PriceConverterService {
    if (!PriceConverterService.instance) {
      PriceConverterService.instance = new PriceConverterService();
    }
    return PriceConverterService.instance;
  }

  /**
   * Convert ETH amount to INR
   * @param ethAmount - Amount in ETH (as string from formatEther)
   * @returns PriceConversionResult with INR amount and formatted string
   */
  public convertEthToInr(ethAmount: string): PriceConversionResult {
    const eth = parseFloat(ethAmount);
    const inr = eth * this.ethToInrRate;
    
    return {
      inr: Math.round(inr * 100) / 100, // Round to 2 decimal places
      eth: eth,
      rate: this.ethToInrRate,
      formatted: `₹${inr.toLocaleString('en-IN', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`
    };
  }

  /**
   * Convert ETH amount to INR with custom rate
   * @param ethAmount - Amount in ETH (as string from formatEther)
   * @param customRate - Custom ETH to INR rate
   * @returns PriceConversionResult with INR amount and formatted string
   */
  public convertEthToInrWithRate(ethAmount: string, customRate: number): PriceConversionResult {
    const eth = parseFloat(ethAmount);
    const inr = eth * customRate;
    
    return {
      inr: Math.round(inr * 100) / 100, // Round to 2 decimal places
      eth: eth,
      rate: customRate,
      formatted: `₹${inr.toLocaleString('en-IN', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`
    };
  }

  /**
   * Format price in INR with proper Indian number formatting
   * @param amount - Amount in INR
   * @returns Formatted string with ₹ symbol
   */
  public formatInrPrice(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }

  /**
   * Get current ETH to INR rate
   * @returns Current conversion rate
   */
  public getCurrentRate(): number {
    return this.ethToInrRate;
  }

  /**
   * Update ETH to INR rate
   * @param newRate - New conversion rate
   */
  public updateRate(newRate: number): void {
    this.ethToInrRate = newRate;
  }

  /**
   * Fetch real-time ETH to INR rate from API (placeholder for future implementation)
   * This could be implemented to fetch from CoinGecko, CoinMarketCap, or other APIs
   */
  public async fetchRealTimeRate(): Promise<number> {
    try {
      // Placeholder for API call
      // const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr');
      // const data = await response.json();
      // return data.ethereum.inr;
      
      // For now, return the static rate
      return this.ethToInrRate;
    } catch (error) {
      console.error('Failed to fetch real-time rate:', error);
      return this.ethToInrRate; // Fallback to static rate
    }
  }
}

// Export singleton instance
export const priceConverter = PriceConverterService.getInstance();

// Utility function for quick conversion
export const convertEthToInr = (ethAmount: string): string => {
  return priceConverter.convertEthToInr(ethAmount).formatted;
};

// Utility function for getting both ETH and INR values
export const getPriceInBothCurrencies = (ethAmount: string): { eth: string; inr: string } => {
  const conversion = priceConverter.convertEthToInr(ethAmount);
  return {
    eth: `${ethAmount} ETH`,
    inr: conversion.formatted
  };
};





