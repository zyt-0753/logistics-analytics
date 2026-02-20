import { useState } from "react"
import { 
  ChevronDown, 
  MoreHorizontal, 
  Search, 
  Filter, 
  Download,
  UploadCloud,
  Truck,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// --- Types ---
type OrderStatus = 
  | 'PENDING_PICKUP' 
  | 'OVERSEAS_WAREHOUSE' 
  | 'LAST_MILE_DELIVERY' 
  | 'COMPLETED' 
  | 'CANCELLED';

type ChannelType = 'Lightcone' | 'Other';
type WmsSyncStatus = 'PENDING' | 'SYNCED' | 'FAILED';

interface Order {
  id: string;
  orderNo: string;
  status: OrderStatus;
  customerName: string;
  destination: string;
  createTime: string;
  amount: number;
  channel: ChannelType;
  wmsSyncStatus: WmsSyncStatus;
}

// --- Mock Data ---
const initialOrders: Order[] = [
  { id: '1', orderNo: 'M20250120001', status: 'OVERSEAS_WAREHOUSE', customerName: 'Acme Corp', destination: 'US', createTime: '2025-01-20 10:00', amount: 150.00, channel: 'Lightcone', wmsSyncStatus: 'SYNCED' },
  { id: '2', orderNo: 'M20250120002', status: 'LAST_MILE_DELIVERY', customerName: 'Globex', destination: 'UK', createTime: '2025-01-19 14:30', amount: 230.50, channel: 'Other', wmsSyncStatus: 'PENDING' },
  { id: '3', orderNo: 'M20250120003', status: 'PENDING_PICKUP', customerName: 'Soylent', destination: 'CA', createTime: '2025-01-20 09:15', amount: 89.99, channel: 'Other', wmsSyncStatus: 'FAILED' },
  { id: '4', orderNo: 'M20250120004', status: 'COMPLETED', customerName: 'Initech', destination: 'US', createTime: '2025-01-18 11:20', amount: 450.00, channel: 'Lightcone', wmsSyncStatus: 'SYNCED' },
  { id: '5', orderNo: 'M20250120005', status: 'OVERSEAS_WAREHOUSE', customerName: 'Umbrella', destination: 'DE', createTime: '2025-01-19 16:45', amount: 1200.00, channel: 'Other', wmsSyncStatus: 'PENDING' },
  { id: '6', orderNo: 'M20250120006', status: 'LAST_MILE_DELIVERY', customerName: 'Stark Ind', destination: 'US', createTime: '2025-01-19 09:00', amount: 3300.00, channel: 'Lightcone', wmsSyncStatus: 'SYNCED' },
  { id: '7', orderNo: 'M20250120007', status: 'PENDING_PICKUP', customerName: 'Wayne Ent', destination: 'UK', createTime: '2025-01-20 08:30', amount: 560.00, channel: 'Other', wmsSyncStatus: 'PENDING' },
  { id: '8', orderNo: 'M20250120008', status: 'CANCELLED', customerName: 'Cyberdyne', destination: 'JP', createTime: '2025-01-15 10:00', amount: 0.00, channel: 'Other', wmsSyncStatus: 'PENDING' },
];

const statusMap: Record<OrderStatus, { label: string; color: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }> = {
  PENDING_PICKUP: { label: '待揽收', color: 'secondary' },
  OVERSEAS_WAREHOUSE: { label: '境外仓', color: 'info' },
  LAST_MILE_DELIVERY: { label: '末端派送中', color: 'warning' },
  COMPLETED: { label: '完成', color: 'success' },
  CANCELLED: { label: '已取消', color: 'destructive' },
};

export default function LogisticsOrderList() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Dialog State
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorOrderNos, setErrorOrderNos] = useState<string[]>([]);

  // Confirmation Dialog State
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingActionOrders, setPendingActionOrders] = useState<Order[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map(o => o.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // --- Actions ---

  const handleBatchUpdateLastMile = () => {
    if (selectedIds.length === 0) {
      toast({ title: "请先选择订单", variant: "destructive" });
      return;
    }

    const selectedOrders = orders.filter(o => selectedIds.includes(o.id));
    const invalidOrders = selectedOrders.filter(o => o.status !== 'OVERSEAS_WAREHOUSE');

    if (invalidOrders.length > 0) {
      const invalidNos = invalidOrders.map(o => o.orderNo);
      setErrorMessage("系统批量更新订单状态失败，存在非境外仓状态的订单信息");
      setErrorOrderNos(invalidNos);
      setErrorDialogOpen(true);
      return;
    }

    // Success
    setOrders(orders.map(o => selectedIds.includes(o.id) ? { ...o, status: 'LAST_MILE_DELIVERY' } : o));
    setSelectedIds([]);
    toast({ title: "系统批量更新订单状态成功", description: "已更新为末端派送中", className: "bg-green-100 border-green-500" });
  };

  // Step 1: Click "批量更新完成"
  const handleBatchUpdateCompleted = () => {
    if (selectedIds.length === 0) {
      toast({ title: "请先选择订单", variant: "destructive" });
      return;
    }

    const selectedOrders = orders.filter(o => selectedIds.includes(o.id));
    const invalidOrders = selectedOrders.filter(o => o.status !== 'LAST_MILE_DELIVERY');

    // Validation
    if (invalidOrders.length > 0) {
      const invalidNos = invalidOrders.map(o => o.orderNo);
      setErrorMessage("系统批量更新订单状态失败，存在非末端派送中状态的订单信息");
      setErrorOrderNos(invalidNos);
      setErrorDialogOpen(true);
      return;
    }

    // If valid, open Confirmation Dialog (Order Data Selection Box)
    setPendingActionOrders(selectedOrders);
    setConfirmDialogOpen(true);
  };

  // Step 2: Confirm in Dialog
  const executeBatchUpdateCompleted = () => {
     setOrders(orders.map(o => selectedIds.includes(o.id) ? { ...o, status: 'COMPLETED' } : o));
     setSelectedIds([]);
     setConfirmDialogOpen(false);
     toast({ title: "系统批量更新订单状态成功", description: "已更新为完成", className: "bg-green-100 border-green-500" });
  };

  const handleBatchUpdateCancelled = () => {
    if (selectedIds.length === 0) {
      toast({ title: "请先选择订单", variant: "destructive" });
      return;
    }

    const selectedOrders = orders.filter(o => selectedIds.includes(o.id));
    // Valid status for cancellation: PENDING_PICKUP
    const invalidOrders = selectedOrders.filter(o => o.status !== 'PENDING_PICKUP');

    if (invalidOrders.length > 0) {
      const invalidNos = invalidOrders.map(o => o.orderNo);
      setErrorMessage("系统批量更新订单状态失败，存在无法取消状态的订单（仅待揽收订单可取消）");
      setErrorOrderNos(invalidNos);
      setErrorDialogOpen(true);
      return;
    }

    // Success
    setOrders(orders.map(o => selectedIds.includes(o.id) ? { ...o, status: 'CANCELLED' } : o));
    setSelectedIds([]);
    toast({ title: "系统批量更新订单状态成功", description: "已更新为已取消", className: "bg-green-100 border-green-500" });
  };

  const handlePushToWMS = () => {
    if (selectedIds.length === 0) {
      toast({ title: "请先选择订单", variant: "destructive" });
      return;
    }

    const selectedOrders = orders.filter(o => selectedIds.includes(o.id));
    // Check channel: Cannot be 'Lightcone'
    const invalidOrders = selectedOrders.filter(o => o.channel === 'Lightcone');

    if (invalidOrders.length > 0) {
      const invalidNos = invalidOrders.map(o => o.orderNo);
      setErrorMessage("推送WMS失败：包含光锥渠道订单（无需推送），请重新选择。");
      setErrorOrderNos(invalidNos);
      setErrorDialogOpen(true);
      return;
    }

    // Success
    setOrders(orders.map(o => selectedIds.includes(o.id) ? { ...o, wmsSyncStatus: 'SYNCED' } : o));
    setSelectedIds([]);
    toast({ title: "推送WMS成功", description: "订单信息已同步至华磊系统", className: "bg-green-100 border-green-500" });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">国际物流订单</h1>
          <p className="text-muted-foreground">管理所有跨境物流订单及状态流转</p>
        </div>
        <div className="flex space-x-2">
           {/* Order Status Processing Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                订单状态处理
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>批量操作</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleBatchUpdateLastMile}>
                <Truck className="mr-2 h-4 w-4" />
                <span>批量更新末端派送</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBatchUpdateCompleted}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                <span>批量更新完成</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleBatchUpdateCancelled} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                <XCircle className="mr-2 h-4 w-4" />
                <span>批量更新取消</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handlePushToWMS}>
                <UploadCloud className="mr-2 h-4 w-4" />
                <span>推送WMS</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 bg-card p-4 rounded-lg border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索订单号/客户..."
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          筛选
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedIds.length === orders.length && orders.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>订单号</TableHead>
              <TableHead>客户</TableHead>
              <TableHead>渠道</TableHead>
              <TableHead>WMS状态</TableHead>
              <TableHead>目的地</TableHead>
              <TableHead>金额</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} data-state={selectedIds.includes(order.id) ? "selected" : undefined}>
                <TableCell>
                  <Checkbox 
                    checked={selectedIds.includes(order.id)}
                    onCheckedChange={() => toggleSelect(order.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{order.orderNo}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>
                  <Badge variant={order.channel === 'Lightcone' ? 'outline' : 'default'}>
                    {order.channel === 'Lightcone' ? '光锥' : '其他'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    order.wmsSyncStatus === 'SYNCED' ? 'success' : 
                    order.wmsSyncStatus === 'FAILED' ? 'destructive' : 'secondary'
                  }>
                    {order.wmsSyncStatus === 'SYNCED' ? '已同步' : 
                     order.wmsSyncStatus === 'FAILED' ? '失败' : '待同步'}
                  </Badge>
                </TableCell>
                <TableCell>{order.destination}</TableCell>
                <TableCell>${order.amount.toFixed(2)}</TableCell>
                <TableCell>{order.createTime}</TableCell>
                <TableCell>
                  <Badge variant={statusMap[order.status].color}>
                    {statusMap[order.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>查看详情</DropdownMenuItem>
                      <DropdownMenuItem>下载单据</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>操作失败</DialogTitle>
            <DialogDescription>
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[200px] overflow-y-auto rounded-md bg-muted p-4">
             <p className="text-sm font-medium mb-2">商家订单号：</p>
             <ul className="list-disc list-inside text-sm text-muted-foreground">
               {errorOrderNos.map(no => (
                 <li key={no}>{no}</li>
               ))}
             </ul>
          </div>
          <DialogFooter>
            <Button onClick={() => setErrorDialogOpen(false)}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog (Order Data Selection Box) */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认批量更新</DialogTitle>
            <DialogDescription>
              即将把以下 {pendingActionOrders.length} 个订单状态更新为【完成】。此操作不可逆，请确认。
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[200px] overflow-y-auto rounded-md border p-2">
            <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>订单号</TableHead>
                   <TableHead>当前状态</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {pendingActionOrders.map(o => (
                   <TableRow key={o.id}>
                     <TableCell>{o.orderNo}</TableCell>
                     <TableCell>{statusMap[o.status].label}</TableCell>
                   </TableRow>
                 ))}
               </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>取消</Button>
            <Button onClick={executeBatchUpdateCompleted}>确认更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
