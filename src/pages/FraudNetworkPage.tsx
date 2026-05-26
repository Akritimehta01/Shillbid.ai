import { useEffect, useState, useRef, useCallback } from 'react';
import { Network, Users, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { fetchFraudNetwork, type FraudNetwork, type NetworkNode } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function FraudNetworkPage() {
  const [network, setNetwork] = useState<FraudNetwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => { loadNetwork(); }, []);

  const loadNetwork = async () => {
    try {
      setLoading(true);
      const data = await fetchFraudNetwork();
      setNetwork(data);
      const positions = calculateNodePositions(data.nodes);
      setNodePositions(positions);
    } catch (error) {
      console.error('Failed to load network:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNodePositions = (nodes: NetworkNode[]): Map<string, { x: number; y: number }> => {
    const positions = new Map<string, { x: number; y: number }>();
    const bidders = nodes.filter((n) => n.type === 'bidder');
    const sellers = nodes.filter((n) => n.type === 'seller');
    const centerX = 400, centerY = 300;

    sellers.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / sellers.length;
      positions.set(node.id, { x: centerX + Math.cos(angle) * 100, y: centerY + Math.sin(angle) * 100 });
    });

    bidders.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / bidders.length;
      const radius = 200 + (node.fraud_score > 0.5 ? -30 : 0);
      positions.set(node.id, { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius });
    });

    return positions;
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !network) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw edges
    network.edges.forEach((edge) => {
      const sourcePos = nodePositions.get(edge.source);
      const targetPos = nodePositions.get(edge.target);
      if (!sourcePos || !targetPos) return;
      ctx.beginPath();
      ctx.moveTo(sourcePos.x, sourcePos.y);
      ctx.lineTo(targetPos.x, targetPos.y);
      ctx.strokeStyle = edge.suspicious ? 'rgba(239, 68, 68, 0.6)' : edge.collusion_probability > 0.3 ? 'rgba(251, 146, 60, 0.4)' : 'rgba(100, 116, 139, 0.3)';
      ctx.lineWidth = edge.suspicious ? 2 : 1;
      ctx.stroke();
    });

    // Draw nodes
    network.nodes.forEach((node) => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;
      const isSelected = selectedNode?.id === node.id;
      const radius = node.type === 'seller' ? 12 : 8;

      if (node.fraud_score > 0.5) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + 8, 0, 2 * Math.PI);
        const gradient = ctx.createRadialGradient(pos.x, pos.y, radius, pos.x, pos.y, radius + 8);
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? '#06b6d4' : node.type === 'seller' ? '#3b82f6' : node.fraud_score > 0.7 ? '#dc2626' : node.fraud_score > 0.5 ? '#f97316' : node.fraud_score > 0.3 ? '#eab308' : '#64748b';
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (node.is_flagged) {
        ctx.beginPath();
        ctx.arc(pos.x + radius - 2, pos.y - radius + 2, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
      }
    });

    ctx.restore();
  }, [network, nodePositions, selectedNode, scale, offset]);

  useEffect(() => { draw(); }, [draw]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!network || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;

    const clickedNode = network.nodes.find((node) => {
      const pos = nodePositions.get(node.id);
      if (!pos) return false;
      const radius = node.type === 'seller' ? 12 : 8;
      return Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2) <= radius + 5;
    });

    setSelectedNode(clickedNode || null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleZoom = (direction: 'in' | 'out') => setScale((prev) => Math.max(0.5, Math.min(3, direction === 'in' ? prev * 1.2 : prev / 1.2)));

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;
  if (!network) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Fraud Network Visualization</h1>
          <p className="text-slate-400 text-sm mt-1">Interactive bidder-seller collusion network</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleZoom('out')} className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700"><ZoomOut className="w-4 h-4 text-slate-400" /></button>
          <button onClick={() => handleZoom('in')} className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700"><ZoomIn className="w-4 h-4 text-slate-400" /></button>
          <button onClick={loadNetwork} className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700"><RefreshCw className="w-4 h-4 text-slate-400" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div ref={containerRef} className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden relative" style={{ height: '600px' }}>
            <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" onClick={handleCanvasClick} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} />
            <div className="absolute bottom-4 left-4 bg-slate-900/90 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-400 mb-2">Legend</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-xs text-slate-300">Seller</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-500" /><span className="text-xs text-slate-300">Bidder</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-xs text-slate-300">High Risk</span></div>
                <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-red-500" /><span className="text-xs text-slate-300">Suspicious</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-4"><Network className="w-5 h-5 text-cyan-400" /><h3 className="text-sm font-semibold text-white">Network Stats</h3></div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-400">Total Nodes</span><span className="text-white">{network.total_bidders + network.total_sellers}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Total Edges</span><span className="text-white">{network.total_edges}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Suspicious</span><span className="text-red-400">{network.suspicious_edges}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Fraud Rings</span><span className="text-orange-400">{network.rings.length}</span></div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-4"><Users className="w-5 h-5 text-emerald-400" /><h3 className="text-sm font-semibold text-white">Detected Rings</h3></div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {network.rings.length === 0 ? <p className="text-xs text-slate-400">No fraud rings detected</p> : network.rings.map((ring, i) => (
                <div key={i} className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white font-medium">Ring {i + 1}</span>
                    <span className="text-xs text-red-400">{(ring.probability * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-slate-400">{ring.bidders.length} bidders with Seller {ring.seller}</p>
                </div>
              ))}
            </div>
          </div>

          {selectedNode && (
            <div className="bg-slate-800/50 rounded-xl border border-cyan-500/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Node Details</h3>
                <span className={`text-xs px-2 py-0.5 rounded ${selectedNode.type === 'seller' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-300'}`}>{selectedNode.type}</span>
              </div>
              <div className="space-y-2">
                <div><p className="text-xs text-slate-400">Name</p><p className="text-sm text-white">{selectedNode.name}</p></div>
                <div><p className="text-xs text-slate-400">Fraud Score</p><p className={`text-sm font-semibold ${selectedNode.fraud_score > 0.7 ? 'text-red-400' : selectedNode.fraud_score > 0.5 ? 'text-orange-400' : 'text-white'}`}>{(selectedNode.fraud_score * 100).toFixed(1)}%</p></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
