let toastObserver = new MutationObserver(pushToast);
jQueryAdd();
addFlag();
postMessage('runtime', {queryStorage: 'sync'}, async(response) => {
    //window.currentTab = response.sender;
    console.log('sync',response.data.plugins)
    asyncForEach(Object.keys(response.data.plugins), async(pluginId) => {
        postMessage('runtime', {queryPlugin: pluginId});
    });
});

function loadPlugin(plugin){
    let pluginId = Object.keys(plugin)[0],
        pluginPath = 'plugins/' + pluginId + '/';
    plugin = plugin[pluginId];
    console.log('loading',pluginId,plugin)
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

function observeToast(toastQueue) {
    if ($('.sidebar_nav.clearfix.visible').length || $('.drawer.peepr-drawer-container.open').length) {
        let target = document.body;
        toastObserver.observe(target, {childList: true, subtree: true});
    } else {
        pushToast(toastQueue);
    }
}

function pushToast(toastQueue) {
    if (!Object.keys(toastQueue).length || !$('.sidebar_nav.clearfix').length || $('.sidebar_nav.clearfix.visible').length || $('.drawer.peepr-drawer-container.open').length) {
        return
    }
    toastObserver.disconnect();
    if (!$('.toast-kit').attr('style')) {
        $('.toast-kit').css({bottom: '10px'})
    }
    setTimeout(() => {
        $.each(Object.keys(toastQueue), (i,toastId)=>{
        let bread = toastQueue[toastId];
        i += $('ul.multi-toasts li').length + ($('ul.multi-toasts li').length ? 1 : 0); //gotta get this right
        console.log(i)
            setTimeout(() => {
                $('ul.multi-toasts').append(bread);
                setTimeout(() => {
                    let waitForNative,
                        toast = '*[data-dashboardplugins-toast-id="' + toastId + '"]',
                        checkPosition = setInterval(() => {
                        if ($(toast + ':first-child').length) {
                            clearInterval(checkPosition);
                            setTimeout(() => {
                                $(toast).addClass('fade-out')
                                setTimeout(() => {
                                    $(toast).remove()
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

window.addEventListener("keydown", (event) => { //temp
    switch(event.key) {
        case 'i' || 'I':
        postMessage('runtime', {queryStorage: 'remote'}, async(response) => {
            console.log('remote',response.data)
            asyncForEach(Object.keys(response.data.plugins), async(pluginId) => {
                postMessage('runtime', {installPlugin: [pluginId]})
            });
        });
        break;
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