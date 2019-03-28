(function($){
    $(document).bind('DOMNodeInserted', (event) => {
        console.log($(event.target).find('.post_dismiss').length ? !$('*[data-dashboardplugins-influencer="dspa"]').length ? 'bastard spotted' : nop : 'searching...')
        $(event.target).find('.post_dismiss').closest('.post_container').attr({'data-dashboardplugins-influencer': 'dspa'});
    });
    $(window).scroll(() => {
        $.each($('*[data-dashboardplugins-influencer="dspa"]'), (i,e) => {
            let top = $(window).scrollTop(),
                postBottom = $(e).offset().top + $(e).outerHeight();
            if (postBottom < top){
                if (!$(e).find('.is_audio')) {
                    console.log('preparing attack')
                    $(e).find('.post').addClass('is_audio');
                }
                setTimeout(() => {
                    if (postBottom < top){
                        console.log('taking out target',$(e).find('.icon_close'))
                        $(e).find('.icon_close').click()
                    };
                },5000)
            };
        });
    });
})(jQuery)
