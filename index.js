const axios = require('axios');

const INITIAL_UUID = '089ef556-dfff-4ff2-9733-654645be56fe';
const ENDPOINT = 'https://nodes-on-nodes-challenge.herokuapp.com/nodes/';

// Initial Attempt:
// Provides answers, but is slow, want to try and make another attempt that's faster
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

// Uncomment this if you want to run v1
// (async () => {
//   try {
//       var text = await traverseNodes();
//       console.log(text);
//   } catch (e) {
//       console.log(e);
//   }
// })();

// Second attempt at a speedier solution, not overwriting the first
// It should be slightly faster as it can query for multiple
// nodes at once rather than just one node at a time
const traverseNodes2 = async () => {
  const seen = {};
  const edgeCounts = {};
  let uniqueNodeCount = 0;

  const stack = [];
  const response = await axios.get(`${ENDPOINT}${INITIAL_UUID}`);
  stack.push(response.data[0]);

  while (stack.length > 0) {
    const node = stack.pop();
    if (!(node.id in seen)) {
      seen[node.id] = true;
      uniqueNodeCount++;
      if (node.child_node_ids.length > 0) {
        const UUIDLookup = node.child_node_ids.join(',');
        const newNodesResponse = await axios.get(`${ENDPOINT}${UUIDLookup}`);
        for (let i = 0; i < newNodesResponse.data.length; i++) {
          const childNode = newNodesResponse.data[i];
          const childNodeId = childNode.id;
          if (childNodeId in edgeCounts) {
            edgeCounts[childNodeId]++
          } else {
            edgeCounts[childNodeId] = 1;
          }
          stack.push(childNode);
        }
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
    edgeCounts,
    uniqueNodeCount,
  }
}

(async () => {
  try {
      var text = await traverseNodes2();
      console.log(text);
  } catch (e) {
      console.log(e);
  }
})();
