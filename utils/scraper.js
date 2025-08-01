const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { createObjectCsvStringifier } = require('csv-writer');

async function scrapeWebsite({ url, headers, body, method, responseFormat }) {
  try {
    const response = await fetch(url, {
      method: method.toUpperCase(),
      headers: {
        'User-Agent': 'WebScraper/1.0',
        ...headers,
      },
      body: method.toUpperCase() === 'POST' ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const scrapedData = {
      title: $('title').text().trim() || 'No title',
      meta: {},
      links: [],
      text: '',
    };

    $('meta').each((_, element) => {
      const name = $(element).attr('name') || $(element).attr('property');
      const content = $(element).attr('content');
      if (name && content) {
        scrapedData.meta[name] = content;
      }
    });

    $('a').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        scrapedData.links.push(href);
      }
    });

    scrapedData.text = $('body').text().trim().replace(/\s+/g, ' ');

    switch (responseFormat) {
      case 'html':
        return html;
      case 'text':
        return scrapedData.text;
      case 'csv':
        return await generateCsv(scrapedData);
      case 'json':
      default:
        return scrapedData;
    }
  } catch (error) {
    throw new Error(`Failed to scrape ${url}: ${error.message}`);
  }
}

async function generateCsv(data) {
  const csvWriter = createObjectCsvStringifier({
    header: [
      { id: 'title', title: 'Title' },
      { id: 'meta', title: 'Meta' },
      { id: 'link', title: 'Link' },
    ],
  });

  const records = [];
  records.push({ title: data.title, meta: '', link: '' });

  Object.entries(data.meta).forEach(([key, value]) => {
    records.push({ title: '', meta: `${key}: ${value}`, link: '' });
  });

  data.links.forEach((link) => {
    records.push({ title: '', meta: '', link });
  });

  return csvWriter.getHeaderString() + csvWriter.stringifyRecords(records);
}

module.exports = { scrapeWebsite };
