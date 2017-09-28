const mx = require("mxgraph")({
    mxImageBasePath: "./src/images",
    mxBasePath: "./src"
});

export class SegmentationGraph {

    constructor(id) {
        this.container = document.getElementById(id);
        this.conditionsCounter = 1;
    }

    init() {
        mx.mxGraph.prototype.collapsedImage = new mx.mxImage('/assets/img/collapsed.gif', 9, 9);
        mx.mxGraph.prototype.expandedImage = new mx.mxImage('/assets/img/expanded.gif', 9, 9);

        /**
         * mxGraph set up
         * */
        const model = new mx.mxGraphModel();
        const graph = new mx.mxGraph(this.container, model);


        graph.setAutoSizeCells(true);
        graph.setConnectable(true);
        graph.setMultigraph(false);
        graph.setEnabled(false);
        graph.getView().updateStyle = true;


        const convertValueToStringDefault = graph.convertValueToString;

        graph.convertValueToString = function (cell) {
            if (cell.isEdge()) {
                return '';
                //convertValueToStringDefault.apply(cell)
            } else if (cell.value['type'] = 'segment') {
                return cell.value['title'] + ' ' + cell.value['value'];
            }
            else {
                return cell.value['title'] + ' ' + cell.value['value'];
            }
        };

        this.graphObj = graph;
        this.keyHandler = new mx.mxKeyHandler(graph);
        this.graphLayout = new mx.mxHierarchicalLayout(graph);

        this.initCellsFolding();

        const cellStyle = graph.getView().getStates().getValues()[0].style;
        this.defaultCellStyle = mx.mxUtils.clone(cellStyle);

        return graph;
    }

    initCellsFolding() {
        const graph = this.graphObj;
        const safeUpdate = this.safeUpdate;

        // Defines the condition for showing the folding icon
        graph.isCellFoldable = function (cell) {
            return this.model.getOutgoingEdges(cell).length > 0;
        };

        // Defines the position of the folding icon
        graph.cellRenderer.getControlBounds = function (state) {
            if (state.control != null) {
                const oldScale = state.control.scale;
                const w = state.control.bounds.width / oldScale;
                const h = state.control.bounds.height / oldScale;
                const s = state.view.scale;

                return new mx.mxRectangle(state.x + state.width / 2 - w / 2 * s,
                    state.y + state.height + 20 * s - h / 2 * s,
                    w * s, h * s);
            }

            return null;
        };

        // Implements the click on a folding icon
        graph.foldCells = function (collapse, recurse, cells) {


            // Updates the visible state of a given subtree taking into
            // account the collapsed state of the traversed branches
            function toggleSubtree(graph, cell, show) {
                show = (show != null) ? show : true;
                var cells = [];

                graph.traverse(cell, true, function (vertex) {
                    if (vertex != cell) {
                        cells.push(vertex);
                    }

                    // Stops recursion if a collapsed cell is seen
                    return vertex == cell || !graph.isCellCollapsed(vertex);
                });

                graph.toggleCells(show, cells, true);
            };


            /*safeUpdate(() => {
                toggleSubtree(this, cells[0], !collapse);
                this.model.setCollapsed(cells[0], collapse);

                // Executes the layout for the new graph since
                // changes to visiblity and collapsed state do
                // not trigger a layout in the current manager.
                layout.execute(graph.getDefaultParent());
            });*/
            this.model.beginUpdate();
            try {
                toggleSubtree(this, cells[0], !collapse);
                this.model.setCollapsed(cells[0], collapse);

                // Executes the layout for the new graph since
                // changes to visiblity and collapsed state do
                // not trigger a layout in the current manager.
                layout.execute(graph.getDefaultParent());
            }
            finally {
                this.model.endUpdate();
            }
        };
    }

    drawMainVertex() {
        this.safeUpdate(() => {
            this.mainVertex = this.graphObj.insertVertex(
                this.graphObj.getDefaultParent(),
                null,
                {
                    title: "All clients",
                    type: 'segment',
                    value: 2000000,
                    available: true
                },
                0, 5, 100, 40);
            this.graphLayout.execute(this.graphObj.getDefaultParent());
        });

        return this.mainVertex;
    }

    makeDraggable(id, onDrop) {
        this.graphObj.dropEnabled = true;

        const draggableElem = document.getElementById(id);

        const onDropDefault = (graph, evt, cell) => {
            graph.stopEditing(false);

            const pt = graph.getPointForEvent(evt);
            //target segment cell
            const targetCell = graph.getCellAt(pt.x, pt.y);

            if (targetCell && targetCell.getValue().available) {

                //condition cell
                const conditionVertex = graph.addCell(this.createConditionVertex('A'));
                this.insertEdges(targetCell, [conditionVertex]);

                const verticesToAdd = this.createSegmentVertices(targetCell);
                targetCell.getValue().available = false;

                graph.addCells(verticesToAdd);

                this.insertEdges(conditionVertex, verticesToAdd);
                this.graphLayout.execute(this.graphObj.getDefaultParent());
            }

            this.addStyles(this.getGraphCells(), {'fillColor': this.defaultCellStyle['fillColor']});
        };

        this.graphDragSource = mx.mxUtils
            .makeDraggable(draggableElem, this.graphObj, onDrop ? onDrop : onDropDefault, draggableElem);

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

    makeDraggableWithCombine(id) {
        this.makeDraggable(id, (graph, evt, cell) => {
            graph.stopEditing(false);

            const pt = graph.getPointForEvent(evt);
            //target segment cell
            const targetCell = graph.getCellAt(pt.x, pt.y);

            if (targetCell && targetCell.getValue().available) {
                const verticesToAdd = this.createSegmentVertices(targetCell);
                targetCell.getValue().available = false;

                graph.addCells(verticesToAdd);

                this.insertEdges(targetCell, verticesToAdd);

                this.safeUpdate(() => {
                    this.graphObj.insertEdge(this.graphObj.getDefaultParent(), null, '', verticesToAdd[0], verticesToAdd[1], 'endArrow=none');
                });

                this.graphLayout.execute(this.graphObj.getDefaultParent());
            }

            this.addStyles(this.getGraphCells(), {'fillColor': this.defaultCellStyle['fillColor']});
        })
    }

    createSegmentVertices(parentVertex) {
        const parentSegmentValue = parentVertex.getValue()['value'];
        const leftSegmentValue = Math.floor(Math.random() * (parentSegmentValue - 1)) + 1;
        const rightSegmentValue = parentSegmentValue - leftSegmentValue;

        return [this.createSegmentVertex(leftSegmentValue), this.createSegmentVertex(rightSegmentValue)]
    }

    createSegmentVertex(segmentValue) {
        const segmentValueObj = {
            title: "Node with value: ",
            type: 'segment',
            value: segmentValue,
            available: true
        };
        const vertex = new mx.mxCell(segmentValueObj, new mx.mxGeometry(0, 0, 160, 40), mx.mxConstants.STYLE_SHAPE + '=' + mx.mxConstants.STYLE_ROUNDED);
        vertex.setVertex(true);
        return vertex;
    }

    createConditionVertex() {
        const conditionValueObj = {
            title: "Condition: ",
            type: 'condition',
            value: this.conditionsCounter,
            available: false
        };
        const vertex = new mx.mxCell(conditionValueObj, new mx.mxGeometry(0, 0, 130, 50), mx.mxConstants.STYLE_SHAPE + '=' + mx.mxConstants.SHAPE_RHOMBUS);
        vertex.setVertex(true);

        this.conditionsCounter++;
        return vertex;
    }

    insertEdges(parentVertex, vertices) {
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