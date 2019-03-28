(($) => {
    $(document).bind('DOMNodeInserted', (event) => {
        $(event.target).find('.post_dismiss').closest('.post_container').attr({'data-dashboardplugins-influencer': 'dspa'})
    });
    let top = $(window).scrollTop();
    $(window).scroll(() => {
        $.each($('*[data-dashboardplugins-influencer="dspa"]'), () => {
            console.log(this)
            let postBottom = this.offset().top + this.outerHeight();
            if (postBottom < top){
                this.find('.post').addClass('is_audio');
                setTimeout(() => {
                    if (postBottom < top){
                        this.find('.post_dismiss').click()
                    };
                },5000)
            };
        });
    });
})(jQuery)
