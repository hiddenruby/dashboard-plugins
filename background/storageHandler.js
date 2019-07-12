queryStorage('sync').then(data => {window.syncData = data});
queryStorage('local').then(data => {window.localData = data});
queryStorage('remote').then(data => {window.remoteData = data});

async function queryStorage(namespace) {
    return new Promise((resolve, reject) => {
        if (window[namespace + 'Data']) {
            console.log('installed plugins:',syncData.plugins);
            resolve(window[namespace + 'Data']);
        };
        switch(namespace) {
            case 'remote':
            $.getJSON(git_apiURL + 'plugins', (directories) => {
                let data = {
                    plugins: {}
                };
                $.each(directories, (i) => {
                    let pluginId = directories[i].name,
                        pluginPath = 'plugins/' + pluginId + '/';
                    $.getJSON(git_envURL + pluginPath + 'manifest.json' + '?_=' + timeStamp(), (plugin) => {
                        data.plugins[pluginId] = {'version':parseFloat(plugin.version.toString())};
                        console.log('found',pluginId,'version',data.plugins[pluginId].version,'in repo');
                    });
                });
                resolve(data)
            });
            break;
            default:
            chrome.storage[namespace].get('plugins', (data) => {
                if (!Object.keys(data).length) {
                    data.plugins = {};
                };
                resolve(data);
            });
        };
    });
};

function updateStorage(namespace) {
    if (namespace) {
        let data = window[namespace + 'Data'];
        console.log(namespace + ':', data);
        chrome.storage[namespace].set(data);
    } else {
        chrome.storage.sync.set(syncData);
        chrome.storage.local.set(localData);
    };
};

chrome.storage.onChanged.addListener((changes, namespace) => {
    asyncForEach(Object.keys(changes), (key) => {
        window[namespace + 'DataHandler'](key,changes[key]);
    });
});

function localDataHandler(namespace,changes) {
    switch(namespace) {
        case 'plugins':
        queryPlugins();
        break;
        case 'toast':
        //callContentFunction({observeToast: localData.toast});
    };
};

function syncDataHandler(namespace,changes) {
    switch(namespace) {
        case 'plugins':
        asyncForEach(Object.keys(changes.newValue), (pluginId) => {
            if (!localData.plugins[pluginId]) {
                syncPlugin(pluginId);
            };
        });
        break;
    };
};