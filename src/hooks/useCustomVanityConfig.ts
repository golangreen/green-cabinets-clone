import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { ShopifyProduct } from "@/types";
import { useCartStore } from "@/stores/cartStore";
import { paymentService } from "@/services/paymentService";
import { vanityRequestService } from "@/services/vanityRequestService";
import {
  customVanityService,
  dimensionSchema,
  brandSchema,
  finishSchema,
  widthSchema,
  heightSchema,
  depthSchema,
  zipCodeSchema,
  validateField,
  type VanityBrand,
} from "@/services/customVanityService";

export interface UseCustomVanityConfigOptions {
  product: ShopifyProduct;
}

export function useCustomVanityConfig({ product }: UseCustomVanityConfigOptions) {
  const addItem = useCartStore((s) => s.addItem);

  const [selectedBrand, setSelectedBrand] = useState<VanityBrand | "">("Tafisa");
  const [selectedFinish, setSelectedFinish] = useState<string>("");
  const [width, setWidth] = useState("");
  const [widthFraction, setWidthFraction] = useState("0");
  const [height, setHeight] = useState("");
  const [heightFraction, setHeightFraction] = useState("0");
  const [depth, setDepth] = useState("");
  const [depthFraction, setDepthFraction] = useState("0");
  const [zipCode, setZipCode] = useState("");
  const [state, setState] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [isRequestingQuote, setIsRequestingQuote] = useState(false);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  type FieldKey = "brand" | "finish" | "width" | "height" | "depth" | "zipCode";
  type ErrorMap = Record<FieldKey, string | null>;
  const EMPTY_ERRORS: ErrorMap = {
    brand: null, finish: null, width: null, height: null, depth: null, zipCode: null,
  };
  const [errors, setErrors] = useState<ErrorMap>(EMPTY_ERRORS);

  const setError = (key: FieldKey, value: string | null) =>
    setErrors((e) => ({ ...e, [key]: value }));

  const availableFinishes = useMemo(
    () => customVanityService.getAvailableFinishes(selectedBrand),
    [selectedBrand],
  );

  // Reset finish on brand change
  useEffect(() => {
    if (selectedBrand) setSelectedFinish(availableFinishes[0] ?? "");
  }, [selectedBrand, availableFinishes]);

  // Detect state from ZIP
  useEffect(() => {
    setState(customVanityService.zipToState(zipCode));
  }, [zipCode]);

  const widthInches = customVanityService.inchesFromParts(width, widthFraction);
  const heightInches = customVanityService.inchesFromParts(height, heightFraction);
  const depthInches = customVanityService.inchesFromParts(depth, depthFraction);
  const linearFeet = widthInches / 12;

  const basePrice = width && selectedBrand
    ? customVanityService.calculateBasePrice(widthInches)
    : 0;
  const tax = customVanityService.calculateTax(basePrice, state);
  const shipping = customVanityService.calculateShipping(state);
  const totalPrice = basePrice + tax + shipping;

  const resetCheckoutErrors = () => setErrors(EMPTY_ERRORS);

  /** Validate all relevant fields with zod and return error map + any-errors flag. */
  const validateAll = (require: { height?: boolean; depth?: boolean }): { next: ErrorMap; hasError: boolean } => {
    const next: ErrorMap = { ...EMPTY_ERRORS };
    next.brand = validateField(brandSchema, selectedBrand);
    next.finish = validateField(finishSchema, selectedFinish);
    next.width = !width
      ? "Width is required"
      : validateField(widthSchema, widthInches);
    if (require.height) {
      next.height = !height
        ? "Height is required"
        : validateField(heightSchema, heightInches);
    }
    if (require.depth) {
      next.depth = !depth
        ? "Depth is required"
        : validateField(depthSchema, depthInches);
    }
    next.zipCode = validateField(zipCodeSchema, zipCode);
    const hasError = (Object.values(next) as (string | null)[]).some(Boolean);
    return { next, hasError };
  };

  const handleAddToCart = () => {
    const { next, hasError } = validateAll({ height: true, depth: true });
    setErrors(next);
    if (hasError) {
      const firstMsg = (Object.values(next) as (string | null)[]).find(Boolean);
      toast.error("Please fix the highlighted fields", {
        description: firstMsg ?? "Some fields need attention",
      });
      return;
    }

    const matchingVariant = product.node.variants.edges[0];
    if (!matchingVariant) {
      toast.error("Configuration error", { description: "Product variant not available." });
      return;
    }

    addItem({
      product,
      variantId: matchingVariant.node.id,
      variantTitle: matchingVariant.node.title,
      price: { amount: totalPrice.toFixed(2), currencyCode: matchingVariant.node.price.currencyCode },
      quantity: 1,
      selectedOptions: [
        { name: "Brand", value: selectedBrand },
        { name: "Finish", value: selectedFinish },
      ],
      customAttributes: [
        { key: "Brand", value: selectedBrand },
        { key: "Finish", value: selectedFinish },
        { key: "Width", value: `${widthInches.toFixed(4)}"` },
        { key: "Height", value: `${heightInches.toFixed(4)}"` },
        { key: "Depth", value: `${depthInches.toFixed(4)}"` },
        { key: "Zip Code", value: zipCode },
        { key: "State", value: state || "Unknown" },
        { key: "Calculated Price", value: `$${basePrice.toFixed(2)}` },
        { key: "Tax", value: `$${tax.toFixed(2)}` },
        { key: "Shipping", value: `$${shipping.toFixed(2)}` },
        { key: "Total Estimate", value: `$${totalPrice.toFixed(2)}` },
      ],
    });

    toast.success("Added to cart!", {
      description: "Your custom vanity configuration has been added. Note: Final pricing will be confirmed by our team.",
      position: "top-center",
    });
  };

  const handleCheckout = async () => {
    const { next, hasError } = validateAll({});
    setErrors(next);
    if (hasError) {
      const firstMsg = (Object.values(next) as (string | null)[]).find(Boolean);
      toast.error("Please fix the highlighted fields", {
        description: firstMsg ?? "Brand, finish, width, and ZIP code are required",
      });
      return;
    }
    setIsProcessing(true);
    try {
      const { url, error } = await paymentService.createCustomProductPayment({
        name: `Custom Vanity - ${selectedBrand} ${selectedFinish}`,
        description: `Width: ${widthInches.toFixed(2)}" (${linearFeet.toFixed(2)} linear feet) | Brand: ${selectedBrand} | Finish: ${selectedFinish} | ZIP: ${zipCode}`,
        amount: Math.round(totalPrice * 100),
        metadata: {
          brand: selectedBrand,
          finish: selectedFinish,
          width: widthInches.toFixed(2),
          zipCode,
          state: state || "Unknown",
          basePrice: basePrice.toFixed(2),
          tax: tax.toFixed(2),
          shipping: shipping.toFixed(2),
        },
      });
      if (error) throw error;
      if (url) window.open(url, "_blank");
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Failed to create payment session");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestQuote = () => {
    const { next, hasError } = validateAll({});
    setErrors(next);
    if (hasError) {
      const firstMsg = (Object.values(next) as (string | null)[]).find(Boolean);
      toast.error("Please fix the highlighted fields", {
        description: firstMsg ?? "Brand, finish, width, and ZIP code are required",
      });
      return;
    }
    setShowQuoteDialog(true);
  };

  const handleSubmitQuote = async () => {
    if (!customerName || !customerEmail) {
      toast.error("Please fill in your contact information");
      return;
    }
    setIsRequestingQuote(true);
    try {
      await vanityRequestService.sendQuote({
        customerName,
        customerEmail,
        customerPhone: customerPhone || undefined,
        brand: selectedBrand,
        finish: selectedFinish,
        width: widthInches,
        height: height ? heightInches : undefined,
        depth: depth ? depthInches : undefined,
        zipCode,
        state: state || "Unknown",
        basePrice,
        tax,
        shipping,
        totalPrice,
        additionalNotes: additionalNotes || undefined,
      });
      toast.success("Quote request sent!", {
        description: "We'll get back to you within 24 hours with a detailed quote.",
      });
      setShowQuoteDialog(false);
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setAdditionalNotes("");
    } catch (err) {
      console.error("Quote request error:", err);
      toast.error("Failed to send quote request", {
        description: "Please try again or contact us directly.",
      });
    } finally {
      setIsRequestingQuote(false);
    }
  };

  return {
    // selections
    selectedBrand, setSelectedBrand: (b: string) => { setSelectedBrand(b as VanityBrand); setError("brand", null); },
    selectedFinish, setSelectedFinish: (v: string) => { setSelectedFinish(v); setError("finish", null); },
    availableFinishes,

    // dimensions — live-validate on change
    width,
    setWidth: (v: string) => {
      setWidth(v);
      if (!v) return setError("width", null);
      const inches = customVanityService.inchesFromParts(v, widthFraction);
      setError("width", validateField(widthSchema, inches));
    },
    widthFraction, setWidthFraction,
    height,
    setHeight: (v: string) => {
      setHeight(v);
      if (!v) return setError("height", null);
      const inches = customVanityService.inchesFromParts(v, heightFraction);
      setError("height", validateField(heightSchema, inches));
    },
    heightFraction, setHeightFraction,
    depth,
    setDepth: (v: string) => {
      setDepth(v);
      if (!v) return setError("depth", null);
      const inches = customVanityService.inchesFromParts(v, depthFraction);
      setError("depth", validateField(depthSchema, inches));
    },
    depthFraction, setDepthFraction,

    // zip / state — live-validate
    zipCode,
    setZipCode: (v: string) => {
      const trimmed = v.replace(/\D/g, "").slice(0, 5);
      setZipCode(trimmed);
      setError("zipCode", trimmed.length === 0 ? null : validateField(zipCodeSchema, trimmed));
    },
    state,

    // errors
    errors,

    // computed
    widthInches, heightInches, depthInches, linearFeet,
    basePrice, tax, shipping, totalPrice,

    // dialog state
    showQuoteDialog, setShowQuoteDialog,
    customerName, setCustomerName,
    customerEmail, setCustomerEmail,
    customerPhone, setCustomerPhone,
    additionalNotes, setAdditionalNotes,

    // status
    isProcessing, isRequestingQuote,

    // handlers
    handleAddToCart, handleCheckout, handleRequestQuote, handleSubmitQuote,
  };
}

export type CustomVanityConfig = ReturnType<typeof useCustomVanityConfig>;
