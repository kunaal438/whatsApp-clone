const imgField = document.querySelector('.porfilePicInput');
const form = document.querySelector('.form');
const imgTag =document.querySelector('.profile-img');

const setBtn = document.querySelector('.set_btn');
const skipBtn = document.querySelector('.skip_btn');

form.addEventListener('submit', (e) => {
    e.preventDefault();
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
                location.replace('/chating');
            } else{
                alert('fail')
            }
        })
        .catch(err => console.log(err));
    } else{
        alert('fill the input first');
    }
})

imgField.addEventListener('change', () => {
    const file = imgField.files[0];

    if(file){
        const reader = new FileReader();

        reader.addEventListener('load', () => {
            imgTag.setAttribute('src', reader.result);
        })
        
        reader.readAsDataURL(file);
    } else{
        imgTag.setAttribute('src', '');
    }

})

skipBtn.addEventListener('click', (e) => {
    e.preventDefault();

    location.replace('/chating');
})