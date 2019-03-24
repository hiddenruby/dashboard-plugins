let toastObserver = new MutationObserver(pushToast);

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
                    $('<span>').attr({class: 'toast-bread', style: 'padding-right: 0px;'}).append(
                        msgPre, msgSubject, msgAp
                    )
                );
    !localData.toast ? localData.toast = {} : '';
    Object.assign(localData.toast,{[toastId]:bread[0]});
    updateStorage('local');
}

function observeToast() {
    if ($('.sidebar_nav.clearfix.visible').length || $('.drawer.peepr-drawer-container.open').length) {
        let target = document.body;
        toastObserver.observe(target, {childList: true, subtree: true});
    } else {
        pushToast();
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