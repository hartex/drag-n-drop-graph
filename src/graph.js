const mx = require("mxgraph")({
    mxImageBasePath: "./src/images",
    mxBasePath: "./src"
});

export function initGraph(container) {
    /**
     * mxGraph set up
     * */
    const model = new mx.mxGraphModel();
    const graph = new mx.mxGraph(container, model);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    const layout = new mx.mxHierarchicalLayout(graph);
    graph.setEnabled(false);
    layout.execute(parent);

    let mainVertex;
    // Adds cells to the model in a single step
    model.beginUpdate();
    try {
        mainVertex = graph.insertVertex(parent, null, '2 000 000', 200, 0, 80, 30);
    }
    finally {
        // Updates the display
        model.endUpdate();
    }

    let vertexCounter = 0;
    window.addVertex = function () {
        safeUpdate(() => {
            const vertex = graph.insertVertex(parent, null, 'Vertex ' + ++vertexCounter, vertexCounter * 100, 100, 80, 30);
            graph.insertEdge(parent, null, '', mainVertex, vertex);
            layout.execute(parent);
        });
    };

    function safeUpdate(func) {
        model.beginUpdate();
        try {
            func();
        }
        finally {
            model.endUpdate();
        }
    }

    return graph;
}