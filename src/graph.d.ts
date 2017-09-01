export declare class SegmentationGraph {
    container: object;
    graphObj: object;
    keyHandler: object;
    graphLayout: object;
    defaultCellStyle: object;
    mainVertex: object;
    graphDragSource: object;

    constructor(id: string);

    init();

    drawMainVertex();

    makeDraggable(id: string): void;

    createSegmentVertices(parentVertex): Array;

    createSegmentVertex(segmentValue): object;

    insertSegmentEdges(parentVertex, vertices): void;
}