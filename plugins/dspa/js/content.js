(function($){
    $(window).scroll(() => {
        $.each($('.post_container').find('.post_dismiss'), (i,e) => {
            let top = $(window).scrollTop(),
                container = $(e).closest('.post_container'),
                containerBottom = $(container).offset().top + $(container).outerHeight();
            $(container).find('.post').addClass('is_audio');
            if (containerBottom + 300 < top){
                $(e).find('.icon_close').click()
            };
        });
    });
})(jQuery)
