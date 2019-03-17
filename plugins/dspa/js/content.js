(function($,pluginId){
    //if (plugin[pluginId].settings.toggle){
        $(window).scroll(function(){
            if ($('.post_dismiss').length) {
                let top = $(window).scrollTop(),
                    postBottom = $('.post_dismiss').parents().eq(5).offset().top + $('.post_dismiss').parents().eq(5).outerHeight() + 300;

                if (postBottom < top){
                    $('.post_dismiss').children().last()[0].click()
                };

                if (!$('.post_dismiss').length) {
                    postBottom = null;
                }
            }
        })
    //}
})(jQuery)