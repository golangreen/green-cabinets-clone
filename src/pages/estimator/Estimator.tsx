import { Save, FolderOpen, LogIn, LogOut, User } from 'lucide-react';
import Seo from '@/components/Seo';
import StepIndicator from '@/components/estimator/StepIndicator';
import UploadStep from '@/components/estimator/UploadStep';
import LocationStep from '@/components/estimator/LocationStep';
import MaterialsStep from '@/components/estimator/MaterialsStep';
import QuoteStep from '@/components/estimator/QuoteStep';
import OrderStep from '@/components/estimator/OrderStep';
import { useEstimator } from '@/hooks/useEstimator';

const Estimator = () => {
  const {
    user, signOut, navigate,
    step, setStep,
    fileAnalyzer,
    blueprintDataUrls, setBlueprintDataUrls,
    location, setLocation,
    analyzing, analysisError,
    analysis, setAnalysis,
    selectedCabinets, setSelectedCabinets,
    customLineItems, setCustomLineItems,
    delivery, setDelivery,
    installation, setInstallation,
    discount, setDiscount,
    hardware, setHardware,
    addOns, setAddOns,
    collection, setCollection,
    selectedFinish, setSelectedFinish,

    loadedQuoteId, saving,
    quoteName, setQuoteName,
    costs, canSave,
    handleSaveQuote, analyzeBlueprint,
  } = useEstimator();

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Blueprint Cost Estimator | Green Cabinets NY"
        description="Upload your blueprints and get an instant, itemized cabinet quote from Green Cabinets NY — Brooklyn's custom cabinet maker."
        path="/estimator"
      />
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Blueprint Cost Estimator
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Upload blueprints, select cabinets, get instant estimates
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          {user ? (
            <>
              <span className="text-xs text-muted-foreground flex items-center gap-1 max-w-[200px] truncate">
                <User size={14} /> {user.email}
              </span>
              <button
                onClick={() => navigate('/estimator/quotes')}
                className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline min-h-[36px] px-2"
              >
                <FolderOpen size={14} /> My Quotes
              </button>
              {canSave && (
                <>
                  <input
                    type="text"
                    value={quoteName}
                    onChange={(e) => setQuoteName(e.target.value)}
                    placeholder="Quote name"
                    className="text-xs bg-background border border-border rounded-lg px-2 py-2 w-28 sm:w-32 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={handleSaveQuote}
                    disabled={saving}
                    className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-60 transition-all min-h-[36px]"
                  >
                    <Save size={14} /> {saving ? 'Saving…' : loadedQuoteId ? 'Update' : 'Save'}
                  </button>
                </>
              )}
              <button onClick={signOut} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 min-h-[36px] px-2">
                <LogOut size={14} /> Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline min-h-[36px]"
            >
              <LogIn size={14} /> Sign in to save quotes
            </button>
          )}
        </div>

        <StepIndicator currentStep={step} onStepClick={setStep} />

        <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm">
          {step === 1 && (
            <UploadStep
              fileAnalyzer={fileAnalyzer}
              selectedCabinets={selectedCabinets}
              setSelectedCabinets={setSelectedCabinets}
              analysis={analysis}
              setAnalysis={setAnalysis}
              onNext={() => setStep(2)}
              onBlueprintPreviewsReady={setBlueprintDataUrls}
              onAddCustomItem={(description, qty, unitPrice) => {
                setCustomLineItems(prev => [
                  ...prev,
                  { id: crypto.randomUUID(), description, qty, unitPrice: unitPrice ?? 0, needsPricing: unitPrice == null },
                ]);
              }}
            />
          )}

          {step === 2 && (
            <LocationStep
              location={location}
              setLocation={setLocation}
              onBack={() => setStep(1)}
              onNext={analysis ? () => setStep(3) : (async () => { await analyzeBlueprint(); setStep(3); })}
              onSkipToManual={() => {
                if (!analysis) {
                  setAnalysis({ kitchens: [], bathrooms: [], closets: [], totalSquareFootage: 0, floors: 1 });
                }
                setStep(3);
              }}
              analyzing={analyzing}
              error={analysisError}
            />
          )}

          {step === 3 && (
            <MaterialsStep
              selectedCabinets={selectedCabinets}
              setSelectedCabinets={setSelectedCabinets}
              customLineItems={customLineItems}
              setCustomLineItems={setCustomLineItems}
              delivery={delivery}
              setDelivery={setDelivery}
              installation={installation}
              setInstallation={setInstallation}
              hardware={hardware}
              setHardware={setHardware}
              addOns={addOns}
              setAddOns={setAddOns}
              analysis={analysis}
              collection={collection}
              setCollection={setCollection}
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
            />
          )}

          {step === 4 && costs && (
            <QuoteStep
              costs={costs}
              location={location}
              fileName={fileAnalyzer.files.map(f => f.name).join(', ') || 'Untitled'}
              analysis={analysis}
              selectedCabinets={selectedCabinets}
              discount={discount}
              setDiscount={setDiscount}
              blueprintDataUrls={blueprintDataUrls}
              onBack={() => setStep(3)}
              onOrder={() => setStep(5)}
            />
          )}

          {step === 5 && costs && (
            <OrderStep
              costs={costs}
              collection={collection}
              location={location}
              selectedFinish={selectedFinish}
              onFinishChange={setSelectedFinish}
              onBack={() => setStep(4)}
            />
          )}

        </div>

        <div className="mt-6 sm:mt-10 text-center text-xs sm:text-sm text-muted-foreground">
          <p>
            Questions? Call{' '}
            <a href="tel:+17188045488" className="text-primary font-medium hover:underline">
              (718) 804-5488
            </a>
          </p>
          <p className="mt-1">Green Cabinets NY — 10 Montieth St, Bushwick, Brooklyn</p>
        </div>
      </div>
    </div>
  );
};

export default Estimator;
