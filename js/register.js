const resgisterBtn = document.querySelector('.resgister_btn');

resgisterBtn.addEventListener('click', () => {
    const email = document.querySelector('.email_inp').value;
    const password = document.querySelector('.password_inp').value;
    const name = document.querySelector('.name_inp').value;

    fetch('http://localhost:3000/register', {
        method: 'post',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
            name: name.toLowerCase(),
            email: email.toLowerCase(),
            password: password
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.id) {
                location.replace('/dp')
            } else {
                alert('fill the details correctly');
            }
        })
        .catch(err => console.log(err));
})