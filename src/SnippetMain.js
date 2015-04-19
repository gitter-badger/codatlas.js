var serverUri = "ws://www.codatlas.com:9020/socket"
var SourcePageDecorator = require("./SourcepageDecorator.js");
var MetadataProcessor = require("./MetadataProcessor.js");
global.jQuery = require("jquery");
var $ = global.jQuery;
require("tooltipster")

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
            req.push(extractLine(b));
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
            jQuery('span').tooltipster( {

                functionInit: function(origin, content) {
                    $.ajax({
                        type: 'GET',
                        crossDomain: true,
                        beforeSend: function (request)
                        {
                            request.setRequestHeader("Access-Control-Request-Headers", "x-requested-with");
                            request.setRequestHeader("Access-Control-Allow-Origin", "http://codatlas.com");
                            request.setRequestHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
                        },
                        url: "http://codatlas.com/loadMetadata/github.com/openjdk-mirror/jdk7u-jdk/master/src/share/classes/java/lang/String.java",
                        success: function(data) {
                            origin.tooltipster('content', 'New content comes');
                        }
                    });
                    // this returned string will overwrite the content of the tooltip for the time being
                    return 'Wait while we load new content...';
                }
            }

            );
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
            window.open("http://www.codatlas.com/gotoNode/" + encodeURIComponent(id));
        }
    };

    if (metaDataDocument.nodes) {
        var symbolTbl = buildSymbolTbl(metaDataDocument.edges);
        $.each(metaDataDocument.nodes, function (i, node) {
            eventMap = {};
            if (symbolTbl.hasOwnProperty(node.signature)) {
                eventMap.click = nodeClickFuncMk(symbolTbl[node.signature]);
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
