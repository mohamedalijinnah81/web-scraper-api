const { Blob } = require('node:buffer');
const FormData = require('form-data');

global.Blob = Blob;
global.File = class File extends Blob {
  constructor(parts, name, options = {}) {
    super(parts, options);
    this.name = name;
    this.lastModified = options.lastModified || Date.now();
  }
};

const express = require('express');
const cors = require('cors');
const scrapeRouter = require('./routes/scrape');
const { logRequest } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(logRequest);

app.use('/scrape', scrapeRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Web Scraper API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
