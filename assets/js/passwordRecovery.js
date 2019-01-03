
password_ok.addEventListener('click', function(){
if (password === passwordR) {
    fetch(location.origin+'/remember/password', 
    {method: 'PUT', headers:{'Accept':'application/json', 'Content-Type': 'application/json'}, 
        body: JSON.stringify({password: document.getElementById('password').value, 
        email: document.getElementById('emailR').innerText})})
    .then(res =>  res.json())
    .then(res => {
        if (res.error === false) {
            location.href = '/';
        } else {
            alert(res.message)
        }
    })
}
}, false)