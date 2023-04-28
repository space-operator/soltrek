import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  useKeyPress,
  Connection,
} from 'reactflow';
import styles from '@/styles/Playground.module.css'
import { nodeTypes } from '@/nodes';
import NodeEdge from '@/layouts/NodeEdge';
import useCtrlA from '@/util/useCtrlA';


const Playground = function Playground() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const ctrlAPress = useCtrlA()
  const backspacePress = useKeyPress('Backspace')


  const onConnect = useCallback((params: Connection) =>
    setEdges((eds) => addEdge(params, eds))
    , [setEdges]
  );


  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const values = Object.keys(node.data)
        values.forEach((value) => {
          if (!nodes.map((nd) => nd.id).includes(value)) {
            const { [value]: removed, ...rest } = node.data;
            node.data = rest;
          }
        })
        return node;
      }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backspacePress]);



  useEffect(() => {
    if (ctrlAPress.split("-")[0] == "true") {
      setNodes((nodes) => nodes.map((nd) => { return { ...nd, selected: true } }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctrlAPress])



  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      edges={edges}
      id="rf-main"
      proOptions={{ hideAttribution: true }}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      edgeTypes={{ default: NodeEdge }}
    >
      <Controls className={styles.controls} position="bottom-right" />
      <MiniMap
        nodeColor="#FF00994d"
        nodeStrokeColor="#FF0099"
        maskColor='#3e3a6d4d'
        className={styles.minimap}
        zoomable
        pannable />
      <Background
        color="#4B4967"
        variant={BackgroundVariant.Dots} />
    </ReactFlow>
  );
}

export default Playground