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
        extensionTabs = [];
    chrome.tabs.query({url: '*://*.tumblr.com/*'}, async(queryTabs) => {
        $.each(Object.keys(queryTabs), (i, tab) => {
            if (!queryTabs[tab].currentWindow && !queryTabs[tab].active) {
                extensionTabs.push(queryTabs[tab].id);
            } else {
                extensionTabs.unshift(queryTabs[tab].id);
            }
        })
        asyncForEach(extensionTabs, async(tab) => {
            let port = chrome.tabs.connect(tab, {name: uniqueName()});
            postMessage(port, message, callback);
        })
    })
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
                console.log(port.name)
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