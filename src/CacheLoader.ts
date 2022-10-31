const Cache = require('../src/Consumers/Cache')

class CacheLoader {
  private cacheDriver = 'redis'
  private app: any

  constructor(App: any) {
    this.app = App
    this._setConfig('driver', this.cacheDriver)
  }

  public createCache() {
    const driver: string = this._getConfig('driver')
    let cache: any
    switch (driver.toLowerCase()) {
      case 'redis':
        // Load RedisCacheService
        const RedisCacheService = require('../src/Services/RedisCacheService')
        cache = new Cache(new RedisCacheService(this.app))
        break
    }
    return cache
  }

  private _getConfig(name: string): string {
    return this.app.container.use('Adonis/Core/Config').get(`cache.${name}`)
  }
  private _setConfig(name: string, value: any) {
    const config = this._getConfig(name)
    if (config) {
      return
    }
    this.app.container.use('Adonis/Core/Config').set(`cache.${name}`, value)
  }
}

module.exports = CacheLoader
