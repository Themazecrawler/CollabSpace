import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Palette, 
  Square, 
  Circle, 
  Type, 
  Eraser, 
  Download, 
  Share2,
  Undo,
  Redo,
  Sparkles
} from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { aiService } from '../services/ai';

interface DrawingElement {
  id: string;
  type: 'rectangle' | 'circle' | 'text' | 'line' | 'path';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  strokeWidth: number;
  points?: { x: number; y: number }[];
  path?: string;
}

export default function Whiteboard() {
  const { id } = useParams();
  const { emit, on, off, isConnected, joinRoom, leaveRoom } = useSocket();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'pen' | 'rectangle' | 'circle' | 'text' | 'eraser'>('pen');
  const [color, setColor] = useState('#3B82F6');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [undoStack, setUndoStack] = useState<DrawingElement[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawingElement[][]>([]);

  // Join whiteboard room when component mounts
  useEffect(() => {
    if (id) {
      console.log(`Joining whiteboard room: ${id}`);
      joinRoom(id);
    }
    
    return () => {
      if (id) {
        leaveRoom(id);
      }
    };
  }, [id, joinRoom, leaveRoom]);

  useEffect(() => {
    const handleWhiteboardUpdate = (data: { elements: DrawingElement[] }) => {
      setElements(data.elements);
    };

    on('whiteboard_update', handleWhiteboardUpdate);
    
    return () => {
      off('whiteboard_update', handleWhiteboardUpdate);
    };
  }, [on, off]);

  const tools = [
    { id: 'pen', icon: Palette, label: 'Pen' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' }
  ];

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#6B7280', '#000000'
  ];

  const generateAIIdeas = async () => {
    setIsGeneratingIdeas(true);
    
    try {
      // Get project context from URL or current state
      const projectType = id?.includes('website') ? 'website' : 
                         id?.includes('mobile') ? 'mobile' : 
                         id?.includes('marketing') ? 'marketing' : 'default';
      
      const context = `Collaborative whiteboard session for ${projectType} project`;
      
      const ideas = await aiService.generateIdeas(context, projectType);
      
      // Save current state for undo
      setUndoStack(prev => [...prev, [...elements]]);
      setRedoStack([]);
      
      // Add each AI idea as a text element
      const newElements: DrawingElement[] = ideas.map((idea, index) => ({
        id: Math.random().toString(36).substr(2, 9),
        type: 'text',
        x: 100 + (index * 20),
        y: 100 + (index * 40),
        text: `💡 ${idea}`,
        color: '#8B5CF6',
        strokeWidth: 1
      }));
      
      const updatedElements = [...elements, ...newElements];
      setElements(updatedElements);
      emit('whiteboard_update', { elements: updatedElements });
    } catch (error) {
      console.error('Failed to generate AI ideas:', error);
      alert(`Failed to generate AI ideas: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your OpenAI API key.`);
    }
    
    setIsGeneratingIdeas(false);
  };

  const undo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      const currentState = [...elements];
      
      setRedoStack(prev => [...prev, currentState]);
      setUndoStack(prev => prev.slice(0, -1));
      setElements(previousState);
      emit('whiteboard_update', { elements: previousState });
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      const currentState = [...elements];
      
      setUndoStack(prev => [...prev, currentState]);
      setRedoStack(prev => prev.slice(0, -1));
      setElements(nextState);
      emit('whiteboard_update', { elements: nextState });
    }
  };

  const shareWhiteboard = () => {
    const shareUrl = `${window.location.origin}/whiteboard/${id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Whiteboard link copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Whiteboard link copied to clipboard!');
    });
  };

  const clearCanvas = () => {
    setUndoStack(prev => [...prev, [...elements]]);
    setRedoStack([]);
    setElements([]);
    emit('whiteboard_update', { elements: [] });
  };

  const getCanvasCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  const drawElement = (element: DrawingElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.strokeStyle = element.color;
    ctx.fillStyle = element.color;
    ctx.lineWidth = element.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    switch (element.type) {
      case 'path':
        if (element.points && element.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          for (let i = 1; i < element.points.length; i++) {
            ctx.lineTo(element.points[i].x, element.points[i].y);
          }
          ctx.stroke();
        }
        break;
      case 'rectangle':
        if (element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
        }
        break;
      case 'circle':
        if (element.width && element.height) {
          const radius = Math.min(element.width, element.height) / 2;
          ctx.beginPath();
          ctx.arc(element.x + radius, element.y + radius, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
        break;
      case 'text':
        if (element.text) {
          ctx.font = `${element.strokeWidth * 4}px Arial`;
          ctx.fillText(element.text, element.x, element.y);
        }
        break;
    }
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all elements
    elements.forEach(drawElement);
    
    // Draw current path
    if (currentPath.length > 1 && isDrawing) {
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }
      ctx.stroke();
    }
  };

  useEffect(() => {
    redrawCanvas();
  }, [elements, currentPath, isDrawing, color, strokeWidth]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(event);
    setIsDrawing(true);
    setStartPoint(coords);
    
    if (tool === 'pen') {
      setCurrentPath([coords]);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const coords = getCanvasCoordinates(event);
    
    if (tool === 'pen') {
      setCurrentPath(prev => [...prev, coords]);
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    
    const coords = getCanvasCoordinates(event);
    
    let newElement: DrawingElement;
    
    switch (tool) {
      case 'pen':
        newElement = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'path',
          x: 0,
          y: 0,
          color,
          strokeWidth,
          points: [...currentPath, coords]
        };
        break;
      case 'rectangle':
        newElement = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'rectangle',
          x: startPoint.x,
          y: startPoint.y,
          width: coords.x - startPoint.x,
          height: coords.y - startPoint.y,
          color,
          strokeWidth
        };
        break;
      case 'circle':
        const radius = Math.sqrt(
          Math.pow(coords.x - startPoint.x, 2) + Math.pow(coords.y - startPoint.y, 2)
        );
        newElement = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'circle',
          x: startPoint.x - radius,
          y: startPoint.y - radius,
          width: radius * 2,
          height: radius * 2,
          color,
          strokeWidth
        };
        break;
      default:
        return;
    }
    
    const updatedElements = [...elements, newElement];
    setElements(updatedElements);
    emit('whiteboard_update', { elements: updatedElements });
    
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPath([]);
  };



  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Collaborative Whiteboard
            </h1>
            <div className={`flex items-center space-x-2 text-sm ${
              isConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={generateAIIdeas}
              disabled={isGeneratingIdeas}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all"
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingIdeas ? 'animate-spin' : ''}`} />
              <span>{isGeneratingIdeas ? 'Generating...' : 'AI Ideas'}</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={undo}
                disabled={undoStack.length === 0}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button 
                onClick={redo}
                disabled={redoStack.length === 0}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>
            
            <button 
              onClick={shareWhiteboard}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 border border-gray-300 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            
            <button 
              onClick={() => {
                const canvas = canvasRef.current;
                if (canvas) {
                  const link = document.createElement('a');
                  link.download = `whiteboard-${id || 'export'}.png`;
                  link.href = canvas.toDataURL();
                  link.click();
                }
              }}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 border border-gray-300 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            {tools.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setTool(id as 'pen' | 'rectangle' | 'circle' | 'text' | 'eraser')}
                className={`p-2 rounded-lg transition-colors ${
                  tool === id
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={label}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {colors.map(colorOption => (
              <button
                key={colorOption}
                onClick={() => setColor(colorOption)}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                  color === colorOption ? 'border-gray-400 scale-110' : 'border-gray-200'
                }`}
                style={{ backgroundColor: colorOption }}
              />
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Size:</label>
            <input
              type="range"
              min="1"
              max="10"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-gray-600">{strokeWidth}px</span>
          </div>

          <button
            onClick={clearCanvas}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          className={`absolute inset-0 ${isDrawing ? 'cursor-crosshair' : 'cursor-default'}`}
          style={{ width: '100%', height: '100%' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsDrawing(false);
            setStartPoint(null);
            setCurrentPath([]);
          }}
        />
        
        <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-2">Mind Map Ideas</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div>• User Research Findings</div>
            <div>• Feature Prioritization</div>
            <div>• Technical Architecture</div>
            <div>• Design System Components</div>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white"></div>
              <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-white"></div>
            </div>
            <span className="text-xs text-gray-600">3 people editing</span>
          </div>
        </div>
      </div>
    </div>
  );
}