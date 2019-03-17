(function($){

    let git_username =  'jorubyp',
        git_repo =      'dashboard-plugins',
        git_apiURL =    'https://api.github.com/repos/' + git_username + '/' + git_repo + '/contents/',
        git_envURL =    'https://' + git_username + '.github.io/' + git_repo + '/',
        locale =        $('html[lang]').length ? $('html').attr('lang').split('-')[0] : 'slow', //fix this
        context =       $('html').classList ? $('html').classList[0] : 'slow', //fix this
        syncData = {}, localData = {}, remoteData = {}, syncQueue = {}, installQueue = { pending:[], executing:[] }, initQueue = {};

    queryStorage();
    queryPlugins();
    addFlag();
    console.log(locale,context)

    async function queryStorage(){
        let querySync = new Promise((resolve, reject) => {
                chrome.storage.sync.get('plugins', function(data) {
                    data.plugins = !data.plugins ? {} : data.plugins;
                    resolve(data)
                });
            }),
            queryLocal = new Promise((resolve, reject) => {
                chrome.storage.local.get('plugins', function(data) {
                    data.plugins = !data.plugins ? {} : data.plugins;
                    resolve(data)
                });
            }),
            queryRemote = new Promise((resolve, reject) => {
                let promiseData = {};
                promiseData.plugins = {};
                $.getJSON(git_apiURL + 'plugins', function(data){
                    $.each(data, function(i){
                        let pluginId = data[i].name,
                            pluginPath = 'plugins/' + pluginId + '/';
                        $.getJSON(git_envURL + pluginPath + 'manifest.json', function(data){
                            Object.assign(promiseData.plugins,{[pluginId]:parseFloat(data.version.toString())});
                            console.log('found',pluginId,'version',promiseData.plugins[pluginId],'in repo')
                        });
                    });
                    resolve(promiseData)
                });
            });
        syncData = await querySync;
        localData = await queryLocal;
        remoteData = await queryRemote;
    }

    async function queryPlugins(plugin){
        let tryData = setInterval(function(){
            if (localData.plugins) {
                clearInterval(tryData);
                asyncForEach(Object.keys(syncData.plugins), async(pluginId) => {
                    if (!localData.plugins[pluginId]) { //the plugin was not found in storage.local, so we need to build it
                        if (!installQueue.executing.includes(pluginId)) { //only push if the plugin is not currently being built
                            installQueue.pending.push(pluginId); 
                            buildPlugins();
                        }
                    } else { //the plugin is already installed and can be added to the init queue
                        Object.assign(initQueue,{[pluginId]:localData.plugins[pluginId]});
                        initPlugins();
                    }
                });
            }
        },1)
        setTimeout(function(){
            clearInterval(tryData);
            if (!Object.keys(syncData.plugins).length) {
                console.log('tryData timed out');
            }
        },2000)
    }

    function initPlugins(){ //attaches the content scripts of plugins in the queue to the document
        if (!Object.keys(initQueue).length) {
            return;
        }
        asyncForEach(Object.keys(initQueue), async(pluginId) => {
            delete initQueue[pluginId];
            $.each($('*[data-dashboardPlugins-pluginId*=' + pluginId + ']'), function(){
                this.remove(); //plugin has already been initialized once before so remove the content scripts 
            });
            console.log('initializing:',pluginId);
            let pluginPath = 'plugins/' + pluginId + '/';
            asyncForEach(Object.keys(localData.plugins[pluginId].content_scripts), async(index) => {
                if ('matches' in localData.plugins[pluginId].content_scripts[index] && localData.plugins[pluginId].content_scripts[index].matches.some(function(i){return (window.location.href.indexOf(i) > -1 || $('link[href*="' + i + '"]').length)})) {
                    if ('css' in localData.plugins[pluginId].content_scripts[index]) {
                        asyncForEach(Object.keys(localData.plugins[pluginId].content_scripts[index].css), async(i) => {
                            $('head').append($('<style>').attr({type: 'text/css', 'data-dashboardPlugins-pluginId':pluginId}).text(localData.plugins[pluginId].content_scripts[index].css[i]))
                        });
                    };
                    if ('js' in localData.plugins[pluginId].content_scripts[index]) {
                        asyncForEach(Object.keys(localData.plugins[pluginId].content_scripts[index].js), async(i) => {
                            $('head').append($('<script>').attr({type: 'text/javascript', 'data-dashboardPlugins-pluginId':pluginId, src: git_envURL + pluginPath + 'js/' + localData.plugins[pluginId].content_scripts[index].js[i]}))
                        });
                    };
                };
            });
            addFlag(pluginId);
        });
    }

    async function addFlag(flagId){
        flagId = 'flag--dashboardPlugins' + (flagId ? '-' + flagId : '');
        let tryFlag = setInterval(function(){
            if ($('html').length) {
                $('html').addClass(flagId);
                clearInterval(tryFlag);
            } 
        },1)
        setTimeout(function(){
            clearInterval(tryFlag);
            console.log(flagId,(!$('html.' + flagId).length ? 'timed out' : 'added'));
        },2000)
    }

    async function buildPlugins(){ //store the manifests of the plugins in the build queue in objects, expanding css and msg content scripts
        if (!installQueue.pending.length) {
            return;
        }
        asyncForEach(Object.values(installQueue.pending), async(pluginId) => {
            console.log('installing:',pluginId);
            installQueue.executing.push(pluginId);
            let pluginPath = 'plugins/' + pluginId + '/',
                contextTypes = ['matches','run_at'],
                totalItems = 0, itemsLoaded = 0,
                plugin = new Promise ((resolve,reject) => {
                    $.getJSON(git_envURL + pluginPath + 'manifest.json', function(data){
                        let plugin = new Object(data);
                        asyncForEach(Object.keys(plugin.content_scripts), async(index) => {
                            asyncForEach(Object.keys(plugin.content_scripts[index]), async(contentType) => {
                                if (!contextTypes.includes(contentType)) {
                                    totalItems = totalItems + Object.values(plugin.content_scripts[index][contentType]).length;
                                    asyncForEach(Object.values(plugin.content_scripts[index][contentType]), async(i) => {
                                        $.get(git_envURL + pluginPath + contentType +'/' + i, function(data){
                                            switch(contentType) {
                                                case 'css' || 'msg':
                                                console.log('expanding content script',i,'in',pluginId)
                                                plugin.content_scripts[index][contentType][0] = data;
                                                break;
                                            }
                                            if (!itemsLoaded) { console.log('installing',pluginId,Math.floor((itemsLoaded / totalItems) * 100) + '%'); }
                                            itemsLoaded++;
                                            console.log('installing',pluginId,Math.floor((itemsLoaded / totalItems) * 100) + '%');
                                            if (itemsLoaded == totalItems) {
                                                resolve({[pluginId]:plugin})
                                            }
                                        });
                                    });
                                }
                            });
                        });
                    });
                });
            Object.assign(localData.plugins,(await plugin)); //sends the expanded plugin manifest as an object to the queue of plugins to be saved to storage.local
            updateStorage('local');
            installQueue.executing.splice(installQueue.executing[pluginId],installQueue.executing[0])
        });
        installQueue.pending = [];
    }

    async function updateStorage(type) {
        switch(type) {
            case 'sync': //names and version number of plugins installed by user are saved to storage.sync
            syncQueue = remoteData.plugins; //for now just save all plugins in the repo
            if (!Object.keys(syncQueue).length) {
                return;
            }
            $.each(Object.keys(syncQueue), function(i){
                if (syncData.plugins[syncQueue[i]]) {
                    delete syncQueue[syncQueue[i]];
                }
            });
            syncData.plugins = Object.assign(syncData.plugins, syncQueue);
            syncQueue = {};
            chrome.storage.sync.set(syncData);
            break;
            case 'local': //expanded manifest files are saved to storage.local
            if (!Object.keys(localData).length) {
                return;
            }
            chrome.storage.local.set(localData);
            break;
        }
        queryPlugins();
    }
    async function asyncForEach(array, callback) {
        for (let i = 0; i < array.length; i++) {
            await callback(array[i], i, array);
        }
    }

    window.addEventListener("keydown", function (event) { //temp
        if (event.key == "i") {
            updateStorage('sync');
        }
    });

})(jQuery)