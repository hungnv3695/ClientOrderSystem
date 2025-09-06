# ClientOrderPrint Service

Local print service for Epson receipt printers, designed to bypass CORS restrictions when printing from web browsers.

## Features

- ✅ **Receipt printing** via Epson thermal printers
- ✅ **CORS bypass** - Local service eliminates browser CORS restrictions
- ✅ **Epson SDK compatible** - Uses same approach as official Epson ePOSDevice SDK
- ✅ **Vietnamese formatting** - Proper currency and date formatting
- ✅ **Error handling** - Detailed printer status and error reporting
- ✅ **Connection testing** - Built-in printer connectivity tests
- ✅ **Simple API** - REST endpoints for easy integration

## API Endpoints

### Test Printer Connection
```
GET /api/print/test?printerIp=192.168.1.100&deviceId=local_printer
```

Response:
```json
{
  "success": true,
  "connected": true,
  "message": "Kết nối máy in thành công",
  "data": {
    "printerIp": "192.168.1.100",
    "deviceId": "local_printer"
  }
}
```

### Print Receipt
```
POST /api/print/receipt
Content-Type: application/json

{
  "printerIp": "192.168.1.100",
  "deviceId": "local_printer",
  "receiptData": {
    "receiptNumber": "HD001",
    "shopName": "QUÁN CAFÉ ABC",
    "items": [...],
    "totalAmount": 90000,
    "finalAmount": 85000
  }
}
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your printer settings
```

### 3. Start Service
```bash
# Development
npm run dev

# Production
npm start
```

### 4. Test Connection
```bash
# Run the test script
node test-print.js

# Or test manually
curl "http://localhost:3003/api/print/test?printerIp=192.168.1.100"
```

## Configuration

Create `.env` file:
```env
# Server configuration
PORT=3003
NODE_ENV=development

# Default printer settings
DEFAULT_PRINTER_IP=192.168.1.100
DEFAULT_PRINTER_PORT=
DEFAULT_DEVICE_ID=local_printer

# Timeout settings
PRINTER_TIMEOUT=10000
```

## Receipt Data Format

```json
{
  "receiptNumber": "HD001",
  "orderNumber": "ORD-2024-001",
  "shopName": "QUÁN CAFÉ ABC",
  "shopAddress": "123 Đường ABC, Quận 1, TP.HCM",
  "shopPhone": "0123-456-789",
  "items": [
    {
      "itemName": "Cà phê sữa đá",
      "qty": 2,
      "unitPrice": 25000
    }
  ],
  "totalAmount": 90000,
  "discountAmount": 5000,
  "finalAmount": 85000,
  "paymentMethod": "cash",
  "paidAt": "2024-01-15T10:30:00Z"
}
```

## Technical Implementation

### Epson SDK Compatibility

This service mimics the behavior of the official Epson ePOSDevice SDK:

- Uses the same HTTP endpoints (`/cgi-bin/epos/service.cgi`)
- Sends SOAP envelopes with proper headers
- Parses Epson-specific response codes
- Handles printer status and errors correctly

### Print Content Builder

The `epsonPrintBuilder.js` utility creates print content using the same XML structure as the frontend `PrinterService.js`:

- Text formatting and alignment
- Vietnamese currency formatting
- Proper character escaping
- Receipt layout matching frontend version

### Error Handling

Comprehensive error handling for common printer issues:

- `EPTR_COVER_OPEN` - Printer cover is open
- `EPTR_REC_EMPTY` - Out of paper
- `ERROR_DEVICE_BUSY` - Printer is busy
- Network connectivity issues
- Timeout handling

## Integration with Frontend

Replace direct printer calls in your web app:

```javascript
// Instead of direct printer connection (blocked by CORS):
// const printer = new epson.ePOSDevice();

// Use the local print service:
const printResponse = await fetch('http://localhost:3003/api/print/receipt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    printerIp: '192.168.1.100',
    receiptData: receiptData
  })
});
```

## Deployment

### Local Development
```bash
npm run dev
```

### Production (PM2)
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 monit
```

### Windows Service
```bash
# Install as Windows service
npm install -g node-windows
node install-service.js
```

## Troubleshooting

### Connection Issues
1. Verify printer IP address
2. Check network connectivity
3. Ensure printer web interface is accessible
4. Test with the `/api/print/test` endpoint

### Print Issues
1. Check paper and printer status
2. Verify receipt data format
3. Check printer error lights
4. Review service logs

### CORS Issues
- This service eliminates CORS by running locally
- Ensure your web app calls the local service
- Frontend and service must be on same network

## Architecture

```
Web Browser → ClientOrderPrint Service → Epson Printer
     ↓              ↓                         ↓
   No CORS      HTTP Proxy                Direct
   Issues       + Error                   Printing
               Handling
```

## Dependencies

- **express** - Web framework
- **axios** - HTTP client for printer communication
- **winston** - Logging
- **cors** - CORS handling
- **dotenv** - Environment configuration

## License

MIT License - See LICENSE file for details.
