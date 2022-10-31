'use strict'

import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class CacheProvider {
  constructor(protected app: ApplicationContract) {}
  public register() {
    this.app.container.singleton('AhmadYusri/Adonis-Cache', () => {
      const CacheLoader = require('../src/CacheLoader')
      return new CacheLoader(this.app).createCache()
    })

    this.app.container.alias('AhmadYusri/Adonis-Cache', 'Cache')
  }
}

module.exports = CacheProvider
