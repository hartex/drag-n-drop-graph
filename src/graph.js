const mx = require("mxgraph")({
    mxImageBasePath: "./src/images",
    mxBasePath: "./src"
});

export class SegmentationGraph {

    constructor(id) {
        this.container = document.getElementById(id);
    }

    init() {
        /**
         * mxGraph set up
         * */
        const model = new mx.mxGraphModel();
        const graph = new mx.mxGraph(this.container, model);

        graph.setConnectable(true);
        graph.setMultigraph(false);

        graph.convertValueToString = function (cell) {
            return cell.value['title'] + ' ' + cell.value['segmentValue'];
        };

        const keyHandler = new mx.mxKeyHandler(graph);

        //todo layout?
        //const layout = new mx.mxHierarchicalLayout(graph);
        //layout.execute(parent);

        graph.setEnabled(false);

        this.graphObj = graph;
        return graph;
    }

    drawMainVertex() {
        this.graphObj.getModel().beginUpdate();
        try {
            this.mainVertex = this.graphObj.insertVertex(
                this.graphObj.getDefaultParent(),
                null,
                {
                    title: "All clients",
                    segmentValue: 2000000
                },
                300, 5, 100, 40);
        }
        finally {
            this.graphObj.getModel().endUpdate();
        }

        return this.mainVertex;
    }

    makeDraggable(id) {
        this.graphObj.dropEnabled = true;

        const draggableElem = document.getElementById(id);

        mx.mxUtils.makeDraggable(draggableElem, this.graphObj,
            (graph, evt, cell) => {
                graph.stopEditing(false);

                const pt = graph.getPointForEvent(evt);
                //target segment cell
                const targetCell = graph.getCellAt(pt.x, pt.y);

                if (targetCell) {
                    graph.addCells(this.createSegmentCells(targetCell));
                }
            }, draggableElem);
    }

    createSegmentCells(parentCell) {
        const parentSegmentValue = parentCell.getValue()['segmentValue'];

        const leftSegmentValue = Math.floor(Math.random() * (parentSegmentValue - 1)) + 1;
        const rightSegmentValue = parentSegmentValue - leftSegmentValue;

        const leftSegmentObj = {title: "segment with value: ", segmentValue: leftSegmentValue};
        const rightSegmentObj = {title: "segment with value: ", segmentValue: rightSegmentValue};

        const parentX = parentCell.geometry.x;
        const parentY = parentCell.geometry.y;

        const leftCell = new mx.mxCell(leftSegmentObj,
            new mx.mxGeometry(parentX - 100, parentY + 70, 150, 40), 'shape=rounded');
        leftCell.setVertex(true);

        const rightCell = new mx.mxCell(rightSegmentObj,
            new mx.mxGeometry(parentX + 100, parentY + 70, 170, 40), 'shape=rounded');
        rightCell.setVertex(true);

        return [leftCell, rightCell]
    }

}