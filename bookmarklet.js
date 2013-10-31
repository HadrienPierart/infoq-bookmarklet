// TODO : gérer la gestion des Tags de pied d'article
// Injecter automatiquemenet le titre
// Injecter automatiquement la source
// Injecter automatiquement l'auteur

(function () {
    if (document.URL.indexOf('www.infoq.com/') !== -1 || window.location.href.indexOf('www.infoq.com/') !== -1) {
        execute();
    } else {
        alert('This bookmarklet only works on infoQ pages.')
    }

    function execute() {
        if (!($ = window.jQuery)) {
            createScript('script', 'http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js', loadJQui, document.body);
        } else {
            loadJQui();
        }

        function loadJQui() {
            if (!(window.jQuery.ui)) {
                createScript('script', 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js', loadMarkdownLib, document.body);
                createScript('link', 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/themes/vader/jquery-ui.css', document.getElementsByTagName("head")[0])
            } else {
                loadMarkdownLib();
            }
        }

        function loadMarkdownLib() {

            if (typeof h2m === 'undefined') {
                createScript('script', 'https://rawgithub.com/domchristie/to-markdown/master/src/to-markdown.js', offWeGo, document.body);
            } else {
                offWeGo();
            }
        }

        function offWeGo() {
            var mdCopyPaste = $('<div id="markdownRendered"><textarea id="mdToCopy" cols="80" rows="40" style="display: block; margin: auto; padding: 10px;"></textarea></div>');
            mdCopyPaste.appendTo('body');

            var $markdownRendered = $('#markdownRendered');
            $markdownRendered.dialog({height: 600, width: 1000, modal: true});
            var textarea = $('#mdToCopy');

            textarea.val('Converting...');

            var htmlToParse = $('.text_content_container>.text_info').clone();
            htmlToParse = htmlToParse.find('.related_sponsors').remove().end()
                .find('.clear').remove().end()
                .find('#lowerFullwidthVCR').remove().end().html();

            htmlToParse = htmlToParse.replace(/img(.*?)src="(\/resource\/)/g, 'img$1src="http://www.infoq.com$2');

            var value = toMarkdown(htmlToParse.split('<div class="random_links">')[0]).replace(/&nbsp;/g, " ");
            textarea.val(value);
        }

        function createScript(type, url, whereToAppend, onloadCallback) {
            var ele = document.createElement(type);
            if (type === 'link') {
                ele.setAttribute("rel", "stylesheet");
                ele.setAttribute("type", "text/css");
                ele.setAttribute("href", url);
            } else {
                ele.src = url;
                ele.onload = onloadCallback;
            }
            whereToAppend.appendChild(ele);
        }
    }
})();
