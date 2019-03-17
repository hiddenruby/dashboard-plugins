(function(){
    console.log('test')
        $(document).bind('DOMNodeInserted', function(event) {
            $.each($(event.target).find('.audio-image'), function(i,e){
                $(e).addClass('play-pause');
            })
        })
})