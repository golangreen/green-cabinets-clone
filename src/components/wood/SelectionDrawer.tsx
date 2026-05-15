/**
 * SelectionDrawer — floating "My Selection" FAB + Sheet drawer.
 * Lives on the /finishes-colors page. Lets the visitor:
 *   1. Copy a shareable URL with their picks encoded
 *   2. Email the selection to themselves
 *   3. Send the selection to Green Cabinets (orders@greencabinetsny.com)
 */
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, X, Copy, Check, Mail, Send, Columns3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFinishSelection, buildShareUrl } from "@/hooks/useFinishSelection";
import { ALL_PANELS } from "@/data/finishes";
import { finishSelectionService } from "@/services/finishSelectionService";
import CompareDialog from "./CompareDialog";

export const SelectionDrawer = () => {
  const { ids, remove, clear } = useFinishSelection();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState<"self" | "shop" | null>(null);

  const picks = useMemo(
    () => ids.map((id) => ALL_PANELS.find((p) => p.id === id)).filter(Boolean),
    [ids]
  );

  const shareUrl = useMemo(() => buildShareUrl(ids), [ids]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "Link copied", description: "Paste it in a text or email." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Long-press the link to copy.", variant: "destructive" });
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      handleCopy();
      return;
    }
    try {
      await navigator.share({
        title: "My Green Cabinets finish picks",
        text: `Check out these ${picks.length} finishes I'm considering:`,
        url: shareUrl,
      });
    } catch {
      /* user cancelled */
    }
  };

  const sendEmail = async (kind: "self" | "shop") => {
    if (kind === "self" && !email.trim()) {
      toast({ title: "Email required", description: "Enter your email first.", variant: "destructive" });
      return;
    }
    if (kind === "shop" && (!name.trim() || !email.trim())) {
      toast({ title: "Name and email required", variant: "destructive" });
      return;
    }
    setSending(kind);
    try {
      await finishSelectionService.send({
        kind,
        name: name.trim() || null,
        email: email.trim(),
        phone: phone.trim() || null,
        note: note.trim() || null,
        shareUrl,
        picks: picks.map((p) => ({
          id: p!.id,
          brand: p!.brand,
          name: p!.name,
          codes: p!.codes,
          thumb: p!.thumb,
          detailUrl: p!.detailUrl,
        })),
      });
      toast({
        title: kind === "self" ? "Sent to your inbox" : "Sent to Green Cabinets",
        description:
          kind === "self"
            ? "Check your email for your finish picks."
            : "We'll get back to you shortly with pricing and availability.",
      });
      if (kind === "shop") {
        setOpen(false);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Could not send",
        description: "Please try again or copy the share link instead.",
        variant: "destructive",
      });
    } finally {
      setSending(null);
    }
  };

  if (ids.length === 0) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#5C7650] px-5 py-3 text-white shadow-2xl hover:bg-[#445339] hover:scale-105 transition-all"
          aria-label={`My selection, ${ids.length} finishes`}
        >
          <Heart className="h-5 w-5 fill-white" />
          <span className="font-semibold">My Selection</span>
          <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-mono">
            {ids.length}
          </span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>My Finish Selection ({picks.length})</SheetTitle>
          <SheetDescription>
            Save it, share it, or send it to us for pricing.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto pr-1">
          {picks.map((p) => (
            <div
              key={p!.id}
              className="flex items-center gap-3 rounded-lg border border-border p-2"
            >
              <img
                src={p!.thumb}
                alt={p!.name}
                className="h-12 w-12 rounded object-cover flex-shrink-0"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{p!.name}</p>
                <p className="text-[11px] font-mono text-[#5C7650] truncate">
                  {p!.brand} · {p!.codes[0]}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 flex-shrink-0"
                onClick={() => remove(p!.id)}
                aria-label={`Remove ${p!.name}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={picks.length < 2}
            onClick={() => {
              setOpen(false);
              setCompareOpen(true);
            }}
            className="border-[#5C7650] text-[#5C7650] hover:bg-[#5C7650] hover:text-white disabled:opacity-50"
          >
            <Columns3 className="h-4 w-4 mr-1.5" />
            Compare {picks.length >= 2 ? `(${Math.min(picks.length, 4)})` : ""}
          </Button>
          <button
            onClick={clear}
            className="text-xs text-muted-foreground hover:text-destructive underline"
          >
            Clear all
          </button>
        </div>

        <Tabs defaultValue="share" className="mt-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="share">Share</TabsTrigger>
            <TabsTrigger value="self">Email me</TabsTrigger>
            <TabsTrigger value="shop">Send to us</TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-3 pt-4">
            <p className="text-xs text-muted-foreground">
              Anyone with this link sees the same finishes.
            </p>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="text-xs" />
              <Button onClick={handleCopy} size="icon" variant="outline">
                {copied ? <Check className="h-4 w-4 text-[#5C7650]" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button onClick={handleNativeShare} className="w-full bg-[#5C7650] hover:bg-[#445339]">
              <Send className="h-4 w-4 mr-2" />
              Share with friends
            </Button>
          </TabsContent>

          <TabsContent value="self" className="space-y-3 pt-4">
            <Label htmlFor="self-email">Your email</Label>
            <Input
              id="self-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Button
              onClick={() => sendEmail("self")}
              disabled={sending !== null}
              className="w-full bg-[#5C7650] hover:bg-[#445339]"
            >
              <Mail className="h-4 w-4 mr-2" />
              {sending === "self" ? "Sending..." : "Email me my picks"}
            </Button>
          </TabsContent>

          <TabsContent value="shop" className="space-y-3 pt-4">
            <p className="text-xs text-muted-foreground">
              We'll review your picks and reply with pricing & availability.
            </p>
            <div className="grid gap-2">
              <Label htmlFor="shop-name">Name</Label>
              <Input
                id="shop-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shop-email">Email</Label>
              <Input
                id="shop-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shop-phone">Phone (optional)</Label>
              <Input
                id="shop-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 555-5555"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shop-note">Note (optional)</Label>
              <Textarea
                id="shop-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tell us about your project..."
                rows={3}
              />
            </div>
            <Button
              onClick={() => sendEmail("shop")}
              disabled={sending !== null}
              className="w-full bg-[#5C7650] hover:bg-[#445339]"
            >
              <Send className="h-4 w-4 mr-2" />
              {sending === "shop" ? "Sending..." : "Send to Green Cabinets"}
            </Button>
          </TabsContent>
        </Tabs>
      </SheetContent>
      <CompareDialog open={compareOpen} onOpenChange={setCompareOpen} />
    </Sheet>
  );
};

export default SelectionDrawer;
