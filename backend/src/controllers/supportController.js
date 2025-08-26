// // controllers/supportController.js
// const pool = require("../config/db");

// // Create a query
// // exports.createQuery = async (req, res) => {
// //   try {
// //     const { subject, priority, message, attachment_url } = req.body;
// //     const userId = req.userId; // from token middleware

// //     if (!subject || !priority || !message) {
// //       return res.status(400).json({ message: "All fields are required" });
// //     }

// //     const result = await pool.query(
// //       `INSERT INTO support_queries (user_id, subject, priority, message, attachment_url, status) 
// //        VALUES ($1, $2, $3, $4, $5, 'open') RETURNING *`,
// //       [userId, subject, priority, message, attachment_url || null]
// //     );

// //     res.status(201).json({
// //       message: "Query submitted successfully",
// //       query: result.rows[0],
// //     });
// //   } catch (error) {
// //     console.error("Error creating support query:", error);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };
// // controllers/supportController.js
// exports.createQuery = async (req, res) => {
//   try {
//     const { subject, priority, message, attachment_url } = req.body;
//     const userId = req.userId;  // 👈 should come from token now

//     if (!userId) {
//       return res.status(400).json({ message: "User ID missing from token" });
//     }

//     const result = await pool.query(
//       `INSERT INTO support_queries (user_id, subject, priority, message, attachment_url, status) 
//        VALUES ($1, $2, $3, $4, $5, 'open') RETURNING *`,
//       [userId, subject, priority, message, attachment_url || null]
//     );

//     res.status(201).json({
//       message: "Query submitted successfully",
//       query: result.rows[0],
//     });
//   } catch (error) {
//     console.error("Error creating support query:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Get all queries for logged-in user
// exports.getMyQueries = async (req, res) => {
//   try {
//     const userId = req.userId;

//     const result = await pool.query(
//       "SELECT * FROM support_queries WHERE user_id = $1 ORDER BY created_at DESC",
//       [userId]
//     );

//     res.status(200).json({ queries: result.rows });
//   } catch (error) {
//     console.error("Error fetching queries:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
const pool = require("../config/db");

exports.createQuery = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { subject, priority, message } = req.body;

    // File (if attached)
    let fileName = null;
    if (req.file) {
      fileName = req.file.originalname; // you can save buffer to GCS/S3 later
    }

    if (!subject || !priority || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await pool.query(
      "INSERT INTO support_queries (user_id, subject, priority, message, attachment_url, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [userId, subject, priority, message, fileName, "open"]
    );

    res.status(201).json({
      message: "Support query created successfully",
      query: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating support query:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
