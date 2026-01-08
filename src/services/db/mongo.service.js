const mongoose = require('../../config/mongo');

class MongoService {
  static async testConnection() {
    try {
      return mongoose.connection.readyState === 1;
    } catch (error) {
      return false;
    }
  }

  static async createDocument(model, data) {
    try {
      const document = new model(data);
      return await document.save();
    } catch (error) {
      throw new Error(`MongoDB Create Error: ${error.message}`);
    }
  }

  static async findDocuments(model, query = {}, options = {}) {
    try {
      let queryBuilder = model.find(query);
      
      if (options.sort) {
        queryBuilder = queryBuilder.sort(options.sort);
      }
      
      if (options.limit) {
        queryBuilder = queryBuilder.limit(options.limit);
      }
      
      if (options.skip) {
        queryBuilder = queryBuilder.skip(options.skip);
      }
      
      return await queryBuilder.exec();
    } catch (error) {
      throw new Error(`MongoDB Find Error: ${error.message}`);
    }
  }

  static async updateDocument(model, query, update) {
    try {
      return await model.updateMany(query, update);
    } catch (error) {
      throw new Error(`MongoDB Update Error: ${error.message}`);
    }
  }

  static async deleteDocument(model, query) {
    try {
      return await model.deleteMany(query);
    } catch (error) {
      throw new Error(`MongoDB Delete Error: ${error.message}`);
    }
  }
}

module.exports = MongoService;
