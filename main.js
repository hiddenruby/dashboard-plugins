let toastObserver = new MutationObserver(pushToast);
jQueryAdd();
addFlag();
callBackgroundFunction({queryPlugins: ''});

async function loadPlugin(plugin){
    return new Promise((resolve, reject) => {
        let pluginId = Object.keys(plugin)[0],
            pluginPath = 'plugins/' + pluginId + '/';
        plugin = plugin[pluginId];
        if ($('*[data-dashboardplugins-owner="' + pluginId + '"]').length) {
            resolve({[pluginId]:'not newer'});
        }
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
        resolve({[pluginId]:'loaded'});
    });
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
        case 'e' || 'E':
        callBackgroundFunction({queryStorage: 'remote'}, async(response) => {
            callBackgroundFunction({installPlugin: 'eaud'})
        });
        break;
        case 'a' || 'A':
        callBackgroundFunction({queryStorage: 'remote'}, async(response) => {
            callBackgroundFunction( {installPlugin: 'aapp'})
        });
        break;
        case 'd' || 'D':
        callBackgroundFunction({queryStorage: 'remote'}, async(response) => {
            callBackgroundFunction({installPlugin: 'dspa'})
        });
        break;
    };
})

async function jQueryAdd() {
    return new Promise((resolve, reject) => {
        let tryAdd = setInterval(() => {
            if ($('head')) {
                clearInterval(tryAdd);
                $('head').append($('<script async>').attr({type: 'text/javascript', 'data-dashboardplugins-owner':'main', src: jQueryURL}));
            };
        },1);
    });
};

function addFlag(flagId) {
    flagId = 'flag--dashboardPlugins' + (flagId ? '-' + flagId : '');
    $('html').addClass(flagId);
};