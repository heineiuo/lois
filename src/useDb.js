
import {
  Collection, // eslint-disable-line
  GridFSBucket,
  MongoClient,
} from 'mongodb'
import Joi from 'joi'
import errors from 'http-errors'

class MongoClient2 {
  constructor (url, options = {}) {
    this._url = url
    this._collections = {}
    this._options = {
      useNewUrlParser: true,
      reconnectInterval: 500,
      reconnectTries: 2
    }

    this.connect()
    const client = this
    return new Proxy(this, {
      get: function (_, name) {
        if (name in client) return client[name]
        if (!client._client || !client._client.isConnected()) {
          throw new errors.InternalServerError('Database disconnected.')
        }
        const db = client._db
        if (name === '_db') return db
        if (name in client._collections) {
          const col = client._collections[name]
          const collection = col.is_bucket
            ? db.collection(col.name + '.files')
            : db.collection(col.name)
          return new Proxy(collection, {
            get: function (targetA, nameA) {
              // TODO: proxy more method that has insert/mutate data effects
              if (nameA === 'insertOne') {
                if (!col.is_bucket) {
                  return async (val) => {
                    const validValue = await Joi.validate(val, col.schema)
                    const result = await targetA.insertOne(validValue)
                    return result
                  }
                }
              }
              return targetA[nameA]
            }
          })
        }
        return db[name]
      }
    })
  }

  /**
   * 
   * @param {*} name 
   * @param {*} options 
   * 
   * @returns {Collection}
   */
  createCollection (name, options) {
    if (!options) throw new errors.InternalServerError('options is required for db.createCollection')
    this._collections[name] = {
      name,
      schema: options.schema,
      is_bucket: options.is_bucket || false
    }
    return this._collections[name]
  }

  /**
   * 
   * @param {*} bucketName 
   * @returns {GridFSBucket}
   */
  createBucket (bucketName) {
    Object.defineProperty(this.bucket, bucketName, {
      get: () => {
        return new GridFSBucket(this._db, { bucketName })
      }
    })
  }

  connect = () => {
    if (this.isConnecting) return false
    this.isConnecting = true
    MongoClient.connect(this._url, this._options, (err, client) => {
      if (err) {
        console.log(`[${new Date()}] Database(${this._url}) connecting failed`)
        this.lostConnectionTime = Date.now()
        this.isConnecting = false
        this._timer = setTimeout(this.connect, 3000)
        return false
      }

      console.log(`[${new Date()}] Database(${this._url}) connected`)
      this._client = client
      this._db = client.db()
      this._db.on('close', () => {
        console.log(`[${new Date()}] Database(${this._url}) closed`)
        this._db.removeAllListeners()
        this.connect()
      })
      this.latestConnectTime = Date.now()
      this.lostConnectionTime = NaN
      this.isConnecting = false
    })
  }

  /**
   * @type {Object.<string, GridFSBucket>} bucket
   */
  bucket = {}
}

/**
 * @type {Object.<string, Collection>} bucket
 */
const db = new MongoClient2(process.env.MONGODB_URL)


export function useDb(name){
  return db[name]
}