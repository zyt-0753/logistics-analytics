import { useState } from "react"
import { 
  Search, 
  Filter, 
  Download,
  Plus,
  MoreHorizontal
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
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker"

// --- Types ---
interface CollectionOrder {
  id: string;
  logisticsOrderId: string;
  consignorId: string;
  supplierId: string;
  expressNo: string;
  createTime: string;
  status: 'PENDING' | 'COLLECTED' | 'CANCELLED';
  finalCountry: string;
}

// --- Mock Data ---
const initialOrders: CollectionOrder[] = [
  { id: '1', logisticsOrderId: 'L20250201001', consignorId: 'C001', supplierId: 'S001', expressNo: 'SF123456789', createTime: '2025-02-01 10:00:00', status: 'COLLECTED', finalCountry: 'US' },
  { id: '2', logisticsOrderId: 'L20250201002', consignorId: 'C002', supplierId: 'S002', expressNo: 'YT987654321', createTime: '2025-02-02 11:30:00', status: 'PENDING', finalCountry: 'UK' },
  { id: '3', logisticsOrderId: 'L20250201003', consignorId: 'C001', supplierId: 'S001', expressNo: 'JD112233445', createTime: '2025-02-03 09:15:00', status: 'CANCELLED', finalCountry: 'US' },
];

const statusMap = {
  PENDING: { label: '待揽收', color: 'secondary' },
  COLLECTED: { label: '已揽收', color: 'success' },
  CANCELLED: { label: '已取消', color: 'destructive' },
};

export default function CollectionOrderList() {
  const [orders, setOrders] = useState<CollectionOrder[]>(initialOrders);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">物流揽收单</h1>
          <p className="text-muted-foreground">管理所有的物流揽收记录</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新建揽收单
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm flex-wrap">
        <div className="space-y-2 flex-1 min-w-[200px]">
          <label className="text-sm font-medium">揽收单号/物流单号</label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="搜索单号" className="pl-8" />
          </div>
        </div>

        <div className="space-y-2 w-[200px]">
          <label className="text-sm font-medium">状态</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">全部状态</SelectItem>
              <SelectItem value="PENDING">待揽收</SelectItem>
              <SelectItem value="COLLECTED">已揽收</SelectItem>
              <SelectItem value="CANCELLED">已取消</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 w-[200px]">
          <label className="text-sm font-medium">目的地国家</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="全部国家" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">全部国家</SelectItem>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="UK">United Kingdom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">创建时间</label>
          <CalendarDateRangePicker className="w-[260px]" />
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedIds.length === orders.length && orders.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>物流订单号</TableHead>
              <TableHead>快递单号</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>货主ID</TableHead>
              <TableHead>供应商ID</TableHead>
              <TableHead>目的地</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedIds.includes(order.id)}
                    onCheckedChange={() => toggleSelect(order.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{order.logisticsOrderId}</TableCell>
                <TableCell>{order.expressNo}</TableCell>
                <TableCell>
                  <Badge variant={statusMap[order.status].color as any}>
                    {statusMap[order.status].label}
                  </Badge>
                </TableCell>
                <TableCell>{order.consignorId}</TableCell>
                <TableCell>{order.supplierId}</TableCell>
                <TableCell>{order.finalCountry}</TableCell>
                <TableCell>{order.createTime}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>操作</DropdownMenuLabel>
                      <DropdownMenuItem>查看详情</DropdownMenuItem>
                      <DropdownMenuItem>编辑</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">删除</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
