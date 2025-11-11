import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      console.error('Error fetching expiring roles:', error);
      toast.error('Failed to load expiring roles');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRoleSelection = (userId: string, role: string) => {
    const key = `${userId}:${role}`;
    const newSelected = new Set(selectedRoles);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedRoles(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRoles.size === expiringRoles.length) {
      setSelectedRoles(new Set());
    } else {
      const allKeys = expiringRoles.map(r => `${r.user_id}:${r.role}`);
      setSelectedRoles(new Set(allKeys));
    }
  };

  const handleBulkExtension = async () => {
    if (selectedRoles.size === 0) {
      toast.error('Please select at least one role to extend');
      return;
    }
    if (!extensionDate) {
      toast.error('Please select an extension date');
      return;
    }

    try {
      setIsExtending(true);
      const extensions = Array.from(selectedRoles).map(key => {
        const [userId, role] = key.split(':');
        return {
          user_id: userId,
          role: role,
          new_expiration: extensionDate.toISOString()
        };
      });

      const { data, error } = await supabase.rpc('bulk_extend_role_expiration', {
        role_extensions: extensions
      });

      if (error) throw error;

      const result = data as { message?: string; extended_count?: number; failed_count?: number };
      toast.success(result.message || 'Roles extended successfully');
      setSelectedRoles(new Set());
      setExtensionDate(undefined);
      fetchExpiringRoles();
    } catch (error: any) {
      console.error('Error extending roles:', error);
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
