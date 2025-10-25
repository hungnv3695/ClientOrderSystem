const { PAYMENT_METHODS, DAY_OF_WEEK_VN } = require('../constants/app.constants.js');

/**
 * Epson Print Builder - Adapted from frontend PrinterService.js
 * Uses the same approach as the Epson ePOSDevice SDK
 */

/**
 * Format currency to Vietnamese format (no symbol, just number)
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount);
}

/**
 * Format date time to Vietnamese format with day name
 */
function formatDateTime(date = new Date()) {
    const dateObj = new Date(date);
    const days = [
        DAY_OF_WEEK_VN.SUNDAY, 
        DAY_OF_WEEK_VN.MONDAY, 
        DAY_OF_WEEK_VN.TUESDAY, 
        DAY_OF_WEEK_VN.WEDNESDAY, 
        DAY_OF_WEEK_VN.THURSDAY, 
        DAY_OF_WEEK_VN.FRIDAY, 
        DAY_OF_WEEK_VN.SATURDAY
    ];
    const dayName = days[dateObj.getDay()];
    
    const time = dateObj.toLocaleTimeString('vi-VN', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const dateStr = dateObj.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    return `${dayName} ${time} ${dateStr}`;
}

/**
 * Escape XML markup characters
 */
function escapeXml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Tạo nội dung in hóa đơn theo format mẫu
 */
function createReceiptContent(receiptData) {
    const {
        receiptNumber,
        items = [],
        totalAmount,
        finalAmount,
        paymentMethod,
        paidAt,
        deviceId = 'Hệ thống'
    } = receiptData;

    let content = '';

    // Header - Biên lai
    content += `<text align="center">           Biên lai         </text>`;
    content += `<feed line="2"/>`;

    // Receipt info - căn trái
    content += `<text align="left">Số biên lai: ${escapeXml(receiptNumber || 'N/A')}</text>`;
    content += `<feed line="1"/>`;
    content += `<text align="left">Ngày: ${escapeXml(formatDateTime(paidAt))}</text>`;
    content += `<feed line="1"/>`;
    
    // Payment method - căn trái
    const paymentText = paymentMethod === PAYMENT_METHODS.BANK_TRANSFER ? 'Chuyển khoản' : 
                       paymentMethod === PAYMENT_METHODS.CASH ? 'Tiền mặt' : 
                       paymentMethod === PAYMENT_METHODS.CARD ? 'Thẻ' : 'Khác';
    content += `<text align="left">Phương thức: ${escapeXml(paymentText)}</text>`;
    content += `<feed line="1"/>`;
    content += `<text align="left">Nhân viên: ${escapeXml(deviceId)}</text>`;
    content += `<feed line="1"/>`;
    
    // Separator line
    content += `<text>-----------------------------------</text>`;
    content += `<feed line="1"/>`;

    // Items header - tiêu đề cột
    content += `<text align="left">Tên sản phẩm${' '.repeat(16)}Đơn giá</text>`;
    content += `<feed line="1"/>`;

    // Items list - tên sản phẩm và giá trên cùng 1 dòng
    items.forEach((item) => {
        const quantity = item.quantity || 1;
        const unitPrice = item.unitPrice || 0;
        const itemName = item.itemName || 'Sản phẩm';

        // In từng sản phẩm riêng biệt theo số lượng
        for (let i = 0; i < quantity; i++) {
            // Tên sản phẩm + giá trên cùng 1 dòng
            const priceStr = formatCurrency(unitPrice);
            const maxLength = 35; // Chiều rộng tối đa của dòng
            const nameLength = itemName.length;
            const priceLength = priceStr.length;
            const spaces = Math.max(1, maxLength - nameLength - priceLength);
            
            content += `<text align="left">${escapeXml(itemName)}${' '.repeat(spaces)}${priceStr}</text>`;
            content += `<feed line="1"/>`;
        }
    });

    // Separator line
    content += `<text>-----------------------------------</text>`;
    content += `<feed line="1"/>`;

    // Total - "Tổng tiền" và số tiền trên cùng 1 dòng
    const totalStr = formatCurrency(finalAmount || totalAmount);
    const totalSpaces = Math.max(1, 35 - 'Tổng tiền'.length - totalStr.length);
    content += `<text align="left">Tổng tiền${' '.repeat(totalSpaces)}${totalStr}</text>`;
    content += `<feed line="1"/>`;
    content += `<text align="left">(đã bao gồm 10% thuế)</text>`;
    content += `<feed line="1"/>`;
    
    // Footer spacing
    content += `<feed line="3"/>`;
    
    // Cut paper
    content += `<cut type="feed"/>`;

    return content;
}

/**
 * Test connection to printer
 */
async function testPrinterConnection(printerIp, port = '', deviceId = 'local_printer') {
    const axios = require('axios');
    
    try {
        // Always use local_printer for Epson compatibility
        const epsonDeviceId = deviceId;
        const printerUrl = `http://${printerIp}${port ? `:${port}` : ''}/cgi-bin/epos/service.cgi?devid=${epsonDeviceId}&timeout=5000`;
        
        // Send empty print command to test connection
        const testEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
    <s:Body>
        <epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
        </epos-print>
    </s:Body>
</s:Envelope>`;

        const response = await axios.post(printerUrl, testEnvelope, {
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT',
                'SOAPAction': '""'
            },
            timeout: 5000
        });

        const responseText = response.data;
        const success = /success\s*=\s*"\s*(1|true)\s*"/.test(responseText);
        
        return {
            success: true,
            connected: success,
            response: responseText
        };
        
    } catch (error) {
        return {
            success: false,
            connected: false,
            error: error.message
        };
    }
}

module.exports = {
    createReceiptContent,
    testPrinterConnection,
    formatCurrency,
    formatDateTime,
    escapeXml
};
