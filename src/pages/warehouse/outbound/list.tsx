import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, RotateCcw, Download, Upload, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Mock Data
const MOCK_OUTBOUND_DATA = [
  {
    id: 1,
    batchNo: "20260204_2",
    trackingNo: "773404127268477",
    customerCount: 1,
    palletCount: 28,
    boxCount: 28,
    outboundWeight: 470.56,
    inboundWeight: 470.56,
    volume: 1381,
    packageCount: 86301.61, // Looks like value in image, but header says package count? Image header: 包裹总数 / 包裹总价. Let's align with image.
    totalValue: 86301.61,
    supplierTrackingNo: "GZSCM20260203-78",
    status: "已出库", // In image it's blank or specific status
    destination: "中国香港",
    carrier: "UPS",
    preReportSuccess: "否",
    actualOutboundTime: "2026-02-04 15:31:11",
    warehouseName: "深圳光锥",
    route: "中国香港陆运LZOUW1L2"
  },
  {
    id: 2,
    batchNo: "20260204_1",
    trackingNo: "773404127268478",
    customerCount: 1,
    palletCount: 1,
    boxCount: 9,
    outboundWeight: 233.8,
    inboundWeight: 233.8,
    volume: 258,
    packageCount: 775.86,
    totalValue: 775.86,
    supplierTrackingNo: "ZA20260205-51",
    status: "跨境运输中",
    destination: "南非",
    carrier: "BUFFALO (ZA)",
    preReportSuccess: "是",
    actualOutboundTime: "2026-02-04 09:22:10",
    warehouseName: "深圳光锥",
    route: "南非空运专线"
  },
  // Add more mock data
]

export default function OutboundList() {
  const [date, setDate] = useState<Date>()

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">出库管理</h2>
      </div>

      <Tabs defaultValue="front" className="space-y-4">
        <TabsList>
          <TabsTrigger value="front">前置仓出库</TabsTrigger>
          <TabsTrigger value="forwarder">货代仓出库</TabsTrigger>
        </TabsList>

        <TabsContent value="forwarder" className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">出库批次</label>
                <Input placeholder="请输入出库批次" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">仓库</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择仓库" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sz">深圳光锥</SelectItem>
                    <SelectItem value="hk">香港前置仓</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">供应商运单号</label>
                <Input placeholder="请输入供应商运单号" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">状态</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="transporting">跨境运输中</SelectItem>
                    <SelectItem value="arrived">抵达目的地仓库</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">目的地国家/地区</label>
                <Input placeholder="请选择目的国家/地区" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">实际出库时间</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>开始时间 ~ 结束时间</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-end space-x-2 md:col-span-2">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white"><Search className="mr-2 h-4 w-4" />查询</Button>
                <Button variant="outline"><RotateCcw className="mr-2 h-4 w-4" />重置</Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">导入出库</Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">出库表模板</Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">一键更新状态</Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">提交异常</Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">合并出库批次</Button>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-blue-500">
               <span>已选择 0 项</span>
               <button>清空</button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"><input type="checkbox" /></TableHead>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead className="min-w-[120px]">出库批次</TableHead>
                  <TableHead className="min-w-[80px]">客户数</TableHead>
                  <TableHead className="min-w-[80px]">托盘数</TableHead>
                  <TableHead className="min-w-[80px]">中包数</TableHead>
                  <TableHead className="min-w-[100px]">出库重量/kg</TableHead>
                  <TableHead className="min-w-[100px]">进位重量/kg</TableHead>
                  <TableHead className="min-w-[80px]">体积/m³</TableHead>
                  <TableHead className="min-w-[80px]">包裹总数</TableHead>
                  <TableHead className="min-w-[100px]">包裹总价</TableHead>
                  <TableHead className="min-w-[150px]">供应商运单号</TableHead>
                  <TableHead className="min-w-[100px]">状态</TableHead>
                  <TableHead className="min-w-[120px]">目的地国家/地区</TableHead>
                  <TableHead className="min-w-[100px]">承运商</TableHead>
                  <TableHead className="min-w-[120px]">是否全部预报成功</TableHead>
                  <TableHead className="min-w-[150px]">实际出库时间</TableHead>
                  <TableHead className="min-w-[180px] fixed-right bg-white shadow-l">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_OUTBOUND_DATA.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell><input type="checkbox" /></TableCell>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.batchNo}</TableCell>
                    <TableCell>{item.customerCount}</TableCell>
                    <TableCell>{item.palletCount}</TableCell>
                    <TableCell>{item.boxCount}</TableCell>
                    <TableCell>{item.outboundWeight}</TableCell>
                    <TableCell>{item.inboundWeight}</TableCell>
                    <TableCell>{item.volume}</TableCell>
                    <TableCell>{item.boxCount}</TableCell>
                    <TableCell>{item.totalValue}</TableCell>
                    <TableCell>{item.supplierTrackingNo}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>{item.destination}</TableCell>
                    <TableCell>{item.carrier}</TableCell>
                    <TableCell>{item.preReportSuccess}</TableCell>
                    <TableCell>{item.actualOutboundTime}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 text-orange-500 text-xs cursor-pointer">
                        <span>导出</span> <span>导出(货值修改)</span> <span>详情</span> <span>操作</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between p-4 text-sm text-gray-500">
              <div>1-10 共2461条</div>
              <div className="flex items-center space-x-2">
                 {/* Pagination Mock */}
                 <div className="flex space-x-1">
                  <button className="px-2 py-1 border rounded bg-orange-100 text-orange-500">1</button>
                  <button className="px-2 py-1 border rounded">2</button>
                  <button className="px-2 py-1 border rounded">3</button>
                  <span>...</span>
                  <button className="px-2 py-1 border rounded">247</button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="front" className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">快递单号</label>
                <Input placeholder="请输入快递单号" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">目的地国家/地区</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择目的地" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="MEX">墨西哥 (MEX)</SelectItem>
                    <SelectItem value="CHL">智利 (CHL)</SelectItem>
                    <SelectItem value="BRA">巴西 (BRA)</SelectItem>
                    <SelectItem value="ZAF">南非 (ZAF)</SelectItem>
                    <SelectItem value="HKG">中国香港 (HKG)</SelectItem>
                    <SelectItem value="USA">美国 (USA)</SelectItem>
                    <SelectItem value="CAN">加拿大 (CAN)</SelectItem>
                    <SelectItem value="GBR">英国 (GBR)</SelectItem>
                    <SelectItem value="DEU">德国 (DEU)</SelectItem>
                    <SelectItem value="FRA">法国 (FRA)</SelectItem>
                    <SelectItem value="AUS">澳大利亚 (AUS)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">出库时间</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>选择日期</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-end space-x-2">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white"><Search className="mr-2 h-4 w-4" />查询</Button>
                <Button variant="outline"><RotateCcw className="mr-2 h-4 w-4" />重置</Button>
              </div>
            </div>
             {/* Action Buttons */}
             <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" className="text-orange-500 border-orange-500"><Download className="mr-2 h-4 w-4" />导出</Button>
              <Button variant="outline" className="text-orange-500 border-orange-500"><Download className="mr-2 h-4 w-4" />模板下载</Button>
              <Button variant="outline" className="text-orange-500 border-orange-500"><Upload className="mr-2 h-4 w-4" />EXCEL导入</Button>
            </div>
          </div>

          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>快递单号</TableHead>
                  <TableHead>出库重量/kg</TableHead>
                  <TableHead>进位重量/kg</TableHead>
                  <TableHead>仓库名称</TableHead>
                  <TableHead>航线</TableHead>
                  <TableHead>目的地国家/地区</TableHead>
                  <TableHead>出库时间</TableHead>
                  <TableHead>承运商</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_OUTBOUND_DATA.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.trackingNo}</TableCell>
                    <TableCell>{item.outboundWeight}</TableCell>
                    <TableCell>{item.inboundWeight}</TableCell>
                    <TableCell>{item.warehouseName}</TableCell>
                    <TableCell>{item.route}</TableCell>
                    <TableCell>{item.destination}</TableCell>
                    <TableCell>{item.actualOutboundTime}</TableCell>
                    <TableCell>{item.carrier}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
