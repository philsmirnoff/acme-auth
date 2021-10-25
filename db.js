const Sequelize = require('sequelize');
const { STRING } = Sequelize;
const config = {
  logging: false
};

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');


if(process.env.LOGGING){
  delete config.logging;
}
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_db', config);

const User = conn.define('user', {
  username: STRING,
  password: STRING
});

// User.beforeCreate = (user) => {
//   const saltRounds = 10;
//   bcrypt.genSalt(saltRounds, function(err, salt) {
//     bcrypt.hash(user.password, salt, function(err, hash) {
//         // Store hash in your password DB.
//         console.log(hash);
//     });
// });
// }

User.addHook('beforeCreate', async(user)=> {
  if(user.changed('password')){
    user.password = await bcrypt.hash(user.password, 3);
  }
});



User.byToken = async(token)=> {
  try {
    const verify = jwt.verify(token, process.env.JWT)
    if(verify){
      console.log(verify)
      const user = await User.findByPk(verify.userId);
      return user;
    }
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  }
  catch(ex){
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  }
};

User.authenticate = async({ username, password })=> {
  const findingUser = await User.findOne({
    where: {
      username
    }

  const correct = await bcrypt.compare(password, findingUser.password);

  if(correct === true) {
    const user = await User.findOne({
      where: {
        username,
        findingUser.password
      }
    });
    if(user){
      return user.id;
    }
  }
})

  const error = Error('bad credentials');
  error.status = 401;
  throw error;
};



const syncAndSeed = async()=> {
  await conn.sync({ force: true });
  const credentials = [
    { username: 'lucy', password: 'lucy_pw'},
    { username: 'moe', password: 'moe_pw'},
    { username: 'larry', password: 'larry_pw'}
  ];
  const [lucy, moe, larry] = await Promise.all(
    credentials.map( credential => User.create(credential))
  );
  return {
    users: {
      lucy,
      moe,
      larry
    }
  };
};

module.exports = {
  syncAndSeed,
  models: {
    User
  }
};
