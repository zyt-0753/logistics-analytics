import { useState } from "react"
import { 
  Search, 
  Filter, 
  Download,
  MoreHorizontal,
  DollarSign,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// --- Types ---
interface PayableBill {
  id: string;
  billNo: string;
  supplierName: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'PARTIAL';
  createTime: string;
  dueDate: string;
}

// --- Mock Data ---
const initialBills: PayableBill[] = [
  { id: '1', billNo: 'PB20250201001', supplierName: 'FedEx Logistics', amount: 1500.00, currency: 'USD', status: 'PENDING', createTime: '2025-02-01', dueDate: '2025-02-15' },
  { id: '2', billNo: 'PB20250120002', supplierName: 'DHL Express', amount: 2300.50, currency: 'USD', status: 'PAID', createTime: '2025-01-20', dueDate: '2025-02-05' },
  { id: '3', billNo: 'PB20250110003', supplierName: 'Shenzhen Warehouse Co.', amount: 800.00, currency: 'CNY', status: 'PARTIAL', createTime: '2025-01-10', dueDate: '2025-01-25' },
  { id: '4', billNo: 'PB20250205004', supplierName: 'Global Shipping Ltd.', amount: 4500.00, currency: 'USD', status: 'PENDING', createTime: '2025-02-05', dueDate: '2025-02-20' },
  { id: '5', billNo: 'PB20250115005', supplierName: 'FedEx Logistics', amount: 1200.00, currency: 'USD', status: 'PAID', createTime: '2025-01-15', dueDate: '2025-01-30' },
];

const statusMap = {
  PENDING: { label: '待付款', color: 'destructive' },
  PAID: { label: '已付款', color: 'success' },
  PARTIAL: { label: '部分付款', color: 'warning' },
};

export default function PayableBillList() {
  const [bills, setBills] = useState<PayableBill[]>(initialBills);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [date, setDate] = useState<Date>();

  const toggleSelectAll = () => {
    if (selectedIds.length === bills.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(bills.map(b => b.id));
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
          <h1 className="text-2xl font-bold tracking-tight">供应商应付账单</h1>
          <p className="text-muted-foreground">管理所有对供应商的应付账款与付款记录</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出账单
          </Button>
          <Button>
            <DollarSign className="mr-2 h-4 w-4" />
            新建付款
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索账单号或供应商..."
            className="pl-8"
          />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="付款状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">全部状态</SelectItem>
            <SelectItem value="PENDING">待付款</SelectItem>
            <SelectItem value="PARTIAL">部分付款</SelectItem>
            <SelectItem value="PAID">已付款</SelectItem>
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>选择账单日期</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedIds.length === bills.length && bills.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>账单编号</TableHead>
              <TableHead>供应商</TableHead>
              <TableHead>金额</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建日期</TableHead>
              <TableHead>到期日期</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedIds.includes(bill.id)}
                    onCheckedChange={() => toggleSelect(bill.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{bill.billNo}</TableCell>
                <TableCell>{bill.supplierName}</TableCell>
                <TableCell>
                  {bill.currency} {bill.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant={bill.status === 'PAID' ? 'default' : bill.status === 'PENDING' ? 'destructive' : 'secondary'}>
                    {statusMap[bill.status].label}
                  </Badge>
                </TableCell>
                <TableCell>{bill.createTime}</TableCell>
                <TableCell>{bill.dueDate}</TableCell>
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
                      <DropdownMenuItem>记录付款</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">删除账单</DropdownMenuItem>
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
