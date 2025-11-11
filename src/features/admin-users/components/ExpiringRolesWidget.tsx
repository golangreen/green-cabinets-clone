import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CalendarIcon, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface ExpiringRole {
  user_id: string;
  user_email: string;
  role: string;
  expires_at: string;
  days_until_expiry: number;
}

export const ExpiringRolesWidget = () => {
  const [expiringRoles, setExpiringRoles] = useState<ExpiringRole[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [extensionDate, setExtensionDate] = useState<Date>();
  const [isExtending, setIsExtending] = useState(false);

  useEffect(() => {
    fetchExpiringRoles();
  }, []);

  const fetchExpiringRoles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_roles_expiring_within_days', {
        days_ahead: 7
      });

      if (error) throw error;
      setExpiringRoles(data || []);
    } catch (error) {
      logger.dbError('fetch expiring roles', error);
    }
  };

  const handleExtendRoles = async () => {
    if (selectedRoles.length === 0) {
      toast({
        title: "No roles selected",
        description: "Please select at least one role to extend",
        variant: "destructive",
      });
      return;
    }

    try {
      // Extend all selected roles by 7 days
      const newExpiration = new Date();
      newExpiration.setDate(newExpiration.getDate() + 7);

      const { error } = await supabase.rpc('bulk_extend_role_expiration', {
        user_role_ids: selectedRoles,
        new_expiration_date: newExpiration.toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Roles extended",
        description: `Extended ${selectedRoles.length} role(s) by 7 days`,
      });

      setSelectedRoles([]);
      fetchExpiringRoles();
    } catch (error) {
      logger.dbError('extend roles', error);
      toast.error(error.message || 'Failed to extend roles');
    } finally {
      setIsExtending(false);
    }
  };

  const getDaysColor = (days: number) => {
    if (days <= 1) return 'text-destructive';
    if (days <= 3) return 'text-orange-500';
    return 'text-yellow-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expiring Roles (Next 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Expiring Roles (Next 7 Days)
            </CardTitle>
            <CardDescription>
              {expiringRoles.length} role(s) expiring soon
            </CardDescription>
          </div>
          {expiringRoles.length > 0 && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {extensionDate ? format(extensionDate, 'PP') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={extensionDate}
                    onSelect={setExtensionDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                onClick={handleBulkExtension}
                disabled={selectedRoles.size === 0 || !extensionDate || isExtending}
                size="sm"
              >
                Extend Selected ({selectedRoles.size})
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {expiringRoles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No roles expiring in the next 7 days
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Checkbox
                checked={selectedRoles.size === expiringRoles.length && expiringRoles.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm font-medium">Select All</span>
            </div>
            {expiringRoles.map((item) => {
              const key = `${item.user_id}:${item.role}`;
              const isSelected = selectedRoles.has(key);
              const daysLeft = Math.ceil(item.days_until_expiry);
              
              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleRoleSelection(item.user_id, item.role)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{item.user_email}</span>
                        <Badge variant="outline" className="capitalize">
                          {item.role}
                        </Badge>
                      </div>
                      <p className={`text-xs ${getDaysColor(daysLeft)} font-medium`}>
                        Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''} 
                        ({format(new Date(item.expires_at), 'PPP')})
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
