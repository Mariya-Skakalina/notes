const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const key = require('../config/keys')

router.use(async (req,res,next)=>{
  await jwt.verify(req.cookies.KEY, key.jwt, async function(err, decoded) {
    if (decoded == undefined){
      res.status(403).json({'err':'not found'})
    } else{
      let user = await User.findOne({_id:decoded.userId})
      if (user){
        req.user = user;
        next()
      } else {
        res.status(403).json({'err':'not found'})
      }
    }
  });
})
/* GET home page. */
router.get('/', function(req, res) {
  const key = req.cookies.KEY
  res.render('index', { 
    user:{
      key
    }
   });
});

router.post('/register', async function createNote(req, res){
  const candidate = await User.findOne({email: req.body.email});
  if(candidate){
    res.json({"message": "Такой email уже занят. Попробуйте другой"})
  }else{
    const solt = bcrypt.genSaltSync(10)
    const password = req.body.password
    const user = new User({
      nickname: req.body.nickname,
      email: req.body.email,
      password: bcrypt.hashSync(password, solt)
    })
    try{
      await user.save()
      res.json(user)
    }catch(error){
      console.log(error)
    }
  }
});

router.post('/login', async function createNote(req, res){
  const candidate = await User.findOne({email: req.body.email})
  if(candidate){
    const resultPassword = bcrypt.compareSync(req.body.password, candidate.password)
    if(resultPassword){
      const token = jwt.sign({
        email: candidate.email,
        userId:candidate._id
      }, key.jwt)
      res.cookie('KEY',token).json({"message": "Авторизация успешно пройдена"})
    }else{  
      res.json({"message": "Данные не верны"})
    }
  }else{
    res.json({"message":"Проверьте корректность заполненных полей или зарегистрируйтесь"})
  }
});

router.post('/logout', function createNote(req, res){
 
});

router.post('/create', function createNote(req, res){
  try{
    const note = new Note({
      title: req.body.title,
      content: req.body.content,
      user:req.user.id
    }).save();
    res.json(note);
  }catch(error){
    console.log(error)
  }
});

router.put('/edit/:id', function editNote(req, res){
  // console.log(req.param('email'))
  // console.log(req.user)
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

router.delete('/delete/:id', async function deleteNote(req, res){
  try {
    await Note.remove({
        user: req.user._id,
        _id: req.params.id
    });
    res.status(200).json({
        message: 'Позиция была удалена'
    });
  } catch (e) {
      console.log(e);
  }
});

module.exports = router;
