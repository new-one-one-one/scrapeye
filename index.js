const express = require('express');
const app = express();

require('dotenv').config();

const logger = require('./utils/logger');
const { CONFIGURATION } = require('./constants/configuration')

const PORT = process.env.PORT || CONFIGURATION.PORT;

const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: process.env.BROWSER_EXE_FILE, 
        headless: false,
    });
    
    const page = await browser.newPage();

    await page.goto(process.env.SCRAPPING_SITE_LINK);
   
    // Wait for the page to load completely (we can adjust the timeout as needed).
    await page.waitForTimeout(10000);

    // Initializing the result object to store the required scraped data.
    const finalResult = {
        fingerprintID: "",
        trust_score: "",
        lies: "",
        bot: ""
    };

    // Scrape the FP ID from the page.
    const fpID = await page.evaluate(() => {
        const fingerprintHeader = document.querySelector('.fingerprint-header');
        const fpIDElement = fingerprintHeader.querySelector('div.ellipsis-all');

        if (fpIDElement) {
            const text = fpIDElement.textContent.trim();
            const match = text.match(/FP ID: ([0-9a-f]+)/i);

            if (match) {
                return match[1];
            }
        }

        return null;
    });

    finalResult.fingerprintID = fpID;

    if (fpID) {
        console.log(`FP ID: ${fpID}`);
    } else {
        console.log('FP ID not found.');
    }

    /**
     * Approach 1:
     *    Use document to find the class selector and then perform scraping.
     * Pros:
     *    Easy to understand and use 
     * Cons: 
     *   Heavy from performance perspective
     * 
     * Our aim:
     * To find out the trust score data from the visitor-info element.
     */
    const firstColSixDivSection = await page.evaluate(() => {
        const colSixElement = document.querySelector('.col-six');
        if (colSixElement) {
            const contentElements = colSixElement.querySelectorAll('div');
            const result = {};

            contentElements.forEach((element) => {
                const key = element.innerText.split(':')[0].trim();
                const valueElement = element.querySelector('span.unblurred');
                if (valueElement) {
                    const value = valueElement.innerText.trim();
                    result[key] = value;
                }
            });

            return result;
        }
        return null;
    });

    finalResult.trust_score = firstColSixDivSection["trust score"];



    /**
     * Approach 2:
     *    Use pure puppetee for evaluation and selection to find the class selector and then perform scraping.
     * Pros:
     *    Efficient and to the point selection
     *    Cna do generalization
     * Cons: 
     *   difficult to adapt
     * 
     * Our aim:
     * To find out the trust score data from the visitor-info element from second column
     */

    const visitorInfoDiv = await page.$('.visitor-info');

    const flexGridRelative = await visitorInfoDiv.$('.flex-grid.relative');
    const colSixDivs = await flexGridRelative.$$('div.col-six');
    const secondColSixDiv = colSixDivs[1];

    if (secondColSixDiv) {
        const lies = await secondColSixDiv.$eval('.lies', async (liesDiv) => {
            return liesDiv.querySelector('label[for="toggle-open-creep-lies"]').textContent;
        });
        finalResult.lies = lies;
    }

    const lastDivInsideSecondColSix = colSixDivs[colSixDivs.length - 1];
    const blockTextElement = await lastDivInsideSecondColSix.$('.block-text');

    if (blockTextElement) {
        const textContent = await blockTextElement.evaluate(element => element.textContent.trim());
        const lines = textContent.split('\n');
        const blockData = {};

        lines.forEach(line => {
            const indexOfSeparator = line.indexOf(":");
            const key = line.substring(0, indexOfSeparator).trim();
            const value = line.substring(indexOfSeparator + 1).trim();
            blockData[key] = value;
        });

        finalResult.bot = blockData["bot"];
    } else {
        console.log("Element with class 'block-text' not found inside the last 'div' element.");
    }

    // Consoling the finalResult object.
    console.log({ finalResult });

    const jsonFilePath = `finalResult.json`; // Define the JSON file path

    // Save finalResult as a JSON file
    fs.writeFileSync(jsonFilePath, JSON.stringify(finalResult, null, 2));

    await page.pdf({
        path: 'pagePdf.pdf', 
        format: 'A4', 
    });
  
    await browser.close();
})();


app.listen(PORT, (err) => {
    if(err) {
        logger.error("Encountered an error" + JSON.stringify(err))
    }
    logger.info(`Server Started at port ${PORT}`)
});
