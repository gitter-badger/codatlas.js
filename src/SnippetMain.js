var serverUri = "ws://www.codatlas.com:9020/socket"
var getNodeUri = "https://codatlas.com/getNode/"
var gotoNodeUri = "https://www.codatlas.com/gotoNode/"
var SourcePageDecorator = require("./SourcepageDecorator.js");
var MetadataProcessor = require("./MetadataProcessor.js");
global.jQuery = require("jquery");
var $ = global.jQuery;
require("tooltipster")

/**********
Cross domain helper
***********/
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {

    // Check if the XMLHttpRequest object has a "withCredentials" property.
    // "withCredentials" only exists on XMLHTTPRequest2 objects.
    xhr.open(method, url, true);

  } else if (typeof XDomainRequest != "undefined") {

    // Otherwise, check if XDomainRequest.
    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
    xhr = new XDomainRequest();
    xhr.open(method, url);

  } else {

    // Otherwise, CORS is not supported by the browser.
    xhr = null;

  }
  return xhr;
}

/**********
Codatlas request helper
***********/
function getNodeRequest(signature) {
  return getNodeUri + encodeURIComponent(signature)
}

function gotoNodeRequest(signature) {
  return gotoNodeUri + encodeURIComponent(signature);
}


// extract plain text from a code block
function extractLine (a) {
    return $(a).text();
}

// Every connection protocol can be plugged in by implementing
// request(blocks, successFunction).
function request(blocks, onSuccessFunction) {
    ws = new WebSocket(serverUri);

    ws.onopen = function() {
        var req = [];
        $.each(blocks, function(i, b) {
            var lang = $(b).attr("data-codatlas-lang");
            var a = {
                lang: lang,
                code: extractLine(b)
            };
            req.push(a);
        });
        ws.send(JSON.stringify(req));
    };

    ws.onmessage = function(ev) {
        var blockMetaDataList = JSON.parse(ev.data);
        var res = [];
        // append meta data to raw data
        $.each(blocks, function(i, block) {
            blockMetaData = blockMetaDataList[i];
            res.push({
                "block": block,
                "meta_data": blockMetaData
            });
        });
        onSuccessFunction(res);

        jQuery(function() {
            jQuery('.tooltip').tooltipster( {

                functionInit: function(origin, content) {
                    var signature = jQuery(origin).attr("signature");
                    if (!signature) return;
                    var url = getNodeRequest(signature);
                    var xhr = createCORSRequest('GET', url);
                    if (!xhr) {
                        return "can not load more info";
                    }

                    xhr.onload = function() {
                        var responseText = xhr.responseText;
                        var response = JSON.parse(responseText);
                        if (response.doc != undefined && response.doc) {
                          jQuery(origin).tooltipster({
                            multiple: true,
                            maxWidth: 700,
                            content: jQuery(jQuery.parseHTML(response.doc))
                          });
                        }
                    };

                    xhr.onerror = function() {
                        console.log('There was an error calling codatlas.com/getNode');
                    };

                    xhr.send();
                }
            });
        });
        ws.close();
    };

    ws.onclose = function() {
        console.log("closing websocket");
    };
}

// filter too long ot too short lines
function filterCodeBlocks (blocks) {
    var res = [];
    blocks.each(function(a, d) {
        var line = extractLine($(d));
        line.length > 50 && line.length < 1e4 && res.push(d);
    });
    return res;
}

// collect potential HTML blocks with code
function gatherCodeBlocks() {
    var raw_blocks =
        $("pre, code, .CodeMirror-lines, .dp-highlighter, .syntaxhighlighter")
        .filter("[data-codatlas-lang]")
        .filter(":visible")
        .filter(":not(pre *)")
        .filter(":not(.CodeMirror-lines *)")
        .filter(":not(.syntaxhighlighter *)")
        .filter(":not(.dp-highlighter *)");
    return filterCodeBlocks(raw_blocks);
}

var CODATLAS_USAGE_NODE_CLASSNAME = "ca-usage";
var CODATLAS_DEFINITION_NODE_CLASSNAME = "ca-definition";

var parseNodeClassName_ = function(kind) {
    if (kind == NodeKind.USAGE) return CODATLAS_USAGE_NODE_CLASSNAME;
    else return CODATLAS_DEFINITION_NODE_CLASSNAME;
};

// apply analyzed metadata to a DOM element.
function applyDecoration(i, decoratedBlock) {
    function buildSymbolTbl(edges) {
        var symbolTbl = {};
        $.each(edges, function(i, edge) {
            symbolTbl[edge.start_id] = edge.end_id;
        });
        return symbolTbl;
    }

    var block = decoratedBlock["block"];
    var metaData = decoratedBlock["meta_data"];

    metaDataDocument = MetadataProcessor.process(metaData);

    nodeClickFuncMk = function (id) {
        return function() {
            window.open(gotoNodeRequest(id));
        }
    };

    if (metaDataDocument.nodes) {
        var symbolTbl = buildSymbolTbl(metaDataDocument.edges);
        $.each(metaDataDocument.nodes, function (i, node) {
            eventMap = {};
            if (symbolTbl.hasOwnProperty(node.signature)) {
                node.signature = symbolTbl[node.signature];
                eventMap.click = nodeClickFuncMk(node.signature);

            } else {
                eventMap.click = nodeClickFuncMk(node.signature);
            }
            SourcePageDecorator.addSpanToDomTree(block, node, parseNodeClassName_(node.kind), eventMap);
        });
    }
}

// ask server for meta of the code blocks
function analyzeCodeBlocks(onSuccessFunction) {
    var blocks = gatherCodeBlocks();
    request(blocks, onSuccessFunction);
}

// decorate meta to existing node
function annoteCodeBlocks(annotatedBlocks) {
    $.each(annotatedBlocks, applyDecoration);
}


function run_snippet() {
    analyzeCodeBlocks(annoteCodeBlocks);
}
window.onload = run_snippet;
