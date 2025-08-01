const express = require('express');
const { scrapeWebsite } = require('../utils/scraper');
const { isValidUrl } = require('../utils/helpers');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { url, headers = {}, body = {}, method = 'GET', responseFormat = 'json' } = req.body;

    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid or missing URL' });
    }

    const validFormats = ['json', 'html', 'text', 'csv'];
    if (!validFormats.includes(responseFormat)) {
      return res.status(400).json({ error: `Invalid responseFormat. Must be one of: ${validFormats.join(', ')}` });
    }

    const validMethods = ['GET', 'POST'];
    if (!validMethods.includes(method.toUpperCase())) {
      return res.status(400).json({ error: `Invalid method. Must be one of: ${validMethods.join(', ')}` });
    }

    const result = await scrapeWebsite({ url, headers, body, method, responseFormat });

    if (responseFormat === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="scraped_data.csv"');
      return res.send(result);
    } else {
      res.setHeader('Content-Type', 'application/json');
      return res.json(result);
    }
  } catch (error) {
    console.error('Error in scrape route:', error.message);
    res.status(500).json({ error: 'Failed to scrape website', details: error.message });
  }
});

module.exports = router;
