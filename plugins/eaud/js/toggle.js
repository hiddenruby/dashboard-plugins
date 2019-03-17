(function($,pluginId,btnToggle){
    $(document).on('click', btnToggle, function(){
        $('body').toggleClass('flag--accessibility-design-update', plugin[pluginId].settings.toggle);
    })
})(jQuery)