(function(pluginId){
    $(document).bind('DOMNodeInserted', function(event) {
        $.each($(event.target).find('.audio-image'), function(i,e){
            $(e).toggleClass('play-pause', plugin[pluginId].settings.toggle);
        })
    })
})