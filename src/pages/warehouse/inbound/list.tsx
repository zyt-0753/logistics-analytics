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
const MOCK_INBOUND_DATA = [
  {
    id: 1,
    source: "B端",
    customerName: "Aman",
    customerCode: "Y8A3",
    trackingNo: "JYM188049022073",
    weight: 6.1,
    status: "已出库",
    warehouseName: "深圳光锥",
    route: "中国香港陆运LZOUW1L2",
    address: "中国内地广东省深圳市宝安区石岩街道罗租社区金霆产业园A栋108室",
    contact: "Jason",
    phone: "15914048579",
    isUnpacked: "否",
    inboundTime: "2026-02-04 10:30:00",
    destination: "中国香港"
  },
  {
    id: 2,
    source: "B端",
    customerName: "Aman",
    customerCode: "Y8A3",
    trackingNo: "773404127268477",
    weight: 1.51,
    status: "已出库",
    warehouseName: "深圳光锥",
    route: "中国香港陆运LZOUW1L2",
    address: "中国内地广东省深圳市宝安区石岩街道罗租社区金霆产业园A栋108室",
    contact: "Jason",
    phone: "15914048579",
    isUnpacked: "否",
    inboundTime: "2026-02-04 11:20:00",
    destination: "中国香港"
  },
  {
    id: 3,
    source: "B端",
    customerName: "Aman",
    customerCode: "Y8A3",
    trackingNo: "78978935517201",
    weight: 0.1,
    status: "已出库",
    warehouseName: "深圳光锥",
    route: "中国香港陆运LZOUW1L2",
    address: "中国内地广东省深圳市宝安区石岩街道罗租社区金霆产业园A栋108室",
    contact: "Jason",
    phone: "15914048579",
    isUnpacked: "否",
    inboundTime: "2026-02-04 14:15:00",
    destination: "中国香港"
  }
]

export default function InboundList() {
  const [date, setDate] = useState<Date>()

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">入库管理</h2>
      </div>

      <Tabs defaultValue="front" className="space-y-4">
        <TabsList>
          <TabsTrigger value="front">前置仓入库</TabsTrigger>
          <TabsTrigger value="forwarder">货代仓入库</TabsTrigger>
        </TabsList>

        <TabsContent value="forwarder" className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">快递单号</label>
                <Input placeholder="请输入快递单号" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">客户名称</label>
                <Input placeholder="请选择客户名称" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">扫描时间</label>
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
              <div className="space-y-2">
                <label className="text-sm font-medium">状态</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="是否出库" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="in">已入库</SelectItem>
                    <SelectItem value="out">已出库</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">是否拆包</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="是否拆包" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="yes">是</SelectItem>
                    <SelectItem value="no">否</SelectItem>
                  </SelectContent>
                </Select>
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
                <label className="text-sm font-medium">包裹来源</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择包裹来源" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="b">B端</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end space-x-2">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white"><Search className="mr-2 h-4 w-4" />查询</Button>
                <Button variant="outline"><RotateCcw className="mr-2 h-4 w-4" />重置</Button>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white"><Download className="mr-2 h-4 w-4" />模板下载</Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">导入入库数据</Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">导入不名包裹</Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">导入拆包信息</Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">上传签收包裹图片</Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">上传拆包图片</Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">更新包裹待出库</Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">由条件导出拆包</Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">由条件导出包裹</Button>
            </div>

            {/* Sub Tabs */}
            <div className="border-b">
              <div className="flex space-x-6 text-sm">
                <button className="border-b-2 border-orange-500 pb-2 text-orange-500 font-medium">全部</button>
                <button className="text-gray-500 pb-2 hover:text-gray-700">正常包裹</button>
                <button className="text-gray-500 pb-2 hover:text-gray-700">待出库包裹</button>
                <button className="text-gray-500 pb-2 hover:text-gray-700">不明包裹</button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"><input type="checkbox" /></TableHead>
                  <TableHead className="min-w-[80px]">包裹来源</TableHead>
                  <TableHead className="min-w-[100px]">客户名称</TableHead>
                  <TableHead className="min-w-[80px]">客户code</TableHead>
                  <TableHead className="min-w-[100px]">客户手机号</TableHead>
                  <TableHead className="min-w-[150px]">快递单号</TableHead>
                  <TableHead className="min-w-[100px]">入库重量/kg</TableHead>
                  <TableHead className="min-w-[80px]">状态</TableHead>
                  <TableHead className="min-w-[100px]">仓库名称</TableHead>
                  <TableHead className="min-w-[150px]">航线</TableHead>
                  <TableHead className="min-w-[200px]">仓库地址</TableHead>
                  <TableHead className="min-w-[100px]">仓库联系人</TableHead>
                  <TableHead className="min-w-[120px]">仓库联系人电话</TableHead>
                  <TableHead className="min-w-[80px]">是否拆包</TableHead>
                  <TableHead className="min-w-[150px] fixed-right bg-white shadow-l">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_INBOUND_DATA.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell><input type="checkbox" /></TableCell>
                    <TableCell>{item.source}</TableCell>
                    <TableCell>{item.customerName}</TableCell>
                    <TableCell>{item.customerCode}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{item.trackingNo}</TableCell>
                    <TableCell>{item.weight}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>{item.warehouseName}</TableCell>
                    <TableCell>{item.route}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={item.address}>{item.address}</TableCell>
                    <TableCell>{item.contact}</TableCell>
                    <TableCell>{item.phone}</TableCell>
                    <TableCell>{item.isUnpacked}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 text-orange-500 text-xs cursor-pointer">
                        <span>编辑</span> | <span>拆包</span> | <span>退件</span> | <span>更多</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between p-4 text-sm text-gray-500">
              <div>已选择 0 项</div>
              <div className="flex items-center space-x-2">
                <span>1-10 共195615条</span>
                <div className="flex space-x-1">
                  <button className="px-2 py-1 border rounded bg-orange-100 text-orange-500">1</button>
                  <button className="px-2 py-1 border rounded">2</button>
                  <button className="px-2 py-1 border rounded">3</button>
                  <span>...</span>
                  <button className="px-2 py-1 border rounded">19562</button>
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
                <label className="text-sm font-medium">入库时间</label>
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
                  <TableHead>入库重量/kg</TableHead>
                  <TableHead>仓库名称</TableHead>
                  <TableHead>航线</TableHead>
                  <TableHead>目的地国家/地区</TableHead>
                  <TableHead>入库时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_INBOUND_DATA.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.trackingNo}</TableCell>
                    <TableCell>{item.weight}</TableCell>
                    <TableCell>{item.warehouseName}</TableCell>
                    <TableCell>{item.route}</TableCell>
                    <TableCell>{item.destination}</TableCell>
                    <TableCell>{item.inboundTime}</TableCell>
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
