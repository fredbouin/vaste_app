import { useRef, useState } from 'react';

const useTimelineDrag = ({ onUpdatePosition, timelineMode }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({
    isDragging: false,
    element: null,
    projectIndex: null,
    operation: null,
    startDay: null,
    duration: null,
    initialX: null,
    startTime: null,
    startPosition: null,
    dayWidth: 48
  });

  const handleDragStart = (e, projectIndex, operation, startDay, duration) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (dragState.current.element) {
      dragState.current.element.style.transform = '';
    }
    
    dragState.current = {
      isDragging: false,
      element: e.currentTarget,
      projectIndex,
      operation,
      startDay,
      duration,
      initialX: e.clientX,
      startTime: new Date().getTime(),
      startPosition: { x: e.clientX, y: e.clientY },
      dayWidth: 48
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleDragMove = (e) => {
    if (!dragState.current.element) return;
    
    if (Math.abs(e.clientX - dragState.current.initialX) > 5) {
      dragState.current.isDragging = true;
      setIsDragging(true);
    }

    if (dragState.current.isDragging) {
      const deltaX = e.clientX - dragState.current.initialX;
      requestAnimationFrame(() => {
        if (dragState.current.element) {
          dragState.current.element.style.transform = `translateX(${deltaX}px)`;
        }
      });
    }
  };

  const handleDragEnd = (e) => {
    if (!dragState.current.element) return;

    const { 
      element, 
      projectIndex, 
      operation, 
      startDay, 
      duration, 
      initialX, 
      isDragging: wasDragging 
    } = dragState.current;

    if (wasDragging) {
      e.stopPropagation();
      e.preventDefault();
      
      const deltaX = e.clientX - initialX;
      const daysDelta = Math.round(deltaX / dragState.current.dayWidth);
      const newStartDay = Math.max(1, startDay + daysDelta);
      
      onUpdatePosition(projectIndex, operation, newStartDay, duration, timelineMode);
    }

    if (element) {
      element.style.transform = '';
    }

    dragState.current = {
      isDragging: false,
      element: null,
      projectIndex: null,
      operation: null,
      startDay: null,
      duration: null,
      initialX: null,
      startTime: null,
      startPosition: null,
      dayWidth: 48
    };

    setIsDragging(false);
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  };

  return {
    isDragging,
    dragState: dragState.current,
    handleDragStart
  };
};

export default useTimelineDrag;