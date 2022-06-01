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

    var repoPath = 'https://gitcdn.link/repo/aitvineet/plugins/dev/extended-rte/';

    loadCssFn(repoPath + 'vendor/tinymce/plugins/emojione/dist/emojione.sprites.css');
    loadCssFn(repoPath + 'assets/css/stylesheets/rte.css');

    loadScriptFn(repoPath + 'vendor/jquery/jquery.min.js');
    loadScriptFn(repoPath + 'vendor/angular/angular.1.6.min.js');
    loadScriptFn(repoPath + 'vendor/tinymce/tinymce.min.js');
    loadScriptFn(repoPath + 'vendor/tinymce/plugins/emojione/dist/emojione.picker.js');
    loadScriptFn(repoPath + 'extended-rte.js');

}());