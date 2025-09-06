#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3003';
const PRINTER_IP = '192.168.1.100'; // Change this to your printer IP
const DEVICE_ID = 'local_printer';

async function testPrinterConnection() {
    console.log('🔍 Testing printer connection...');
    
    try {
        const response = await axios.get(`${BASE_URL}/api/print/test`, {
            params: {
                printerIp: PRINTER_IP,
                deviceId: DEVICE_ID
            }
        });
        
        console.log('✅ Connection test result:', response.data);
        return response.data.connected;
    } catch (error) {
        console.log('❌ Connection test failed:', error.response?.data || error.message);
        return false;
    }
}

async function testPrintReceipt() {
    console.log('🖨️  Testing receipt printing...');
    
    // Load sample receipt data
    const sampleDataPath = path.join(__dirname, 'sample-receipt-data.json');
    const receiptData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf8'));
    
    try {
        const response = await axios.post(`${BASE_URL}/api/print/receipt`, {
            printerIp: PRINTER_IP,
            deviceId: DEVICE_ID,
            receiptData: receiptData
        });
        
        console.log('✅ Print test result:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Print test failed:', error.response?.data || error.message);
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting ClientOrderPrint tests...\n');
    
    // Test 1: Health check
    console.log('1. Health check...');
    try {
        const response = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Service is running:', response.data);
    } catch (error) {
        console.log('❌ Service is not running. Please start the service first.');
        return;
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Printer connection
    const connected = await testPrinterConnection();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: Print receipt (only if connected)
    if (connected) {
        await testPrintReceipt();
    } else {
        console.log('⚠️  Skipping print test - printer not connected');
    }
    
    console.log('\n🏁 Tests completed!');
    console.log('\nNote: Update PRINTER_IP in this script to match your actual printer IP address.');
}

// Run the tests
runTests().catch(console.error);
