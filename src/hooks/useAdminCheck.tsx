import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        if (error) throw error;

        if (!data) {
          navigate('/');
          return;
        }

        setIsAdmin(data);
      } catch (error) {
        console.error('Error checking admin role:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminRole();
  }, [navigate]);

  return { isAdmin, isLoading };
};
