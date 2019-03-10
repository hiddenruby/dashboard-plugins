(function($){

    let git_username =  'jorubyp',
        git_repo =      'dashboard-plugins'
        git_apiURL =    'https://api.github.com/repos/' + git_username + '/' + git_repo + '/contents/',
        git_rawURL =    'https://raw.githubusercontent.com/' + git_username + '/' + git_repo + '/master/',
        git_pagesURL =  'https://' + git_username + '.github.io/' + git_repo + '/'
        locale = $('html').attr('lang').split('-')[0],
        remotePlugins = [],
        buildQueue = [],
        installQueue = {},
        initQueue = [],
        installedPlugins = {};

    loadPlugins();

    window.addEventListener("keydown", function (event) {
        if (event.key == "i") {
            $.getJSON(git_apiURL + 'plugins', function(data){ //fetch remote plugins list
                $.each(Object.keys(data), function(i){
                    remotePlugins.push(data[i].name);
                })
                updateStorage('sync');
            });
        }
    });

    function updateStorage(type) {
        switch(type) {
            case 'sync':
            let syncQueue = remotePlugins;
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
                loadPlugins();
            });
            break;
            case 'local':
            chrome.storage.local.get('plugins', function(data) {
                if (!Object.keys(installQueue).length) {
                    return;
                }
                if (!data.plugins) {
                    data.plugins = {}
                }
                $.each(Object.keys(installQueue), function(i){
                    if (data.plugins[installQueue[i]]) {
                        installQueue.splice(installQueue[i],installQueue[0])
                    }
                });
                data.plugins = Object.assign(data.plugins, installQueue);
                installQueue = {};
                chrome.storage.local.set(data);
                $.each(Object.keys(data.plugins), function(i,pluginId){
                    initQueue.push(pluginId)
                    initPlugins();
                });
            });
            break;
        }
    }

    function loadPlugins(){
        chrome.storage.sync.get('plugins', function(syncData) {
            let userPlugins = syncData.plugins;
            if (userPlugins){
                $.each(Object.values(userPlugins), function(i,pluginId){
                    chrome.storage.local.get('plugins', function(localData) {
                        if (!localData.plugins) { localData.plugins = {} }
                        let installedPlugins = localData.plugins;
                        if (!installedPlugins[pluginId]) {
                        //if (!Object.keys(localStorage).includes('dashboardPlugins-' + pluginId)){
                            buildQueue.push(pluginId);
                            updatePlugins();
                        } else {
                            initQueue.push(pluginId);
                            initPlugins();
                        }
                    });
                });
            }
        });
    }

    function updatePlugins(){
        if (!buildQueue.length) {
            return;
        }
        $.each(Object.values(buildQueue), function(i,pluginId){
            console.log('installing:',buildQueue);
            let pluginPath = 'plugins/' + pluginId + '/',
                totalItems = 0,
                itemsLoaded = 0,
                expandTypes = ['css','msg'];
            $.getJSON(git_pagesURL + pluginPath + 'manifest.json', function(data){
                let plugin = new Object(data);
                $.each(Object.keys(plugin.content_scripts), function(index){
                    $.each(Object.keys(plugin.content_scripts[index]), function(contentType){
                        if (expandTypes.includes(Object.keys(plugin.content_scripts[index])[contentType])) {
                            totalItems = totalItems + Object.values(plugin.content_scripts[index])[contentType].length;
                            $.each(Object.values(plugin.content_scripts[index])[contentType], function(i,path){
                                $.get(git_pagesURL + pluginPath + Object.keys(plugin.content_scripts[index])[contentType] +'/' + path, function(data){
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
                                        //localStorage.setItem('dashboardPlugins-' + pluginId, JSON.stringify(plugin));
                                        Object.assign(installQueue,{[pluginId]:plugin});
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

    /*
    $.each(Object.keys(localStorage), function(i,id){ //load plug-ins into objects
        if (id.indexOf('dashboardPlugins-') > -1) {
            installedPlugins[id.split('-')[1]] = new Object(JSON.parse(localStorage.getItem(id)));
        }
    });
    $.each(Object.keys(installedPlugins), function(i,pluginId){
        console.log(installedPlugins[pluginId]);
        let pluginPath = 'plugins/' + pluginId + '/';
        $.each(Object.keys(installedPlugins[pluginId].content_scripts), function(index){
            console.log(installedPlugins[pluginId].content_scripts[index]);
            if ('matches' in installedPlugins[pluginId].content_scripts[index] && installedPlugins[pluginId].content_scripts[index].matches.some(function(i){return (window.location.href.indexOf(i) > -1 || $('link[href*="' + i + '"]').length)})) {
                if ('css' in installedPlugins[pluginId].content_scripts[index]) {
                    let addcss = setInterval(function(){
                        if ($('head').length) {
                            $.each(Object.keys(installedPlugins[pluginId].content_scripts[index].css), function(i){
                                console.log(Object.keys(installedPlugins[pluginId].content_scripts[index]).length)
                                $('head').append($('<style>').attr({type: 'text/css', class: 'dashboardPlugins-' + pluginId + '-css'}).text(installedPlugins[pluginId].content_scripts[index].css[i]))
                            });
                            clearInterval(addcss);
                        }
                    },1);
                };
                if ('js' in installedPlugins[pluginId].content_scripts[index]) {
                    $.each(Object.keys(installedPlugins[pluginId].content_scripts[index].js), function(i){
                        $('head').append($('<script>').attr({async:'', src: git_pagesURL + pluginPath + 'js/' + installedPlugins[pluginId].content_scripts[index].js[i], class: 'dashboardPlugins-' + pluginId + '-js'}))
                    });
                };
            };
        });
    });

    */
    function initPlugins(){
        if (!initQueue.length) {
            return;
        }
        $.each(Object.values(initQueue), function(i,pluginId){
            console.log('initializing:',Object.values(initQueue));
            let pluginPath = 'plugins/' + pluginId + '/';
            chrome.storage.local.get('plugins', function(data) {
                let installedPlugins = data.plugins;
                $.each(Object.keys(installedPlugins[pluginId].content_scripts), function(index){
                    if ('matches' in installedPlugins[pluginId].content_scripts[index] && installedPlugins[pluginId].content_scripts[index].matches.some(function(i){return (window.location.href.indexOf(i) > -1 || $('link[href*="' + i + '"]').length)})) {
                        if ('css' in installedPlugins[pluginId].content_scripts[index]) {
                            $.each(Object.keys(installedPlugins[pluginId].content_scripts[index].css), function(i){
                                $('head').append($('<style>').attr({type: 'text/css', class: 'dashboardPlugins-' + pluginId + '-css'}).text(installedPlugins[pluginId].content_scripts[index].css[i]))
                            });
                        };
                        if ('js' in installedPlugins[pluginId].content_scripts[index]) {
                            $.each(Object.keys(installedPlugins[pluginId].content_scripts[index].js), function(i){
                                $('head').append($('<script>').attr({async:'', src: git_pagesURL + pluginPath + 'js/' + installedPlugins[pluginId].content_scripts[index].js[i], class: 'dashboardPlugins-' + pluginId + '-js'}))
                            });
                        };
                    };
                });
            });
        });     
        initQueue = [];
    }
    function addFlag(target,flagId){
        if ($(target).length) {
            $(target).addClass('flag--dashboardPlugins' + flagId ? '-' + flagId : '');
        }
    }

    function msg(pluginId,msgId){
        if (!msgId){
            console.log('msg: not enough arguments')
            return
        }
        return plugin[pluginId].msg[msgId].message[locale]
    }
})(jQuery)