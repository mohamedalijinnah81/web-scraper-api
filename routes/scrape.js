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

    // Handle different response formats
    if (responseFormat === 'html') {
      res.setHeader('Content-Type', 'text/html');
      return res.send(result); // Send raw HTML
    } else if (responseFormat === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="scraped_data.csv"');
      return res.send(result); // Send raw CSV
    } else if (responseFormat === 'text') {
      res.setHeader('Content-Type', 'text/plain');
      return res.send(result); // Send raw text
    } else {
      res.setHeader('Content-Type', 'application/json');
      return res.json(result); // Send JSON
    }
  } catch (error) {
    console.error('Error in scrape route:', error.message);
    res.status(500).json({ error: 'Failed to scrape website', details: error.message });
  }
});

module.exports = router;
