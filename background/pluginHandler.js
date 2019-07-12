async function queryPlugins() {
    asyncForEach(Object.keys(syncData.plugins), async(pluginId) => {
        if (!localData.plugins[pluginId]) {
            syncPlugin(pluginId);
            return
        };
        let pendingBuild = !localData.plugins[pluginId].state && !localData.plugins[pluginId].context_scripts,
            pendingUpdate = parseFloat(remoteData.plugins[pluginId].version) > parseFloat(localData.plugins[pluginId].version),
            ready = Object.keys(localData.plugins[pluginId]).length > 2;
        switch(true) {
            case pendingBuild:
            localData.plugins[pluginId].state = 'pending build';
            break;
            case pendingUpdate: 
            localData.plugins[pluginId].state = 'pending update';
            break;
            case ready:
            localData.plugins[pluginId].state = 'ready';
        }
        console.log(pluginId,'is',localData.plugins[pluginId].state);
        switch(localData.plugins[pluginId].state) {
            case (/pending/.exec(localData.plugins[pluginId].state) || {}).input:
            buildPlugin(pluginId);
            break;
            case 'ready':
            console.log('loading',pluginId)
            callContentFunction({loadPlugin: {[pluginId]: localData.plugins[pluginId]}}, (response) => {
                console.log(response.sender, response.data);
            });
            callContentFunction({loadCfg: localData.plugins});
        };
    });
};

function installPlugin(pluginId) {
    let attributes = {
        installDate: timeStamp(),
        version: remoteData.plugins[pluginId].version
    };
    Object.assign(syncData.plugins,{[pluginId]:attributes});
    updateStorage('sync');
};

function syncPlugin(pluginId) {
    localData.plugins[pluginId] = syncData.plugins[pluginId];
    updateStorage('local');
};

async function buildPlugin(pluginId) {
    let action = localData.plugins[pluginId].state.split(' ')[1];
    localData.plugins[pluginId].state = 'processing ' + action;
    let pluginPath = 'plugins/' + pluginId + '/',
        contextTypes = ['matches','contexts','run_at'],
        totalItems = 0, itemsLoaded = 0,
        plugin = new Promise ((resolve,reject) => {
            $.getJSON(git_envURL + pluginPath + 'manifest.json' + '?_=' + timeStamp(), (data) => {
                plugin = localData.plugins[pluginId];
                Object.assign(plugin,data);
                plugin.source = git_repoURL + '/tree/master/' + pluginPath;
                plugin.repo = git_repoURL;
                asyncForEach(plugin.content_scripts, async(content) => {
                    asyncForEach(Object.keys(content), async(contentType) => {
                        if (!contextTypes.includes(contentType)) {
                            totalItems = totalItems + Object.values(content[contentType]).length;
                            asyncForEach(content[contentType], async(path, i) => {
                                $.get(git_envURL + pluginPath + contentType +'/' + path + '?_=' + timeStamp(), (data) => {
                                    switch(contentType) {
                                        case 'css':
                                        console.log(pluginId,'building: expanding',contentType,'content script',path)
                                        content[contentType][i] = data;
                                        break;
                                    };
                                    if (!itemsLoaded) { console.log(pluginId,'building:',Math.floor((itemsLoaded / totalItems) * 100) + '%'); };
                                    itemsLoaded++;
                                    console.log(pluginId,'building:',Math.floor((itemsLoaded / totalItems) * 100) + '%');
                                    if (itemsLoaded == totalItems) {
                                        resolve(plugin)
                                    };
                                });
                            });
                        };
                    });
                });
            });
        });
    plugin = await plugin;
    localData.plugins[pluginId] = plugin;
    buildToast(0,plugin.name.en,action);
    updateStorage('local');
};
