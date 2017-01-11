(function($){

    $('.hide-sidebar-toggle').on('click', function(){
        $('.aside').toggleClass('hide');
    });

    $('.sidebar-left-toggle').on('click', function(){
        $('.aside').addClass('sidebar-left');
        $('.content').removeClass('column');
    });

    $('.sidebar-right-toggle').on('click', function(){
        $('.aside').removeClass('sidebar-left');
        $('.content').removeClass('column');
    });

    $('.no-sidebar-toggle').on('click', function(){
        $('.content').addClass('column');
    });

})( jQuery )
