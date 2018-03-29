(function() {

    function loadCssFn(url) {
        var link = document.createElement("link");
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.media = 'all';
        link.href = url;
        document.head.appendChild(link);
    }

    function loadScriptFn(url) {
        var script = document.createElement("script");
        script.src = url;
        //script.onreadystatechange = callbackFn;
        //script.onload = callbackFn;
        script.async = false;
        document.head.appendChild(script);
    }

    loadCssFn('vendor/tinymce/plugins/emojione/dist/emojione.sprites.css');
    loadCssFn('assets/css/stylesheets/rte.css');

    loadScriptFn('vendor/jquery/jquery.min.js');
    loadScriptFn('vendor/angular/angular.1.6.min.js');
    loadScriptFn('vendor/tinymce/tinymce.min.js');
    loadScriptFn('vendor/tinymce/plugins/emojione/dist/emojione.picker.js');
    loadScriptFn('extended-rte.js');

}());