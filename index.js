const express = require('express');
const dotenv = require('dotenv');
const logger = require('./utils/logger');

const { CONFIGURATION } = require('./constants/configuration')

dotenv.config();

const app = express();
const PORT = process.env.PORT || CONFIGURATION.PORT;

app.listen(PORT, (err) => {
    if(err) {
        logger.error("Encountered an error" + JSON.stringify(err))
    }
    logger.info(`Server Started at port ${PORT}`)
});
