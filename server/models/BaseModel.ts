import pool from "../db";
import type { PoolClient, QueryResult, QueryResultRow } from "pg";

/**
 * Base Model class providing common database operations
 * All models should extend this class for consistent data access patterns
 */
export abstract class BaseModel {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Execute a raw SQL query
   */
  protected async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    return pool.query<T>(text, params);
  }

  /**
   * Find all records with optional filters
   */
  async findAll<T extends QueryResultRow = QueryResultRow>(
    conditions?: Record<string, unknown>,
    orderBy?: string
  ): Promise<T[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (conditions && Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map((key) => {
          params.push(conditions[key]);
          return `${key} = $${paramIndex++}`;
        })
        .join(" AND ");
      query += ` WHERE ${whereClause}`;
    }

    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }

    const result = await this.query<T>(query, params);
    return result.rows;
  }

  /**
   * Find a single record by ID
   */
  async findById<T extends QueryResultRow = QueryResultRow>(
    id: number | string
  ): Promise<T | null> {
    const result = await this.query<T>(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find a single record by conditions
   */
  async findOne<T extends QueryResultRow = QueryResultRow>(
    conditions: Record<string, unknown>
  ): Promise<T | null> {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);

    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(" AND ");

    const result = await this.query<T>(
      `SELECT * FROM ${this.tableName} WHERE ${whereClause}`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Create a new record
   */
  async create<T extends QueryResultRow = QueryResultRow>(
    data: Record<string, unknown>
  ): Promise<T> {
    // Filter out undefined values to let PostgreSQL use DEFAULT values
    const entries = Object.entries(data).filter(([_, value]) => value !== undefined);
    const keys = entries.map(([key]) => key);
    const values = entries.map(([_, value]) => value);

    const columns = keys.join(", ");
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");

    const result = await this.query<T>(
      `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );

    if (!result.rows[0]) {
      throw new Error("Insert failed: no row returned");
    }

    return result.rows[0];
  }

  /**
   * Update a record by ID
   */
  async updateById<T extends QueryResultRow = QueryResultRow>(
    id: number | string,
    data: Record<string, unknown>
  ): Promise<T | null> {
    const keys = Object.keys(data);
    const values = Object.values(data);

    if (keys.length === 0) {
      throw new Error("No fields to update");
    }

    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    values.push(id);

    const result = await this.query<T>(
      `UPDATE ${this.tableName} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Delete a record by ID
   */
  async deleteById(id: number | string): Promise<boolean> {
    const result = await this.query(`DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`, [
      id,
    ]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Count records with optional conditions
   */
  async count(conditions?: Record<string, unknown>): Promise<number> {
    let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (conditions && Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map((key) => {
          params.push(conditions[key]);
          return `${key} = $${paramIndex++}`;
        })
        .join(" AND ");
      query += ` WHERE ${whereClause}`;
    }

    const result = await this.query<{ count: string }>(query, params);
    return parseInt(result.rows[0]?.count || "0", 10);
  }

  /**
   * Check if a record exists
   */
  async exists(conditions: Record<string, unknown>): Promise<boolean> {
    const count = await this.count(conditions);
    return count > 0;
  }

  /**
   * Execute a transaction
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
