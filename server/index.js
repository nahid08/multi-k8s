
//express

const express = require("express");
const cors = require("cors");



const app = express();
app.use(cors());


// Postgres Client Setup
const { Pool } = require("pg");
const keys = require("./keys");
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.port

})

pgClient.on("error", () => console.log('lost connection'))
pgClient.on("connect", (client) => {
    client
      .query("CREATE TABLE IF NOT EXISTS values (number INT)")
      .catch((err) => console.error(err));
  });
 
  
  // Redis client setup

  const redis = require("redis");
  const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
  })



  const redisPublisher = redisClient.duplicate();


  // Express route handlers

  app.get('/', (req,res) => {
    res.send("hi");
  })

  app.get("/values/all", async(req,res) => {
    const values = await pgClient.query(
        "Select * from values"
    )
    res.send(values.rows);
  })

  app.get("/values/current", async(req,res) => {
    redisClient.hGetAll('values', (err,values) => {
        res.send(values)
    })
  })


  app.post('/values', async(req,res) => {
    const index = req.body;

    if(parseInt(index)<40) {
        return res.status(422).send("index too high")
    }

    redisClient.hset('values', index, "Nothing yey");
    redisPublisher.publish('insert', index)
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index])

    res.send({Working: true})
  })

  app.listen(5000, err => {
    console.log('listening')
  })