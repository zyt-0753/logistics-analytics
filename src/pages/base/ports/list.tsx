import { useState } from "react"
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreHorizontal, 
  Plane, 
  Ship, 
  Truck 
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

// --- Types ---
type PortType = 'AIR' | 'SEA' | 'LAND';

interface Port {
  id: string;
  code: string; // IATA or UN/LOCODE
  nameEn: string;
  nameCn: string;
  country: string;
  city: string;
  type: PortType;
  status: 'ACTIVE' | 'INACTIVE';
  timezone?: string;
}

// --- Mock Data ---
const initialPorts: Port[] = [
  { id: '1', code: 'PVG', nameEn: 'Shanghai Pudong Int. Airport', nameCn: '上海浦东国际机场', country: 'CN', city: 'Shanghai', type: 'AIR', status: 'ACTIVE', timezone: 'GMT+8' },
  { id: '2', code: 'LAX', nameEn: 'Los Angeles Int. Airport', nameCn: '洛杉矶国际机场', country: 'US', city: 'Los Angeles', type: 'AIR', status: 'ACTIVE', timezone: 'GMT-8' },
  { id: '3', code: 'SHA', nameEn: 'Shanghai Port', nameCn: '上海港', country: 'CN', city: 'Shanghai', type: 'SEA', status: 'ACTIVE', timezone: 'GMT+8' },
  { id: '4', code: 'LGB', nameEn: 'Port of Long Beach', nameCn: '长滩港', country: 'US', city: 'Long Beach', type: 'SEA', status: 'ACTIVE', timezone: 'GMT-8' },
  { id: '5', code: 'LHR', nameEn: 'London Heathrow Airport', nameCn: '伦敦希思罗机场', country: 'UK', city: 'London', type: 'AIR', status: 'ACTIVE', timezone: 'GMT+0' },
  { id: '6', code: 'HKG', nameEn: 'Hong Kong Int. Airport', nameCn: '香港国际机场', country: 'CN', city: 'Hong Kong', type: 'AIR', status: 'ACTIVE', timezone: 'GMT+8' },
];

const typeIconMap = {
  AIR: <Plane className="h-4 w-4" />,
  SEA: <Ship className="h-4 w-4" />,
  LAND: <Truck className="h-4 w-4" />,
};

export default function PortList() {
  const [ports, setPorts] = useState<Port[]>(initialPorts);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const toggleSelectAll = () => {
    if (selectedIds.length === ports.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ports.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Filter Logic
  const filteredPorts = ports.filter(port => {
    const matchesSearch = 
      port.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
      port.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
      port.nameCn.includes(searchQuery);
    const matchesType = typeFilter === "ALL" || port.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">港口/口岸管理</h1>
          <p className="text-muted-foreground">维护全球港口、机场及陆运口岸基础数据</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新增口岸
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm flex-wrap">
        <div className="space-y-2 flex-1 min-w-[200px]">
          <label className="text-sm font-medium">搜索</label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="搜索代码/名称" 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2 w-[200px]">
          <label className="text-sm font-medium">类型</label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="全部类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">全部类型</SelectItem>
              <SelectItem value="AIR">空运 (AIR)</SelectItem>
              <SelectItem value="SEA">海运 (SEA)</SelectItem>
              <SelectItem value="LAND">陆运 (LAND)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 w-[200px]">
          <label className="text-sm font-medium">国家/地区</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="全部国家" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">全部国家</SelectItem>
              <SelectItem value="CN">China</SelectItem>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="UK">United Kingdom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedIds.length === ports.length && ports.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>代码</TableHead>
              <TableHead>名称 (EN)</TableHead>
              <TableHead>名称 (CN)</TableHead>
              <TableHead>城市/国家</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPorts.map((port) => (
              <TableRow key={port.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedIds.includes(port.id)}
                    onCheckedChange={() => toggleSelect(port.id)}
                  />
                </TableCell>
                <TableCell className="font-bold font-mono">{port.code}</TableCell>
                <TableCell>{port.nameEn}</TableCell>
                <TableCell>{port.nameCn}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{port.city}</span>
                    <span className="text-xs text-muted-foreground">{port.country}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {typeIconMap[port.type]}
                    <span>{port.type}</span>
                  </div>
                </TableCell>
                <TableCell>
                   <Badge variant={port.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {port.status === 'ACTIVE' ? '启用' : '停用'}
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
                      <DropdownMenuItem className="text-destructive">停用</DropdownMenuItem>
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