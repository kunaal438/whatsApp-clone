const userImg = document.querySelector('.img-field');
const nameField = document.querySelector('.name-field');
const emailField = document.querySelector('.email-field');
const backBtn = document.querySelector('.back-btn');
const imgField = document.querySelector('#porfilePicInput');
// const userImg = document.querySelector('.img-field');

// variables for updating.....
const nameInp = document.querySelector('.name_inp');
const editBtn = document.querySelector('.fa-pencil-alt');
const cancelBtn = document.querySelector('.fa-times');
const updateBtn  = document.querySelector('.update_btn');

window.onload = () => {
    fetch('/user-profile', {
        method: 'post'
    })
    .then(res => res.json())
    .then(data =>{
        nameField.innerHTML = data.name;
        emailField.innerHTML = data.email;
        userImg.setAttribute('src', data.dp)
    })  
    .catch(err => console.log(err));
}

backBtn.addEventListener('click', () => {
    window.history.back();
})

// updating function

editBtn.addEventListener('click', () =>{
    nameField.style.display = 'none';
    nameInp.style.display = 'block';
    updateBtn.style.display = 'block';
    cancelBtn.style.display = 'block';
    editBtn.style.display = 'none';
})

function normalizing() {
    nameField.style.display = null;
    nameInp.style.display = null;
    updateBtn.style.display = null;
    cancelBtn.style.display = null;
    editBtn.style.display = null;
    nameInp.value = "";
}

cancelBtn.addEventListener('click', () => {
    normalizing();
})

updateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const username = document.querySelector('.name_inp');
    if(imgField.files.length > 0){
        const formdata = new FormData();
        const file = imgField.files[0];

        formdata.append('photo', file);
        
        if(imgField.files[0]){
            fetch('/upload', {
                method: 'post',
                body: formdata
            })
            .then(res => res.json())
            .then(data => {
                if(data.success === true){
                    alert('update successfully');
                    imgField.value = "";
                } else{
                    alert('fail')
                }
            })
            .catch(err => console.log(err));
        } else{
            alert('fill the input first');
        }
    } else if(username.value !== ""){
        fetch('/update-profile', {
            method: 'post',
            headers: new Headers({'Content-Type': 'application/json'}),
            body: JSON.stringify({
                name: username.value.toLowerCase()
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.id){
                alert('update successfully!!!');
                nameField.innerHTML = data.name;
                normalizing();
            } else if(data === 'err in updating'){
                alert(data)
            } else{
                alert('fill the input');
            }
        })
    } else{
        alert('fill the inputs');
    }
})

imgField.addEventListener('click', () => {
    
    updateBtn.style.display = 'block';
})

imgField.addEventListener('change', () => {
    const file = imgField.files[0];

    if(file){
        const reader = new FileReader();

        reader.addEventListener('load', () => {
            userImg.setAttribute('src', reader.result);
        })
        
        reader.readAsDataURL(file);
    } else{
        userImg.setAttribute('src', '');
    }

})