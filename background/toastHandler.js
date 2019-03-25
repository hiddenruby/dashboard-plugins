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