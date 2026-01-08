const pool = require('../../config/mysql');

class MySQLService {
  static async executeQuery(query, params = []) {
    try {
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`MySQL Query Error: ${error.message}`);
    }
  }

  static async executeTransaction(queries) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const results = [];
      for (const { query, params } of queries) {
        const [result] = await connection.execute(query, params);
        results.push(result);
      }
      
      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Transaction Error: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async testConnection() {
    try {
      const [rows] = await pool.execute('SELECT 1 as test');
      return rows[0].test === 1;
    } catch (error) {
      return false;
    }
  }
}

module.exports = MySQLService;
