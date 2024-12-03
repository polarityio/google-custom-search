'use strict';

const request = require('postman-request');
const config = require('./config/config');
const async = require('async');
const fs = require('fs');

let Logger;
let requestWithDefaults;

const MAX_PARALLEL_LOOKUPS = 10;

function startup(logger) {
  let defaults = {};
  Logger = logger;

  const { cert, key, passphrase, ca, proxy, rejectUnauthorized } = config.request;

  if (typeof cert === 'string' && cert.length > 0) {
    defaults.cert = fs.readFileSync(cert);
  }

  if (typeof key === 'string' && key.length > 0) {
    defaults.key = fs.readFileSync(key);
  }

  if (typeof passphrase === 'string' && passphrase.length > 0) {
    defaults.passphrase = passphrase;
  }

  if (typeof ca === 'string' && ca.length > 0) {
    defaults.ca = fs.readFileSync(ca);
  }

  if (typeof proxy === 'string' && proxy.length > 0) {
    defaults.proxy = proxy;
  }

  if (typeof rejectUnauthorized === 'boolean') {
    defaults.rejectUnauthorized = rejectUnauthorized;
  }

  requestWithDefaults = request.defaults(defaults);
}

function doLookup(entities, options, cb) {
  let lookupResults = [];
  let tasks = [];

  Logger.trace({ entities }, 'doLookup Entities');

  entities.forEach((entity) => {
    const requestOptions = {
      method: 'GET',
      uri: `https://www.googleapis.com/customsearch/v1/`,
      qs: {
        key: options.apiKey,
        cx: options.cx,
        num: options.maxResults,
        q: `"${entity.value}"`
      },
      json: true
    };

    Logger.trace({ requestOptions }, 'Request Options');

    tasks.push(function (done) {
      requestWithDefaults(requestOptions, function (error, res, body) {
        Logger.trace({ body, status: res.statusCode });
        let processedResult = handleRestError(error, entity, res, body);

        if (processedResult.error) {
          done(processedResult);
          return;
        }

        done(null, processedResult);
      });
    });
  });

  async.parallelLimit(tasks, MAX_PARALLEL_LOOKUPS, (err, results) => {
    if (err) {
      Logger.error({ err: err }, 'Error');
      cb(err);
      return;
    }

    results.forEach((result) => {
      if (result.body === null || result.body.searchInformation.totalResults === '0') {
        lookupResults.push({
          entity: result.entity,
          data: null
        });
      } else {
        lookupResults.push({
          entity: result.entity,
          data: {
            summary: [`Total Results: ${result.body.searchInformation.totalResults}`],
            details: result.body
          }
        });
      }
    });

    Logger.debug({ lookupResults }, 'Results');
    cb(null, lookupResults);
  });
}

function handleRestError(error, entity, res, body) {
  let result;

  if (error || !body) {
    return {
      error,
      body,
      detail: 'Network Error Encountered'
    };
  }

  if (res.statusCode === 200) {
    // we got data!
    result = {
      entity: entity,
      body: body
    };
  } else if (res.statusCode === 400 || res.statusCode === 404) {
    result = {
      error: 'Did not receive HTTP 200 Status Code',
      statusCode: res ? res.statusCode : 'Unknown',
      detail:
        body.error && body.error.message
          ? `${body.error.message} -- Ensure you have provided a valid Google Search Engine ID`
          : `An unexpected HTTP Status Code of ${res.statusCode} was received`,
      body
    };
  } else {
    result = {
      error: 'Did not receive HTTP 200 Status Code',
      statusCode: res ? res.statusCode : 'Unknown',
      detail:
        body.error && body.error.message
          ? body.error.message
          : `An unexpected HTTP Status Code of ${res.statusCode} was received`,
      body
    };
  }

  return result;
}

function validateStringOption(errors, options, optionName, errMessage) {
  if (
    typeof options[optionName].value !== 'string' ||
    (typeof options[optionName].value === 'string' && options[optionName].value.length === 0)
  ) {
    errors.push({
      key: optionName,
      message: errMessage
    });
  }

  return errors;
}

function validateNumericOption(errors, options, optionName, errMessage) {
  if (typeof options[optionName].value === 'undefined' || +options[optionName].value <= 0) {
    errors.push({
      key: optionName,
      message: errMessage
    });
  }

  return errors;
}

function validateOptions(options, callback) {
  let errors = [];

  errors = validateStringOption(errors, options, 'apiKey', 'You must provide a valid API Key.');
  errors = validateStringOption(errors, options, 'cx', 'You must provide a Custom Search Engine ID.');
  errors = validateNumericOption(
    errors,
    options,
    'maxResults',
    'You must provide a Maximum Number of Results to return greater than 0'
  );

  callback(null, errors);
}

module.exports = {
  doLookup,
  startup,
  validateOptions
};
