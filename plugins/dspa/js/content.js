(function($){
    $(document).bind('DOMNodeInserted', function(event) {
        $(event.target).find('.post_dismiss').closest('.post_container').attr({'data-dashboardplugins-influencer': 'dspa'})
    });
    let top = $(window).scrollTop();
    $(window).scroll(function(){
        $.each($('*[data-dashboardplugins-influencer="dspa"]'), function(i,post) {
            let btn = post.find('.post_dismiss'),
                postBottom = post.offset().top + post.outerHeight();
            if (postBottom < top){
                post.addClass('is_audio')
                setTimeout(()=>{
                    if (postBottom < top){
                        btn.click()
                    };
                },5000)
            };
        });
    });
})(jQuery)
