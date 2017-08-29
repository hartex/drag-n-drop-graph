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
                    segmentValue: 2000000,
                    available: true
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

            if (targetCell && targetCell.getValue().available) {
                const verticesToAdd = this.createSegmentVertices(targetCell);
                targetCell.getValue().available = false;
                targetCell.setStyle(null);

                graph.addCells(verticesToAdd);

                this.insertSegmentEdges(targetCell, verticesToAdd);
                this.graphLayout.execute(this.graphObj.getDefaultParent());
            }
        };

        this.graphDragSource = mx.mxUtils.makeDraggable(draggableElem, this.graphObj, onDrop, draggableElem);

        const protoDragEnter = Object.getPrototypeOf(this.graphDragSource).dragEnter;

        const onDragEnter = (graph, evt) => {
            //calling main onDragEnter method
            protoDragEnter.call(this.graphDragSource, graph, evt);

            const allCells = Object.values(graph.getModel().cells);
            const availableCells = graph.getModel().filterCells(allCells, (cell) => cell.value && cell.value.available);

            //add dashed border to all available cells
            availableCells.forEach((val) => val.setStyle('border=3px dashed black'));
        };

        this.graphDragSource.dragEnter = onDragEnter
    }

    createSegmentVertices(parentVertex) {
        const parentSegmentValue = parentVertex.getValue()['segmentValue'];

        const leftSegmentValue = Math.floor(Math.random() * (parentSegmentValue - 1)) + 1;
        const rightSegmentValue = parentSegmentValue - leftSegmentValue;

        const leftSegmentObj = {title: "segment with value: ", segmentValue: leftSegmentValue, available: true};
        const rightSegmentObj = {title: "segment with value: ", segmentValue: rightSegmentValue, available: true};

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