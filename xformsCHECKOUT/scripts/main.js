window.onload = function(){

    var App = App || {};

    App.useDiffBilling = function(){

        var useDiffBilling = document.querySelector('#diff-billing'),
            newBilling = document.querySelector('.new-billing');

        useDiffBilling.addEventListener('change', function(){
            newBilling.classList.toggle('fade-in');
        });
    }
    App.useDiffBilling();
}
