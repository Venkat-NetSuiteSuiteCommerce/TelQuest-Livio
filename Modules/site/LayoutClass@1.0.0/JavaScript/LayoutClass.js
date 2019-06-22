define("LayoutClass",function(){
    return {
        mountToApp: function(application){
            var Layout = application.getLayout();

            Layout.on('afterAppendView',function(view){
                if(!view.inModal){
                    var layoutClass = 'layout';

                    if(application.name === 'Checkout'){
                        layoutClass = 'checkout-layout';
                    }

                    Layout.$('#layout').removeClass().addClass(layoutClass).addClass('sec_'+view.template.Name);

                }
            });
        }
    }
});