const axios = require('axios');
const logger = require('../utils/logger');
const { createReceiptContent, testPrinterConnection } = require('../utils/epsonPrintBuilder');

class PrintController {
    /**
     * Test printer connection
     * GET /api/print/test
     */
    async testPrinter(req, res) {
        try {
            const {
                printerIp = process.env.DEFAULT_PRINTER_IP,
                port = process.env.DEFAULT_PRINTER_PORT,
                deviceId = process.env.DEFAULT_DEVICE_ID
            } = req.query;

            if (!printerIp) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu địa chỉ IP máy in'
                });
            }

            logger.info(`Testing printer connection: ${printerIp}`);

            const result = await testPrinterConnection(printerIp, port, deviceId);
            
            return res.json({
                success: result.success,
                connected: result.connected,
                message: result.connected ? 'Kết nối máy in thành công' : 'Không thể kết nối đến máy in',
                data: {
                    printerIp,
                    port,
                    deviceId,
                    error: result.error
                }
            });

        } catch (error) {
            logger.error('Test printer error:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi kiểm tra máy in: ' + error.message
            });
        }
    }

    /**
     * In hóa đơn qua máy in Epson
     * POST /api/print/receipt
     */
    async printReceipt(req, res) {
        try {
            const {
                printerIp = process.env.DEFAULT_PRINTER_IP,
                port = process.env.DEFAULT_PRINTER_PORT,
                //deviceId = process.env.DEFAULT_DEVICE_ID,
                receiptData
            } = req.body;

            // Override deviceId to use the correct Epson device ID
            const epsonDeviceId = 'local_printer'; // Epson printers expect this specific device ID            // Validate input
            if (!receiptData) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu dữ liệu hóa đơn (receiptData)'
            });
            }

            if (!printerIp) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu địa chỉ IP máy in'
                });
            }

            logger.info(`Printing receipt: ${receiptData.receiptNumber || 'N/A'}`);

            // Tạo URL cho máy in Epson (giống như Epson SDK)
            const printerUrl = `http://${printerIp}${port ? `:${port}` : ''}/cgi-bin/epos/service.cgi?devid=${epsonDeviceId}&timeout=30000`;

            // Tạo SOAP envelope với ePOS-Print XML (giống như SDK)
            const printContent = createReceiptContent(receiptData);
            const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
    <s:Body>
        <epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
            ${printContent}
        </epos-print>
    </s:Body>
</s:Envelope>`;

            // Gửi request đến máy in với headers giống SDK
            const response = await axios.post(printerUrl, soapEnvelope, {
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT',
                    'SOAPAction': '""'
                },
                timeout: 30000 // Tăng timeout lên 30 giây
            });

            // Parse response để kiểm tra kết quả
            const responseText = response.data;
            const success = /success\s*=\s*"\s*(1|true)\s*"/.test(responseText);
            const codeMatch = responseText.match(/code\s*=\s*"\s*(\S*)\s*"/);
            const code = codeMatch ? codeMatch[1] : '';

            if (!success) {
                logger.error(`Print failed: ${code} - ${receiptData.receiptNumber || 'N/A'}`);
                return res.status(400).json({
                    success: false,
                    message: `Lỗi máy in: ${code === 'EPTR_COVER_OPEN' ? 'Nắp máy in đang mở' : 
                                          code === 'EPTR_REC_EMPTY' ? 'Hết giấy' : 
                                          code === 'ERROR_DEVICE_BUSY' ? 'Máy in đang bận' : 
                                          `Mã lỗi: ${code}`}`
                });
            }

            logger.info(`Print successful: ${receiptData.receiptNumber || 'N/A'}`);

            return res.json({
                success: true,
                message: 'In hóa đơn thành công',
                data: {
                    receiptNumber: receiptData.receiptNumber,
                    timestamp: new Date().toISOString(),
                    printerStatus: code
                }
            });

        } catch (error) {
            logger.error('Print receipt error:', error.message);
            
            if (error.code === 'ECONNREFUSED') {
                return res.status(503).json({
                    success: false,
                    message: 'Không thể kết nối đến máy in. Vui lòng kiểm tra địa chỉ IP và kết nối mạng.'
                });
            }

            if (error.code === 'ETIMEDOUT') {
                return res.status(504).json({
                    success: false,
                    message: 'Kết nối đến máy in bị timeout. Vui lòng thử lại.'
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Lỗi khi in hóa đơn: ' + error.message
            });
        }
    }
}

module.exports = new PrintController();
