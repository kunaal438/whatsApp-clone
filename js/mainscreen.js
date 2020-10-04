const greeting = document.querySelector('.greeting');

let current_tabs = [];

window.onload = () => {
    fetch('http://localhost:3000/user-profile', {
        method: 'post'
    })
        .then(res => res.json())
        .then(data => {
            greeting.innerHTML = `${data.name}`;
        })
        .catch(err => console.log(err));
}

const CreatingUserProfileTabs = (data) => {

    const chatProfileBox = document.querySelector('#searchTab');
    const recieverProfile = document.createElement('div');
    const recieverProfileImgBox = document.createElement('div');
    const recieverProfileImg = document.createElement('img');
    const recieverProfileName = document.createElement('h2');

    chatProfileBox.appendChild(recieverProfile);
    recieverProfile.appendChild(recieverProfileImgBox);
    recieverProfileImgBox.appendChild(recieverProfileImg);
    recieverProfileImg.setAttribute('src', data.dp);
    recieverProfile.appendChild(recieverProfileName);

    recieverProfile.className = 'recieverProfile';
    recieverProfileImgBox.className = 'recieverProfile-img';
    recieverProfileName.className = 'recieverProfile-name';

    if (data === 'none') {
        recieverProfileImgBox.style.display = 'none';
        recieverProfileName.appendChild(document.createTextNode('user not found'));
        recieverProfileName.style.width = 100 + '%';
    } else {
        recieverProfileName.appendChild(document.createTextNode(data.name));
    }
}

const tabsIdentity = () => {
    const all_tabs = [...document.querySelectorAll('#searchTab .recieverProfile')];
    all_tabs.map((item,i) => {
        return item.addEventListener('click', () => {
            // console.log(current_tabs[i]);
            fetch('http://localhost:3000/chat-room', {
                method: 'post',
                headers: new Headers({'Content-Type': 'application/json'}),
                body: JSON.stringify({
                    id: current_tabs[i].id,
                    name: current_tabs[i].name,
                    email: current_tabs[i].email,
                    dp: current_tabs[i].dp
                })
            })
            .then(res => res.json())
            .then(data => {
                if(data === 'success'){
                    loadingChatUser();
                }
            })
            .catch(err => console.log(err));
        })
    })
}

const searchBox = document.querySelector('.search-box');

searchBox.addEventListener('keyup', () => {
    current_tabs = [];
    const searchBox = document.querySelector('.search-box');
    const startingTabs = document.querySelector('#startingTab');
    const searchTab = document.querySelector('#searchTab');

    if (searchBox.value === '') {
        startingTabs.style.display = 'block';
        searchTab.style.display = 'none';
    } else {
        fetch('http://localhost:3000/filter', {
            method: 'post',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                value: searchBox.value
            })
        })
            .then(res => res.json())
            .then(data => {
                // console.log(data);
                const tabs = [...document.querySelectorAll('#searchTab .recieverProfile')];

                tabs.forEach(item => {
                    item.remove();
                })

                if (!data.length) {
                    CreatingUserProfileTabs('none');
                } else {
                    for (let i = 0; i < data.length; i++) {
                        current_tabs.push(data[i]);
                        CreatingUserProfileTabs(data[i]);
                    }
                    tabsIdentity();

                    startingTabs.style.display = 'none';
                    searchTab.style.display = 'block';
                }
                // console.log(data);
            })
            .catch(err => console.log(err));
    }
})