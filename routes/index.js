const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const key = require('../config/keys');
const crypto = require('crypto')
const {transporter} = require('../config/email')


// Мидлвар авторизация
router.use(async (req,res,next)=>{
  await jwt.verify(req.cookies.KEY, key.jwt, async function(err, decoded) {
    if (decoded == undefined){
      console.log(req.originalUrl)
      if(req.originalUrl !== '/' && req.originalUrl !== '/register' && req.originalUrl !== '/login'){
          res.redirect('/');
          // next()
      } else {
        next()
      }
    } else{
      let user = await User.findOne({_id:decoded.userId})
      if (user){
        req.user = user;
        next()
      } else {
        if(req.originalUrl !== '/' && req.originalUrl !== '/register' && req.originalUrl !== '/login'){
          res.redirect('/');
          // next()
        } else {
          next()
        }
      }
    }
  });
})

// Основная страница
router.get('/', function(req, res) {
  const users = req.user;
  if (users !== undefined){
    res.render('index', { 
      auth:true,
      users
    });
  } else{
    res.render('index', {
      auth: false
    })
  }
});

// Регистрационный код
router.get('/user/activate/:a_code', async function(req,res){
  if (req.params.a_code){
    User.findOne({a_code:req.params.a_code}).then((result)=>{
      if (result !== undefined && result !== null){
        result.active = true;
        result.a_code = '';
        result.save()
        res.json({res: true})
      } else {
        res.json({res: false})
      }
    })
  } else {
    res.json({res: false})
  }
})


// api для регистрация
router.post('/register', async function createNote(req, res){
  const candidate = await User.findOne({email: req.body.email});
  if(candidate){
    res.json({"message": "Такой email уже занят. Попробуйте другой", error: true})
  }else{
    const solt = bcrypt.genSaltSync(10)
    const password = req.body.password
    const user = new User({
      nickname: req.body.nickname,
      email: req.body.email,
      password: bcrypt.hashSync(password, solt),
      a_code: crypto.randomBytes(20).toString('hex')
    })
    try{
      await user.save()
      let mailOptions = {
        from: '"Notes" <mashka@mashka.com>', // sender address
        to: user.email, // list of receivers
        subject: 'Регистрация', // Subject line
        text: 'Регистрация ...', // plain text body
        html: `<p>Активация вашего аккаунта тыкните на <a href="http://${req.hostname}/user/activate/${user.a_code}">ссылку</> <p/>` // html body
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
          console.log('Message sent: %s', info.messageId);
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      });
      res.json(user)
    }catch(error){
      console.log(error)
    }
  }
});

// Код для восстановление пароля
router.get('/user/remember/:a_code', async (req, res) => {
  if (req.params.a_code){
    User.findOne({a_code:req.params.a_code}).then((result)=>{
      if (result !== undefined && result !== null){
        result.password = req.body.password;
        result.a_code = '';
        result.save()
        res.json({res: true})
      } else {
        res.json({res: false})
        }
    })
  }
})

// Восстановление пароля
router.get('/login/remember', (res, req) => {
    let mailOptions = {
      from: '"Fred Foo 👻" <mashka@mashka.com>', // sender address
      to: user.email, // list of receivers
      subject: 'Восстановление пароля', // Subject line
      text: 'Восстановление пароля', // plain text body
      html: `<p>Активация вашего аккаунта тыкните на <a href="http://localhost:3000/user/remember/${user.a_code}">ссылку</> <p/>` // html body
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
})

router.post('/auth', (req, res) =>{
  res.json({"auth": true})
})

// Вход
router.post('/login', async function createNote(req, res){
  const candidate = await User.findOne({email: req.body.email})
  if(candidate){
    const resultPassword = bcrypt.compareSync(req.body.password, candidate.password)
    if(resultPassword && candidate.active == true){
      const token = jwt.sign({
        email: candidate.email,
        userId:candidate._id
      }, key.jwt)
      res.cookie('KEY',token).json({"message": "Авторизация успешно пройдена", "auth": true})
    }else{  
      res.json({"message": "Данные не верны"})
    }
  }else{
    res.json({"message":"Проверьте корректность заполненных полей или зарегистрируйтесь"})
  }
});

// Выход 
router.post('/logout', function createNote(req, res){
  res.clearCookie('KEY');
  res.json({"message": "Вы вышли"});
});

// создание заметки
router.post('/create', function createNote(req, res){
  try{
    const note = new Note({
      title: req.body.title,
      content: req.body.content,
      user:req.user.id
    });
    note.save()
    res.json(note);
  }catch(error){
    console.log(error)
  }
});

// редактирование заметки
router.put('/edit/:id', function editNote(req, res){
  Note.findOne({_id:req.params.id}).populate({
    path: 'users',
    match: {
      _id: req.user.id
    }
  }).then((result)=>{ //.update({title:req.param('title'),content:req.param('content')})
    console.log(req.param('title'))
    result.title = req.param('title');
    result.content = req.param('content');
    result.save();
    res.json(result)
  })
});

// Удаление заметки
router.delete('/delete/:id', async function deleteNote(req, res){
  try {
    const note = await Note.findOne({_id:req.params.id}).populate({
      path: 'users',
      match: {
        _id: req.user.id
      }
    })
    note.remove()
    // await Note.remove({
    //     user: req.user._id,
    //     _id: req.params.id
    // });
    res.json({
        message: 'Позиция была удалена'
    });
  } catch (e) {
      console.log(e);
  }
});

router.get('/notes', (req, res) => {
  const user = req.user;
  Note.find().populate({
    path: 'users',
    match: {
      _id: req.user.id
    }}).sort('-date')
    .then(result => res.json(result))
})

module.exports = router;