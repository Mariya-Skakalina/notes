'use strict'
const container = document.getElementById('container');
import {CreateDomElement, DeleteElement} from './component/domelements.js';
import {Main} from './lk.js';
// nameTag, idTag, classTag, attributeTag[[],[]], parentElement, text
function loginUser (){
    new DeleteElement('container');
    new CreateDomElement({nameTag:'h2', idTag: 'login-title', parentElement:'container', text:'Вход'})
    new CreateDomElement({nameTag: 'div',  idTag:'form-login', classTag: 'login-user', parentElement: 'container'});
    const login_email = new CreateDomElement({nameTag: 'input', idTag:'login-email', attributeTag:[['type', 'email'], ['placeholder', 'Ваш email']], parentElement: 'form-login'});
    new CreateDomElement({nameTag:'br', parentElement: 'form-login'});
    const login_password =  new CreateDomElement({nameTag: 'input', idTag:'login-password', attributeTag:[['type', 'password'], ['placeholder', 'Ваш пароль']], parentElement: 'form-login'});
    new CreateDomElement({nameTag:'br', parentElement: 'form-login'});
    const login_submit = new CreateDomElement({nameTag: 'button', idTag:'login-submit', attributeTag:[['type', 'submit']], parentElement: 'form-login', text: 'Войти'});
    login_submit.addEventListener('click', () => {
        fetch(location.origin+'/login', {method:'POST', headers:{'Accept':'application/json', 'Content-Type': 'application/json'}, body: JSON.stringify({email: login_email.value, password: login_password.value})})
        .then((res) =>  res.json())
        .then( (res)=>{
            if (res.auth){
                location.href = '/'
            } else {
                new CreateDomElement({nameTag:'p',idTag:'errorLogin', parentElement:'container', text:res.message})
            }
        }).catch(function (err) {
            console.log(err);
        });
    });
}
const register = document.getElementById('register')
if(register){
    register.addEventListener('click', () => {
        let container = new DeleteElement('container');
        new CreateDomElement({nameTag:'h2', idTag: 'register-title', parentElement:'container', text:'Зарегистрироваться'})
        new CreateDomElement({nameTag: 'div',  idTag:'form-register', classTag: 'Register-user', parentElement: 'container'});
        const register_nickname = new CreateDomElement({nameTag: 'input', idTag:'register-nickname', attributeTag:[['type', 'text'], ['placeholder', 'Ваш nickname']], parentElement: 'form-register'});
        new CreateDomElement({nameTag:'br', parentElement: 'form-register'});
        const register_email = new CreateDomElement({nameTag: 'input', idTag:'register-email', attributeTag:[['type', 'email'], ['placeholder', 'Ваш email']], parentElement: 'form-register'});
        new CreateDomElement({nameTag:'br', parentElement: 'form-register'});
        const register_password =  new CreateDomElement({nameTag: 'input', idTag:'register-password', attributeTag:[['type', 'password'], ['placeholder', 'Ваш пароль']], parentElement: 'form-register'});
        new CreateDomElement({nameTag:'br', parentElement: 'form-register'});
        const register_submit = new CreateDomElement({nameTag: 'button', idTag:'register-submit', attributeTag:[['type', 'submit']], parentElement: 'form-register', text: 'Зарегистрироваться'});
        register_submit.addEventListener('click', () => {
            fetch(location.origin+'/register', {method:'POST',headers:{'Accept':'application/json', 'Content-Type': 'application/json'}, body: JSON.stringify({nickname:register_nickname.value, email: register_email.value, password: register_password.value})})
            .then((res) =>  res.json())
            .then( (res)=>{
                if(res.error){
                    new CreateDomElement({nameTag:'p', classTag: 'error-register', parentElement:'container', text:res.message})
                } else {
                    loginUser()
                }
            }).catch(function (err) {
                console.log(err)
            })
        })
    })

    const login = document.getElementById('login')
    login.addEventListener('click', () => {
        loginUser()
    });
};

fetch(location.origin+'/auth', {method:'POST', headers:{'Accept':'application/json', 'Content-Type': 'application/json'}})
.then((res) =>  res.json())
.then( (res)=>{
    if (res.auth){
        new Main();
    }
}).catch(function (err) {
    console.log(err);
});