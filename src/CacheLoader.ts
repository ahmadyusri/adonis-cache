const Cache = require("../src/Consumers/Cache");
const DatabaseCacheService = require("../src/Services/DatabaseCacheService");
const FileCacheService = require("../src/Services/FileCacheService");
const RedisCacheService = require("../src/Services/RedisCacheService");
const MemCacheService = require("../src/Services/MemCacheService");

class CacheLoader {
  cacheDriver = "redis";
  private app: any;

  constructor(App: any) {
    this.app = App;
    this._setConfig("driver", this.cacheDriver);
  }
  _getConfig(name: String) {
    return this.app.use("Adonis/Src/Config").get(`cache.${name}`);
  }
  _setConfig(name: String, value: any) {
    const config = this._getConfig(name);
    if (config) {
      return;
    }
    this.app.use("Adonis/Src/Config").set(`cache.${name}`, value);
  }
  createCache() {
    const driver: string = this._getConfig("driver");
    let cache: any;
    switch (driver.toLowerCase()) {
      case "memcache":
        // Load MemCacheService
        cache = new Cache(new MemCacheService(this.app));
        break;

      case "redis":
        // Load RedisCacheService
        cache = new Cache(new RedisCacheService(this.app));
        break;

      case "database":
        // Load DatabaseCacheService
        cache = new Cache(new DatabaseCacheService(this.app));
        break;

      default:
        // Load FileCacheService
        cache = new Cache(new FileCacheService(this.app));
        break;
    }
    return cache;
  }
}

module.exports = CacheLoader;
