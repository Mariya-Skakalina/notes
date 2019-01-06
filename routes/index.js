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
      if(req.originalUrl !== '/' && req.originalUrl !== '/register' && 
          req.originalUrl !== '/login' && req.originalUrl.indexOf('/user/activate/') === -1 
          && req.originalUrl.indexOf('/remember/') === -1 && req.originalUrl !== '/login/remember'
          && req.originalUrl.indexOf('/profile/edit/email/') === -1){
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
        if(req.originalUrl !== '/' && req.originalUrl !== '/register' && req.originalUrl !== '/login' && req.originalUrl.indexOf('/profile/edit/email/') === -1){
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
      remember: false,
      users
    });
  } else{
    res.render('index', {
      auth: false,
      remember: false,
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
        res.send('Ваша почта подтверждена')
      } else {
        res.redirect('/');
      }
    })
  } else {
     res.redirect('/');
  }
})


// api для регистрация
router.post('/register', async function createNote(req, res){
  let email = req.body.email
  let password = req.body.password
  let nickname = req.body.nickname
  if(email && email !== undefined && password && password !== undefined && nickname && nickname !== undefined && password>4){
    const candidate = await User.findOne({email: req.body.email});
    if(candidate){
      res.json({"message": "Такой email уже занят. Попробуйте другой", error: true})
    }else{
        let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if(reg.test(email) == false){
          res.json({message: 'Введите корректный email', error: true});
        }
      const solt = bcrypt.genSaltSync(10)
      const user = new User({
        nickname: req.body.nickname,
        email: req.body.email,
        password: bcrypt.hashSync(password, solt),
        a_code: crypto.randomBytes(20).toString('hex')
      })
      try{
        await user.save()
        let mailOptions = {
          from: '"Notes" <admin@mynotes.su>', // sender address
          to: user.email, // list of receivers
          subject: 'Регистрация', // Subject line
          text: 'Регистрация ...', // plain text body
          html: `<p>Активация вашего аккаунта тыкните на <a href="http://mynotes.su/user/activate/${user.a_code}">ссылку</> <p/>` // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
        });
        res.json(user)
      }catch(error){
        console.log(error)
      }
    }
  }else{
     res.json({message: 'Заполните все поля корректно', error: true});
  }
});

// Страница для восстановление пароля
router.get('/user/remember/:a_code', async (req, res) => {
  if (req.params.a_code){
    User.findOne({a_code:req.params.a_code}).then((result)=>{
      if (result !== undefined && result !== null){
        res.render('index', {
          auth: false,
          remember: true,
          user: result.email
        })
      } else {
        res.redirect('/')
        }
    })
  }
})

// Восстановление пароля
router.post('/login/remember', async (req,res) => {
    if(req.body.email){
      const user = await User.findOne({email: req.body.email});
      if(user){
        user.a_code = crypto.randomBytes(20).toString('hex');
        user.save();
        let mailOptions = {
          from: '"Notes remember" <admin@notes.su>', // sender address
          to: user.email, // list of receivers
          subject: 'Восстановление пароля', // Subject line
          text: 'Восстановление пароля', // plain text body
          html: `<p>Восстановление пароля <a href="http://mynotes.su/user/remember/${user.a_code}">ссылку</> <p/>` // html body
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
        });

      }
      
    }
    
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

router.put('/remember/password', async function(req, res){
  const user = await User.findOne({email: req.param('email')})
  if(user && req.param('password').length >4){
    user.password =bcrypt.hashSync(req.param('password'), bcrypt.genSaltSync(10));
    user.save()
    res.json({message: "Пароль обновлен"});
  }else{
    res.json({error: true, message: 'Некорректные данные'})
  }
})

//Подтверждение новой почты
router.get('/profile/edit/email/:email/:activation_code', async (req,res)=>{
  const user = await User.findOne({a_code: req.params.activation_code});
  if (user){
    user.email = req.params.email;
    user.a_code = '';
    user.save()
    res.redirect('/');
  } else {
     res.redirect('/');
  }

})


// Изменение почты
router.post('/edit-profile', (req, res) => {
  let nickname =req.body.nickname
  let email =req.body.email
  let password =req.body.password
  if(req.user.nickname !== nickname){
    if(nickname.length > 3){
      req.user.nickname = nickname
    }else{
      res.json({message: 'Слишком короткий никнейм'})
    }
    
  }
  if(req.user.email !== email){
    if( email.length > 8){
      let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
      if(reg.test(email) == false){
        res.json({message: 'Введите корректный email', error: true});
      }
      let a_code= crypto.randomBytes(20).toString('hex')
      req.user.a_code=a_code;
      // req.user.email = email;
      let mailOptions = {
        from: '"Notes remember" <admin@notes.su>', // sender address
        to: email, // list of receivers
        subject: 'Изменение почты', // Subject line
        text: 'Изменение почты', // plain text body
        html: `<p>Изменение почты <a href="http://mynotes.su/profile/edit/email/${email}/${a_code}">ссылку</> <p/>` // html body
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
      });
    }else{
      res.json({message:'Слишком короткий email'})
    }
    
  }
  if(req.user.password !== password && password.length !== 0){
    if(password.length > 5){
      const solt = bcrypt.genSaltSync(10)
      req.user.password = bcrypt.hashSync(password, solt)
    }else{
       res.json({message:'Пароль должен быть не менее 5 символов'});
    }
    
  }
  req.user.save()
  res.json({message: 'Изменения внесены'})
});

module.exports = router;