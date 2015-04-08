  var _ = require("underscore");
  var $ = require("jquery");

  var addSpanToDomTree = function(domTree, node, clsName, eventMap) {
    if (domTree.lambdaRange == undefined) {
      addRangeToDomTree_(domTree, 0);
    }
    var range = {start: node.range.start_loc.offset, end: node.range.end_loc.offset};

    addSpanToDomTree_(domTree, range, clsName, node.signature, eventMap);
  };

  var addSpanToDomTreeByLine = function(domTree, node, clsName, eventMap) {
    if (domTree.lambdaRange == undefined) {
      addRangeToDomTree_(domTree, 0);
    }
    var range = {start: node.range.start_loc.column, end: node.range.end_loc.column};

    addSpanToDomTree_(domTree, range, clsName, node.signature, eventMap);
  };

  // traverse a dom tree and add the given span to it
  var addSpanToDomTree_ = function(domTree, range, clsName, signature, eventMap) {
    var lambdaRange = domTree.lambdaRange;
    var intersectRange = intersectRange_(lambdaRange, range);
    if (intersectRange == 1 || intersectRange == -1) {
      return; //out of range, nothing to do and trim the current branch
    }

    // for each text node, it can be broken and replaced by up to 3 nodes: 1/0 text node before the span,
    // the annotated span and 1/0 text node after the span
    if (domTree.nodeType == 3) {// this is a text node, we should actually add span
      var parentNode = domTree.parentNode;
      var textContent = domTree.textContent;
      var nodesToAdd = [];
      if (lambdaRange.start != intersectRange.start) { // need to create a text node before the newly added span
        var newNode = document.createTextNode(textContent.substring(0, intersectRange.start - lambdaRange.start));
        newNode.lambdaRange = {start: lambdaRange.start, end: intersectRange.start};
        nodesToAdd.push(newNode);
        // take care to correctly set lambdaRange for new node too
      }

      var spanNode = $("<span>").
        addClass(clsName).attr("signature", signature).
        text(textContent.substring(
          intersectRange.start - lambdaRange.start,
          intersectRange.end - lambdaRange.start)
        );

      for(var eventName in eventMap) {
        spanNode.on(eventName, eventMap[eventName]);
      }

      // convert back to javascript DOM node
      spanNode = spanNode[0];
      // take care to correctly set lambdaRange for new node too
      spanNode.lambdaRange = {start: intersectRange.start, end: intersectRange.end};
      nodesToAdd.push(spanNode);

      if (lambdaRange.end != intersectRange.end) { // there is a text node after the newly added span
        var newNode = document.createTextNode(textContent.substring(intersectRange.end - lambdaRange.start));
        // take care to correctly set lambdaRange for new node too
        newNode.lambdaRange = {start: intersectRange.end, end: lambdaRange.end};
        nodesToAdd.push(newNode);

      }

      // add new nodes before domTree node then remove domTree node
      for(var i = 0; i < nodesToAdd.length; ++i) {
        parentNode.insertBefore(nodesToAdd[i], domTree);
      }
      parentNode.removeChild(domTree);

    } else { // not a text node, go on the propagate to the children with intersectRange
      var children = domTree.childNodes;
      var currentNumOfChildren = children.length;
      for (var i = 0; i < children.length; ++i) {
        addSpanToDomTree_(children[i], intersectRange, clsName, signature, eventMap);
        if (currentNumOfChildren != children.length) {
          // as we addSpanToDomTree, there could be more children being dynamically added, we need to compensate for that
          // by skipping the newly created nodes
          var numOfNodesAdded = children.length - currentNumOfChildren;
          i = i + numOfNodesAdded;
          currentNumOfChildren = children.length;
        }
      }
    }
  };

  // compute the intersection of two range, if two range has no intersection, -1 will be returned if lambdaRange is to
  // the left of spanRange and 1 if the opposite
  var intersectRange_ = function(lambdaRange, spanRange) {
    console.log("lambda range : %o", lambdaRange );
    console.log("span range: %o", spanRange);
    if (lambdaRange.end <= spanRange.start) {
      return -1;
    } else if (lambdaRange.start >= spanRange.end) {
      return 1;
    }
    return {start: Math.max(lambdaRange.start, spanRange.start), end: Math.min(lambdaRange.end, spanRange.end)};
  };

  // traverse a dom tree and insert a lambdaRange field to each node of the dom tree
  // lambdaRange represents that, in textContent of the root node, what is the range as substring does the textContent
  // of each node represents, given a starting offset start.
  var addRangeToDomTree_ = function(domTree, start) {
    var nodeLength = domTree.textContent.length;
    domTree.lambdaRange = {start:start, end: start + nodeLength};
    var children = domTree.childNodes;
    var currentStart = start;
    for (var i = 0; i < children.length; ++i) {
      var currentChild = children[i];
      addRangeToDomTree_(currentChild, currentStart);
      currentStart = currentStart + currentChild.textContent.length;
    }
  };

exports.addSpanToDomTree = addSpanToDomTree;
exports.addSpanToDomTreeByLine = addSpanToDomTreeByLine;

