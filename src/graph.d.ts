export declare class SegmentationGraph {
    container;
    graphObj;
    mainVertex;
    constructor(id: string);
    init();
    drawMainVertex();
    makeDraggable(id: string): void;
    createSegmentVertices(parentVertex): Array;
    insertSegmentEdges(parentVertex, vertices): void;
}