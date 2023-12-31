## Running the Project

To run this project and scrape data using Puppeteer, follow these steps:

### Prerequisites

1. Make sure you have [Node.js](https://nodejs.org/) installed on your system.
2. Also must have `nvm` installed. 

### Installation

2. Clone this repository:

   ```bash
   git clone https://github.com/new-one-one-one/scrapeye.git
   cd scrapeye
   ```

3. Install project dependencies:

   ```bash
   npm install
   ```

### Configuration

Create a `.env` file in the repository 

4. Set the following environment variables in a `.env` file:
   
   - `BROWSER_EXE_FILE`: Provide the path to your Chromium executable.
   - `SCRAPPING_SITE_LINK`: Specify the URL of the site you want to scrape.
   - `PORT`: as this is an express based project you can provide port number as well

### Run the Application

5. Execute the main script:

   ```bash
   node index.js
   ```

## Project Highlights

- **Scraping with Puppeteer:** This project uses Puppeteer to extract specific information from web pages.
- **Multiple Data Extraction Approaches:** Different methods of data extraction are demonstrated like pure javascript based and pure puppeteer based.
- **Data Storage:** The scraped data is stored as JSON file named `finalResult.json`
- **PDF Generation:** The project can create PDFs of web page we opened with named `pagePdf.pdf` present inside same directory as that of project
- **Logging Support:** Log messages are formatted with a timestamp and log level.Also, i have added four log files are used: `error.log`, `info.log`, `success.log`, and `warning.log`. Moreover, logs are stored in directories like `2023/January/27/`, following the date-based hierarchy.

### Results

After running the script, the scraped data will be saved in a JSON file named `finalResult.json` in the project directory. A PDF of the web page will also be generated as `pagePdf.pdf`.