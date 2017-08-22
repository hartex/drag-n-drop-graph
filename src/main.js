import {initGraph} from 'graph'

const dragula = require('dragula/dist/dragula.min');

(() => {
    const container = document.getElementById('graph-container');
    const graph = initGraph(container);

    /**
     * Dragula set up
     * */
    const basket = document.getElementById('basket');
    const drake = dragula([basket, container], {copy: true});
})();