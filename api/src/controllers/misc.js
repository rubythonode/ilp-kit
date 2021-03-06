'use strict'

module.exports = MiscControllerFactory

const exec = require('child_process').exec
const Config = require('../lib/config')
const Ledger = require('../lib/ledger')
const Utils = require('../lib/utils')
const currencySymbolMap = require('currency-symbol-map').currencySymbolMap
const Connector = require('../lib/connector')
const InvalidBodyError = require('../errors/invalid-body-error')

function MiscControllerFactory (deps) {
  const config = deps(Config)
  const ledger = deps(Ledger)
  const utils = deps(Utils)
  const connector = deps(Connector)

  return class MiscController {
    static init (router) {
      router.get('/parse/destination', this.destination)
      router.get('/config', this.config)
    }

    /**
     * @api {GET} /parse/destination Parse destination
     * @apiName ParseDestination
     * @apiGroup Misc
     * @apiVersion 1.0.0
     *
     * @apiDescription Parse a destination
     *
     * @apiExample {shell} Parse a destination
     *    curl -X GET
     *    https://wallet.example/parse/destination?destination=alice@wallet.example
     *
     * @apiSuccessExample {json} 200 Response:
     *    HTTP/1.1 200 OK
     *    {
     *      {
     *        "type": "local",
     *        "ledgerUri": "http://wallet.example/ledger",
     *        "paymentUri": "http://wallet.example/api/spsp/alice",
     *        "ilpAddress": "wallet.alice",
     *        "currencyCode": "USD",
     *        "currencySymbol": "$",
     *        "name": "Alice Faye",
     *        "imageUrl": ""
     *      }
     *    }
     */
    static async destination (ctx) {
      const destination = ctx.query.destination

      if (!destination) {
        throw new InvalidBodyError('No destination specified')
      }

      ctx.body = await utils.parseDestination({ destination })
    }

    /**
     * @api {GET} /config Wallet config
     * @apiName GetConfig
     * @apiGroup Misc
     * @apiVersion 1.0.0
     *
     * @apiDescription Get wallet config
     *
     * @apiExample {shell} Get wallet config
     *    curl -X GET
     *    https://wallet.example/config
     *
     * @apiSuccessExample {json} 200 Response:
     *    HTTP/1.1 200 OK
     *    {
     *      "ledgerUri": "https://wallet.example/ledger",
     *      "currencyCode": "USD",
     *      "currencySymbol": "$"
     *    }
     */
    static async config (ctx) {
      const ledgerInfo = await ledger.getInfo()

      const packageVersion = require('../../../package.json').version
      const gitCommit = await new Promise((resolve, reject) => {
        exec('git rev-parse --short HEAD', { cwd: __dirname }, (err, stdout) => {
          if (err) {
            reject(err)
          } else {
            resolve(stdout.split('\n').join(''))
          }
        })
      })

      const response = {
        clientUri: config.data.get('client_host'),
        ledgerUri: config.data.getIn(['ledger', 'public_uri']),
        currencyCode: ledgerInfo.currency_code,
        currencyScale: ledgerInfo.scale,
        currencySymbol: currencySymbolMap[ledgerInfo.currency_code] || ledgerInfo.currency_code,
        registration: config.data.get('registration'),
        antiFraud: !!config.data.getIn(['antifraud', 'service_url']),
        title: config.data.get('client_title'),
        track: {
          ga: config.data.getIn(['track', 'ga']),
          mixpanel: config.data.getIn(['track', 'mixpanel'])
        },
        githubAuth: (config.data.getIn(['github', 'client_id']) && config.data.getIn(['github', 'client_secret'])),
        version: `${packageVersion}-${gitCommit}`
      }

      response.settlementMethods = await connector.getSelfSettlementMethods(false, 0)

      if (config.data.get('reload')) {
        response.reload = true
      }

      ctx.body = response
    }
  }
}
