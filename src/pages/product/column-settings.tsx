import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  pinned?: 'left' | 'right' | null;
  width?: string;
  minWidth?: string;
}

interface ColumnSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: ColumnConfig[];
  setColumns: (columns: ColumnConfig[]) => void;
  onReset: () => void;
}

export function ColumnSettingsDialog({
  open,
  onOpenChange,
  columns,
  setColumns,
  onReset,
}: ColumnSettingsDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const dragOverItemIndex = useRef<number | null>(null);

  // Initialize selectedId if null
  if (selectedId === null && columns.length > 0) {
    setSelectedId(columns[0].id);
  }

  const toggleVisibility = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newColumns = [...columns];
    newColumns[index].visible = !newColumns[index].visible;
    setColumns(newColumns);
  };

  const handlePinChange = (value: 'none' | 'left' | 'right') => {
    if (!selectedId) return;
    const index = columns.findIndex(c => c.id === selectedId);
    if (index === -1) return;
    
    const newColumns = [...columns];
    newColumns[index].pinned = value === 'none' ? null : value;
    setColumns(newColumns);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    dragOverItemIndex.current = index;
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverItemIndex.current !== null && draggedIndex !== dragOverItemIndex.current) {
      const newColumns = [...columns];
      const draggedItem = newColumns[draggedIndex];
      newColumns.splice(draggedIndex, 1);
      newColumns.splice(dragOverItemIndex.current, 0, draggedItem);
      setColumns(newColumns);
    }
    setDraggedIndex(null);
    dragOverItemIndex.current = null;
  };

  const selectedColumn = columns.find(c => c.id === selectedId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl select-none">
        <DialogHeader>
          <DialogTitle>电商管理基础配置-产品管理-列设置</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-2">
          <div className="bg-blue-50 text-blue-600 p-3 rounded text-sm border border-blue-100 flex items-center">
            <span className="mr-1">ℹ️</span> 提示：点击列名选中，点击复选框切换显示/隐藏，拖拽可调整顺序
          </div>

          {/* Column Chips */}
          <div className="flex flex-wrap gap-3 min-h-[120px] content-start">
            {columns.map((col, index) => (
              <div
                key={col.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => setSelectedId(col.id)}
                className={cn(
                  "flex items-center px-3 py-2 rounded border cursor-move transition-all",
                  // Selected State
                  selectedId === col.id 
                    ? "ring-2 ring-orange-500 border-transparent bg-orange-50" 
                    : "hover:bg-muted/50 border-input",
                  // Dragging State
                  draggedIndex === index && "opacity-50 dashed border-2",
                  // Visibility Style
                  !col.visible && "text-muted-foreground bg-muted"
                )}
              >
                {/* Checkbox for Visibility */}
                <div 
                  className={cn(
                    "mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border cursor-pointer",
                    col.visible 
                      ? "bg-orange-500 border-orange-500 text-primary-foreground" 
                      : "border-primary/50"
                  )}
                  onClick={(e) => toggleVisibility(e, index)}
                >
                  {col.visible && <div className="h-2 w-1 rotate-45 border-b-2 border-r-2 border-white mb-0.5" />}
                </div>
                
                <span className="text-sm font-medium">{col.label || col.id}</span>
                
                {/* Pin Icon Indicator */}
                {col.pinned && (
                  <span className="ml-2 text-[10px] px-1 rounded bg-muted text-muted-foreground border">
                    {col.pinned === 'left' ? '左' : '右'}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Pinning Controls */}
          <div className="border-t pt-4 space-y-3">
             <div className="flex items-center gap-2 text-sm">
               <span className="text-muted-foreground">当前选中:</span>
               <span className="font-bold">{selectedColumn?.label || '无'}</span>
             </div>
             
             <div className="flex items-center space-x-8">
               <Label className="flex items-center space-x-2 cursor-pointer">
                 <input 
                   type="radio" 
                   name="pinning" 
                   checked={!selectedColumn?.pinned}
                   onChange={() => handlePinChange('none')}
                   className="w-4 h-4 accent-orange-500"
                   disabled={!selectedColumn}
                 />
                 <span>不固定</span>
               </Label>
               <Label className="flex items-center space-x-2 cursor-pointer">
                 <input 
                   type="radio" 
                   name="pinning" 
                   checked={selectedColumn?.pinned === 'left'}
                   onChange={() => handlePinChange('left')}
                   className="w-4 h-4 accent-orange-500"
                   disabled={!selectedColumn}
                 />
                 <span>左侧固定</span>
               </Label>
               <Label className="flex items-center space-x-2 cursor-pointer">
                 <input 
                   type="radio" 
                   name="pinning" 
                   checked={selectedColumn?.pinned === 'right'}
                   onChange={() => handlePinChange('right')}
                   className="w-4 h-4 accent-orange-500"
                   disabled={!selectedColumn}
                 />
                 <span>右侧固定</span>
               </Label>
               <Label className="flex items-center space-x-2 cursor-not-allowed opacity-50">
                 <input 
                   type="radio" 
                   disabled
                   className="w-4 h-4"
                 />
                 <span>左右固定</span>
               </Label>
             </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onReset} className="text-muted-foreground">
            <RotateCcw className="mr-2 h-4 w-4" />
            重置为默认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
