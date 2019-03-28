(function($){
    $(document).bind('DOMNodeInserted', (event) => {
        console.log('rrr')
        $(event.target).find('.post_dismiss').closest('.post_container').attr({'data-dashboardplugins-influencer': 'dspa'})
    });
    $(window).scroll(() => {
        $.each($('*[data-dashboardplugins-influencer="dspa"]'), (i,e) => {
            console.log('bastard spotted',$(e).find('.post').attr('data-id'))
            let top = $(window).scrollTop(),
                postBottom = $(e).offset().top + $(e).outerHeight();
            if (postBottom < top){
                console.log('preparing attack',$(e).find('.post').attr('data-id'))
                $(e).find('.post').addClass('is_audio');
                setTimeout(() => {
                    if (postBottom < top){
                        console.log('taking out target',$(e).find('.post').attr('data-id'))
                        $(e).find('.post_dismiss').click()
                    };
                },5000)
            };
        });
    });
})(jQuery)
