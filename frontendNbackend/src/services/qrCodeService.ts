import QRCode from 'qrcode';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

// Interface for QR code data
export interface QRCodeData {
  productId: string;
  name: string;
  farmer: string;
  harvestDate: string;
  location: string;
  blockchainHash?: string;
  timestamp: number;
}

// QR Code Service class
export class QRCodeService {
  private scanner: Html5QrcodeScanner | null = null;
  private html5QrCode: Html5Qrcode | null = null;

  // Generate QR code as base64 data URL
  async generateQRCode(data: QRCodeData): Promise<string> {
    try {
      const qrData = JSON.stringify(data);
      
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H' // High error correction for better scanning
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Generate QR code as SVG string
  async generateQRCodeSVG(data: QRCodeData): Promise<string> {
    try {
      const qrData = JSON.stringify(data);
      
      const qrCodeSVG = await QRCode.toString(qrData, {
        type: 'svg',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });

      return qrCodeSVG;
    } catch (error) {
      console.error('Error generating QR code SVG:', error);
      throw new Error('Failed to generate QR code SVG');
    }
  }

  // Start QR code scanner with camera
  startScanner(
    elementId: string,
    onSuccess: (decodedText: string, decodedResult: any) => void,
    onError?: (error: any) => void
  ): void {
    try {
      // Stop any existing scanner
      this.stopScanner();

      this.scanner = new Html5QrcodeScanner(
        elementId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2
        },
        false // verbose logging
      );

      this.scanner.render(
        (decodedText, decodedResult) => {
          try {
            // Parse the QR code data
            const qrData = JSON.parse(decodedText) as QRCodeData;
            onSuccess(decodedText, qrData);
          } catch (parseError) {
            // If JSON parsing fails, treat as plain text
            onSuccess(decodedText, { rawText: decodedText });
          }
        },
        onError || ((error) => {
          console.warn('QR Scanner error:', error);
        })
      );
    } catch (error) {
      console.error('Failed to start QR scanner:', error);
      throw new Error('Failed to start QR code scanner');
    }
  }

  // Stop QR code scanner
  stopScanner(): void {
    try {
      if (this.scanner) {
        this.scanner.clear().catch(console.error);
        this.scanner = null;
      }
      if (this.html5QrCode) {
        this.html5QrCode.stop().catch(console.error);
        this.html5QrCode = null;
      }
    } catch (error) {
      console.error('Error stopping scanner:', error);
    }
  }

  // Scan QR code from file
  async scanFromFile(file: File): Promise<QRCodeData | { rawText: string }> {
    try {
      if (!this.html5QrCode) {
        this.html5QrCode = new Html5Qrcode('temp-qr-reader');
      }

      const result = await this.html5QrCode.scanFile(file, true);
      
      try {
        // Try to parse as QRCodeData
        const qrData = JSON.parse(result) as QRCodeData;
        return qrData;
      } catch (parseError) {
        // Return as raw text if parsing fails
        return { rawText: result };
      }
    } catch (error) {
      console.error('Failed to scan QR code from file:', error);
      throw new Error('Failed to scan QR code from file');
    }
  }

  // Validate QR code data structure
  isValidQRCodeData(data: any): data is QRCodeData {
    return (
      data &&
      typeof data.productId === 'string' &&
      typeof data.name === 'string' &&
      typeof data.farmer === 'string' &&
      typeof data.harvestDate === 'string' &&
      typeof data.location === 'string' &&
      typeof data.timestamp === 'number'
    );
  }

  // Create QR code data object
  createQRCodeData(
    productId: string,
    name: string,
    farmer: string,
    harvestDate: string,
    location: string,
    blockchainHash?: string
  ): QRCodeData {
    return {
      productId,
      name,
      farmer,
      harvestDate,
      location,
      blockchainHash,
      timestamp: Date.now()
    };
  }

  // Get QR code scanner capabilities
  async getScannerCapabilities(): Promise<any> {
    try {
      const cameras = await Html5Qrcode.getCameras();
      return {
        cameras,
        hasCamera: cameras.length > 0,
        supportedFormats: ['QR_CODE', 'DATA_MATRIX', 'UPC_A', 'UPC_E', 'EAN_8', 'EAN_13']
      };
    } catch (error) {
      console.error('Failed to get scanner capabilities:', error);
      return {
        cameras: [],
        hasCamera: false,
        supportedFormats: []
      };
    }
  }

  // Download QR code as image
  downloadQRCode(dataURL: string, filename: string = 'qr-code.png'): void {
    try {
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download QR code:', error);
      throw new Error('Failed to download QR code');
    }
  }

  // Print QR code
  printQRCode(dataURL: string): void {
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print QR Code</title>
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                }
                img {
                  max-width: 100%;
                  max-height: 100%;
                }
              </style>
            </head>
            <body>
              <img src="${dataURL}" alt="QR Code" />
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    } catch (error) {
      console.error('Failed to print QR code:', error);
      throw new Error('Failed to print QR code');
    }
  }
}

// Create singleton instance
export const qrCodeService = new QRCodeService();

// Utility functions
export const generateProductQRCode = async (
  productId: string,
  productName: string,
  farmerName: string,
  harvestDate: string,
  location: string,
  blockchainHash?: string
): Promise<string> => {
  const qrData = qrCodeService.createQRCodeData(
    productId,
    productName,
    farmerName,
    harvestDate,
    location,
    blockchainHash
  );
  
  return await qrCodeService.generateQRCode(qrData);
};
