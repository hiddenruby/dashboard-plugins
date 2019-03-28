(function($){
    $(document).bind('DOMNodeInserted', function(event) {
        $(event.target).find('.post_dismiss').closest('.post_container').attr({'data-dashboardplugins-influencer': 'dspa'})
    });
    let top = $(window).scrollTop();
    $(window).scroll(function(){
        $.each($('*[data-dashboardplugins-influencer="dspa"]'), function() {
            console.log(this)
            let btn = this.find('.post_dismiss'),
                postBottom = this.offset().top + this.outerHeight();
            if (postBottom < top){
                this.find('.post').addClass('is_audio');
                setTimeout(()=>{
                    if (postBottom < top){
                        btn.click()
                    };
                },5000)
            };
        });
    });
})(jQuery)
