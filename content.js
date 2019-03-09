(function($){

    let lang = $('html').attr('lang').split('-')[0],plugin = {
        main: {functions: {

            cfg: { //adds plug-in management section to dashboard settings page
        
                matches: ['.com/settings'],
                func:
        
                function(){
                    let cfg = setInterval(function(){
        
                        let descDash = $('.controls_section.controls_section_settings .controls_item_anchor[href="/settings/dashboard"] .small_text'),
                            descDashStr = plugin.main.str.general[lang].split('|')[0].toLowerCase();
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
                                        } else {
                                            clearInterval(cfg);
                                        }
                                    }
                                })
                            }
                    }
                    }, 1);
                },
            },
        
            update: { //checks for and performs plugin updates
        
                func:
        
                function(){                            
                    let sidebarNav = setInterval(function(){
                        if ($('.pinned_sidebar_footer .sidebar_nav_item#popover_legal').length) {
                            //$.ajax("https://hiddenruby.github.io/dashboard-plugins/plugins/eaud/eaud.json",{success: function(response) {console.log(response); $('html').innerHTML = response;}});
                            console.log(3);
                            $('.pinned_sidebar_footer .sidebar_nav_item#popover_legal').before($('.pinned_sidebar_footer .sidebar_nav_item#popover_legal').clone());
                            clearInterval(sidebarNav);
                        }
                    }, 1)
                }
            },
        },
        
        str: {
        
            cfg: {
        
                settings_group: {
        
                    de: "Niets geïnstalleerd|Voeg meer toe",
                    fr: "x|Ajouter plus",
                    it: "x|Aggiungere altro",
                    ja: "x|さらに追加",
                    tr: "x|Daha ekle",
                    es: "x|Añadir más",
                    ru: "x|Добавить больше",
                    pl: "x|Dodaj więcej",
                    pt: "x|Adicione mais",
                    nl: "Niets geïnstalleerd|Voeg meer toe",
                    ko: "x|더 추가하기",
                    zh: "x|添加更多",
                    id: "x|Tambah lagi",
                    hi: "x|अधिक जोड़ें",
                    en: "Nothing installed|Add more",
                },
            },
        
            general: {
        
                de: "Plugins|x",
                fr: "x|x",
                it: "x|x",
                ja: "x|x",
                tr: "x|x",
                es: "x|x",
                ru: "x|x",
                pl: "x|x",
                pt: "x|x",
                nl: "Plugins|x",
                ko: "플러그인|x",
                zh: "插件|x",
                id: "Pengaya|x",
                hi: "प्लगइन्स|x",
                en: "Plug-ins|What's this?",
            },
        },
        
        css: {
        
            cfg: {
        
                matches: ['.com/settings/dashboard'],
                sheet:
                    `.flag--dashboardPlugins .invis {
                        opacity: 0 !important;
                        pointer-events: none !important;
                    }
        
                    .flag--dashboardPlugins .inline_notification {
                        pointer-events: none;
                    }
        
                    .flag--dashboardPlugins .settings_group.dashboardPlugins-cfg {
                        min-height: 64px;
                    }
        
                    .flag--dashboardPlugins .settings_group.dashboardPlugins-cfg .setting {
                        padding-right: 50px;
                        margin-right: 0px;
                        background: white;
                        transition: .2s ease;
                    }
        
                    .flag--dashboardPlugins .settings_group.dashboardPlugins-cfg .setting.placeholder {
                        height: 0px;
                        margin: 0px;
                        color: #999;
                        transition-delay: .4s;
                        padding-left: 0px;
                    }
        
                    .flag--dashboardPlugins .settings_group.dashboardPlugins-cfg .setting.checkbox {
                        margin-bottom: 0px;
                        padding-bottom: 10px;
                    }
        
                    .flag--dashboardPlugins .settings_group.dashboardPlugins-cfg .setting.checkbox .help_text {
                        margin: 0 0 10px;
                    }
        
                    .flag--dashboardPlugins .settings_group.dashboardPlugins-cfg .setting.checkbox:last-of-type {
                        margin-bottom: -20px;
                        padding-bottom: 19px;
                    }
        
                    .flag--dashboardPlugins .settings_group.dashboardPlugins-cfg .setting.checkbox:last-of-type .help_text {
                        margin: 0px;
                        padding-bottom: 0px;
                    }
        
                    .flag--dashboardPlugins .settings_group.dashboardPlugins-cfg .setting.checkbox.invis {
                        transform: scale(0.7);
                    }
        
                    .flag--dashboardPlugins .settings_group.dashboardPlugins-cfg .setting .dashboardPlugins-btn {
                        top: 0px;
                        right: 53px;
                        transition-delay: .05s;
                    }
        
                    .flag--dashboardPlugins .settings_group.dashboardPlugins-cfg .dashboardPlugins-btn.icon_editor_plus {
                        font-size: 25px;
                        background: none;
                        color: #00cf35;
                        animation: dashboardPlugins-btn-grow .3s cubic-bezier(.175,.885,.32,1.275) .4s forwards;
                        top: -2px;
                        right: 27px;
                        pointer-events: all;
                    }
        
                    @keyframes dashboardPlugins-btn-grow {
                        100% {
                        transform: scale(1);
                        opacity: 1;
                        }
                    }
        
                    .flag--dashboardPlugins .settings_group.dashboardPlugins-cfg .dashboardPlugins-btn.icon_editor_plus:before {
                        left: -3px;
                    }
        
                    .flag--dashboardPlugins .dashboardPlugins-cfg .setting.checkbox:hover .dashboardPlugins-btn.icon_close {
                        transform: scale(1);
                        opacity: 1;
                        pointer-events: all;
                        transition-delay: 0s;
                    }`
            },
        
            sidebarNav: {
        
                matches: [
                    ".com/dashboard",
                    ".com/edit/",
                    ".com/reblog/",
                    ".com/blog/"
                ],
                sheet:
                    `.jsonContainer {
                        display:none;
                    }`
            },
        },}
    },

    init = 
    $('html').addClass('flag--dashboardPlugins');

    $.each(Object.keys(localStorage), function(i,id){ //load plug-ins into objects
        if (id.indexOf('dashboardPlugins-') > -1) {
            plugin[id.split('-')[1]] = new Object(JSON.parse(localStorage.getItem(id)));
        }
    });

    $.each(Object.keys(plugin), function(i,pluginId){

        if ('functions' in plugin[pluginId]) {
            $.each(Object.keys(plugin[pluginId].functions), function(i,funcId){pluginFunc(pluginId,funcId)});
        };

        if ('css' in plugin[pluginId]){
            let loadCSS = setInterval(function(){
                if ($('head').length) {
                    $.each(Object.keys(plugin[pluginId].css), function(i,cssId){pluginCSS(pluginId,cssId)})
                    clearInterval(loadCSS);
                }
            },1);
        };
    });
    
    function pluginFunc(pluginId,funcId){ //calls plug-in from function
        if (!('matches' in plugin[pluginId].functions[funcId]) || plugin[pluginId].functions[funcId].matches.some(function(i){return window.location.href.indexOf(i) > -1})){
            plugin[pluginId].functions[funcId].func = eval('(' + plugin[pluginId].functions[funcId].func + ')');
            plugin[pluginId].functions[funcId].func();
        }
    }

    function pluginCSS(pluginId,cssId){ //appends stylesheet from plugin
        if ($('link[href*="' + plugin[pluginId].css[cssId].replace + '"]').length
            || ((!('replace' in plugin[pluginId].css[cssId]) && !('matches' in plugin[pluginId].css[cssId]))
                || (('matches' in plugin[pluginId].css[cssId]) && plugin[pluginId].css[cssId].matches.some(function(i){return window.location.href.indexOf(i) > -1})))){
                    $('head').append($('<style>').attr({type: 'text/css', class: 'dashboardPlugins-' + pluginId + '-' + cssId}).text(plugin[pluginId].css[cssId].sheet))
                }
    };
            
})(jQuery)