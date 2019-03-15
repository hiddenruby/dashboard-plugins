(function($){

    let git_username =  'jorubyp',
        git_repo =      'dashboard-plugins'
        git_apiURL =    'https://api.github.com/repos/' + git_username + '/' + git_repo + '/contents/',
        git_envURL =    'https://' + git_username + '.github.io/' + git_repo + '/'
        locale =        $('html').attr('lang').split('-')[0],
        remotePlugins = [], buildQueue = [], installQueue = {}, initQueue = {};

    queryPlugins();
    addFlag('html');

    function queryPlugins(){
        chrome.storage.sync.get('plugins', function(syncData) {
            if (syncData.plugins){
                $.each(Object.values(syncData.plugins), function(i,pluginId){
                    chrome.storage.local.get('plugins', function(localData) {
                        if (!localData.plugins) {
                            localData.plugins = {}
                        }
                        if (!localData.plugins[pluginId]) { //the plugin was not found in storage.local, so we need to build it
                            buildQueue.push(pluginId);
                            buildPlugins();
                        } else { //the plugin is already installed and can be added to the init queue
                            Object.assign(initQueue,{[pluginId]:localData.plugins[pluginId]});
                            initPlugins();
                        }
                    });
                });
            }
        });
    }

    function initPlugins(){ //attaches the content scripts of plugins in the queue to the document
        if (!Object.keys(initQueue).length) {
            return;
        }
        $.each(Object.keys(initQueue), function(i,pluginId){
            console.log('initializing:',pluginId);
            let pluginPath = 'plugins/' + pluginId + '/';
            $.each(Object.keys(initQueue[pluginId].content_scripts), function(index){
                if ('matches' in initQueue[pluginId].content_scripts[index] && initQueue[pluginId].content_scripts[index].matches.some(function(i){return (window.location.href.indexOf(i) > -1 || $('link[href*="' + i + '"]').length)})) {
                    if ('css' in initQueue[pluginId].content_scripts[index]) {
                        $.each(Object.keys(initQueue[pluginId].content_scripts[index].css), function(i){
                            $('head').append($('<style>').attr({type: 'text/css', class: 'dashboardPlugins-' + pluginId + '-css'}).text(initQueue[pluginId].content_scripts[index].css[i]))
                        });
                    };
                    if ('js' in initQueue[pluginId].content_scripts[index]) {
                        $.each(Object.keys(initQueue[pluginId].content_scripts[index].js), function(i){
                            $('head').append($('<script>').attr({src: git_envURL + pluginPath + 'js/' + initQueue[pluginId].content_scripts[index].js[i], class: 'dashboardPlugins-' + pluginId + '-js'}))
                        });
                    };
                };
            });
            addFlag('html',pluginId);
        });     
        initQueue = {};
    }

    function addFlag(target,flagId){
        target = target ? target : 'html';
        flagId = 'flag--dashboardPlugins' + (flagId ? '-' + flagId : '');
        let tryFlag = setInterval(function(){
            if ($(target)) {
                $(target).addClass(flagId);
                clearInterval(tryFlag);
            } 
        },1)
        setTimeout(function(){
            clearInterval(tryFlag);
            console.log(flagId,(!$(target + '.' + flagId).length ? 'timed out' : 'added to ' + target));
        },2000)
    }

    function buildPlugins(){ //store the manifests of the plugins in the build queue in objects, expanding css and msg content scripts
        if (!buildQueue.length) {
            return;
        }
        $.each(Object.values(buildQueue), function(i,pluginId){
            console.log('installing:',buildQueue);
            let pluginPath = 'plugins/' + pluginId + '/',
                excludeTypes = ['matches','run_at'];
                totalItems = 0, itemsLoaded = 0;
            $.getJSON(git_envURL + pluginPath + 'manifest.json', function(data){
                let plugin = new Object(data);
                $.each(Object.keys(plugin.content_scripts), function(index){
                    $.each(Object.keys(plugin.content_scripts[index]), function(contentType){
                        if (!excludeTypes.includes(Object.keys(plugin.content_scripts[index])[contentType])) {
                            totalItems = totalItems + Object.values(plugin.content_scripts[index])[contentType].length;
                            $.each(Object.values(plugin.content_scripts[index])[contentType], function(i,path){
                                $.get(git_envURL + pluginPath + Object.keys(plugin.content_scripts[index])[contentType] +'/' + path, function(data){
                                    switch(Object.keys(plugin.content_scripts[index])[contentType]) {
                                        case 'css':
                                        Object.values(plugin.content_scripts[index])[contentType][i] = data;
                                        break;
                                        case 'msg':
                                        Object.values(plugin.content_scripts[index])[contentType][i] = data;
                                        break;
                                    }
                                    if (!itemsLoaded) { console.log('installing',pluginId,Math.floor((itemsLoaded / totalItems) * 100) + '%'); }
                                    itemsLoaded++;          
                                    console.log('installing',pluginId,Math.floor((itemsLoaded / totalItems) * 100) + '%');
                                    if (itemsLoaded == totalItems) {
                                        Object.assign(installQueue,{[pluginId]:plugin}); //sends the expanded plugin manifest as an object to the queue of plugins to be saved to storage.local
                                        updateStorage('local');
                                    }
                                });
                            });
                        }
                    });
                });
            });
        });     
        buildQueue = [];
    }

    function updateStorage(type) {
        switch(type) {
            case 'sync': //names of plugin to be installed by user are saved to storage.sync
            let syncQueue = remotePlugins; //for now just save all plugins in the repo
            chrome.storage.sync.get('plugins', function(data) {
                if (!syncQueue.length) {
                    return;
                }
                if (!data.plugins) {
                    data.plugins = []
                }
                $.each(Object.keys(syncQueue), function(i){
                    if (data.plugins[syncQueue[i]]) {
                        syncQueue.splice(syncQueue[i],syncQueue[0])
                    }
                });
                data.plugins = [].concat(data.plugins || [], syncQueue);
                syncQueue = [];
                chrome.storage.sync.set(data);
                queryPlugins();
            });
            break;
            case 'local': //expanded manifest files are saved to storage.local
            chrome.storage.local.get('plugins', function(data) {
                if (!Object.keys(installQueue).length) {
                    return;
                }
                if (!data.plugins) {
                    data.plugins = {}
                }
                data.plugins = Object.assign(data.plugins, installQueue);
                installQueue = {};
                chrome.storage.local.set(data);
                queryPlugins();
            });
            break;
        }
    }

// temp

    window.addEventListener("keydown", function (event) {
        if (event.key == "i") {
            $.getJSON(git_apiURL + 'plugins', function(data){
                $.each(data, function(i){
                    remotePlugins.push(data[i].name);
                    console.log('found',remotePlugins[i],'in repo')
                });
                updateStorage('sync');
            });
        }
    });

})(jQuery)