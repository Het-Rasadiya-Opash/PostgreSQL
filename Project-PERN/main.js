const { Client } = require("pg");

const con = new Client({
  host: "",
  user: "",
  port: ,
  password: "",
  database: "",
});

con
  .connect()
  .then(() => console.log("Connected successfully"))
  .catch((err) => console.log(err));

// const createTableQuery = `
// CREATE TABLE IF NOT EXISTS users (
//   id SERIAL PRIMARY KEY,
//     name VARCHAR(100) NOT NULL
// );`;

// con
//   .query(createTableQuery)
//   .then(() => console.log("Table created successfully"))
//   .catch((err) => console.log(err))
//   .finally(() => con.end());

// const insertQuery = `
// INSERT INTO users (name) VALUES ('Het Rasadiya');
// `;

// con.query(insertQuery)
//   .then(() => console.log("Data inserted successfully"))
//   .catch((err) => console.log(err))
//     .finally(() => con.end());


// const updateQuery = `
// UPDATE users SET name='Het RASADIYA' WHERE id=2;
// `;

// con.query(updateQuery)
//   .then(() => console.log("Data updated successfully"))
//   .catch((err) => console.log(err))


const deleteQuery = `
DELETE FROM users WHERE id=2;
`;

con.query(deleteQuery)
  .then(() => console.log("Data deleted successfully"))
  .catch((err) => console.log(err))

const selectQuery = `
SELECT * FROM users;
`;

con.query(selectQuery)
  .then((res) => console.log(res.rows))
  .catch((err) => console.log(err))
  .finally(() => con.end());

