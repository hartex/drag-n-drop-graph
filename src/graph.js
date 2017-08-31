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
        graph.getView().updateStyle = true;

        graph.convertValueToString = function (cell) {
            return cell.value['title'] + ' ' + cell.value['segmentValue'];
        };

        this.graphObj = graph;
        this.keyHandler = new mx.mxKeyHandler(graph);
        this.graphLayout = new mx.mxHierarchicalLayout(graph);

        const cellStyle = graph.getView().getStates().getValues()[0].style;
        this.defaultCellStyle = mx.mxUtils.clone(cellStyle);

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

                graph.addCells(verticesToAdd);

                this.insertSegmentEdges(targetCell, verticesToAdd);
                this.graphLayout.execute(this.graphObj.getDefaultParent());
            }

            this.addStyles(this.getGraphCells(), {'fillColor': this.defaultCellStyle['fillColor']});
        };

        this.graphDragSource = mx.mxUtils.makeDraggable(draggableElem, this.graphObj, onDrop, draggableElem);

        const protoDragEnter = Object.getPrototypeOf(this.graphDragSource).dragEnter;

        const onDragEnter = (graph, evt) => {
            //calling main onDragEnter method
            protoDragEnter.call(this.graphDragSource, graph, evt);

            const partitionedCells = this.partition(this.getGraphCells(), cell => cell.value && cell.value.available);

            //add dashed border to all cells
            this.addStyles(partitionedCells[0], {'fillColor': '#63dd62'});
            this.addStyles(partitionedCells[1], {'fillColor': '#d0d0d0'});
        };

        this.graphDragSource.dragEnter = onDragEnter
    }

    createSegmentVertices(parentVertex) {
        const parentSegmentValue = parentVertex.getValue()['segmentValue'];
        const leftSegmentValue = Math.floor(Math.random() * (parentSegmentValue - 1)) + 1;
        const rightSegmentValue = parentSegmentValue - leftSegmentValue;

        return [this.createSegmentVertex(leftSegmentValue), this.createSegmentVertex(rightSegmentValue)]
    }

    createSegmentVertex(segmentValue) {
        const segmentValueObj = {title: "segment with value: ", segmentValue: segmentValue, available: true};
        const vertex = new mx.mxCell(segmentValueObj, new mx.mxGeometry(0, 0, 160, 40), 'shape=rounded');
        vertex.setVertex(true);
        return vertex;
    }

    insertSegmentEdges(parentVertex, vertices) {
        this.safeUpdate(() => {
            vertices.forEach((vertex) => {
                this.graphObj.insertEdge(this.graphObj.getDefaultParent(), null, '', parentVertex, vertex);
            })
        })
    }

    addStyles(cells, styles, predicate) {
        if (cells) {
            cells.forEach((cell) => {
                if ((predicate && predicate(cells)) || !predicate) {
                    const cellState = this.graphObj.getView().getState(cell);

                    for (let style in styles) {
                        cellState.style[style] = styles[style]
                    }

                    if (cellState.shape) {
                        cellState.shape.apply(cellState);
                        cellState.shape.redraw();
                    }
                }
            });
        }
    }

    getGraphCells() {
        return Object.values(this.graphObj.getModel().cells);
    }

    partition(array, predicate) {
        const truthy = [];
        const falsy = [];
        array.forEach(elem => {
            if (predicate(elem)) truthy.push(elem);
            else falsy.push(elem)
        });
        return [truthy, falsy]
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