$(document).bind('DOMNodeInserted', (event) => {
    console.log('ay')
    $(event.target).find('.post_dismiss').closest('.post_container').attr({'data-dashboardplugins-influencer': 'dspa'})
});
let scrollTop = $(window).scrollTop();
$(window).scroll(() => {
    $.each($('*[data-dashboardplugins-influencer="dspa"]'), (i) => {
        console.log('bastard spotted',$(this).find('.post').attr('data-id'))
        let postBottom = $(this).offset().scrollTop + $(this).outerHeight();
        if (postBottom < scrollTop){
            console.log('preparing attack',$(this).find('.post').attr('data-id'))
            $(this).find('.post').addClass('is_audio');
            setTimeout(() => {
                if (postBottom < scrollTop){
                    console.log('taking out target',$(this).find('.post').attr('data-id'))
                    $(this).find('.post_dismiss').click()
                };
            },5000)
        };
    });
});
