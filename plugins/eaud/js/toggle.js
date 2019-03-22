(function($,pluginId,btnToggle){
    $(document).on('click', btnToggle, function(){
        $('body').toggleClass('flag--accessibility-design-update', !$('flag--accessibility-design-update'));
    })
})(jQuery)