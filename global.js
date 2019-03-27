let git_username =  'jorubyp',
    git_repo =      'dashboard-plugins',
    git_apiURL =    'https://api.github.com/repos/' + git_username + '/' + git_repo + '/contents/',
    git_envURL =    'https://' + git_username + '.github.io/' + git_repo + '/',
    jQueryURL =     git_envURL + '/require/jquery.js',
    timeStamp =     ()=>{ return new Date().getTime() },
    locale =        ()=>{ return $('html').attr('lang').split('-')[0] },
    context =       ()=>{ let context; $.each($('html').attr('class').split(" "), (i, c) =>{ if (c.match(/-context/)) { context = c } }); return context };

function callBackgroundFunction(message, callback) {
    let uniqueName = {name: (timeStamp() + (Math.random() * (+1000 - +1) + +1)).toString()},
        port = chrome.runtime.connect(uniqueName);
    postMessage(port, message, callback);
};

function callContentFunction(message, callback) {
    let uniqueName = ()=>{ return (timeStamp() + (Math.random() * (+1000 - +1) + +1)).toString() },
        match = '*://*.tumblr.com/*',
        currentTab;
    chrome.tabs.query({url: match, currentWindow: true, active: true}, function (tabs) {
        currentTab = tabs[0].id;
        let port = chrome.tabs.connect(currentTab, {name: uniqueName()});
        postMessage(port, message, callback);
    });
    chrome.tabs.query({url: match}, (queryTabs) => {
        asyncForEach(queryTabs, async(tab) => {
            if (tab.id !== currentTab) {
                let port = chrome.tabs.connect(tab.id, {name: uniqueName()});
                postMessage(port, message, callback);
            };
        });
    });
};

async function postMessage(port, message, callback) {
    let uniqueName = { name: (timeStamp() + (Math.random() * (+1000 - +1) + +1)).toString() };
    port.postMessage(message);
    if (typeof callback == 'function') {
        port.onMessage.addListener( async(response) => {
            await callback(response)
        });
    }
};

chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(message,event) {
        asyncForEach(Object.keys(message), async(id) => {
            if (typeof window[id] == 'function') {
                window[id](message[id]).then(result => {
                    message = {data: result, sender: ('tab' in event.sender ? event.sender.tab.id : event.sender)};
                    port.postMessage(message)
                });
            }
        });
    });
});

async function asyncForEach(array, callback) {
    for (let i = 0; i < array.length; i++) {
        await callback(array[i], i, array);
    };
};