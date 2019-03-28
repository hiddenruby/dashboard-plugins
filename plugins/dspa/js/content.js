(function($){
    $(document).bind('DOMNodeInserted', (event) => {
        console.log($(event.target).find('.post_dismiss').length ? $('*[data-dashboardplugins-influencer="dspa"]').length ? 'bastard spotted' : '' : 'searching...')
        $(event.target).find('.post_dismiss').closest('.post_container').attr({'data-dashboardplugins-influencer': 'dspa'});
    });
    $(window).scroll(() => {
        $.each($('*[data-dashboardplugins-influencer="dspa"]'), (i,e) => {
            let top = $(window).scrollTop(),
                postBottom = $(e).offset().top + $(e).outerHeight();
            if (postBottom < top){
                console.log(!$(e).find('.is_audio') ? 'preparing attack ' + $(e).find('.post').attr('data-id') : '')
                $(e).find('.post').addClass('is_audio');
                setTimeout(() => {
                    if (postBottom < top){
                        console.log('taking out target',$(e).find('.post_dismiss'))
                        $(e).find('.post_dismiss').click()
                    };
                },5000)
            };
        });
    });
})(jQuery)
