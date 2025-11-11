import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useCartStore } from "@/features/shopping-cart";
import { ROUTES } from "@/constants/routes";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCartStore();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Clear cart after successful payment
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Thank you for your order. We've received your payment and will begin processing your custom vanity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessionId && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Order Reference</p>
                <p className="text-sm font-mono">{sessionId}</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              You will receive an email confirmation shortly with your order details.
              We'll contact you within 24 hours to confirm your custom specifications and discuss the next steps.
            </p>
            <Button onClick={() => navigate(ROUTES.HOME)} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
