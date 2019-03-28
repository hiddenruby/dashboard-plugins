(function($){
    $(document).bind('DOMNodeInserted', (event) => {
        console.log('ooo')
        $(event.target).find('.post_dismiss').closest('.post_container').attr({'data-dashboardplugins-influencer': 'dspa'})
    });
    let top = $(window).scrollTop();
    $(window).scroll(() => {
        $.each($('*[data-dashboardplugins-influencer="dspa"]'), (i) => {
            console.log('bastard spotted',$('*[data-dashboardplugins-influencer="dspa"]')[i].find('.post').attr('data-id'))
            let postBottom = $('*[data-dashboardplugins-influencer="dspa"]')[i].offset().top + $('*[data-dashboardplugins-influencer="dspa"]')[i].outerHeight();
            if (postBottom < top){
                console.log('preparing attack',$('*[data-dashboardplugins-influencer="dspa"]')[i].find('.post').attr('data-id'))
                $('*[data-dashboardplugins-influencer="dspa"]')[i].find('.post').addClass('is_audio');
                setTimeout(() => {
                    if (postBottom < top){
                        console.log('taking out target',$('*[data-dashboardplugins-influencer="dspa"]')[i].find('.post').attr('data-id'))
                        $('*[data-dashboardplugins-influencer="dspa"]')[i].find('.post_dismiss').click()
                    };
                },5000)
            };
        });
    });
})(jQuery)
