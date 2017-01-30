'use strict'

module.exports = ReceiverFactory

const _ = require('lodash')
const crypto = require('crypto')
const base64url = require('base64url')
const Model = require('five-bells-shared').Model
const PersistentModelMixin = require('five-bells-shared').PersistentModelMixin
const Database = require('../lib/db')
const Config = require('../lib/config')
const Validator = require('five-bells-shared/lib/validator')
const Sequelize = require('sequelize')

function hmac(key, message) {
  const hm = crypto.createHmac('sha256', key)
  hm.update(message, 'utf8')
  return hm.digest()
}

ReceiverFactory.constitute = [Database, Validator, Config]
function ReceiverFactory(sequelize, validator, config) {
  class Receiver extends Model {
    static convertFromExternal(data) {
      delete data.shared_secret

      return data
    }

    static convertToExternal(data) {
      delete data.created_at
      delete data.updated_at

      return data
    }

    static convertFromPersistent(data) {
      data = _.omit(data, _.isNull)
      return data
    }

    static convertToPersistent(data) {
      return data
    }
  }

  Receiver.validateExternal = validator.create('Receiver')

  PersistentModelMixin(Receiver, sequelize, {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4
    },
    name: Sequelize.STRING,
    user: Sequelize.INTEGER,
    webhook: Sequelize.STRING
  })

  return Receiver
}
