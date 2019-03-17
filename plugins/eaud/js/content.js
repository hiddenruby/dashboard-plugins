(function($,pluginId){
    let init = setInterval(function(){
        if ($('body.identity')) {
            $('body').toggleClass('flag--accessibility-design-update', false/*plugin[pluginId].settings.toggle*/);
            clearInterval(init);
        }
    },1);
})(jQuery)