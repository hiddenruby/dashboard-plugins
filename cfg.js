function loadCfg(plugins){
    let cfg =   setInterval(() =>{
                let descDash = $('.controls_section.controls_section_settings .controls_item_anchor[href="/settings/dashboard"] .small_text'),
                    descDashStr = chrome.i18n.getMessage("pluginsWord").toLowerCase();
                if (descDash.length && descDash.text().indexOf(descDashStr) < 0) { //appends ', plug-ins' text to description of settings pages sidebar entry for 'Dashboard'
                    descDash.append(', ' + descDashStr)
                }

                if ($('.settings_group.interface').length) { //create plug-ins section
                    if (!$('.dashboardPlugins-cfg').length){
                        $('.settings_group.interface').after(
                            $('.settings_group.interface').clone().removeClass('interface').addClass('dashboardPlugins-cfg editor')
                        );
                        $('.dashboardPlugins-cfg .setting:not(:last)').remove();
                        $('.dashboardPlugins-cfg .group_label').addClass('media-holder').append(
                            $('<span>').addClass('dashboardPlugins-tumblr-icon media-button media-killer').attr({
                                id:'user_findPlugins'
                            })
                        );
                        $('.dashboardPlugins-cfg .setting').removeClass('checkbox').addClass('placeholder media-holder' + (Object.keys(plugins).length ? ' invis' : ''));
                        $('.dashboardPlugins-cfg .setting label').text(chrome.i18n.getMessage("cfg_nothingInstalled"));
                        $('.dashboardPlugins-cfg .setting .binary_switch').remove();
                        $('.dashboardPlugins-cfg .settings_subheading').text(chrome.i18n.getMessage("pluginsWord"));

                        $(document).on('click', '#user_findPlugins', function(){
                            window.location.href = '/dashboard/blog/dashboard-plugins';
                        });
                    } else {
                        clearInterval(cfg);
                        asyncForEach(Object.keys(plugins), function(pluginId){
                            if (!$('#user_enable_' + pluginId).length) {
                                let plugin = plugins[pluginId];
                                if ('msg' in plugin && 'name' in plugin.msg) {
                                    plugin.name = plugin.msg.name.message;
                                }
                                $('.dashboardPlugins-cfg .group_content ').append(
                                    (plugin.toggle_description != false) ?
                                    $('.interface .group_content > div p').closest('.checkbox').clone() :
                                    $('.interface .checkbox:last').clone()
                                );
                                $('.dashboardPlugins-cfg .checkbox:last').addClass('media-holder');
                                $('.dashboardPlugins-cfg .checkbox:last label:last').attr({
                                    'for': 'user_enable_' + pluginId
                                }).text(
                                    plugin.name[locale()]
                                ).after(
                                    $('<span>').addClass('dashboardPlugins-tumblr-icon media-button media-killer settings-icon-hollow').attr({
                                        id: 'user_configure_' + pluginId
                                    })
                                );
                                if ($('.dashboardPlugins-cfg .checkbox:last p').length) {
                                    $('.dashboardPlugins-cfg .checkbox:last p').text(plugin.description[locale()]);
                                };
                                $('.dashboardPlugins-cfg .checkbox:last input').prop('checked', false /*syncData[pluginId].settings.toggle*/).attr({
                                    id: 'user_enable_' + pluginId,
                                    name: 'user[enable_' + pluginId + ']',
                                    value: ''
                                });

                                $(document).on('click', '#user_configure_' + pluginId, function(){
                                    pluginDrawer(plugin,pluginId);
                                    /*
                                    $('#plugin_info_' + pluginId).closest('.setting').addClass('invis');
                                    setTimeout(function(){
                                        $('user_configure_' + pluginId).closest('.setting').remove();
                                        if (!$('.dashboardPlugins-cfg .checkbox').length){
                                            $('.dashboardPlugins-cfg .setting.placeholder').removeClass('invis');
                                        }
                                    }, 300)
                                    */
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
}

function pluginDrawer(plugin,pluginId) {
    if (!$('body.peepr').length) {
        $('body').removeClass('flag--always-opaque-peepr')
        let installDate = formatDate(new Date(plugin.installDate));
        $('body').append(
            $('<div>').attr({
                class: 'ui_peepr_glass',
                'data-dashboardplugins-owner': 'main',
                style: 'opacity: 0'
            }),
            $('<div>').attr({
                class: 'drawer peepr-drawer-container plugin-cfg-drawer',
                'data-dashboardplugins-owner': 'main'
            }).append(
                $('<div>').attr({
                    class:'peepr-drawer'
                }).append(
                    $('<div>').attr({
                        class:'peepr-body'
                    }).append(
                        $('<div>').attr({
                            class:'indash_blog'
                        }).append(
                            $('<div>').attr({
                                class:'header'
                            }).append(
                                $('<div>').attr({
                                    class:'indash_header_wrapper has_info no_header_image'
                                }).append(
                                    $('<div>').attr({
                                        class: 'navigation'
                                    }).append(
                                        $('<div>').attr({
                                            class: 'navigation_inner'
                                        }).append(
                                            $('<h3>').append(
                                                $('<a>').attr({
                                                    class: 'blog_name',
                                                    href: plugin.source,
                                                    target: '_blank'
                                                }).append(
                                                    $('<span>').attr({
                                                        class: 'name'
                                                    }).text(
                                                        plugin.name[locale()]
                                                    ),
                                                    $('<span>').attr({
                                                        class: 'full_url'
                                                    }).text(
                                                        plugin.source
                                                    )
                                                )
                                            ),
                                            $('<div>').attr({
                                                class: 'header_controls'
                                            }).append(
                                                $('<a>').attr({
                                                    class: 'open_blog_button nav_icon icon_export',
                                                    href: plugin.source,
                                                    target: '_blank'
                                                }),
                                                $('<button>').attr({
                                                    class: 'chrome white delete big',
                                                    type: 'button'
                                                }).text(
                                                    'Remove plug-in'
                                                )
                                            )
                                        )
                                    ),
                                    $('<div>').attr({
                                        class:'avatar square invis'
                                    }).append(                  
                                        $('<img>').attr({
                                            src:''
                                        })
                                    ),
                                    $('<div>').attr({
                                        class:'info_wrapper'
                                    }).append(
                                        $('<div>').attr({
                                            class:'info'
                                        }).append(
                                            $('<h1>').attr({
                                                class:'title'
                                            }).text(
                                                plugin.name[locale()]
                                            ),
                                            $('<div>').attr({
                                                class:'description'
                                            }).append(
                                                $('<div>').attr({
                                                    class:'description_inner'
                                                }).text(
                                                    plugin.description[locale()]
                                                )
                                            )
                                        )
                                    )
                                )
                            ),
                            $('<div>').attr({
                                class:'keycommand-guide'
                            }).append(
                                $('<ul>').attr({
                                    class:'keycommand-guide-section'
                                }).append(
                                    $('<li>').attr({
                                        class:'section_header'
                                    }).text(
                                        'details'
                                    ),
                                    $('<li>').attr({
                                        class:'keycommand-guide-section-item'
                                    }).append(
                                        $('<div>').attr({
                                            class:'controls-item'
                                        }).text(
                                            'Repository'
                                        ),
                                        $('<span>').attr({
                                            class:'shortcut'
                                        }).append(
                                            $('<b>').attr({
                                                class:'key'
                                            }).text(
                                                plugin.repo
                                            )
                                        )
                                    ),
                                    $('<li>').attr({
                                        class:'keycommand-guide-section-item'
                                    }).append(
                                        $('<div>').attr({
                                            class:'controls-item'
                                        }).text(
                                            'Author'
                                        ),                         
                                        $('<span>').attr({
                                            class:'shortcut'
                                        }).append(
                                            $('<b>').attr({
                                                class:'key'
                                            }).text(
                                                plugin.author
                                            )
                                        )
                                    ),
                                    $('<li>').attr({
                                        class:'keycommand-guide-section-item'
                                    }).append(
                                        $('<div>').attr({
                                            class:'controls-item'
                                        }).text(
                                            'Version'
                                        ),                         
                                        $('<span>').attr({
                                            class:'shortcut'
                                        }).append(
                                            $('<b>').attr({
                                                class:'key'
                                            }).text(
                                                plugin.version
                                            )
                                        )
                                    ),
                                    $('<li>').attr({
                                        class:'keycommand-guide-section-item'
                                    }).append(
                                        $('<div>').attr({
                                            class:'controls-item'
                                        }).text(
                                            'Last updated'
                                        ),
                                        $('<span>').attr({
                                            class:'shortcut'
                                        }).append(
                                            $('<b>').attr({
                                                class:'key'
                                            }).text(
                                                installDate
                                            )
                                        )
                                    ),/*
                                    $('<li>').attr({
                                        class:'keycommand-guide-section-item'
                                    }).append(
                                        $('<div>').attr({
                                            class:'controls-item'
                                        }).text(
                                            'Locales'
                                        ),                         
                                        $('<span>').attr({
                                            class:'shortcut'
                                        }).append(
                                            $('<b>').attr({
                                                class:'key'
                                            }).text(
                                                Object.keys(plugin.name).toString().toLocaleUpperCase().replace(/,/g,", ")
                                            )
                                        )
                                    ),*/
                                ),
                                $('<ul>').attr({
                                    class:'keycommand-guide-section'
                                }).append(
                                    $('<li>').attr({
                                        class:'section_header'
                                    }).text(
                                        'preferences'
                                    ),/*
                                    $('<li>').attr({
                                        class:'keycommand-guide-section-item'
                                    }).append(
                                        $('<div>').attr({
                                            class:'controls-item'
                                        }).text(
                                            'Enabled'
                                        ),                         
                                        $('<label>').attr({
                                            class:'binary_switch'
                                        }).append(
                                            $('<input>').attr({
                                                type:'checkbox',
                                                name: 'user[enable_' + pluginId + ']',
                                                id: 'user_enable_' + pluginId,
                                                checked: ''
                                            }),
                                            $('<span>').attr({
                                                class:'binary_switch_track'
                                            }),
                                            $('<span>').attr({
                                                class:'binary_switch_button'
                                            })
                                        )
                                    ),*/
                                    $('<li>').attr({
                                        class:'keycommand-guide-section-item'
                                    }).append(
                                        $('<div>').attr({
                                            class:'controls-item'
                                        }).text(
                                            'Keep up to date'
                                        ),                         
                                        $('<label>').attr({
                                            class:'binary_switch'
                                        }).append(
                                            $('<input>').attr({
                                                type:'checkbox',
                                                name: 'user[update_' + pluginId + ']',
                                                id: 'user_update_' + pluginId,
                                                checked: ''
                                            }),
                                            $('<span>').attr({
                                                class:'binary_switch_track'
                                            }),
                                            $('<span>').attr({
                                                class:'binary_switch_button'
                                            })
                                        )
                                    ),
                                    $('<li>').attr({
                                        class:'keycommand-guide-section-item'
                                    }).append(
                                        $('<div>').attr({
                                            class:'controls-item'
                                        }).text(
                                            'Save to Chrome Sync'
                                        ),                         
                                        $('<label>').attr({
                                            class:'binary_switch'
                                        }).append(
                                            $('<input>').attr({
                                                type:'checkbox',
                                                name: 'user[sync_' + pluginId + ']',
                                                id: 'user_sync_' + pluginId,
                                                checked: ''
                                            }),
                                            $('<span>').attr({
                                                class:'binary_switch_track'
                                            }),
                                            $('<span>').attr({
                                                class:'binary_switch_button'
                                            })
                                        )
                                    ),
                                ),
                                $('<ul>').attr({
                                    class:'keycommand-guide-section'
                                }).append(
                                    $('<li>').attr({
                                        class:'section_header'
                                    }).text(
                                        'configuration'
                                    ),
                                )
                            )
                        )
                    )
                )
            )
        )
        setTimeout(() => {
            $('body').addClass('peepr peepr--dashboardPlugins-plugincfg');
            $('.ui_peepr_glass[data-dashboardplugins-owner="main"]').attr({
                style: 'opacity: 1'
            });
            $('.drawer.peepr-drawer-container.plugin-cfg-drawer .peepr-body .indash_blog .header .indash_header_wrapper.has_info .avatar').removeClass('invis');
            $('.drawer.peepr-drawer-container[data-dashboardplugins-owner="main"]').addClass('open');
        },100);
        $(document).on('click', '.ui_peepr_glass[data-dashboardplugins-owner="main"]', function(){
            $('body').removeClass('peepr');
            $('.ui_peepr_glass[data-dashboardplugins-owner="main"]').attr({
                style: 'opacity: 0'
            })
            $('.drawer.peepr-drawer-container[data-dashboardplugins-owner="main"]').removeClass('open');
            setTimeout(() => {
                $('.drawer.peepr-drawer-container[data-dashboardplugins-owner="main"]').remove();
                $('.ui_peepr_glass[data-dashboardplugins-owner="main"]').remove();
            },500)
        });
        $(document).on('click', '.drawer.peepr-drawer-container[data-dashboardplugins-owner="main"] .delete', function(){
            $('body').removeClass('peepr peepr--dashboardPlugins-plugincfg');
            $('.ui_peepr_glass[data-dashboardplugins-owner="main"]').attr({
                style: 'opacity: 0'
            })
            $('.drawer.peepr-drawer-container[data-dashboardplugins-owner="main"]').removeClass('open');
            setTimeout(() => {
                $('.drawer.peepr-drawer-container[data-dashboardplugins-owner="main"]').remove();
                $('.ui_peepr_glass[data-dashboardplugins-owner="main"]').remove();
            },500)
            setTimeout(() => {
                $('#user_configure_' + pluginId).closest('.setting').addClass('invis');
                setTimeout(function(){
                    $('#user_configure_' + pluginId).closest('.setting').remove();
                    if (!$('.dashboardPlugins-cfg .checkbox').length){
                        $('.dashboardPlugins-cfg .setting.placeholder').removeClass('invis');
                    }
                }, 300);
            },300);
        });
    }
}