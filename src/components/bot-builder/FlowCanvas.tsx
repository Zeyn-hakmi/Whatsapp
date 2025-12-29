import { useCallback, useState, useRef, DragEvent, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import MessageNode from './nodes/MessageNode';
import QuickReplyNode from './nodes/QuickReplyNode';
import ConditionNode from './nodes/ConditionNode';
import ApiCallNode from './nodes/ApiCallNode';
import StartNode from './nodes/StartNode';
import DelayNode from './nodes/DelayNode';
import ABTestNode from './nodes/ABTestNode';
import HandoffNode from './nodes/HandoffNode';
import AppointmentNode from './nodes/AppointmentNode';
import WebhookTriggerNode from './nodes/WebhookTriggerNode';
import EmailNode from './nodes/EmailNode';
import { NodePanel } from './NodePanel';
import { NodeEditor } from './NodeEditor';
import { FlowPreview } from './FlowPreview';

const nodeTypes = {
  start: StartNode,
  message: MessageNode,
  quickReply: QuickReplyNode,
  condition: ConditionNode,
  apiCall: ApiCallNode,
  delay: DelayNode,
  abTest: ABTestNode,
  handoff: HandoffNode,
  appointment: AppointmentNode,
  webhookTrigger: WebhookTriggerNode,
  email: EmailNode,
};

const defaultStartNode: Node = {
  id: 'start',
  type: 'start',
  position: { x: 250, y: 50 },
  data: { label: 'Start' },
};

let nodeId = 0;
const getId = () => `node_${nodeId++}`;

interface FlowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onFlowChange?: (nodes: Node[], edges: Edge[]) => void;
  isInitialized?: boolean;
}

export function FlowCanvas({
  initialNodes = [],
  initialEdges = [],
  onFlowChange,
  isInitialized = true
}: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialNodes.length > 0 ? initialNodes : [defaultStartNode]
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Sync with parent when initialNodes/initialEdges change (for loading saved bots)
  useEffect(() => {
    if (isInitialized && initialNodes.length > 0) {
      setNodes(initialNodes);
      setEdges(initialEdges);
      // Reset node ID counter based on existing nodes
      const maxId = initialNodes.reduce((max, node) => {
        const match = node.id.match(/^node_(\d+)$/);
        if (match) {
          return Math.max(max, parseInt(match[1], 10));
        }
        return max;
      }, 0);
      nodeId = maxId + 1;
    }
  }, [isInitialized, initialNodes, initialEdges, setNodes, setEdges]);

  // Notify parent of changes
  useEffect(() => {
    if (onFlowChange && isInitialized) {
      onFlowChange(nodes, edges);
    }
  }, [nodes, edges, onFlowChange, isInitialized]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#25D366', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#25D366' },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type !== 'start') {
      setSelectedNode(node);
    }
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const defaultData: Record<string, unknown> = {
        message: { label: 'Message', message: 'Hello! How can I help you today?' },
        quickReply: {
          label: 'Quick Reply',
          body: 'Please select an option:',
          buttons: [
            { id: 'btn-1', title: 'Option 1' },
            { id: 'btn-2', title: 'Option 2' },
          ],
        },
        condition: {
          label: 'Condition',
          variable: 'user_input',
          operator: 'equals',
          value: 'yes',
        },
        apiCall: {
          label: 'API Call',
          method: 'GET',
          url: '/api/data',
          saveAs: 'response',
        },
        delay: {
          label: 'Delay',
          duration: 1,
          unit: 'minutes',
        },
        abTest: {
          label: 'A/B Test',
          variants: [
            { name: 'A', percentage: 50 },
            { name: 'B', percentage: 50 },
          ],
        },
        handoff: {
          label: 'Human Handoff',
          assignTo: 'available',
          message: 'Connecting to agent...',
        },
        appointment: {
          label: 'Schedule',
        },
        webhookTrigger: {
          label: 'Webhook',
          method: 'POST',
        },
        email: {
          label: 'Send Email',
          subject: 'Notification',
        },
      };

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: (defaultData[type] || { label: type }) as Node['data'],
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes]
  );

  const onUpdateNode = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: data as Node['data'] };
          }
          return node;
        })
      );
      setSelectedNode((prev) => (prev?.id === nodeId ? { ...prev, data: data as Node['data'] } : prev));
    },
    [setNodes]
  );

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      if (deleted.some((n) => n.id === selectedNode?.id)) {
        setSelectedNode(null);
      }
    },
    [selectedNode]
  );

  return (
    <div className="flex h-full">
      <NodePanel />

      <div ref={reactFlowWrapper} className="flex-1 h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodesDelete={onNodesDelete}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
          className="bg-background"
          proOptions={{ hideAttribution: true }}
        >
          <Controls className="!bg-card !border-border !shadow-lg [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted" />
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="hsl(var(--muted-foreground) / 0.2)"
          />
        </ReactFlow>
      </div>

      {selectedNode ? (
        <NodeEditor
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onUpdate={onUpdateNode}
        />
      ) : (
        <FlowPreview nodes={nodes} edges={edges} />
      )}
    </div>
  );
}
