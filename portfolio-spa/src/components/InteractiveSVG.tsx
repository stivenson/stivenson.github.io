import { useState, useRef, useCallback, useEffect } from 'react';

// Importar SVG directamente para mejor compatibilidad con Vite
import agentMcpSkillsSvg from '../data/articles/image/Agent-Mcp-Skills.svg?raw';

interface InteractiveSVGProps {
  src: string;
  alt?: string;
}

export function InteractiveSVG({ src, alt }: InteractiveSVGProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [isHoveringContainer, setIsHoveringContainer] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const MIN_SCALE = 0.3;
  const MAX_SCALE = 5;
  const ZOOM_SENSITIVITY = 0.1;

  // Calcular límites de pan basados en el tamaño del SVG y el contenedor
  const calculateBounds = useCallback(() => {
    if (!containerRef.current || !svgRef.current) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };

    const container = containerRef.current;
    const svg = svgRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Obtener viewBox del SVG
    const viewBox = svg.viewBox.baseVal;
    const svgWidth = viewBox.width || svg.clientWidth;
    const svgHeight = viewBox.height || svg.clientHeight;

    // Calcular límites considerando el zoom
    const scaledWidth = svgWidth * scale;
    const scaledHeight = svgHeight * scale;

    const minX = Math.min(0, containerRect.width - scaledWidth);
    const maxX = 0;
    const minY = Math.min(0, containerRect.height - scaledHeight);
    const maxY = 0;

    return { minX, maxX, minY, maxY };
  }, [scale]);

  // Aplicar límites a la posición
  const constrainPosition = useCallback((x: number, y: number) => {
    const bounds = calculateBounds();
    return {
      x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, y))
    };
  }, [calculateBounds]);

  // Manejar zoom con rueda del mouse
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calcular nuevo zoom
    const delta = e.deltaY > 0 ? -ZOOM_SENSITIVITY : ZOOM_SENSITIVITY;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta));

    if (newScale === scale) return;

    // Calcular posición para mantener el punto del mouse fijo
    const scaleChange = newScale / scale;
    const newX = mouseX - (mouseX - position.x) * scaleChange;
    const newY = mouseY - (mouseY - position.y) * scaleChange;

    const constrained = constrainPosition(newX, newY);
    
    setScale(newScale);
    setPosition(constrained);
  }, [scale, position, constrainPosition]);

  // Iniciar arrastre
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Solo botón izquierdo
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    e.preventDefault();
  }, [position]);

  // Mover durante arrastre
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStart) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    const constrained = constrainPosition(newX, newY);
    setPosition(constrained);
  }, [isDragging, dragStart, constrainPosition]);

  // Finalizar arrastre
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  // Resetear zoom y posición
  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Zoom in
  const handleZoomIn = useCallback(() => {
    const newScale = Math.min(MAX_SCALE, scale + 0.25);
    setScale(newScale);
  }, [scale]);

  // Zoom out
  const handleZoomOut = useCallback(() => {
    const newScale = Math.max(MIN_SCALE, scale - 0.25);
    setScale(newScale);
  }, [scale]);

  // Agregar event listeners para mouse move y up globales
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Cargar SVG
  const [svgContent, setSvgContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si es el SVG específico de Agent-Mcp-Skills, usar import directo
    if (src.includes('Agent-Mcp-Skills.svg')) {
      setSvgContent(agentMcpSkillsSvg);
      setLoading(false);
      return;
    }

    // Para otros SVGs, intentar cargar dinámicamente
    let resolvedSrc = src;
    
    // Si es ruta relativa (image/...), construir ruta desde src/data/articles/
    if (src.startsWith('image/')) {
      // En Vite, usar import.meta.url para construir ruta relativa al módulo actual
      try {
        resolvedSrc = new URL(`../data/articles/${src}`, import.meta.url).href;
      } catch (e) {
        // Fallback: usar ruta relativa directa
        resolvedSrc = `/src/data/articles/${src}`;
      }
    } else if (src.startsWith('/src/')) {
      // Ya es una ruta absoluta desde src, intentar convertir a relativa
      const relativePath = src.replace(/^\/src\//, '');
      try {
        resolvedSrc = new URL(`../${relativePath}`, import.meta.url).href;
      } catch (e) {
        resolvedSrc = src;
      }
    }

    // Intentar cargar el SVG
    const loadSVG = async (path: string) => {
      try {
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const text = await response.text();
        setSvgContent(text);
        setLoading(false);
      } catch (error) {
        console.error('Error loading SVG from:', path, error);
        setLoading(false);
      }
    };

    loadSVG(resolvedSrc);
  }, [src]);

  // Calcular zoom inicial automático para mostrar el SVG completo (fit-to-view)
  useEffect(() => {
    if (!svgContent || !containerRef.current) return;
    
    // Esperar a que el DOM se actualice para que el SVG esté renderizado
    const timeoutId = setTimeout(() => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const svgElement = container.querySelector('svg');
      
      if (!svgElement) return;
      
      svgRef.current = svgElement;
      const viewBox = svgElement.viewBox.baseVal;
      
      // Si no hay viewBox, intentar obtener dimensiones del SVG
      if (viewBox.width === 0 || viewBox.height === 0) {
        const width = svgElement.getAttribute('width');
        const height = svgElement.getAttribute('height');
        if (width && height) {
          const w = parseFloat(width);
          const h = parseFloat(height);
          if (w > 0 && h > 0) {
            calculateInitialZoom(container, w, h);
            return;
          }
        }
        return;
      }
      
      const svgWidth = viewBox.width;
      const svgHeight = viewBox.height;
      
      calculateInitialZoom(container, svgWidth, svgHeight);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [svgContent]);

  // Función para calcular zoom inicial
  const calculateInitialZoom = useCallback((container: HTMLDivElement, svgWidth: number, svgHeight: number) => {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    if (containerWidth === 0 || containerHeight === 0) return;
    
    // Calcular escala para ajustar (con padding del 10%)
    const scaleX = (containerWidth * 0.9) / svgWidth;
    const scaleY = (containerHeight * 0.9) / svgHeight;
    const initialScale = Math.min(scaleX, scaleY, 1); // No hacer zoom in inicialmente
    
    // Centrar el SVG (considerando transformOrigin '0 0')
    const scaledWidth = svgWidth * initialScale;
    const scaledHeight = svgHeight * initialScale;
    const centerX = (containerWidth - scaledWidth) / 2;
    const centerY = (containerHeight - scaledHeight) / 2;
    
    setScale(initialScale);
    setPosition({ x: centerX, y: centerY });
  }, []);

  // Deshabilitar scroll de la página cuando el usuario interactúa con el SVG
  useEffect(() => {
    if (isHoveringContainer || isDragging) {
      // Guardar el overflow actual
      const originalOverflow = document.body.style.overflow;
      
      // Deshabilitar scroll
      document.body.style.overflow = 'hidden';
      
      // Restaurar al desmontar o cuando termine la interacción
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isHoveringContainer, isDragging]);

  if (loading) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: 'var(--rf-text-muted)'
      }}>
        Cargando diagrama...
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={alt || 'Diagrama interactivo'}
      title={alt}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        margin: '32px 0',
        border: '1px solid rgba(0, 229, 255, 0.2)',
        borderRadius: '8px',
        overflow: 'hidden',
        background: 'rgba(0, 102, 255, 0.02)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Controles de zoom */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '6px',
          borderRadius: '6px',
          backdropFilter: 'blur(4px)'
        }}
      >
        <button
          onClick={handleZoomIn}
          style={{
            width: '32px',
            height: '32px',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            background: 'rgba(0, 102, 255, 0.2)',
            color: 'var(--electric-cyan)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 102, 255, 0.4)';
            e.currentTarget.style.borderColor = 'var(--electric-cyan)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 102, 255, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.3)';
          }}
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          style={{
            width: '32px',
            height: '32px',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            background: 'rgba(0, 102, 255, 0.2)',
            color: 'var(--electric-cyan)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 102, 255, 0.4)';
            e.currentTarget.style.borderColor = 'var(--electric-cyan)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 102, 255, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.3)';
          }}
          title="Zoom out"
        >
          −
        </button>
        <button
          onClick={handleReset}
          style={{
            width: '32px',
            height: '32px',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            background: 'rgba(0, 102, 255, 0.2)',
            color: 'var(--electric-cyan)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 102, 255, 0.4)';
            e.currentTarget.style.borderColor = 'var(--electric-cyan)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 102, 255, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.3)';
          }}
          title="Reset zoom"
        >
          ⌂
        </button>
      </div>

      {/* Indicador de instrucciones */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          zIndex: 10,
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'rgba(255, 255, 255, 0.8)',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          backdropFilter: 'blur(4px)'
        }}
      >
        Rueda del mouse: Zoom | Arrastrar: Mover
      </div>

      {/* Contenedor del SVG */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHoveringContainer(true)}
        onMouseLeave={() => setIsHoveringContainer(false)}
        style={{
          width: '100%',
          height: 'clamp(500px, 70vh, 800px)',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
          position: 'relative',
          background: '#ffffff'
        }}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
          ref={(el) => {
            if (el) {
              const svg = el.querySelector('svg');
              if (svg) {
                svgRef.current = svg;
                // Mantener las dimensiones originales del SVG basadas en viewBox
                const viewBox = svg.viewBox.baseVal;
                if (viewBox.width > 0 && viewBox.height > 0) {
                  svg.style.width = `${viewBox.width}px`;
                  svg.style.height = `${viewBox.height}px`;
                } else {
                  svg.style.width = '100%';
                  svg.style.height = 'auto';
                }
                svg.style.maxWidth = 'none';
              }
            }
          }}
        />
      </div>
    </div>
  );
}
