import { Shield, Lock, Eye, Server, Key, AlertTriangle, CheckCircle2, FileCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SecurityPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-full">
                <Shield className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Security & Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your trust is our priority. Learn how we protect your data and maintain the highest security standards.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last Updated: November 10, 2025
            </p>
          </div>

          {/* Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Our Commitment to Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                At Green Cabinets, we implement enterprise-grade security measures to protect your personal information,
                payment data, and custom design specifications. Our multi-layered security approach ensures your data
                remains safe throughout your entire experience with us.
              </p>
            </CardContent>
          </Card>

          {/* Security Measures */}
          <div className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold mb-6">Security Measures</h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Data Encryption & Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>End-to-End Encryption:</strong> All data transmitted between your device and our servers
                    is encrypted using industry-standard TLS/SSL protocols.
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Secure Storage:</strong> Your personal information and design configurations are stored
                    in encrypted databases with strict access controls.
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>PCI DSS Compliance:</strong> Payment processing is handled through Stripe, a PCI DSS Level 1
                    certified payment processor. We never store your credit card information.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Authentication & Access Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>JWT Authentication:</strong> Secure token-based authentication protects all sensitive
                    endpoints and user sessions.
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Role-Based Access:</strong> Administrative functions are protected with role-based access
                    control (RBAC) ensuring only authorized personnel can access sensitive data.
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Row-Level Security:</strong> Database policies ensure users can only access their own data.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Infrastructure Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Rate Limiting:</strong> All public endpoints implement rate limiting to prevent abuse
                    and protect against denial-of-service attacks.
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>IP Blocking:</strong> Automated IP blocking system identifies and blocks suspicious
                    activity in real-time.
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Security Monitoring:</strong> 24/7 automated monitoring detects and alerts on potential
                    security threats.
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>reCAPTCHA Protection:</strong> Google reCAPTCHA v3 protects forms from automated bot attacks.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Input Validation & XSS Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Comprehensive Validation:</strong> All user inputs are validated using strict schemas
                    to prevent injection attacks and malformed data.
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>HTML Sanitization:</strong> User-generated content is automatically sanitized to prevent
                    cross-site scripting (XSS) attacks.
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Security Headers:</strong> HTTP security headers including X-XSS-Protection, X-Frame-Options,
                    and Content-Security-Policy protect against common web vulnerabilities.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Handling Practices */}
          <div className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold mb-6">Data Handling Practices</h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  What Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p><strong>Personal Information:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name, email address, phone number, and shipping address</li>
                  <li>Custom cabinet specifications and design preferences</li>
                  <li>Communication history and project details</li>
                </ul>
                
                <p className="mt-4"><strong>Payment Information:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Payment data is processed by Stripe (PCI DSS Level 1 certified)</li>
                  <li>We never store your credit card details on our servers</li>
                </ul>

                <p className="mt-4"><strong>Technical Information:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>IP addresses for security monitoring and fraud prevention</li>
                  <li>Browser type, device information, and usage analytics</li>
                  <li>Session data for authentication and user experience</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Order Fulfillment:</strong> Process your custom cabinet orders and provide quotes
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Communication:</strong> Send order updates, respond to inquiries, and provide customer support
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Service Improvement:</strong> Analyze usage patterns to enhance our configurator and services
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Security:</strong> Detect and prevent fraud, abuse, and security incidents
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Retention & Rights */}
          <div className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold mb-6">Your Rights & Data Retention</h2>
            
            <Card>
              <CardContent className="pt-6 space-y-4 text-muted-foreground">
                <p><strong>Your Rights Include:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your data (subject to legal retention requirements)</li>
                  <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
                </ul>

                <p className="mt-6"><strong>Data Retention:</strong></p>
                <p>
                  We retain your personal information only as long as necessary to fulfill the purposes outlined
                  in this policy, comply with legal obligations, resolve disputes, and enforce agreements. Custom
                  design specifications are typically retained for the duration of your project plus 7 years for
                  warranty and legal purposes.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Third-Party Services */}
          <div className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold mb-6">Third-Party Services</h2>
            
            <Card>
              <CardContent className="pt-6 space-y-4 text-muted-foreground">
                <p>We use trusted third-party services to provide our platform:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Stripe:</strong> Payment processing (PCI DSS Level 1 certified)</li>
                  <li><strong>Resend:</strong> Email delivery service</li>
                  <li><strong>Google reCAPTCHA:</strong> Bot and spam protection</li>
                  <li><strong>Shopify:</strong> Product catalog and order management</li>
                </ul>
                <p className="mt-4">
                  These services may collect and process data according to their own privacy policies.
                  We ensure all third-party services meet our high security standards.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Security Incidents */}
          <div className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold mb-6">Security Incident Response</h2>
            
            <Card>
              <CardContent className="pt-6 space-y-4 text-muted-foreground">
                <p>
                  In the unlikely event of a security breach affecting your personal data, we will:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Notify affected users within 72 hours of discovery</li>
                  <li>Provide details about the nature of the breach</li>
                  <li>Outline steps being taken to address the incident</li>
                  <li>Recommend actions you can take to protect yourself</li>
                  <li>Report the incident to relevant authorities as required by law</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Contact Section */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-4">Questions About Security or Privacy?</h3>
              <p className="text-muted-foreground mb-4">
                We're committed to transparency and are happy to answer any questions about our security practices
                or how we handle your data.
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:security@greencabinets.com" className="text-primary hover:underline">
                    security@greencabinets.com
                  </a>
                </p>
                <p>
                  <strong>General Inquiries:</strong>{" "}
                  <a href="mailto:greencabinets@gmail.com" className="text-primary hover:underline">
                    greencabinets@gmail.com
                  </a>
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  <a href="tel:+17188045488" className="text-primary hover:underline">
                    (718) 804-5488
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Updates Notice */}
          <div className="mt-8 p-4 bg-muted rounded-lg text-sm text-muted-foreground text-center">
            <p>
              This security policy may be updated periodically to reflect changes in our practices or legal requirements.
              We will notify users of significant changes via email.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SecurityPolicy;
