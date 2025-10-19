const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Client Order System API',
            version: '1.0.0',
            description: 'API documentation for Client Order System - Restaurant Order Management System',
            contact: {
                name: 'API Support',
                email: 'hung.dev95@gmail.com'
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
            {
                url: 'http://192.168.11.12:3000',
                description: 'Local network server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token obtained from /api/auth/login'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'Error message'
                        }
                    }
                },
                Order: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        orderNumber: { type: 'string', example: 'HBC001KSK0012510190001' },
                        status: { 
                            type: 'integer', 
                            enum: [0, 1, 2, 3, 4],
                            description: '0=Cancelled, 1=Received, 2=Processing, 3=Completed, 4=Delivered'
                        },
                        paymentStatus: { 
                            type: 'integer', 
                            enum: [0, 1],
                            description: '0=Unpaid, 1=Paid'
                        },
                        paymentMethod: { 
                            type: 'integer', 
                            enum: [0, 1],
                            description: '0=Cash, 1=Bank Transfer'
                        },
                        totalPrice: { type: 'integer', example: 45000 },
                        note: { type: 'string', nullable: true },
                        shopCode: { type: 'string', example: 'HBC001' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Food: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Bánh mì' },
                        price: { type: 'integer', example: 20000 },
                        description: { type: 'string', nullable: true },
                        image: { type: 'string', nullable: true },
                        status: { type: 'integer', example: 1 }
                    }
                },
                Menu: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Menu Sáng' },
                        description: { type: 'string', nullable: true }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Authentication',
                description: 'Login and authentication endpoints'
            },
            {
                name: 'Orders',
                description: 'Order management endpoints'
            },
            {
                name: 'Menu',
                description: 'Menu and food management endpoints'
            },
            {
                name: 'Receipt',
                description: 'Receipt and payment endpoints'
            },
            {
                name: 'Payment',
                description: 'Payment gateway integration (Sepay)'
            },
            {
                name: 'Manager',
                description: 'Manager-only endpoints (requires manager role)'
            }
        ]
    },
    apis: [
        './docs/swagger/*.yaml',  // Load YAML files
        './src/routes/*.js',      // Fallback to JSDoc if needed
        './src/routes/manager/*.js',
    ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
