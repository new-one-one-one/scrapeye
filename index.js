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
    await page.waitForTimeout(10000);

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

    if (fpID) {
        console.log(`FP ID: ${fpID}`);
    } else {
        console.log('FP ID not found.');
    }

    const data = await page.evaluate(() => {
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

    if (data) {
        console.log(JSON.stringify(data, null, 2));
    } else {
        console.log('Data not found.');
    }

    await browser.close();
})();


app.listen(PORT, (err) => {
    if(err) {
        logger.error("Encountered an error" + JSON.stringify(err))
    }
    logger.info(`Server Started at port ${PORT}`)
});
