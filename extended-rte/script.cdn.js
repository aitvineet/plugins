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

    loadCssFn('https://gitcdn.link/repo/vineet-atlogys/plugins/dev/extended-rte/vendor/tinymce/plugins/emojione/dist/emojione.sprites.css');
    loadCssFn('https://gitcdn.link/repo/vineet-atlogys/plugins/dev/extended-rte/assets/css/stylesheets/rte.css');

    loadScriptFn('https://gitcdn.link/repo/vineet-atlogys/plugins/dev/extended-rte/vendor/jquery/jquery.min.js');
    loadScriptFn('https://gitcdn.link/repo/vineet-atlogys/plugins/dev/extended-rte/vendor/angular/angular.1.6.min.js');
    loadScriptFn('https://gitcdn.link/repo/vineet-atlogys/plugins/dev/extended-rte/vendor/tinymce/tinymce.min.js');
    loadScriptFn('https://gitcdn.link/repo/vineet-atlogys/plugins/dev/extended-rte/vendor/tinymce/plugins/emojione/dist/emojione.picker.js');
    loadScriptFn('https://gitcdn.link/repo/vineet-atlogys/plugins/dev/extended-rte/extended-rte.js');

}());