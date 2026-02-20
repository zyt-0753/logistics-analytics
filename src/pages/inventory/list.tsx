import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ExternalLink, RefreshCw } from "lucide-react"

const INVENTORY_URL = "https://cstar.castlers.net/commerce/Inventory"

export default function InventoryList() {
  const [iframeKey, setIframeKey] = useState(0)

  const openExternal = () => {
    window.open(INVENTORY_URL, "_blank")
  }

  const refreshEmbed = () => setIframeKey(k => k + 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">库存管理</h1>
          <p className="text-muted-foreground">聚合外部库存页面并在系统内嵌展示，便于统一入口访问</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={openExternal}>
            <ExternalLink className="mr-2 h-4 w-4" /> 打开外链
          </Button>
          <Button variant="outline" onClick={refreshEmbed}>
            <RefreshCw className="mr-2 h-4 w-4" /> 刷新嵌入
          </Button>
        </div>
      </div>

      <Tabs defaultValue="embed">
        <TabsList>
          <TabsTrigger value="embed">嵌入页</TabsTrigger>
          <TabsTrigger value="about">页面信息</TabsTrigger>
        </TabsList>

        <TabsContent value="embed" className="space-y-4">
          <div className="rounded-md border bg-card">
            <div className="p-3 border-b text-sm text-muted-foreground">
              如外站启用登录或跨域限制，嵌入可能受限，可点击右上角“打开外链”直接访问
            </div>
            <div className="h-[70vh]">
              <iframe
                key={iframeKey}
                src={INVENTORY_URL}
                title="Inventory"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <div className="rounded-md border bg-card p-4 space-y-2">
            <h3 className="text-lg font-semibold">外部页面信息</h3>
            <div className="text-sm text-muted-foreground">
              出海星集运运营后台系统，提供物流追踪与库存相关页面。
              版权所有：广州科铄软件科技有限公司；备案号：粤ICP备2020118553号-5；技术支持：科铄软件；粤公网安备：44010602008769号。
            </div>
            <div className="text-sm">
              链接：
              <a href={INVENTORY_URL} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline">
                {INVENTORY_URL}
              </a>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

