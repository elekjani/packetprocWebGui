$(window).load(function() {
	$("#statusBar").pinFooter();
});

$(window).resize(function() {
	$("#statusBar").pinFooter();
});


function webStatus(status) {
    if (status) {
        $('#webStatus').removeClass('status-failure').addClass('status-success');
    } else {
        $('#webStatus').removeClass('status-success').addClass('status-failure');
    }
}