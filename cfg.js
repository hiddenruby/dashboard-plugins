(async() => {
    let queryLocal = new Promise((resolve, reject) => {
            chrome.storage.local.get('plugins', (data)=> {
                if (!Object.keys(data).length) {
                    data.plugins = {};
                }
                resolve(data);
            });
        }),
        locale =    ()=>{ return $('html').attr('lang').split('-')[0] },
        localData = await queryLocal,
        cfg =       setInterval( async() =>{
            let descDash = $('.controls_section.controls_section_settings .controls_item_anchor[href="/settings/dashboard"] .small_text'),
                descDashStr = chrome.i18n.getMessage("pluginsWord").toLowerCase();
            if (descDash.length && descDash.text().indexOf(descDashStr) < 0) { //appends ', plug-ins' text to description of settings pages sidebar entry for 'Dashboard'
                descDash.append(', ' + descDashStr)
            }

            if ($('.settings_group.interface').length) { //create plug-ins section
                if (!$('.dashboardPlugins-cfg').length){
                    $('.settings_group.interface').after($('.settings_group.interface').clone().removeClass('interface').addClass('dashboardPlugins-cfg editor'));
                    $('.dashboardPlugins-cfg .setting:not(:last)').remove();
                    $('.dashboardPlugins-cfg .group_label').addClass('media-holder').append($('<span>').addClass('dashboardPlugins-btn media-button media-killer icon_editor_plus').attr('id','user_findPlugins'));
                    $('.dashboardPlugins-cfg .setting').removeClass('checkbox').addClass('placeholder media-holder' + (Object.keys(localData.plugins).length ? ' invis' : ''));
                    $('.dashboardPlugins-cfg .setting label').text(chrome.i18n.getMessage("cfg_nothingInstalled"));
                    $('.dashboardPlugins-cfg .setting .binary_switch').remove();
                    $('.dashboardPlugins-cfg .settings_subheading').text(chrome.i18n.getMessage("pluginsWord"));

                    $(document).on('click', '#user_findPlugins', function(){
                        window.location.href = '/dashboard/blog/dashboard-plugins';
                    });
                } else {
                    clearInterval(cfg);
                    asyncForEach(Object.keys(localData.plugins), function(pluginId){
                        if (!$('user_enable' + pluginId).length) {
                            let plugin = localData.plugins[pluginId];
                            if ('msg' in plugin && 'name' in plugin.msg) {
                                plugin.name = plugin.msg.name.message;
                            }
                            $('.dashboardPlugins-cfg .group_content ').append( (plugin.toggle_description != false) ? $('.interface .group_content > div p').closest('.checkbox').clone()
                                                                                                                : $('.interface .checkbox:last').clone());
                            $('.dashboardPlugins-cfg .checkbox:last').addClass('media-holder');
                            $('.dashboardPlugins-cfg .checkbox:last label:last').attr('for', 'user_enable_' + pluginId).text(plugin.name[locale()]).after($('<span>').addClass('dashboardPlugins-btn media-button media-killer settings-icon-hollow').attr('id','user_configure_' + pluginId));
                            if ($('.dashboardPlugins-cfg .checkbox:last p').length) {
                                $('.dashboardPlugins-cfg .checkbox:last p').text(plugin.description[locale()]);
                            };
                            $('.dashboardPlugins-cfg .checkbox:last input').prop('checked', false /*syncData[pluginId].settings.toggle*/).attr({id: 'user_enable_' + pluginId, name: 'user[enable_' + pluginId + ']'}).removeAttr('value');

                            $(document).on('click', 'user_configure_' + pluginId, function(){
                                //delete syncData.plugins[pluginId];
                                delete localData.plugins[pluginId];
                                //updateStorage();
                                $('#plugin_info_' + pluginId).closest('.setting').addClass('invis');
                                setTimeout(function(){
                                    $('user_configure_' + pluginId).closest('.setting').remove();
                                    if (!$('.dashboardPlugins-cfg .checkbox').length){
                                        $('.dashboardPlugins-cfg .setting.placeholder').removeClass('invis');
                                    }
                                }, 300)
                            });

                            $(document).on('click', '#user_enable_' + pluginId, function(){
                                //syncData[pluginId].settings.toggle = !syncData[pluginId].settings.toggle;
                                //updateStorage('sync')
                            })
                        }
                    })
                }
            }
        }, 1);

    async function asyncForEach(array, callback) {
        for (let i = 0; i < array.length; i++) {
            await callback(array[i], i, array);
        };
    };

})()
