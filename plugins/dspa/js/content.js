(function($){
    $(document).bind('DOMNodeInserted', function(event) {
        $.each($(event.target).find('.post_dismiss'), function(i,e){
            $(window).scroll(function(){
                if ($('.post_dismiss').length) {
                    let top = $(window).scrollTop(),
                        post = $('.post_dismiss').closest('.post_container'),
                        postBottom = post.offset().top + post.outerHeight() + 300;
                    if (postBottom < top){
                        $('.post_dismiss .icon_close[data-dashboardplugins-influencer!="aapp"]').attr({'data-dashboardplugins-influencer':'aapp'}).click()
                    };
                }
            })
        })
    })
})(jQuery)
