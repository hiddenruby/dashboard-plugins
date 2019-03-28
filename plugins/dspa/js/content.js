(function($){
    $(window).scroll(() => {
        $.each($('.post_container').find('.post_dismiss'), (i,e) => {
            let top = $(window).scrollTop(),
                postBottom = $(e).offset().top + $(e).outerHeight();
            $(e).find('.post').addClass('is_audio');
            if (postBottom + 300 < top){
                $(e).find('.icon_close').click()
            };
        });
    });
})(jQuery)
