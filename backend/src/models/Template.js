const pool = require('../config/db');

class Template {
  static async create({ user_id, name, html, is_public = false }) {
    const query = `
      INSERT INTO templates (user_id, name, html, is_public)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [user_id, name, html, is_public];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM templates WHERE id = $1;';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async findByUserId(user_id) {
    const query = 'SELECT * FROM templates WHERE user_id = $1 OR is_public = TRUE;';
    const { rows } = await pool.query(query, [user_id]);
    return rows;
  }

  static async update(id, { name, html, is_public }) {
    const query = `
      UPDATE templates
      SET name = $1, html = $2, is_public = $3
      WHERE id = $4
      RETURNING *;
    `;
    const values = [name, html, is_public, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM templates WHERE id = $1 RETURNING *;';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = Template;