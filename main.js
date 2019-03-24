console.log(context())
jQueryAdd();
addFlag();

postMessage({queryStorage: 'sync'}, async(data) => {
    console.log('sync',data)
    asyncForEach(Object.keys(data.plugins), async(pluginId) => {
        postMessage({queryPlugin: pluginId});
    });
});

function loadPlugin(pluginId){
    console.log(0,pluginId)
    let pluginId = Object.keys(plugin)[0],
        plugin = plugin[pluginId],
        pluginPath = 'plugins/' + pluginId + '/';
    console.log('loading:',pluginId);
    asyncForEach(plugin.content_scripts, async(content) => {
        let matches = 'matches' in content && content.matches.some( (i) => {
                return window.location.href.match(new RegExp(i.replace(/\*/g, '.*').replace(/\//g,'\\/')))
            }),
            contexts = 'contexts' in content && content.contexts.some( (i) => {
                return context().match(new RegExp(i.replace(/\*/g, '.*')))
            });
        if (matches || contexts) {
            asyncForEach(Object.keys(content), async(contentType) => {
                switch(contentType) {
                    case 'css':
                    asyncForEach(content.css, async(css) => {
                        let attributes = {
                            type: 'text/css',
                            'data-dashboardplugins-owner':  pluginId
                        };
                        $('head').append($('<style>').attr(attributes).text(css));
                    });
                    break;
                    case 'js':
                    asyncForEach(content.js, async(js) => {
                        let attributes = {
                            type: 'text/javascript',
                            'data-dashboardplugins-owner':pluginId, 
                            src: git_envURL + pluginPath + 'js/' + js + '?=' + timeStamp()
                        };
                        $('head').append($('<script>').attr(attributes));
                    });
                    break;
                }
            });
        };
    });
    addFlag(pluginId);
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
window.addEventListener("keydown", (event) => { //temp
    if (event.key == "i") {
        postMessage({queryStorage: 'remote'}, async(data) => {
            console.log('remote',data)
            asyncForEach(Object.keys(data.plugins), async(pluginId) => {
                postMessage({installPlugin: [pluginId]})
            });
        });
    };
})

async function jQueryAdd() {
    let jQueryAdd = new Promise((resolve, reject) => {
        let tryAdd = setInterval(() => {
            if ($('head')) {
                clearInterval(tryAdd);
                $('head').append($('<script async>').attr({type: 'text/javascript', 'data-dashboardplugins-owner':'main', src: jQueryURL}));
                if (!$('script[scr="' + jQueryURL + '"]')) {
                    reject('jquery not added');
                } else {
                    resolve('jquery added');
                };
            };
        },1);
    });
    console.log(await jQueryAdd);
};

function addFlag(flagId) {
    flagId = 'flag--dashboardPlugins' + (flagId ? '-' + flagId : '');
    $('html').addClass(flagId);
    console.log(flagId,(!$('html.' + flagId).length ? 'was not added' : 'added'));
};