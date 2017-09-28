import './styles.css'
import '../assets/img/collapsed.gif'
import '../assets/img/expanded.gif'

import {SegmentationGraph} from 'graph'

(() => {
    const graph = new SegmentationGraph('graph-container');
    graph.init();
    graph.drawMainVertex();
    graph.makeDraggable('draggable');
    graph.makeDraggableWithCombine('draggable-combine');
})();