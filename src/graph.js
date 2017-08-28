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
        graph.setEnabled(false);

        graph.convertValueToString = function (cell) {
            return cell.value['title'] + ' ' + cell.value['segmentValue'];
        };

        this.graphObj = graph;
        this.keyHandler = new mx.mxKeyHandler(graph);
        this.graphLayout = new mx.mxHierarchicalLayout(graph);

        return graph;
    }

    drawMainVertex() {
        this.safeUpdate(() => {
            this.mainVertex = this.graphObj.insertVertex(
                this.graphObj.getDefaultParent(),
                null,
                {
                    title: "All clients",
                    segmentValue: 2000000
                },
                0, 5, 100, 40);
            this.graphLayout.execute(this.graphObj.getDefaultParent());
        });

        return this.mainVertex;
    }

    makeDraggable(id) {
        this.graphObj.dropEnabled = true;

        const draggableElem = document.getElementById(id);

        const onDrop = (graph, evt, cell) => {
            graph.stopEditing(false);

            const pt = graph.getPointForEvent(evt);
            //target segment cell
            const targetCell = graph.getCellAt(pt.x, pt.y);

            if (targetCell) {
                const verticesToAdd = this.createSegmentVertices(targetCell);
                graph.addCells(verticesToAdd);
                this.insertSegmentEdges(targetCell, verticesToAdd);
                this.graphLayout.execute(this.graphObj.getDefaultParent());
            }
        };

        this.graphDragSource = mx.mxUtils.makeDraggable(draggableElem, this.graphObj, onDrop, draggableElem);

        const protoDragEnter = Object.getPrototypeOf(this.graphDragSource).dragEnter;
        const onDragEnter = (graph, evt) => {
            protoDragEnter();
            console.log("dragEnter")
        };

        this.graphDragSource.dragEnter = onDragEnter
    }

    createSegmentVertices(parentVertex) {
        const parentSegmentValue = parentVertex.getValue()['segmentValue'];

        const leftSegmentValue = Math.floor(Math.random() * (parentSegmentValue - 1)) + 1;
        const rightSegmentValue = parentSegmentValue - leftSegmentValue;

        const leftSegmentObj = {title: "segment with value: ", segmentValue: leftSegmentValue};
        const rightSegmentObj = {title: "segment with value: ", segmentValue: rightSegmentValue};

        const leftVertex = new mx.mxCell(leftSegmentObj, new mx.mxGeometry(0, 0, 160, 40), 'shape=rounded');
        leftVertex.setVertex(true);

        const rightVertex = new mx.mxCell(rightSegmentObj, new mx.mxGeometry(0, 0, 160, 40), 'shape=rounded');
        rightVertex.setVertex(true);

        return [leftVertex, rightVertex]
    }

    insertSegmentEdges(parentVertex, vertices) {
        this.safeUpdate(() => {
            vertices.forEach((vertex) => {
                this.graphObj.insertEdge(this.graphObj.getDefaultParent(), null, '', parentVertex, vertex);
            })
        })
    }

    safeUpdate(func) {
        this.graphObj.getModel().beginUpdate();
        try {
            func()
        }
        finally {
            this.graphObj.getModel().endUpdate();
        }
    }

}