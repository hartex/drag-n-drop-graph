import {SegmentationGraph} from 'graph'

(() => {
    const graph = new SegmentationGraph('graph-container');
    graph.init();
    graph.drawMainVertex();
    graph.makeDraggable('draggable');
})();