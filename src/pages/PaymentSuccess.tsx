import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Mail, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ObfuscatedEmail from "@/components/ObfuscatedEmail";
import ObfuscatedPhone from "@/components/ObfuscatedPhone";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCartStore();
  const sessionId = searchParams.get("session_id");
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    // Clear cart after successful payment
    clearCart();
    
    // Automatically send confirmation email
    if (sessionId && !emailSent) {
      sendConfirmationEmail();
    }
  }, [clearCart, sessionId]);

  const sendConfirmationEmail = async () => {
    if (!sessionId || emailSent || sendingEmail) return;
    
    setSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-order-confirmation', {
        body: { sessionId }
      });

      if (error) throw error;
      
      setEmailSent(true);
      toast.success("Order confirmation sent to your email!");
      console.log("Email sent:", data);
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
      toast.error("Failed to send confirmation email. We'll email you shortly.");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-3xl">Payment Successful!</CardTitle>
            <CardDescription className="text-base">
              Thank you for your order. We've received your payment and will begin processing your custom cabinetry.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {sessionId && (
              <div className="bg-muted p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Order Reference</p>
                <p className="text-sm font-mono font-medium">{sessionId.substring(0, 30)}...</p>
              </div>
            )}

            <div className="bg-[#5C7650]/10 border-l-4 border-[#5C7650] p-4 rounded">
              <h3 className="font-semibold text-[#445339] mb-2 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Confirmation
              </h3>
              <p className="text-sm text-muted-foreground">
                {emailSent ? (
                  "✓ Order confirmation has been sent to your email address."
                ) : sendingEmail ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending confirmation email...
                  </span>
                ) : (
                  "Preparing your order confirmation email..."
                )}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">What Happens Next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-[#5C7650] font-bold">1.</span>
                  <span>Our team will review your order within 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5C7650] font-bold">2.</span>
                  <span>We'll contact you to confirm specifications and measurements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5C7650] font-bold">3.</span>
                  <span>Production begins once all details are finalized</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5C7650] font-bold">4.</span>
                  <span>We'll keep you updated throughout the process</span>
                </li>
              </ul>
            </div>

            <div className="border-t pt-4 space-y-2">
              <p className="text-sm font-medium">Need to make changes or have questions?</p>
              <div className="flex flex-col sm:flex-row gap-2 text-sm">
                <ObfuscatedEmail 
                  encoded="b3JkZXJzQGdyZWVuY2FiaW5ldHNueS5jb20="
                  className="text-[#5C7650] hover:text-[#445339] flex items-center gap-1"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email us</span>
                </ObfuscatedEmail>
                <span className="hidden sm:inline text-muted-foreground">•</span>
                <ObfuscatedPhone 
                  encoded="NzE4ODA0NTQ4OA=="
                  type="tel"
                  className="text-[#5C7650] hover:text-[#445339]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={() => navigate("/")} className="flex-1">
                Return to Home
              </Button>
              <Button 
                onClick={() => navigate("/shop")} 
                variant="outline"
                className="flex-1"
              >
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
