const express = require('express');
const app = express();
app.use(express.json());
const { models: { User }} = require('./db');
const path = require('path');
const jwt = require('jsonwebtoken');
const { Console } = require('console');

app.get('/', (req, res)=> res.sendFile(path.join(__dirname, 'index.html')));

app.post('/api/auth', async(req, res, next)=> {
  try {
     const id = await User.authenticate(req.body)
     const token = jwt.sign({ userId: id}, SECRET_KEY)
    //  console.log(token)
    res.send({token});
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/auth', async(req, res, next)=> {
  try {
    // console.log(req.headers.authorization)
    const verification = await User.byToken(req.headers.authorization)
    console.log(verification)
    res.send(verification);
  }
  catch(ex){
    next(ex);
  }
});

app.use((err, req, res, next)=> {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

const SECRET_KEY = process.env.JWT
// const token = JWT.sign({ userId: '1'}, SECRET_KEY)


// jwt.sign({ foo: 'bar' }, privateKey, { algorithm: 'RS256' }, function(err, token) {
//   console.log(token);
// });

module.exports = app;
