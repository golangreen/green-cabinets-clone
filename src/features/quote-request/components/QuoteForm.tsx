import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRecaptcha } from '@/features/quote-request/hooks';
import { validators } from "@/lib/formValidation";
import { logger } from '@/lib/logger';
import { prepareQuoteForSubmission, createQuoteMailtoLink, type QuoteData } from "../services/quoteService";

interface QuoteFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  projectType: z.enum(["kitchen", "bathroom", "closet", "other"], {
    required_error: "Please select a project type",
  }),
  roomSize: z.string().min(1, "Please select room size"),
  style: z.string().min(1, "Please select a style"),
  budget: z.string().min(1, "Please select a budget range"),
  timeline: z.string().min(1, "Please select a timeline"),
  name: validators.name,
  email: validators.email,
  phone: validators.phone,
  address: z.string().trim().min(5, "Please enter your address").max(200, "Address is too long"),
  message: validators.message.optional(),
});

type FormData = z.infer<typeof formSchema>;

const QuoteForm = ({ isOpen, onClose }: QuoteFormProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { executeRecaptcha, isConfigured } = useRecaptcha();
  const totalSteps = 4;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const projectType = watch("projectType");
  const roomSize = watch("roomSize");
  const style = watch("style");
  const budget = watch("budget");
  const timeline = watch("timeline");

  const progress = (step / totalSteps) * 100;

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Execute reCAPTCHA if configured (optional - app works without it)
      let recaptchaToken = null;
      if (isConfigured) {
        recaptchaToken = await executeRecaptcha('quote_request');
        // Don't block submission if reCAPTCHA fails - just continue without token
        if (!recaptchaToken) {
          logger.warn('reCAPTCHA verification skipped in development', { 
            component: 'QuoteForm'
          });
        }
      }
      
      // Prepare quote data with sanitization and formatting
      const quoteData: QuoteData = prepareQuoteForSubmission({
        projectType: data.projectType,
        roomSize: data.roomSize,
        style: data.style,
        budget: data.budget,
        timeline: data.timeline,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        message: data.message,
      });
      
      // Create mailto link with sanitized and formatted data
      const mailtoLink = createQuoteMailtoLink(quoteData, 'greencabinets@gmail.com');
      
      // Open email client
      window.location.href = mailtoLink;
      
      toast({
        title: "Quote Request Prepared!",
        description: "Your email client will open with the quote details. Please send the email to complete your request.",
      });
      
      // Reset form and close
      setTimeout(() => {
        reset();
        setStep(1);
        onClose();
        setIsSubmitting(false);
      }, 1000);
      
    } catch (error) {
      logger.error("Quote submission failed", error, { 
        component: 'QuoteForm',
        formData: data
      });
      toast({
        title: "Error",
        description: "Something went wrong. Please try calling us directly.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setStep(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Get Your Free Quote</DialogTitle>
          <DialogDescription>
            Tell us about your project and we'll provide a detailed estimate
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Project Type */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-semibold">What type of project do you have?</h3>
                <RadioGroup
                  value={projectType}
                  onValueChange={(value) => setValue("projectType", value as any)}
                  className="grid grid-cols-2 gap-4"
                >
                  {["kitchen", "bathroom", "closet", "other"].map((type) => (
                    <Label
                      key={type}
                      htmlFor={type}
                      className={`flex flex-col items-center justify-center p-6 border-2 rounded-lg cursor-pointer transition-all hover:border-primary ${
                        projectType === type ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <RadioGroupItem value={type} id={type} className="sr-only" />
                      <span className="text-4xl mb-2">
                        {type === "kitchen" && "🍳"}
                        {type === "bathroom" && "🛁"}
                        {type === "closet" && "👔"}
                        {type === "other" && "🏠"}
                      </span>
                      <span className="font-medium capitalize">{type}</span>
                    </Label>
                  ))}
                </RadioGroup>
                {errors.projectType && (
                  <p className="text-sm text-destructive">{errors.projectType.message}</p>
                )}
              </div>
            )}

            {/* Step 2: Room Details */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="roomSize">Room Size</Label>
                    <Select value={roomSize} onValueChange={(value) => setValue("roomSize", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (under 100 sq ft)</SelectItem>
                        <SelectItem value="medium">Medium (100-200 sq ft)</SelectItem>
                        <SelectItem value="large">Large (200-300 sq ft)</SelectItem>
                        <SelectItem value="extra-large">Extra Large (300+ sq ft)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.roomSize && (
                      <p className="text-sm text-destructive mt-1">{errors.roomSize.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="budget">Budget Range</Label>
                    <Select value={budget} onValueChange={(value) => setValue("budget", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-10k">Under $10,000</SelectItem>
                        <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                        <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                        <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                        <SelectItem value="over-100k">Over $100,000</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.budget && (
                      <p className="text-sm text-destructive mt-1">{errors.budget.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Style & Timeline */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="style">Preferred Style</Label>
                    <Select value={style} onValueChange={(value) => setValue("style", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="contemporary">Contemporary</SelectItem>
                        <SelectItem value="traditional">Traditional</SelectItem>
                        <SelectItem value="transitional">Transitional</SelectItem>
                        <SelectItem value="rustic">Rustic</SelectItem>
                        <SelectItem value="minimalist">Minimalist</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.style && (
                      <p className="text-sm text-destructive mt-1">{errors.style.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="timeline">Project Timeline</Label>
                    <Select value={timeline} onValueChange={(value) => setValue("timeline", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="When do you want to start?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">As soon as possible</SelectItem>
                        <SelectItem value="1-3months">1-3 months</SelectItem>
                        <SelectItem value="3-6months">3-6 months</SelectItem>
                        <SelectItem value="6months+">6+ months</SelectItem>
                        <SelectItem value="planning">Just planning/researching</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.timeline && (
                      <p className="text-sm text-destructive mt-1">{errors.timeline.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Contact Information */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="John Doe"
                      className="mt-1"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="john@example.com"
                      className="mt-1"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register("phone")}
                      placeholder="(646) 549-3955"
                      className="mt-1"
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="address">Project Address *</Label>
                    <Input
                      id="address"
                      {...register("address")}
                      placeholder="123 Main St, Brooklyn, NY 11206"
                      className="mt-1"
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="message">Additional Details (Optional)</Label>
                    <Textarea
                      id="message"
                      {...register("message")}
                      placeholder="Tell us more about your project..."
                      className="mt-1 min-h-[100px]"
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive mt-1">{errors.message.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t">
              {step > 1 ? (
                <Button type="button" variant="brand-outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              ) : (
                <div />
              )}

              {step < totalSteps ? (
                <Button
                  type="button"
                  variant="hero"
                  onClick={nextStep}
                  disabled={
                    (step === 1 && !projectType) ||
                    (step === 2 && (!roomSize || !budget)) ||
                    (step === 3 && (!style || !timeline))
                  }
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" variant="hero" disabled={isSubmitting}>
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Get My Quote
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteForm;
