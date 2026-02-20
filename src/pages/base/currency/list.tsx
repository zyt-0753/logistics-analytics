import { useState } from "react"
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreHorizontal, 
  ArrowRightLeft
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
interface ExchangeRate {
  id: string;
  sourceCurrency: string;
  targetCurrency: string;
  rate: number;
  effectiveDate: string;
  source: 'MANUAL' | 'BANK_API';
  status: 'ACTIVE' | 'EXPIRED';
}

// --- Mock Data ---
const initialRates: ExchangeRate[] = [
  { id: '1', sourceCurrency: 'USD', targetCurrency: 'CNY', rate: 7.2350, effectiveDate: '2025-02-01', source: 'BANK_API', status: 'ACTIVE' },
  { id: '2', sourceCurrency: 'EUR', targetCurrency: 'CNY', rate: 7.8500, effectiveDate: '2025-02-01', source: 'BANK_API', status: 'ACTIVE' },
  { id: '3', sourceCurrency: 'GBP', targetCurrency: 'CNY', rate: 9.1200, effectiveDate: '2025-02-01', source: 'BANK_API', status: 'ACTIVE' },
  { id: '4', sourceCurrency: 'USD', targetCurrency: 'CNY', rate: 7.2100, effectiveDate: '2025-01-01', source: 'MANUAL', status: 'EXPIRED' },
];

export default function ExchangeRateList() {
  const [rates, setRates] = useState<ExchangeRate[]>(initialRates);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currencyFilter, setCurrencyFilter] = useState<string>("ALL");

  const toggleSelectAll = () => {
    if (selectedIds.length === rates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(rates.map(r => r.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredRates = rates.filter(rate => {
    if (currencyFilter === "ALL") return true;
    return rate.sourceCurrency === currencyFilter;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">汇率管理</h1>
          <p className="text-muted-foreground">管理多币种结算汇率</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            同步汇率
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            手动设置
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm flex-wrap">
        <div className="space-y-2 w-[200px]">
          <label className="text-sm font-medium">源币种</label>
          <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="全部币种" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">全部币种</SelectItem>
              <SelectItem value="USD">美元 (USD)</SelectItem>
              <SelectItem value="EUR">欧元 (EUR)</SelectItem>
              <SelectItem value="GBP">英镑 (GBP)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">生效日期</label>
          <CalendarDateRangePicker className="w-[260px]" />
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedIds.length === rates.length && rates.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>源币种</TableHead>
              <TableHead>目标币种</TableHead>
              <TableHead>汇率</TableHead>
              <TableHead>生效日期</TableHead>
              <TableHead>来源</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRates.map((rate) => (
              <TableRow key={rate.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedIds.includes(rate.id)}
                    onCheckedChange={() => toggleSelect(rate.id)}
                  />
                </TableCell>
                <TableCell className="font-medium font-mono">{rate.sourceCurrency}</TableCell>
                <TableCell className="font-mono">{rate.targetCurrency}</TableCell>
                <TableCell className="font-bold">{rate.rate.toFixed(4)}</TableCell>
                <TableCell>{rate.effectiveDate}</TableCell>
                <TableCell>
                  <Badge variant="outline">{rate.source === 'BANK_API' ? '自动同步' : '手动'}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={rate.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {rate.status === 'ACTIVE' ? '生效中' : '已过期'}
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
                      <DropdownMenuLabel>操作</DropdownMenuLabel>
                      <DropdownMenuItem>编辑</DropdownMenuItem>
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