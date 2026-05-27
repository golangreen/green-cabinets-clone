import React, { useState } from 'react';
import { CheckCircle2, Loader2, Package, Phone, Mail, MapPin, CalendarDays, MessageSquare, User, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { CostBreakdown, Collection } from '@/lib/estimator/types';
import { fmt } from '@/lib/estimator/utils';
import { callEdgeFunction } from '@/lib/estimator/call-edge-function';
import FinishPicker from './FinishPicker';
import { getFinishById, getDoorStyleById } from '@/lib/estimator/finishes-data';
import { checkCompatibility, isFinishAllowedForDoor } from '@/lib/estimator/compatibility';

interface OrderForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  installDate: string;
  notes: string;
  doorStyle: string;
  finish: string;
}

interface OrderStepProps {
  costs: CostBreakdown;
  collection: Collection;
  location: string;
  selectedFinish?: string;
  onFinishChange?: (id: string) => void;
  onBack: () => void;
}


function FieldLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
      {icon}
      {label}
    </div>
  );
}

const OrderStep: React.FC<OrderStepProps> = ({ costs, collection, location, selectedFinish, onFinishChange, onBack }) => {
  const [form, setForm] = useState<OrderForm>({
    name: '', phone: '', email: '', address: '', installDate: '', notes: '',
    doorStyle: '', finish: selectedFinish ?? '',
  });

  const [errors, setErrors] = useState<Partial<OrderForm>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const set = (field: keyof OrderForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<OrderForm> = {};
    if (!form.name.trim())      errs.name      = 'Name is required';
    if (!form.phone.trim())     errs.phone     = 'Phone number is required';
    if (!form.email.trim())     errs.email     = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.address.trim())   errs.address   = 'Delivery address is required';
    if (!form.doorStyle)        errs.doorStyle = 'Please select a door style';
    if (!form.finish)           errs.finish    = 'Please select a finish';
    if (form.doorStyle && form.finish) {
      const compat = checkCompatibility(form.doorStyle, form.finish);
      if (!compat.ok) errs.finish = compat.reason;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const doorStyleName = getDoorStyleById(form.doorStyle)?.name ?? form.doorStyle;
      const finishObj     = getFinishById(form.finish);
      const finishName    = finishObj ? (finishObj.brand ? `${finishObj.brand} — ${finishObj.name}` : finishObj.name) : form.finish;

      const data = await callEdgeFunction('send-order', {
        order: {
          name:        form.name.trim(),
          phone:       form.phone.trim(),
          email:       form.email.trim(),
          address:     form.address.trim(),
          installDate: form.installDate.trim() || undefined,
          notes:       form.notes.trim() || undefined,
          doorStyle:   doorStyleName,
          finish:      finishName,
        },
        quoteSnapshot: {
          grandTotal:      costs.grandTotal,
          collection,
          location,
          items:           costs.items,
          customItems:     costs.customItems,
          addOnItems:      costs.addOnItems,
          deliveryFee:     costs.deliveryFee,
          installationFee: costs.installationFee,
          discountAmount:  costs.discountAmount,
        },
      });
      if (data?.error) throw new Error(data.error);

      setOrderNumber(data.orderNumber ?? 'GC-ORDER');
      toast.success('Order submitted! Check your email for confirmation.');
    } catch (err: any) {
      console.error('Order submission error:', err);
      toast.error(err?.message || 'Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ───────────────────────────────────────────────────
  if (orderNumber) {
    const finishObj  = getFinishById(form.finish);
    const finishName = finishObj ? (finishObj.brand ? `${finishObj.brand} — ${finishObj.name}` : finishObj.name) : form.finish;

    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-400">
        <div className="text-center pt-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={44} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Order Submitted!</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Green Cabinets NY will contact you within 24 hours to confirm details and schedule your installation.
          </p>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Your Order Number</p>
          <p className="text-3xl font-bold text-primary tracking-tight">{orderNumber}</p>
          <p className="text-xs text-muted-foreground mt-1">Keep this for your records — we'll reference it when we call</p>
        </div>

        <div className="bg-accent rounded-2xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total ordered</span>
            <span className="font-semibold text-foreground">{fmt(costs.grandTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Collection</span>
            <span className="font-semibold capitalize">{collection}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Door style</span>
            <span className="font-semibold">{getDoorStyleById(form.doorStyle)?.name ?? form.doorStyle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Finish</span>
            <span className="font-semibold">{finishName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Confirmation sent to</span>
            <span className="font-semibold truncate max-w-[180px]">{form.email}</span>
          </div>
        </div>

        <div className="bg-warning-soft border-l-4 border-warning rounded-xl p-4 flex gap-3">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            <strong>Next step:</strong> Our team will review your order and reach out to confirm pricing after on-site measurement. No payment is required yet.
          </p>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Questions in the meantime?</p>
          <a
            href="tel:+17188045488"
            className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
          >
            <Phone size={14} />
            (718) 804-5488
          </a>
        </div>
      </div>
    );
  }

  // ── Order form ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Place Your Order</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Confirm your details and submit — our team will follow up within 24 hours
        </p>
      </div>

      {/* Order summary */}
      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Package size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {costs.items.length} cabinet line{costs.items.length !== 1 ? 's' : ''}
              {costs.customItems.length > 0 && ` + ${costs.customItems.length} custom`}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{collection} collection</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-primary">{fmt(costs.grandTotal)}</p>
          <p className="text-xs text-muted-foreground">incl. all fees</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">

        {/* Name */}
        <div>
          <FieldLabel icon={<User size={12} />} label="Full Name *" />
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={set('name')}
            placeholder="Jane Smith"
            maxLength={100}
            className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary ${errors.name ? 'border-destructive' : 'border-border'}`}
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>

        {/* Phone + Email row */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel icon={<Phone size={12} />} label="Phone Number *" />
            <input
              type="tel"
              name="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="(718) 555-0100"
              maxLength={30}
              className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary ${errors.phone ? 'border-destructive' : 'border-border'}`}
            />
            {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
          </div>
          <div>
            <FieldLabel icon={<Mail size={12} />} label="Email Address *" />
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={set('email')}
              placeholder="jane@example.com"
              maxLength={255}
              className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary ${errors.email ? 'border-destructive' : 'border-border'}`}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Delivery address */}
        <div>
          <FieldLabel icon={<MapPin size={12} />} label="Delivery Address *" />
          <input
            type="text"
            name="street-address"
            autoComplete="street-address"
            value={form.address}
            onChange={set('address')}
            placeholder="123 Main St, Brooklyn, NY 11201"
            maxLength={300}
            className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary ${errors.address ? 'border-destructive' : 'border-border'}`}
          />
          {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
        </div>

        {/* Finishes & Colors */}
        <div className="border border-border rounded-2xl p-4">
          <p className="text-sm font-bold text-foreground mb-4">Finishes & Colors</p>
          <FinishPicker
            selectedDoorStyle={form.doorStyle}
            selectedFinish={form.finish}
            onDoorStyleChange={id => {
              setForm(prev => ({ ...prev, doorStyle: id }));
              if (errors.doorStyle) setErrors(prev => ({ ...prev, doorStyle: undefined }));
            }}
            onFinishChange={id => {
              setForm(prev => ({ ...prev, finish: id }));
              onFinishChange?.(id);
              if (errors.finish) setErrors(prev => ({ ...prev, finish: undefined }));
            }}

            errorDoorStyle={errors.doorStyle}
            errorFinish={errors.finish}
          />
        </div>

        {/* Preferred install date */}
        <div>
          <FieldLabel icon={<CalendarDays size={12} />} label="Preferred Installation Date (optional)" />
          <input
            type="date"
            value={form.installDate}
            onChange={set('installDate')}
            min={new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Notes */}
        <div>
          <FieldLabel icon={<MessageSquare size={12} />} label="Special Instructions (optional)" />
          <textarea
            value={form.notes}
            onChange={set('notes')}
            placeholder="Access instructions, specific room notes, anything else we should know…"
            maxLength={1000}
            rows={3}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          {form.notes.length > 0 && <p className="text-xs text-muted-foreground text-right mt-1">{form.notes.length}/1,000</p>}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-accent rounded-xl p-3 text-xs text-muted-foreground">
        By submitting this order you're requesting a cabinet order from Green Cabinets NY. No payment is collected now — our team will contact you to confirm pricing and arrange payment before production.
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-bold text-base hover:opacity-90 disabled:opacity-60 transition-all min-h-[52px] active:scale-[0.98]"
        >
          {submitting
            ? <><Loader2 size={18} className="animate-spin" /> Submitting…</>
            : <><Package size={18} /> Confirm Order — {fmt(costs.grandTotal)}</>
          }
        </button>
        <button
          onClick={onBack}
          className="w-full bg-secondary text-secondary-foreground py-3.5 rounded-xl font-semibold hover:opacity-80 transition-all min-h-[48px] active:scale-[0.98]"
        >
          ← Back to Quote
        </button>
      </div>
    </div>
  );
};

export default OrderStep;
