import { Link, useLocation } from "react-router-dom"
import { 
  Package, 
  LayoutDashboard, 
  Truck, 
  Settings, 
  ShoppingCart, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  ShoppingBag,
  Plane,
  Map,
  Warehouse,
  BarChart, 
  LineChart, 
  Users,
  Wallet,
  Activity,
  DollarSign,
  LogIn,
  LogOut,
  ArrowRightLeft,
  Anchor
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface MenuItem {
  title: string
  icon: any
  path: string
  enabled: boolean
  children?: MenuItem[]
}

export function Sidebar() {
  const location = useLocation()
  const [openMenus, setOpenMenus] = useState<string[]>(["电商管理", "物流管理", "财务管理", "数据分析", "基础数据"])
  
  const menuItems: MenuItem[] = [
    {
      title: "仪表盘",
      icon: LayoutDashboard,
      path: "/",
      enabled: true
    },
    {
      title: "数据分析",
      icon: Activity,
      path: "/operation/analysis",
      enabled: true
    },
    {
      title: "财务管理",
      icon: Wallet,
      path: "/finance",
      enabled: true,
      children: [
        {
          title: "供应商应付",
          icon: FileText,
          path: "/finance/payable",
          enabled: true
        },
        {
          title: "客户应收",
          icon: DollarSign,
          path: "/finance/receivable",
          enabled: true
        }
      ]
    },
    {
      title: "电商管理",
      icon: ShoppingBag,
      path: "/ecommerce",
      enabled: true,
      children: [
        {
          title: "产品管理",
          icon: ShoppingCart,
          path: "/product/list",
          enabled: true
        },
        {
          title: "库存管理",
          icon: Package,
          path: "/inventory/list",
          enabled: true
        }
      ]
    },
    {
      title: "物流管理",
      icon: Truck,
      path: "/logistics",
      enabled: true,
      children: [
        {
          title: "报价管理",
          icon: FileText,
          path: "/quotation",
          enabled: true
        },
        {
          title: "国际物流订单",
          icon: Plane,
          path: "/logistics/orders",
          enabled: true
        },
        {
          title: "物流揽收单",
          icon: FileText,
          path: "/logistics/collection-orders",
          enabled: true
        },
        {
          title: "批次概览",
          icon: Package,
          path: "/logistics/batch-overview",
          enabled: true
        }
      ]
    },
    {
      title: "仓储管理",
      icon: Warehouse,
      path: "/warehouse",
      enabled: true,
      children: [
        {
          title: "入库管理",
          icon: LogIn,
          path: "/warehouse/inbound",
          enabled: true
        },
        {
          title: "出库管理",
          icon: LogOut,
          path: "/warehouse/outbound",
          enabled: true
        }
      ]
    },
    {
      title: "基础数据",
      icon: Settings,
      path: "/base",
      enabled: true,
      children: [
        {
          title: "供应商管理",
          icon: Users,
          path: "/base/suppliers",
          enabled: true
        },
        {
          title: "国际线路",
          icon: Map,
          path: "/base/lines",
          enabled: true
        },
        {
          title: "港口/口岸",
          icon: Anchor,
          path: "/base/ports",
          enabled: true
        },
        {
          title: "汇率管理",
          icon: ArrowRightLeft,
          path: "/base/currency",
          enabled: true
        }
      ]
    },
    {
      title: "运输管理",
      icon: Map,
      path: "/tms",
      enabled: false
    },
    {
      title: "系统设置",
      icon: Settings,
      path: "/settings",
      enabled: false
    }
  ]

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

  const renderMenuItem = (item: MenuItem) => {
    if (item.children) {
      const isOpen = openMenus.includes(item.title)
      return (
        <Collapsible
          key={item.title}
          open={isOpen}
          onOpenChange={() => toggleMenu(item.title)}
          className="w-full"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-between font-normal",
                !item.enabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={!item.enabled}
            >
              <div className="flex items-center">
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 px-2 py-1">
            {item.children.map(child => (
              <Link key={child.path} to={child.enabled ? child.path : "#"}>
                <Button
                  variant={location.pathname === child.path ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full justify-start pl-8 h-9",
                    !child.enabled && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={!child.enabled}
                >
                  <child.icon className="mr-2 h-4 w-4" />
                  {child.title}
                </Button>
              </Link>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return (
      <Link key={item.path} to={item.enabled ? item.path : "#"}>
        <Button
          variant={location.pathname === item.path ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start",
            !item.enabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={!item.enabled}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.title}
        </Button>
      </Link>
    )
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-6">
        <span className="text-lg font-bold">出海星 SeaStar</span>
      </div>
      <div className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {menuItems.map(renderMenuItem)}
        </nav>
      </div>
    </div>
  )
}
