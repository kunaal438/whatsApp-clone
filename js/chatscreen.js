
const socket = io.connect('http://localhost:3000/');
const overlay = document.querySelector('.overlay');
const userDP = document.querySelector('#userDP');
const leftpanel = document.querySelector('.left-panel');
const rightpanel = document.querySelector('.right-panel');
const backBtn = document.querySelector('.back-btn');

// const navbarIcon = document.querySelector('#navbar-icon');
let chatRoom;
// setting reciever information

let textBox = document.querySelector('.text-field');
const recieverImg = document.querySelector('#recieverDP');
const recieverName = document.querySelector('.sender-name');

const greeting = document.querySelector('.greeting');

let current_tabs = [];
let current_chats = [];

window.onload = () => {
    leftpanel.style.display = null;
    fetch('http://localhost:3000/user-profile', {
        method: 'post'
    })
        .then(res => res.json())
        .then(data => {
            userDP.setAttribute('src', data.dp);
            greeting.innerHTML = `${data.name}`;
            chatRoom = {
                user: data.email
            }
        })
        .catch(err => console.log(err));


    setTimeout(() => {
        socket.emit('user-join', chatRoom.user);
    }, 500);
}

backBtn.addEventListener('click', () => {
    leftpanel.style.display = null;
})

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
    all_tabs.map((item, i) => {
        return item.addEventListener('click', () => {
            // console.log(current_tabs[i]);
            fetch('http://localhost:3000/chat-room', {
                method: 'post',
                headers: new Headers({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({
                    id: current_tabs[i].id,
                    name: current_tabs[i].name,
                    email: current_tabs[i].email,
                    dp: current_tabs[i].dp
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data === 'success') {
                        const prev_chat = [...document.querySelectorAll('.message')];
                        prev_chat.forEach(item => {
                            item.remove()
                        })
                        loadingChatUser();
                        if (innerWidth < 996) {
                            leftpanel.style.display = 'none';
                        }
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
            .then((data) => {
                // console.log(data);
                const tabs = [...document.querySelectorAll('#searchTab .recieverProfile')];

                tabs.forEach(item => {
                    item.remove();
                })

                if (!data[0].length || data[0].length === 1) {
                    CreatingUserProfileTabs('none');
                } else {
                    for (let i = 0; i < data[0].length; i++) {
                        if (data[0][i].email === data[1]) {
                            
                        } else {
                            current_tabs.push(data[0][i]);
                            CreatingUserProfileTabs(data[0][i]);
                        }
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

const loadingChatUser = () => {
    const parentDiv = document.querySelector('.container');
    textBox.textContent = "";
    overlay.style.display = 'none';
    fetch('/reciever-profile', {
        method: 'post'
    })
        .then(res => res.json())
        .then(data => {
            recieverImg.setAttribute('src', data.dp);
            recieverName.innerHTML = data.name;
            chatRoom = {
                user: data.sender,
                username: data.sender_name,
                reciever: data.email,
                reciever_name: data.name
            }
        })
        .catch(err => console.log(err));
    fetch('/getting-chats', {
        method: 'post'
    })
        .then(res => res.json())
        .then(data => {
            for (let i = 0; i < data.length; i++) {
                if (data[i].sender === chatRoom.user) {
                    sendingMsg(data[i].sent_time, data[i].msg);
                } else {
                    recievingMsg(data[i].sent_time, data[i].msg);
                }
                parentDiv.scrollTop = parentDiv.scrollHeight;
            }

        })
}

// sending msg

const sendingMsg = (t, msg) => {
    const parentDiv = document.querySelector('.container');
    const senderBox = document.createElement('div');
    const sentMsg = document.createElement('p');
    const senderTimingSpan = document.createElement('span');
    const senderTiming = document.createElement('p');
    parentDiv.appendChild(senderBox);
    senderBox.appendChild(sentMsg);
    sentMsg.appendChild(document.createTextNode(msg));
    sentMsg.appendChild(senderTimingSpan);
    senderTimingSpan.appendChild(senderTiming);
    senderTiming.appendChild(document.createTextNode(timeConversion(t)));

    senderBox.className = 'box-sender message';


    textBox.textContent = '';
}

const recievingMsg = (t, msg) => {
    const parentDiv = document.querySelector('.container');
    const recieverBox = document.createElement('div');
    const recieveMsg = document.createElement('p');
    const recieverTimingSpan = document.createElement('span');
    const recieverTiming = document.createElement('p');
    parentDiv.appendChild(recieverBox);
    recieverBox.appendChild(recieveMsg);
    recieveMsg.appendChild(document.createTextNode(msg));
    recieveMsg.appendChild(recieverTimingSpan);
    recieverTimingSpan.appendChild(recieverTiming);
    recieverTiming.appendChild(document.createTextNode(timeConversion(t)));

    recieverBox.className = 'box-reciever message';

    textBox.textContent = '';
}

const timeConversion = (t) => {
    let timeArray = t.split('');
    let actuall_time = [];
    let daytime = 'am';
    for (let i = 0; i < 5; i++) {
        actuall_time.push(timeArray[i]);
    }
    let hrs = Number(`${actuall_time[0]}${actuall_time[1]}`);
    let min = Number(`${actuall_time[3]}${actuall_time[4]}`);
    if (hrs > 12) {
        hrs = hrs - 12;
        daytime = 'pm';
    }
    if (hrs < 10) {
        hrs = `0${hrs}`;
    }
    if (min < 10) {
        min = `0${min}`;
    }
    let time = `${hrs}:${min} ${daytime}`;
    return time;
}

const insertingChat = () => {
    fetch('/insert-chat', {
        method: 'post',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
            msg: textBox.textContent
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data === 'no length') {
                console.log('err');
            } else {
                sendingMsg(data.sent_time, textBox.textContent);
            }
        })
        .catch(err => console.log(err));
}

const ChatBox = document.querySelector('#chatInput');

ChatBox.addEventListener('keypress', (e) => {
    if (e.keyCode == 10 || e.keyCode == 13) {
        e.preventDefault();
        if (textBox.textContent !== "") {
            insertingChat();
            socket.emit('chat', {
                sender: chatRoom.user,
                sender_name: chatRoom.username,
                reciever_name: chatRoom.reciever_name,
                reciever: chatRoom.reciever,
                msg: textBox.textContent
            })
        }
        // return false;
    }
})

socket.on('new-msg', (data) => {
    if (chatRoom.reciever === data.sender) {
        let time = `${data.hour}:${data.min}`
        recievingMsg(time, data.msg);
        console.log(data);

    } else {
        alert('you get msg from ' + data.sender_name);
    }
})

window.onresize = () => {
    if (innerWidth < 996) {
        leftpanel.style.display = 'none';
    } else {
        leftpanel.style.display = null;
    }
}