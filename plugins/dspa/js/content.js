(function($,pluginId){
    //if (plugin[pluginId].settings.toggle){
        $(window).scroll(function(){
            if ($('.post_dismiss').length) {
                let top = $(window).scrollTop(),
                    postBottom = $('.post_dismiss').parents().eq(5).offset().top + $('.post_dismiss').parents().eq(5).outerHeight() + 300;

                if (postBottom < top){
                    $('.post_dismiss[data-dashboardplugins-influencer^="aapp"]').attr({'data-dashboardplugins-influencer':'aapp'}).children().last()[0].click()
                };
            }
        })
    //}
})(jQuery)