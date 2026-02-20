import { useState } from "react"
import { 
  Search, 
  Filter, 
  Download,
  MoreHorizontal,
  CreditCard,
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
interface ReceivableBill {
  id: string;
  billNo: string;
  customerName: string;
  amount: number;
  currency: string;
  status: 'UNPAID' | 'RECEIVED' | 'OVERDUE';
  createTime: string;
  dueDate: string;
}

// --- Mock Data ---
const initialBills: ReceivableBill[] = [
  { id: '1', billNo: 'RB20250201001', customerName: 'Acme Corp', amount: 500.00, currency: 'USD', status: 'UNPAID', createTime: '2025-02-01', dueDate: '2025-02-15' },
  { id: '2', billNo: 'RB20250120002', customerName: 'Globex Inc', amount: 1200.00, currency: 'USD', status: 'RECEIVED', createTime: '2025-01-20', dueDate: '2025-02-05' },
  { id: '3', billNo: 'RB20250110003', customerName: 'Soylent Corp', amount: 300.00, currency: 'USD', status: 'OVERDUE', createTime: '2025-01-10', dueDate: '2025-01-25' },
  { id: '4', billNo: 'RB20250205004', customerName: 'Umbrella Corp', amount: 2500.00, currency: 'USD', status: 'UNPAID', createTime: '2025-02-05', dueDate: '2025-02-20' },
  { id: '5', billNo: 'RB20250115005', customerName: 'Acme Corp', amount: 800.00, currency: 'USD', status: 'RECEIVED', createTime: '2025-01-15', dueDate: '2025-01-30' },
];

const statusMap = {
  UNPAID: { label: '待收款', color: 'warning' },
  RECEIVED: { label: '已收款', color: 'success' },
  OVERDUE: { label: '已逾期', color: 'destructive' },
};

export default function ReceivableBillList() {
  const [bills, setBills] = useState<ReceivableBill[]>(initialBills);
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
          <h1 className="text-2xl font-bold tracking-tight">客户应收账单</h1>
          <p className="text-muted-foreground">管理所有客户的应收账款与收款记录</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出账单
          </Button>
          <Button>
            <CreditCard className="mr-2 h-4 w-4" />
            生成账单
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索账单号或客户..."
            className="pl-8"
          />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="收款状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">全部状态</SelectItem>
            <SelectItem value="UNPAID">待收款</SelectItem>
            <SelectItem value="RECEIVED">已收款</SelectItem>
            <SelectItem value="OVERDUE">已逾期</SelectItem>
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
              <TableHead>客户名称</TableHead>
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
                <TableCell>{bill.customerName}</TableCell>
                <TableCell>
                  {bill.currency} {bill.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant={bill.status === 'RECEIVED' ? 'default' : bill.status === 'OVERDUE' ? 'destructive' : 'secondary'}>
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
                      <DropdownMenuItem>记录收款</DropdownMenuItem>
                      <DropdownMenuItem>发送催款</DropdownMenuItem>
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
