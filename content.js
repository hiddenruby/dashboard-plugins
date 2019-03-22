(async function($){

    let git_username =  'jorubyp',
        git_repo =      'dashboard-plugins',
        git_apiURL =    'https://api.github.com/repos/' + git_username + '/' + git_repo + '/contents/',
        git_envURL =    'https://' + git_username + '.github.io/' + git_repo + '/',
        jQueryURL =     git_envURL + 'jquery-3.3.1.min.js',
        context =       function(){ return $('html').classList[0] },
        timeStamp =     function(){ return new Date().getTime() },
        locale =        function(){ return $('html').attr('lang').split('-')[0] },
        toastObserver = new MutationObserver(pushToast),
        jQueryAdd =     new Promise((resolve, reject) => {
            let tryAdd = setInterval(function(){
                if ($('head')) {
                    clearInterval(tryAdd);
                    $('head').append($('<script async>').attr({type: 'text/javascript', 'data-dashboardplugins-owner':'main', src: jQueryURL}));
                    if (!$('script[scr="' + jQueryURL + '"]')) {
                        reject('jquery not added');
                    } else {
                        resolve('jquery added');
                    }
                }
            },1);
        }),
        querySync = new Promise((resolve, reject) => {
            chrome.storage.sync.get('plugins', function(data) {
                if (!Object.keys(data).length) {
                    data.plugins = {};
                }
                resolve(data);
            });
        }),
        queryLocal = new Promise((resolve, reject) => {
            chrome.storage.local.get('plugins', function(data) {
                if (!Object.keys(data).length) {
                    data.plugins = {};
                }
                resolve(data);
            });
        }),
        queryRemote = new Promise((resolve, reject) => {
            let promiseData = {};
            promiseData.plugins = {};
            $.getJSON(git_apiURL + 'plugins', function(data){
                $.each(data, function(i){
                    let pluginId = data[i].name,
                        pluginPath = 'plugins/' + pluginId + '/';
                    $.getJSON(git_envURL + pluginPath + 'manifest.json' + '?_=' + timeStamp(), function(data){
                        Object.assign(promiseData.plugins,{[pluginId]:{'version':parseFloat(data.version.toString())}});
                        console.log('found',pluginId,'version',promiseData.plugins[pluginId].version,'in repo');
                    });
                });
                resolve(promiseData);
            });
        }),
        syncData = await querySync,
        localData = await queryLocal,
        remoteData = await queryRemote;

    console.log(await jQueryAdd);
    
    addFlag();

    asyncForEach(Object.keys(syncData.plugins), function(pluginId){
        queryPlugin(pluginId);
    });

    function updateStorage(namespace) {
        switch(namespace) {
            case 'sync':
            chrome.storage.sync.set(syncData);
            break;
            case 'local':
            chrome.storage.local.set(localData);
            break;
            default:
            chrome.storage.sync.set(syncData);
            chrome.storage.local.set(localData);
        };
    };

    chrome.storage.onChanged.addListener(function(changes, namespace) {
        asyncForEach(Object.keys(changes), function(key){
            switch(namespace){
                case 'local':
                switch(key){
                    case 'plugins':
                    asyncForEach(Object.keys(changes[key].newValue), function(pluginId){
                        if (syncData.plugins[pluginId]) {
                            queryPlugin(pluginId);
                        };
                    });
                    break;
                    case 'toast':
                    observeToast();
                    break;
                }
                break;
                case 'sync':
                switch(key){
                    case 'plugins':
                    asyncForEach(Object.keys(changes[key].newValue), function(pluginId){
                        if (!localData.plugins[pluginId]) {
                            syncPlugin(pluginId);
                        };
                    });
                    break;
                }
            }
        });
    });

    async function queryPlugin(pluginId){
        if (!localData.plugins[pluginId]) {
            syncPlugin(pluginId);
            return
        }
        let pendingBuild = !localData.plugins[pluginId].state && !localData.plugins[pluginId].context_scripts,
            pendingUpdate = parseFloat(remoteData.plugins[pluginId].version) > parseFloat(localData.plugins[pluginId].version);
            ready = Object.keys(localData.plugins[pluginId]).length > 2 && (localData.plugins[pluginId].state && !localData.plugins[pluginId].state != 'loaded');
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
            localData.plugins[pluginId].state == 'loaded'
            loadPlugin(pluginId);
        }
    }

    function syncPlugin(pluginId) {
        localData.plugins[pluginId] = syncData.plugins[pluginId];
        updateStorage('local');
    }

    function loadPlugin(pluginId){
        console.log('loading:',pluginId);
        let pluginPath = 'plugins/' + pluginId + '/';
        asyncForEach(Object.keys(localData.plugins[pluginId].content_scripts), async(index) => {
            if ('matches' in localData.plugins[pluginId].content_scripts[index] && localData.plugins[pluginId].content_scripts[index].matches.some(function(i){return (window.location.href.match(new RegExp(i.replace(/\*/g, '.*').replace(/\//g,'\\/'))) || $('link[href*="' + i + '"]').length)})) {
                if ('css' in localData.plugins[pluginId].content_scripts[index]) {
                    asyncForEach(Object.keys(localData.plugins[pluginId].content_scripts[index].css), async(i) => {
                        $('head').append($('<style>').attr({type: 'text/css', 'data-dashboardplugins-owner':pluginId}).text(localData.plugins[pluginId].content_scripts[index].css[i]));
                    });
                };
                if ('js' in localData.plugins[pluginId].content_scripts[index]) {
                    asyncForEach(Object.keys(localData.plugins[pluginId].content_scripts[index].js), async(i) => {
                        $('head').append($('<script>').attr({type: 'text/javascript', 'data-dashboardplugins-owner':pluginId, src: git_envURL + pluginPath + 'js/' + localData.plugins[pluginId].content_scripts[index].js[i]}));
                    });
                };
            };
        });
        addFlag(pluginId);
    };

    async function installPlugin(pluginId){
        let attributes = {
            installDate:timeStamp()
        }
        Object.assign(syncData.plugins,{[pluginId]:attributes});
        updateStorage('sync');
    }

    async function buildPlugin(pluginId){
        let action = localData.plugins[pluginId].state.split(' ')[1];
        localData.plugins[pluginId].state = 'processing ' + action;
        let pluginPath = 'plugins/' + pluginId + '/',
            contextTypes = ['matches','run_at'],
            totalItems = 0, itemsLoaded = 0,
            plugin = new Promise ((resolve,reject) => {
                $.getJSON(git_envURL + pluginPath + 'manifest.json' + '?_=' + timeStamp(), function(data){
                    Object.assign(localData.plugins[pluginId],data);
                    plugin = localData.plugins[pluginId];
                    asyncForEach(Object.keys(plugin.content_scripts), async(index) => {
                        asyncForEach(Object.keys(plugin.content_scripts[index]), async(contentType) => {
                            if (!contextTypes.includes(contentType)) {
                                totalItems = totalItems + Object.values(plugin.content_scripts[index][contentType]).length;
                                asyncForEach(Object.values(plugin.content_scripts[index][contentType]), async(path, i) => {
                                    $.get(git_envURL + pluginPath + contentType +'/' + path + '?_=' + timeStamp(), function(data){
                                        switch(contentType) {
                                            case 'css' || 'msg':
                                            console.log(pluginId + 'building: expanding content script',path)
                                            plugin.content_scripts[index][contentType][i] = data;
                                            break;
                                        }
                                        if (!itemsLoaded) { console.log(pluginId,'building:',Math.floor((itemsLoaded / totalItems) * 100) + '%'); }
                                        itemsLoaded++;
                                        console.log(pluginId,'building:',Math.floor((itemsLoaded / totalItems) * 100) + '%');
                                        if (itemsLoaded == totalItems) {
                                            resolve(plugin)
                                        }
                                    });
                                });
                            }
                        });
                    });
                });
            });
        localData.plugins[pluginId] = await plugin;
        switch(action) {
            case 'update':
            buildToast(0,localData.plugins[pluginId].name[locale()],'was updated');
            break;
            case 'build':
            buildToast(0,localData.plugins[pluginId].name[locale()],'was installed');
        }
        updateStorage('local');
    };

    function buildToast(pre,subject,ap){
        let plugin = localData.plugins[subject],
            msgPre = pre ? (plugin ? plugin.msg[pre] ? plugin.msg[pre] : pre : pre) + ' ' : '',
            msgSubject = $('<strong>').text((subject ? plugin ? plugin.msg[subject] : subject : '') + ' '),
            msgAp = ap ? plugin ? plugin.msg[ap] ? plugin.msg[ap] : ap : ap : '',
            toastId = timeStamp();
            bread = $('<li>').attr({
                        class:          'toast blog-sub',
                        'data-subview': 'toast',
                        'data-peepr':   '{"' + (plugin || (subject == 'Dashboard Plug-ins') ? 'tumblog' : 'misc') + '":"' + (plugin ? subject : subject == 'Dashboard Plug-ins' ? 'dashboard-plugins' : subject) + '"}',
                        'data-dashboardplugins-toast-id': toastId
                    }).append(
                        $('<img>').attr({
                            class: 'toaster avatar',
                            src: git_envURL + 'images/icon_blue_bright.png'
                        }),
                        $('<span>').attr({class: 'toast-bread'}).append(
                            msgPre, msgSubject, msgAp
                        )
                    );
        !localData.toast ? localData.toast = {} : '';
        Object.assign(localData.toast,{[toastId]:bread[0]});
        updateStorage('local');
    }

    function observeToast(){
        if ($('.sidebar_nav.clearfix.visible').length || $('.drawer.peepr-drawer-container.open').length) {
            let target = document.body;
            toastObserver.observe(target, {childList: true, subtree: true});
        } else {
            pushToast();
        }
    }

    function pushToast(){
        if (!localData.toast || $('.sidebar_nav.clearfix.visible').length || $('.drawer.peepr-drawer-container.open').length) {
            return
        }
        toastObserver.disconnect();
        if (!$('.toast-kit').attr('style')) {
            $('.toast-kit').css({bottom: '10px'})
        }
        setTimeout(function(){
            $.each(Object.keys(localData.toast), function(i,toastId){
            let bread = localData.toast[toastId],
                waitForNative;
            i += $('ul.multi-toasts li').length + ($('ul.multi-toasts li').length ? 1 : 0); //gotta get this right
            console.log(i)
                setTimeout(function(){
                    $('ul.multi-toasts').append(bread);
                    setTimeout(function(){
                        let checkPosition = setInterval(function(){
                            if ($('ul.multi-toasts li[data-dashboardplugins-toast-id="' + toastId + '"]:first-child').length) {
                                clearInterval(checkPosition);
                                setTimeout(function(){
                                    $('ul.multi-toasts li[data-dashboardplugins-toast-id="' + toastId + '"]').addClass('fade-out')
                                    setTimeout(function(){
                                        $('ul.multi-toasts li[data-dashboardplugins-toast-id="' + toastId + '"]').remove()
                                        if (!$('ul.multi-toasts').children().length) {
                                            $('.toast-kit').removeAttr('style');
                                        };
                                    },500);
                                }, 300*(waitForNative & 1));
                                return
                            }
                            waitForNative = !('data-dashboardplugins-toast-id' in $('ul.multi-toasts li:first-child')[0].attributes);
                        },1);
                    },5000);
                }, 1000*i);
            });
            delete localData.toast;
            updateStorage('local');
        }, 300);
    }

    function addFlag(flagId){
        flagId = 'flag--dashboardPlugins' + (flagId ? '-' + flagId : '');
        let tryFlag = setInterval(function(){
            if ($('html').length) {
                $('html').addClass(flagId);
                clearInterval(tryFlag);
            };
        },1);
        setTimeout(function(){
            clearInterval(tryFlag);
            console.log(flagId,(!$('html.' + flagId).length ? 'timed out' : 'added'));
        },2000);
    };

    async function asyncForEach(array, callback) {
        for (let i = 0; i < array.length; i++) {
            await callback(array[i], i, array);
        };
    };

    window.addEventListener("keydown", async function (event) { //temp
        if (event.key == "i") {
            asyncForEach(Object.keys(remoteData.plugins), function(pluginId){
                installPlugin(pluginId);
            });
        }
    });

})(jQuery)
