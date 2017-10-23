// Injecter automatiquement la source
// FIXME : image avec un click to enlarge semble buggée. Voir le dom associé.
// TODO ajouter un loader
(function () {
  "use strict";

  var JQUERY = 'https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js';
  var JQUERY_UI = 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js';
  var JQUERY_UI_CSS = 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/themes/vader/jquery-ui.css';
  var HE_JS = 'https://cdn.rawgit.com/mathiasbynens/he/v0.5.0/he.js';
  var TO_MARKDOWN = 'https://cdn.rawgit.com/domchristie/to-markdown/v0.0.3/src/to-markdown.js';

  if (document.URL.indexOf('www.infoq.com/') !== -1 || window.location.href.indexOf('www.infoq.com/') !== -1) {
    execute();
  } else {
    alert('This bookmarklet only works on infoQ pages.')
  }

  function execute() {
    var templates = {
      news: "\n* URL: ${original_url}\n* Title: ${title}\n* Translator:\n* Topics: ${topics}\n* Summary (max 400 chars): ${summary}\n\n---------------------------------------\n\n",
      article: "\n* URL: ${original_url}\n* Title: ${title}\n* Translator:\n* Topics: ${topics}\n* Short Summary (200 chars max): ${summaryShort}\n* Summary (max 400 chars) : ${summary}\n\n---------------------------------------\n\n"
    };

    if (!($ = window.jQuery)) {
      var jqScript    = document.createElement('script');
      jqScript.src = JQUERY;
      jqScript.onload = loadJQui;
      document.body.appendChild(jqScript);
    }
    else {
      loadJQui();
    }

    function loadJQui() {
      if (!(window.jQuery.ui)) {
        var jquiScript = document.createElement('script');
        jquiScript.src = JQUERY_UI;
        jquiScript.onload = loadMarkdownLib;
        document.body.appendChild(jquiScript);

        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", JQUERY_UI_CSS);
        document.getElementsByTagName("head")[0].appendChild(fileref)
      }
      else {
        loadMarkdownLib();
      }
    }

    function loadMarkdownLib() {

      if (typeof h2m === 'undefined') {
        var script = document.createElement('script');
        script.src = HE_JS;
        script.onload = function() {
          var script2 = document.createElement('script');
          script2.src = TO_MARKDOWN;
          script2.onload = offWeGo;
          document.body.appendChild(script2);
        };
        document.body.appendChild(script);

      } else {
        offWeGo();
      }
    }

    function offWeGo() {
      var buttonStyles = 'position: absolute; top: 10px; left: 6px; text-align: center; background: #3498db; background-image: linear-gradient(to bottom, #3498db, #2980b9); border-radius: 10px; box-shadow: 2px 2px 2px #666666; font-family: Arial; color: #ffffff; font-size: 18px; padding: 5px 13px; border: solid #1f628d 2px; text-decoration: none; cursor:pointer;';

      var mdCopyPaste = $('<div id="markdownRendered">' +
          '<textarea id="mdToCopy" cols="80" rows="40" style="display: block; margin: auto; padding: 10px;"></textarea>' +
          '<button onclick="saveTextAsFile()" style="'+buttonStyles+'">Download</button>' +
      '</div>');
      mdCopyPaste.appendTo('body');

      var $markdownRendered = $('#markdownRendered');
      $markdownRendered.dialog({height: 600, width: 1000, modal: true});
      var textarea = $('#mdToCopy');

      textarea.val('Converting...');

      var TO_CLEAN = [
        'ul.sh_t',
        '#topInfo',
        '#header',
        '.article_page_right',
        '.related_sponsors',
        '.comment_here',
        '.bottomContent',
        '.comments',
        '.authModal',
        '.clear',
        '.follow__div',
        '.overlay_comments',
        '.all_comments',
        '.popupLoginComments',
        '#overlay_comments',
        '#lowerFullwidthVCR',
        '#responseContent',
        '#footer',
        'script'
      ];
      TO_CLEAN.forEach(function(it) {
        $(it).remove()
      });

      var htmlToParse = $('.text_content_container>.text_info').clone();
      htmlToParse = htmlToParse.html();

      htmlToParse = htmlToParse.replace(/<img(.*)src="(.*?)".*>/g, '<img src="$2"/>');
      htmlToParse = htmlToParse.replace(/&nbsp;/g, ' ');
      htmlToParse = htmlToParse.replace(/\u00a0/g, ' ');
      htmlToParse = htmlToParse.replace(/<pre\b[^>]*>([\w\W\s\S.]*?)<\/pre>/g, function (match, n1) {
        return ('\n' + n1 + '\n').replace(/<span[\s\S]*?>/g, '').replace(/<\/span>/g, ''); // Removes nested span inside pre blocks
      });

      var template = "";
      if(document.URL.indexOf('www.infoq.com/news')!==-1){
        template = templates.news;
      } else if(document.URL.indexOf('www.infoq.com/article')!==-1){
        template = templates.news;
      }

      var topics = [];
      $('.related__topics .follow__what').each(function(idx, ele){ topics.push($(ele).text()); });

      var value = template
          .replace(/\$\{title\}/g, document.title)
          .replace(/\$\{original_url\}/g, window.location.href)
          .replace(/\$\{topics\}/g, '\n    - ' + topics.join('\n    - ') + '\n')
          .replace(/\$\{summary\}/g, $('meta[name=description]').attr("content"));

      value += toMarkdown(htmlToParse.split('<div class="related">')[0]);
      value = value.replace(/<!--[\S\s.]*?-->/, '');

      $('.ui-dialog').zIndex(10000);
      textarea.val(value);
    }

    window.saveTextAsFile = function () {
      var textToWrite = document.getElementById("mdToCopy").value;
      var textFileAsBlob = new Blob([textToWrite], {type: 'text/plain'});
      var urlPath = window.location.pathname.split('/');
      var fileNameToSaveAs = urlPath[urlPath.length - 1] + '.md';

      var downloadLink = document.createElement("a");
      downloadLink.download = fileNameToSaveAs;
      downloadLink.innerHTML = "Download File";
      if (window.webkitURL != null) {
        // Chrome allows the link to be clicked
        // without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
      }
      else {
        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = function (evt) { document.body.removeChild(evt.target) };
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
      }

      downloadLink.click();
    }

  }
})();
// Injecter automatiquement la source
// FIXME : image avec un click to enlarge semble buggée. Voir le dom associé.