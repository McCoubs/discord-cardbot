import { Db, MongoClient, MongoError } from 'mongodb';
import { getLogger } from '../utils/logger';
import { environment } from '../config/environment';
import mongoose from 'mongoose';
import { Service } from '../di/serviceDecorator';

const url = `mongodb://${environment.mongo.host}:${environment.mongo.port}`;
const dbName = 'test';
const logger = getLogger('mongo');

@Service()
export class MongoConnector {
  client: MongoClient;
  db: Db;
  mongoose;

  constructor() {
    this.client = new MongoClient(url,{ useNewUrlParser: true, useUnifiedTopology: true });
    this.mongoose = mongoose.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true });
    this.client.connect((err: MongoError) => {
      if (err) return logger.error(err);
      logger.info('Connected successfully to server');
      this.db = this.client.db(dbName);
    });
  }
}

