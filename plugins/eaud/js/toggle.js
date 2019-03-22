(function($,pluginId,btnToggle){
    $(document).on('click', '#user_enable_eaud', function(){
        $('body').toggleClass('flag--accessibility-design-update', ()=>{ return !$('flag--accessibility-design-update').length });
    })
})(jQuery)