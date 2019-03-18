(function($){
    let cfg = setInterval(function(){

        let descDash = $('.controls_section.controls_section_settings .controls_item_anchor[href="/settings/dashboard"] .small_text'),
            descDashStr = msg('cfg','pluginsWord');
        if (descDash.length && descDash.text().indexOf(descDashStr) < 0) { //appends ', plug-ins' text to description of settings pages sidebar entry for 'Dashboard'
            descDash.append(', ' + descDashStr)
        }

        if ($('.settings_group.interface').length) { //create plug-ins section
            if (!$('.dashboardPlugins-cfg').length){
                $('.settings_group.interface').after($('.settings_group.interface').clone().removeClass('interface').addClass('dashboardPlugins-cfg editor'));
                $('.dashboardPlugins-cfg .setting:not(:last)').remove();
                $('.dashboardPlugins-cfg .group_label').addClass('media-holder').append($('<span>').addClass('dashboardPlugins-btn media-button media-killer icon_editor_plus').attr('id','user_findPlugins'));
                $('.dashboardPlugins-cfg .setting').removeClass('checkbox').addClass('placeholder media-holder' + (Object.keys(plugin).length > 1 ? ' invis' : ''));
                $('.dashboardPlugins-cfg .setting label').text(plugin.main.str.cfg.settings_group[lang].split('|')[0]);
                $('.dashboardPlugins-cfg .setting .binary_switch').remove();
                $('.dashboardPlugins-cfg .settings_subheading').text(plugin.main.str.general[lang].split('|')[0]);

                $(document).on('click', '#user_findPlugins', function(){
                    window.location.href = '/dashboard/blog/dashboard-plugins';
                });
            } else {
                clearInterval(cfg);
            }
            $.each(Object.keys(plugin), function(index, id){
                if (id !== 'main') {
                    if (!$('#user_enable_' + id).length && $('.dashboardPlugins-cfg.group_content').length !== plugin.length){
                        if('str' in plugin[id]){ //populate plug-ins section
                            $('.dashboardPlugins-cfg .group_content').append( plugin[id].str[lang].indexOf('|') > -1 ? $('.interface .group_content > div p').closest('.checkbox').clone()
                                                                                                                        : $('.interface .checkbox:last').clone());
                            $('.dashboardPlugins-cfg .checkbox:last').addClass('media-holder').append($('<span>').addClass('dashboardPlugins-btn media-button media-killer icon_close').attr('id','user_uninstall_' + id));
                            $('.dashboardPlugins-cfg .checkbox:last label:last').attr('for', 'user_enable_' + id).text( plugin[id].str[lang].split('|')[0] );
                            if ($('.dashboardPlugins-cfg .checkbox:last p').length) {
                                $('.dashboardPlugins-cfg .checkbox:last p').text( plugin[id].str[lang].split('|')[1])
                            };
                            $('.dashboardPlugins-cfg .checkbox:last input').prop('checked', plugin[id].pref.toggle).attr({id: 'user_enable_' + id, name: 'user[enable_' + id + ']'}).removeAttr('value');

                            $(document).on('click', '#user_uninstall_' + id, function(){
                                localStorage.removeItem('dashboardPlugins-' + id);
                                $('#user_uninstall_' + id).closest('.setting').addClass('invis');
                                setTimeout(function(){
                                    $('#user_uninstall_' + id).closest('.setting').remove();
                                    if (!$('.dashboardPlugins-cfg .checkbox').length){
                                        $('.dashboardPlugins-cfg .setting.placeholder').removeClass('invis');
                                    }
                                }, 300)
                            });

                            $(document).on('click', '#user_enable_' + id, function(){
                                plugin[id].pref.toggle = !plugin[id].pref.toggle;
                                localStorage.setItem('dashboardPlugins-' + id, JSON.stringify(plugin[id], function(key, value) {
                                    return (typeof value === 'function' ? value.toString() : value );
                                }));
                                if ('func' in plugin[id]) {
                                    plugin[id].func(plugin[id].pref.toggle)
                                }
                            })
                        }
                    }
                }
            })
        }
    }, 1);
})(jQuery)
