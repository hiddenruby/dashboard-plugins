let git_username =  'jorubyp',
    git_repo =      'dashboard-plugins',
    git_apiURL =    'https://api.github.com/repos/' + git_username + '/' + git_repo + '/contents/',
    git_envURL =    'https://' + git_username + '.github.io/' + git_repo + '/',
    jQueryURL =     git_envURL + '/require/jquery.js',
    timeStamp =     ()=>{ return new Date().getTime() },
    locale =        ()=>{ return $('html').attr('lang').split('-')[0] }, //use tabs[0]
    context =       ()=>{ let context; $.each($('html').attr('class').split(" "), (i, c) =>{ if (c.match(/-context/)) { context = c } }); return context }; //use current tab

async function postMessage(message, callback) {
    uniquePort = chrome.runtime.connect({name: (timeStamp() + (Math.random() * (+1000 - +1) + +1)).toString()});
    uniquePort.postMessage(message)
    if (typeof callback == 'function') {
        uniquePort.onMessage.addListener( async(response) => {
            await callback(response)
        });
    }
};

chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(message) {
        console.log(message)
        $.each(Object.keys(message), (i, taskId) => {
            console.log(taskId,'function:',typeof window[taskId]);
            if (typeof window[taskId] == 'function') {
                window[taskId](message[taskId]).then(data => port.postMessage(data));
            }
        });
    });
});

async function asyncForEach(array, callback) {
    for (let i = 0; i < array.length; i++) {
        await callback(array[i], i, array);
    };
};