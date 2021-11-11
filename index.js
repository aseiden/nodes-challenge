const axios = require('axios');

const INITIAL_UUID = '089ef556-dfff-4ff2-9733-654645be56fe';
const ENDPOINT = 'https://nodes-on-nodes-challenge.herokuapp.com/nodes/';

const traverseNodes = async () => {
  const seen = {};
  const edgeCounts = {};
  let uniqueNodeCount = 0;

  const stack = [];
  stack.push(INITIAL_UUID);

  while (stack.length > 0) {
    const uuid = stack.pop();
    if (!(uuid in seen)) {
      seen[uuid] = true;
      uniqueNodeCount++;
      // This is a bit slow, as I'm only getting one node at a time where I could be fetching more.
      const response = await axios.get(`${ENDPOINT}${uuid}`);
      const childNodes = response.data[0].child_node_ids;
      for (let i = 0; i < childNodes.length; i++) {
        const childNode = childNodes[i];
        if (childNode in edgeCounts) {
          edgeCounts[childNode]++
        } else {
          edgeCounts[childNode] = 1;
        }
        stack.push(childNode);
      }
    }
  }

  let max = 0;
  for (node in edgeCounts) {
    const edgeCount = edgeCounts[node];
    if (edgeCount > max) {
      max = edgeCount;
    }
  }

  return {
    max,
    uniqueNodeCount,
  }
}

(async () => {
  try {
      var text = await traverseNodes();
      console.log(text);
  } catch (e) {
      console.log(e);
  }
})();
