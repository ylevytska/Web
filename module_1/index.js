const express = require('express')
const app = express()
const port = 3000
var mysql = require('mysql');
const bp = require('body-parser')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')

app.use(bp.json())
app.use(cookieParser());
var con = mysql.createConnection({
  host: "localhost",
  port: "3307",
  user: "root",
  password: "",
  database : "task"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

app.get('/getUsers', (req, res) => {
  con.query("SELECT name FROM students", (err,result)=>{
    res.send(result)
  })
})

const generateAccessToken = (username) => {
  const payload = { username }
  return jwt.sign(payload, "SECRET_KEY_RANDOM", {expiresIn: "24h"} )
}

app.post('/getToken', (req, res) => {
  let username = [];
  const filter = [req.body.username];
  con.query("SELECT name FROM students WHERE username = ?",filter, (err,result)=>{
  username = result;
  let token = generateAccessToken(username)
  if(result.length != 0){
    res.cookie("token: ", token)
    res.send(token)
  }else{
    res.send("Пользователь не найден")
  }
  }) 
})
app.post('/addUser', (req, res) => {
  try {
    const token = req.headers?.cookie.split(`=`)[1];
    if (!token) {
      return res.status(403).json({message: "Отказано в доступе"})
    }
    let usernamnne = req.body.username;
    let name = req.body.name;
    let surname = req.body.surname;
    const decodedData = jwt.verify(token, "SECRET_KEY_RANDOM")
    con.query(`INSERT INTO students (name, username, surname) VALUES ("${name}", "${usernamnne}", "${surname}")`, ()=>{
      res.send("Пользователь создан")
    })
    } catch (e) {
      return res.status(403).json({message: "Отказано в доступе"})
    }
  })
  app.listen(port, () => {
    console.log(`app listening on port ${port}`)
  })
  