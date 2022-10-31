import EngineInterface from '../Contracts/EngineInterface'
import {
  RedisManagerContract,
  RedisConnectionContract,
  RedisClusterConnectionContract,
} from '@ioc:Adonis/Addons/Redis'

class RedisCache implements EngineInterface {
  private redis: RedisManagerContract
  private config: any

  /**
   * Custom connection or query client
   */
  private connection?: string | RedisConnectionContract | RedisClusterConnectionContract

  constructor(app: any) {
    if (!app.container.hasBinding('Adonis/Addons/Redis')) {
      throw new Error('"@adonisjs/redis" is required to use the "redis" token provider')
    }

    this.redis = app.container.use('Adonis/Addons/Redis')
    this.config = app.container.use('Adonis/Core/Config').get('redis')
  }

  /**
   * Returns the singleton instance of the redis connection
   */
  private getRedisConnection(): RedisConnectionContract | RedisClusterConnectionContract {
    /**
     * Use custom connection if defined
     */
    if (this.connection) {
      return typeof this.connection === 'string'
        ? this.redis.connection(this.connection)
        : this.connection
    }

    /**
     * Config must have a connection defined
     */
    if (!this.config.connections) {
      throw new Error(
        'Missing "connections" property for redis provider inside "config/redis" file'
      )
    }

    return this.redis.connection()
  }

  /**
   * Define custom connection
   */
  public setConnection(
    connection: string | RedisConnectionContract | RedisClusterConnectionContract
  ): this {
    this.connection = connection
    return this
  }

  public async get(name: string): Promise<any> {
    if (name) {
      const value = await this.getRedisConnection().get(name)
      return value ? value : null
    }
  }

  public async set(name: string, data: any, duration: number): Promise<any> {
    if (name && data) {
      if (duration === 0) {
        return await this._addCache(name, data)
      }
      return await this._addExpiredCache(name, data, duration)
    }
  }

  public async delete(name: string): Promise<Boolean> {
    const config = this.config
    const connection = config?.connection
    const connections = config?.connections
    const keyPrefix = connections[connection]?.keyPrefix ?? ''

    const keys = await this.getRedisConnection().keys(`${keyPrefix}${name}`)
    if (keys.length === 0) {
      return false
    }

    await Promise.all(
      keys.map(async (key) => {
        await this.getRedisConnection().del(key.replace(keyPrefix, ''))
      })
    )
    return true
  }

  public async flush(): Promise<void> {
    await this.getRedisConnection().flushdb()
  }

  private async _addExpiredCache(name: string, data: any, duration: number): Promise<any> {
    let expiration = Math.floor(duration * 60)
    await this.getRedisConnection().set(name, data, 'EX', expiration)
    return data
  }

  private async _addCache(name: string, data: any): Promise<any> {
    await this.getRedisConnection().set(name, data)
    return data
  }
}
export default RedisCache
