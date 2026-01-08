import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Server,
  Globe,
  Database,
  Shield,
  Cloud,
  Zap
} from "lucide-react";

const SystemHealth = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);

  const checkServiceHealth = async (service) => {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(service.url, {
        method: 'GET',
        signal: controller.signal,
        headers: service.headers || {}
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      return {
        ...service,
        status: response.ok ? 'operational' : 'degraded',
        statusCode: response.status,
        responseTime,
        lastChecked: new Date().toISOString(),
        error: null
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        ...service,
        status: 'down',
        statusCode: null,
        responseTime,
        lastChecked: new Date().toISOString(),
        error: error.name === 'AbortError' ? 'Timeout' : error.message
      };
    }
  };

  const checkAllServices = async () => {
    setLoading(true);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const serviceChecks = [
      {
        id: 'frontend',
        name: 'Frontend (Vercel)',
        description: 'React application hosting',
        url: window.location.origin,
        icon: Globe,
        category: 'Application'
      },
      {
        id: 'backend',
        name: 'Backend API (Railway)',
        description: 'Node.js REST API',
        url: `${apiUrl}/health`,
        icon: Server,
        category: 'Application'
      },
      {
        id: 'database',
        name: 'Database (Neon)',
        description: 'PostgreSQL database connection',
        url: `${apiUrl}/api/health/database`,
        icon: Database,
        category: 'Infrastructure'
      },
      {
        id: 'clerk',
        name: 'Authentication (Clerk)',
        description: 'User authentication service',
        url: 'https://api.clerk.com/v1/health',
        icon: Shield,
        category: 'Third Party'
      },
      {
        id: 'vercel-status',
        name: 'Vercel Status',
        description: 'Vercel platform status',
        url: 'https://www.vercel-status.com/api/v2/status.json',
        icon: Cloud,
        category: 'Platform'
      },
      {
        id: 'railway-status',
        name: 'Railway Status',
        description: 'Railway platform status',
        url: 'https://status.railway.app/api/v2/status.json',
        icon: Zap,
        category: 'Platform'
      }
    ];

    const results = await Promise.all(
      serviceChecks.map(service => checkServiceHealth(service))
    );

    setServices(results);
    setLastChecked(new Date());
    setLoading(false);
  };

  useEffect(() => {
    checkAllServices();
    // Auto-refresh every 60 seconds
    const interval = setInterval(checkAllServices, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-500 hover:bg-green-600">Operational</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Degraded</Badge>;
      case 'down':
        return <Badge className="bg-red-500 hover:bg-red-600">Down</Badge>;
      default:
        return <Badge variant="outline">Checking...</Badge>;
    }
  };

  const getResponseTimeColor = (responseTime) => {
    if (responseTime < 200) return 'text-green-600';
    if (responseTime < 1000) return 'text-yellow-600';
    return 'text-red-600';
  };

  const overallStatus = services.length > 0
    ? services.every(s => s.status === 'operational')
      ? 'operational'
      : services.some(s => s.status === 'down')
        ? 'degraded'
        : 'degraded'
    : 'checking';

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            System Health
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring of all platform services
          </p>
        </div>
        <Button
          onClick={checkAllServices}
          disabled={loading}
          variant="outline"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(overallStatus)}
              <div>
                <CardTitle>Overall System Status</CardTitle>
                <CardDescription>
                  {lastChecked
                    ? `Last checked: ${lastChecked.toLocaleTimeString()}`
                    : 'Checking...'
                  }
                </CardDescription>
              </div>
            </div>
            {getStatusBadge(overallStatus)}
          </div>
        </CardHeader>
      </Card>

      {/* Service Status by Category */}
      {Object.entries(groupedServices).map(([category, categoryServices]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-semibold text-muted-foreground">{category}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {categoryServices.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <CardDescription>{service.description}</CardDescription>
                        </div>
                      </div>
                      {getStatusIcon(service.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      {getStatusBadge(service.status)}
                    </div>

                    {service.responseTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Response Time</span>
                        <span className={`text-sm font-mono font-semibold ${getResponseTimeColor(service.responseTime)}`}>
                          {service.responseTime}ms
                        </span>
                      </div>
                    )}

                    {service.statusCode && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status Code</span>
                        <Badge variant="outline">{service.statusCode}</Badge>
                      </div>
                    )}

                    {service.error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {service.error}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        Endpoint: <code className="text-xs bg-muted px-1 py-0.5 rounded">{service.url}</code>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>System Metrics</CardTitle>
          <CardDescription>Overall platform performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {services.filter(s => s.status === 'operational').length}
              </div>
              <div className="text-sm text-muted-foreground">Operational</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {services.filter(s => s.status === 'degraded').length}
              </div>
              <div className="text-sm text-muted-foreground">Degraded</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {services.filter(s => s.status === 'down').length}
              </div>
              <div className="text-sm text-muted-foreground">Down</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {services.length > 0
                  ? Math.round(services.reduce((acc, s) => acc + (s.responseTime || 0), 0) / services.length)
                  : 0}ms
              </div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Status Legend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm"><strong>Operational:</strong> Service is fully functional</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm"><strong>Degraded:</strong> Service is experiencing issues</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm"><strong>Down:</strong> Service is unavailable</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealth;
