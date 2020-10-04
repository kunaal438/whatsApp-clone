const signUpBtn = document.querySelector('.sign_up_btn');


signUpBtn.addEventListener('click', () => {
    const email = document.querySelector('.email_inp').value;
    const password = document.querySelector('.password_inp').value;

    fetch('http://localhost:3000/signin', {
        method: 'post',
        headers: new Headers({'Content-Type': 'application/json'}),
        body: JSON.stringify({
            email: email.toLowerCase(),
            password: password
        })
    })
    .then(res => res.json())
    .then(data => {
        if(data.id){
            location.replace('/chating');
        } else if (data === 'wrong password'){
            alert("incorrect password");
        } else{
            alert('the email address and password not exist');
        }
    })
    .catch(err => console.log(err));
})