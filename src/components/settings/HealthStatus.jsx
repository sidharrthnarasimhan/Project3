import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Server,
  Database,
  Globe,
  Wifi
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

const statusConfig = {
  healthy: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-900",
    label: "Healthy",
  },
  degraded: {
    icon: AlertCircle,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-900",
    label: "Degraded",
  },
  down: {
    icon: XCircle,
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-950/20",
    border: "border-rose-200 dark:border-rose-900",
    label: "Down",
  },
  checking: {
    icon: RefreshCw,
    color: "text-zinc-400",
    bg: "bg-zinc-50 dark:bg-zinc-900",
    border: "border-zinc-200 dark:border-zinc-700",
    label: "Checking...",
  },
};

export default function HealthStatus() {
  const [services, setServices] = useState([
    {
      id: "frontend",
      name: "Frontend Application",
      description: "React web application",
      icon: Globe,
      status: "checking",
      responseTime: null,
      lastCheck: null,
      endpoint: "/"
    },
    {
      id: "api-tasks",
      name: "Tasks API",
      description: "Task management endpoints",
      icon: Server,
      status: "checking",
      responseTime: null,
      lastCheck: null,
      endpoint: "/api/tasks"
    },
    {
      id: "api-decisions",
      name: "Decisions API",
      description: "Decision tracking endpoints",
      icon: Server,
      status: "checking",
      responseTime: null,
      lastCheck: null,
      endpoint: "/api/decisions"
    },
    {
      id: "api-users",
      name: "Users API",
      description: "User management endpoints",
      icon: Server,
      status: "checking",
      responseTime: null,
      lastCheck: null,
      endpoint: "/api/users"
    },
    {
      id: "database",
      name: "Data Storage",
      description: "LocalStorage persistence layer",
      icon: Database,
      status: "checking",
      responseTime: null,
      lastCheck: null,
      endpoint: null
    },
    {
      id: "network",
      name: "Network Connectivity",
      description: "Internet connection status",
      icon: Wifi,
      status: "checking",
      responseTime: null,
      lastCheck: null,
      endpoint: null
    },
  ]);

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkHealth = async (service) => {
    const startTime = performance.now();

    try {
      switch (service.id) {
        case "frontend":
          // Frontend is healthy if we're running
          await new Promise(resolve => setTimeout(resolve, 50));
          return {
            status: "healthy",
            responseTime: Math.round(performance.now() - startTime)
          };

        case "api-tasks":
          await base44.entities.Task.list();
          const taskResponseTime = Math.round(performance.now() - startTime);
          return {
            status: taskResponseTime < 100 ? "healthy" : taskResponseTime < 300 ? "degraded" : "down",
            responseTime: taskResponseTime
          };

        case "api-decisions":
          await base44.entities.Decision.list();
          const decisionResponseTime = Math.round(performance.now() - startTime);
          return {
            status: decisionResponseTime < 100 ? "healthy" : decisionResponseTime < 300 ? "degraded" : "down",
            responseTime: decisionResponseTime
          };

        case "api-users":
          await base44.entities.User.list();
          const userResponseTime = Math.round(performance.now() - startTime);
          return {
            status: userResponseTime < 100 ? "healthy" : userResponseTime < 300 ? "degraded" : "down",
            responseTime: userResponseTime
          };

        case "database":
          // Check localStorage availability
          try {
            const testKey = "__health_check__";
            localStorage.setItem(testKey, "test");
            localStorage.removeItem(testKey);
            return {
              status: "healthy",
              responseTime: Math.round(performance.now() - startTime)
            };
          } catch (e) {
            return {
              status: "down",
              responseTime: null
            };
          }

        case "network":
          // Check network connectivity
          if (navigator.onLine) {
            return {
              status: "healthy",
              responseTime: Math.round(performance.now() - startTime)
            };
          } else {
            return {
              status: "down",
              responseTime: null
            };
          }

        default:
          return {
            status: "down",
            responseTime: null
          };
      }
    } catch (error) {
      return {
        status: "down",
        responseTime: null
      };
    }
  };

  const runHealthChecks = async () => {
    setIsRefreshing(true);

    const results = await Promise.all(
      services.map(async (service) => {
        const result = await checkHealth(service);
        return {
          ...service,
          status: result.status,
          responseTime: result.responseTime,
          lastCheck: new Date()
        };
      })
    );

    setServices(results);
    setIsRefreshing(false);
  };

  useEffect(() => {
    // Initial health check
    runHealthChecks();

    // Set up auto-refresh
    if (autoRefresh) {
      const interval = setInterval(runHealthChecks, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const overallStatus = services.every(s => s.status === "healthy")
    ? "healthy"
    : services.some(s => s.status === "down")
    ? "down"
    : "degraded";

  const StatusIcon = statusConfig[overallStatus].icon;

  return (
    <div className="space-y-6">
      {/* Overall Status Header */}
      <div className={cn(
        "rounded-xl border p-6",
        statusConfig[overallStatus].bg,
        statusConfig[overallStatus].border
      )}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className={cn("w-8 h-8", statusConfig[overallStatus].color)} />
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                System Status: {statusConfig[overallStatus].label}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {overallStatus === "healthy"
                  ? "All services are operating normally"
                  : overallStatus === "degraded"
                  ? "Some services are experiencing issues"
                  : "Critical services are down"}
              </p>
            </div>
          </div>
          <Button
            onClick={runHealthChecks}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Auto-refresh toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">Auto-refresh</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Automatically check health every 30 seconds
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      {/* Service Status List */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Service Health
        </h4>

        <div className="grid gap-3">
          {services.map((service) => {
            const ServiceIcon = service.icon;
            const StatusIconComponent = statusConfig[service.status].icon;

            return (
              <div
                key={service.id}
                className={cn(
                  "rounded-lg border p-4 transition-all",
                  statusConfig[service.status].bg,
                  statusConfig[service.status].border
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <ServiceIcon className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-zinc-900 dark:text-zinc-100">
                          {service.name}
                        </h5>
                        <StatusIconComponent
                          className={cn(
                            "w-4 h-4",
                            statusConfig[service.status].color,
                            service.status === "checking" && "animate-spin"
                          )}
                        />
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        {service.responseTime !== null && (
                          <span>
                            Response: <span className="font-medium">{service.responseTime}ms</span>
                          </span>
                        )}
                        {service.lastCheck && (
                          <span>
                            Last checked: <span className="font-medium">
                              {formatDistanceToNow(service.lastCheck, { addSuffix: true })}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    statusConfig[service.status].color
                  )}>
                    {statusConfig[service.status].label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
