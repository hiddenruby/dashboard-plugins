(async($)=>{

    let git_username =  'jorubyp',
        git_repo =      'dashboard-plugins',
        git_apiURL =    'https://api.github.com/repos/' + git_username + '/' + git_repo + '/contents/',
        git_envURL =    'https://' + git_username + '.github.io/' + git_repo + '/',
        jQueryURL =     git_envURL + 'jquery-3.3.1.min.js',
        timeStamp =     ()=>{ return new Date().getTime() },
        locale =        ()=>{ return $('html').attr('lang').split('-')[0] },
        context =       $('html').attr('class').split(" ")[2],
        toastObserver = new MutationObserver(pushToast),
        jQueryAdd =     new Promise((resolve, reject) => {
            let tryAdd = setInterval(()=>{
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
            chrome.storage.sync.get('plugins', (data)=> {
                if (!Object.keys(data).length) {
                    data.plugins = {};
                }
                resolve(data);
            });
        }),
        queryLocal = new Promise((resolve, reject) => {
            chrome.storage.local.get('plugins', (data)=> {
                if (!Object.keys(data).length) {
                    data.plugins = {};
                }
                resolve(data);
            });
        }),
        queryRemote = new Promise((resolve, reject) => {
            let promiseData = {};
            promiseData.plugins = {};
            $.getJSON(git_apiURL + 'plugins', (data) => {
                $.each(data, (i) => {
                    let pluginId = data[i].name,
                        pluginPath = 'plugins/' + pluginId + '/';
                    $.getJSON(git_envURL + pluginPath + 'manifest.json' + '?_=' + timeStamp(), (data) => {
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
    
    addFlag();

    asyncForEach(Object.keys(syncData.plugins), async (pluginId) => {
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

    chrome.storage.onChanged.addListener((changes, namespace) => {
        asyncForEach(Object.keys(changes), (key) => {
            switch(namespace){
                case 'local':
                switch(key){
                    case 'plugins':
                    asyncForEach(Object.keys(changes[key].newValue), (pluginId) => {
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
                    asyncForEach(Object.keys(changes[key].newValue), (pluginId) => {
                        if (!localData.plugins[pluginId]) {
                            syncPlugin(pluginId);
                        };
                    });
                    break;
                }
            }
        });
    });

    async function queryPlugin(pluginId,i){
        if (!localData.plugins[pluginId]) {
            syncPlugin(pluginId);
            return
        }
        let pendingBuild = !localData.plugins[pluginId].state && !localData.plugins[pluginId].context_scripts,
            pendingUpdate = false, //parseFloat(remoteData.plugins[pluginId].version) > parseFloat(localData.plugins[pluginId].version),
            ready = Object.keys(localData.plugins[pluginId]).length > 2 && (localData.plugins[pluginId].state && localData.plugins[pluginId].state != 'loaded');
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
            contextTypes = ['matches','contexts','run_at'],
            totalItems = 0, itemsLoaded = 0,
            plugin = new Promise ((resolve,reject) => {
                $.getJSON(git_envURL + pluginPath + 'manifest.json' + '?_=' + timeStamp(), (data) => {
                    plugin = localData.plugins[pluginId];
                    Object.assign(plugin,data);
                    asyncForEach(plugin.content_scripts, async(content) => {
                        asyncForEach(Object.keys(content), async(contentType) => {
                            if (!contextTypes.includes(contentType)) {
                                totalItems = totalItems + Object.values(content[contentType]).length;
                                asyncForEach(content[contentType], async(path, i) => {
                                    $.get(git_envURL + pluginPath + contentType +'/' + path + '?_=' + timeStamp(), (data) => {
                                        switch(contentType) {
                                            case 'css' || 'msg':
                                            console.log(pluginId,'building: expanding content script',path)
                                            content[contentType][i] = data;
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
        plugin = await plugin;
        localData.plugins[pluginId] = plugin;
        switch(action) {
            case 'update':
            buildToast('Updated',plugin.name[locale()],0);
            break;
            case 'build':
            buildToast('Installed',plugin.name[locale()],0);
        }
        updateStorage('local');
    };

    function loadPlugin(pluginId){
        console.log('loading:',pluginId);
        let pluginPath = 'plugins/' + pluginId + '/';
        asyncForEach(localData.plugins[pluginId].content_scripts, async(content) => {
            if (contexts(content) || matches(content)) {
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
                                src: git_envURL + pluginPath + 'js/' + js
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

    function matches(content) {
        let result;
        if ('matches' in content) {
            content.matches.some( (i) => {
                result = window.location.href.match(new RegExp(i.replace(/\*/g, '.*').replace(/\//g,'\\/'))) || $('link[href*="' + i + '"]').length;
            });
        }
        return result;
    }

    function contexts(content) {
        let result;
        if ('contexts' in content) {
            content.contexts.some( (i) => {
                result =  context.match(new RegExp(i.replace(/\*/g, '.*')));
            });
        }
        return result;
    }

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
        setTimeout(()=>{
            $.each(Object.keys(localData.toast), (i,toastId)=>{
            let bread = localData.toast[toastId],
                waitForNative;
            i += $('ul.multi-toasts li').length + ($('ul.multi-toasts li').length ? 1 : 0); //gotta get this right
            console.log(i)
                setTimeout(()=>{
                    $('ul.multi-toasts').append(bread);
                    setTimeout(()=>{
                        let checkPosition = setInterval(()=>{
                            if ($('ul.multi-toasts li[data-dashboardplugins-toast-id="' + toastId + '"]:first-child').length) {
                                clearInterval(checkPosition);
                                setTimeout(()=>{
                                    $('ul.multi-toasts li[data-dashboardplugins-toast-id="' + toastId + '"]').addClass('fade-out')
                                    setTimeout(()=>{
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

    async function asyncForEach(array, callback) {
        for (let i = 0; i < array.length; i++) {
            await callback(array[i], i, array);
        };
    };

    function addFlag(flagId) {
        flagId = 'flag--dashboardPlugins' + (flagId ? '-' + flagId : '');
        $('html').addClass(flagId);
        console.log(flagId,(!$('html.' + flagId).length ? 'was not added' : 'added'));
    };

    window.addEventListener("keydown", async(event)=>{ //temp
        if (event.key == "i") {
            asyncForEach(Object.keys(remoteData.plugins), (pluginId) => {
                installPlugin(pluginId);
            });
        }
    });

})(jQuery)
