const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const databasePath = path.join(__dirname, "userData.db");
let db = null;
const initializeDatabase = async (request, response) => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Running");
    });
  } catch (e) {
    console.log(`Running ${e}`);
    process.exit(1);
  }
};
initializeDatabase();

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const k = password.length;
  console.log(k);
  const checkForUser = `
  SELECT
    *
  FROM
  user
  WHERE 
  username='${username}';`;
  const forIfCondition = await db.get(checkForUser);
  if (forIfCondition === undefined) {
    if (k < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const hashedPassword = await bcrypt.hash(password, k);
      const query = `
        INSERT INTO
        user(username,name,password,gender,location)
        VALUES
        ('${username}','${name}','${hashedPassword}','${gender}','${location}');`;
      const jh = await db.run(query);
      response.send("User created successfully");
    }
  } else {
    response.status = 400;
    response.send("User already exists");
  }
});

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const query = `
  SELECT
    *
  FROM
  user
  WHERE 
  username='${username}';`;
  const hh = await db.get(query);
  console.log(hh);
  if (hh === undefined) {
    response.status = 400;
    response.send("Invalid user");
  } else {
    const check = await bcrypt.compare(password, hh.password);
    if (check) {
      response.status = 200;
      response.send("Login success!");
    } else {
      response.status = 400;
      response.send("Invalid password");
    }
  }
});

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const lengthOfNewPasswordCheck = newPassword.length;
  const query = `
    SELECT
      *
    FROM
    user
    WHERE
    username='${username}';`;
  const currentDetails = await db.get(query);
  const compare = await bcrypt.compare(oldPassword, currentDetails.password);
  if (lengthOfNewPasswordCheck < 5) {
    response.status = 200;
    response.send("Password is too short");
  } else {
    if (compare === false) {
      response.status = 400;
      response.send("Invalid current password");
    } else {
      const kj = await bcrypt.hash(newPassword, lengthOfNewPasswordCheck);
      const updateQuery = `
          UPDATE 
          user
          SET
          password='${kj}';`;
      const k = await db.run(updateQuery);
      response.send("Password updated");
    }
  }
});
module.exports = app;
