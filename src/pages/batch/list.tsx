import { useState } from "react"
import { 
  Search, 
  Filter, 
  Download,
  MoreHorizontal,
  Package,
  Calendar as CalendarIcon
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
interface BatchOverview {
  id: string;
  batchNo: string;
  finalCountry: string;
  orderCount: number;
  forecastTotalWeight: number; // in grams
  supplierShortName: string;
  warehouseOutCode: string;
  createTime: string;
  status: 'PLANNING' | 'TRANSIT' | 'ARRIVED' | 'CLEARED' | 'COMPLETED';
}

// --- Mock Data ---
const initialBatches: BatchOverview[] = [
  { id: '1', batchNo: 'B20250201A', finalCountry: 'US', orderCount: 150, forecastTotalWeight: 50000, supplierShortName: 'FedEx', warehouseOutCode: 'WO2025020101', createTime: '2025-02-01 08:00', status: 'TRANSIT' },
  { id: '2', batchNo: 'B20250201B', finalCountry: 'UK', orderCount: 80, forecastTotalWeight: 25000, supplierShortName: 'DHL', warehouseOutCode: 'WO2025020102', createTime: '2025-02-01 09:30', status: 'ARRIVED' },
  { id: '3', batchNo: 'B20250202A', finalCountry: 'MEX', orderCount: 200, forecastTotalWeight: 75000, supplierShortName: 'UPS', warehouseOutCode: '', createTime: '2025-02-02 10:15', status: 'PLANNING' },
];

const statusMap: Record<string, { label: string, color: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
  PLANNING: { label: '计划中', color: 'secondary' },
  TRANSIT: { label: '运输中', color: 'default' },
  ARRIVED: { label: '已抵达', color: 'warning' },
  CLEARED: { label: '已清关', color: 'success' },
  COMPLETED: { label: '已完成', color: 'outline' },
};

export default function BatchOverviewList() {
  const [batches, setBatches] = useState<BatchOverview[]>(initialBatches);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === batches.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(batches.map(b => b.id));
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
          <h1 className="text-2xl font-bold tracking-tight">批次概览</h1>
          <p className="text-muted-foreground">查看和管理物流发货批次</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出报表
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="space-y-2 flex-1">
           <label className="text-sm font-medium">批次号</label>
           <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="搜索批次号" className="pl-8" />
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
              <SelectItem value="PLANNING">计划中</SelectItem>
              <SelectItem value="TRANSIT">运输中</SelectItem>
              <SelectItem value="ARRIVED">已抵达</SelectItem>
              <SelectItem value="CLEARED">已清关</SelectItem>
              <SelectItem value="COMPLETED">已完成</SelectItem>
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
              <SelectItem value="MEX">Mexico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">创建时间</label>
          <CalendarDateRangePicker className="w-[260px]" />
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedIds.length === batches.length && batches.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>批次号</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>目的地</TableHead>
              <TableHead>物流商</TableHead>
              <TableHead>订单数</TableHead>
              <TableHead>预估重量(g)</TableHead>
              <TableHead>出库单号</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedIds.includes(batch.id)}
                    onCheckedChange={() => toggleSelect(batch.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{batch.batchNo}</TableCell>
                <TableCell>
                  <Badge variant={statusMap[batch.status].color}>
                    {statusMap[batch.status].label}
                  </Badge>
                </TableCell>
                <TableCell>{batch.finalCountry}</TableCell>
                <TableCell>{batch.supplierShortName}</TableCell>
                <TableCell>{batch.orderCount}</TableCell>
                <TableCell>{batch.forecastTotalWeight.toLocaleString()}</TableCell>
                <TableCell>{batch.warehouseOutCode || '-'}</TableCell>
                <TableCell>{batch.createTime}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>操作</DropdownMenuLabel>
                      <DropdownMenuItem>查看详情</DropdownMenuItem>
                      <DropdownMenuItem>导出清单</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">取消批次</DropdownMenuItem>
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
