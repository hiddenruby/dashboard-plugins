let git_username =  'jorubyp',
    git_repo =      'dashboard-plugins',
    git_apiURL =    'https://api.github.com/repos/' + git_username + '/' + git_repo + '/contents/',
    git_envURL =    'https://' + git_username + '.github.io/' + git_repo + '/',
    jQueryURL =     git_envURL + '/require/jquery.js',
    timeStamp =     ()=>{ return new Date().getTime() },
    locale =        ()=>{ return $('html').attr('lang').split('-')[0] },
    context =       ()=>{ let context; $.each($('html').attr('class').split(" "), (i, c) =>{ if (c.match(/-context/)) { context = c } }); return context };

postMessage('runtime', {getCurrentTab: ''})

async function postMessage(recipient, message, callback) {
    let uniqueName = { name: (timeStamp() + (Math.random() * (+1000 - +1) + +1)).toString() },
        attributes = { tabs: [ window.currentTab, uniqueName ], runtime: [ uniqueName ] },
        port = chrome[recipient].connect(...attributes[recipient]);
    port.postMessage(message);
    if (typeof callback == 'function') {
        port.onMessage.addListener( async(response) => {
            await callback(response)
        });
    }
};

chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(message,event) {
        $.each(Object.keys(message), (i, taskId) => {
            console.log(taskId,'function:',typeof window[taskId]);
            if (typeof window[taskId] == 'function') {
                window[taskId](message[taskId]).then(result => port.postMessage({data: result, sender: event.sender.tab.id}));
            }
        });
    });
});

async function getCurrentTab() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
            window.currentTab = tabs[0].id;
            resolve(tabs[0]);
        })
    })
}

async function asyncForEach(array, callback) {
    for (let i = 0; i < array.length; i++) {
        await callback(array[i], i, array);
    };
};