(function() {

    function loadScriptFn(url) {
        var script = document.createElement("script");
        script.src = url;
        //script.onreadystatechange = callbackFn;
        //script.onload = callbackFn;
        script.async = false;
        document.head.appendChild(script);
    }

    loadScriptFn('vendor/jquery/jquery.min.js');
    loadScriptFn('vendor/angular/angular.1.6.min.js');
    loadScriptFn('vendor/tinymce/tinymce.min.js');
    loadScriptFn('vendor/tinymce/plugins/emojione/dist/emojione.picker.js');
    loadScriptFn('extended-rte.js');

}());