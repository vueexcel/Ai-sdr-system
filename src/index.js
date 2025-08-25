const express = require('express');
const cors = require('cors');
require('dotenv').config();

const prospectRoutes = require('./routes/prospects');
const DatabaseService = require('./database/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/prospects', prospectRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const stats = await DatabaseService.getProspectStats();
    res.json({ 
      status: 'OK', 
      message: 'AI SDR System is running',
      database: 'Connected',
      totalProspects: stats.totalProspects
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await DatabaseService.disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 AI SDR System running on port ${PORT}`);
  console.log(`💾 Using Prisma ORM with PostgreSQL`);
});

module.exports = app;
