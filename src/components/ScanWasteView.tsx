import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Loader2,
  MapPin,
  PlusCircle,
  RefreshCw,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import {
  CATEGORY_META,
  SAMPLE_DEMO_PHOTOS,
  WASTE_CATALOG,
} from '../data/wasteData';
import {
  ClassificationResult,
  SampleDemoPhoto,
  WasteActionType,
  WasteCategoryId,
} from '../types/ecosort';
import { calculateActivityPoints, normalizeProbabilityBreakdown } from '../utils/ecoRules';
import {
  PreparedImage,
  prepareFileForClassification,
  prepareUrlForClassification,
} from '../utils/imagePrep';
import { CategoryIcon } from './CategoryIcon';

interface ScanWasteViewProps {
  onLogDisposal: (entry: {
    itemName: string;
    category: WasteCategoryId;
    action: WasteActionType;
    quantity: number;
    notes: string;
    source: 'scan';
  }) => void;
  onFindCentreForMaterial: (material: string) => void;
}

const ORDERED_CATEGORIES: WasteCategoryId[] = [
  'dry',
  'ewaste',
  'wet',
  'hazardous',
];

export function ScanWasteView({
  onLogDisposal,
  onFindCentreForMaterial,
}: ScanWasteViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [selectedImage, setSelectedImage] = useState<PreparedImage | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);

  // Manual override state
  const [overrideCategory, setOverrideCategory] =
    useState<WasteCategoryId>('dry');
  const [overrideItemName, setOverrideItemName] = useState('');
  const [loggedSuccess, setLoggedSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Live camera capture state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleOpenCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Camera access is not supported in this browser. Please upload a photo instead.'
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setCameraOpen(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    } catch {
      setCameraError(
        'Camera permission was denied or no camera was found. You can upload any photo file instead.'
      );
    }
  };

  const handleCaptureCameraFrame = async () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9)
    );
    stopCameraStream();
    setCameraOpen(false);
    if (!blob) return;

    const file = new File([blob], 'camera-capture.jpg', {
      type: 'image/jpeg',
    });
    const prepared = await prepareFileForClassification(file);
    setSelectedImage(prepared);
    setResult(null);
    setErrorMessage(null);
    setLoggedSuccess(false);
  };

  const handleCloseCamera = () => {
    stopCameraStream();
    setCameraOpen(false);
  };

  const handleFilePicked = async (file: File) => {
    setErrorMessage(null);
    setLoggedSuccess(false);
    try {
      const prepared = await prepareFileForClassification(file);
      setSelectedImage(prepared);
      setResult(null);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Could not read the selected image.'
      );
    }
  };

  const classifyPreparedImage = async (img: PreparedImage) => {
    setIsClassifying(true);
    setErrorMessage(null);
    setLoggedSuccess(false);

    try {
      const res = await fetch('/api/classify-waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: img.base64,
          mimeType: img.mimeType,
        }),
      });

      const payload = (await res.json()) as
        | ClassificationResult
        | { error?: string };

      if (!res.ok) {
        const errMsg =
          'error' in payload && payload.error
            ? payload.error
            : 'Unable to classify image right now.';
        throw new Error(errMsg);
      }

      const classified = payload as ClassificationResult;
      const normalized = normalizeProbabilityBreakdown(
        classified.probabilityBreakdown,
        classified.category
      );

      const finalResult: ClassificationResult = {
        ...classified,
        confidence: classified.confidence || normalized.confidence,
        probabilityBreakdown: normalized.breakdown,
      };

      setResult(finalResult);
      setOverrideCategory(finalResult.category);
      setOverrideItemName(finalResult.itemName);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to analyze waste photo. Please try again.'
      );
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSelectSample = async (sample: SampleDemoPhoto) => {
    setErrorMessage(null);
    setLoggedSuccess(false);
    try {
      const prepared = await prepareUrlForClassification(
        sample.imageUrl,
        `${sample.id}.jpg`
      );
      setSelectedImage(prepared);
      await classifyPreparedImage(prepared);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not load sample photo.'
      );
    }
  };

  const handleOverrideCategoryChange = (nextCategory: WasteCategoryId) => {
    setOverrideCategory(nextCategory);
    if (!result) return;
    const matchingCatalog = WASTE_CATALOG.find(
      (item) => item.category === nextCategory
    );
    if (
      !overrideItemName ||
      overrideItemName === result.itemName ||
      WASTE_CATALOG.some((c) => c.name === overrideItemName)
    ) {
      if (matchingCatalog && overrideItemName !== result.itemName) {
        setOverrideItemName(matchingCatalog.name);
      }
    }
  };

  const activeCategoryMeta = CATEGORY_META[overrideCategory];
  const activeItemName =
    overrideItemName.trim() || result?.itemName || 'Scanned Waste Item';
  const pointsPreview = calculateActivityPoints(
    overrideCategory,
    activeCategoryMeta.defaultAction,
    1
  );

  const handleLogConfirmedResult = () => {
    if (!result) return;
    onLogDisposal({
      itemName: activeItemName,
      category: overrideCategory,
      action: activeCategoryMeta.defaultAction,
      quantity: 1,
      notes: `AI Photo Scan (${result.confidence}% confidence) · ${activeCategoryMeta.binShort}`,
      source: 'scan',
    });
    setLoggedSuccess(true);
  };

  const sortedProbabilities = result
    ? [...ORDERED_CATEGORIES].sort(
        (a, b) =>
          result.probabilityBreakdown[b] - result.probabilityBreakdown[a]
      )
    : [];

  const matchedCentreStream = (() => {
    if (overrideCategory === 'ewaste') return 'E-waste';
    if (overrideCategory === 'hazardous') return 'Hazardous';
    if (result?.materialTags?.length) {
      const candidate = result.materialTags.find((tag) =>
        [
          'Plastic',
          'Paper',
          'Glass',
          'Metal',
          'General recycling',
          'E-waste',
          'Hazardous',
        ].includes(tag)
      );
      if (candidate) return candidate;
    }
    return overrideCategory === 'dry' ? 'General recycling' : 'All Centres';
  })();

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[#18432B] tracking-wide">
            Module 01 · AI Photo Classification
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14231A] mt-1">
            Scan Waste Photo
          </h1>
          <p className="text-sm text-[#4B5E53] mt-1">
            Upload or capture a real photo of any waste item. EcoSort inspects
            the object, identifies the material, and routes it to the right bin
            or Pune drop-off hub.
          </p>
        </div>
      </div>

      {/* Camera Modal */}
      {cameraOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Camera waste photo capture"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl border border-[#DCE5DF] max-w-lg w-full overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E6EDE8]">
              <h2 className="text-base font-bold text-[#14231A]">
                Capture Waste Photo
              </h2>
              <button
                type="button"
                onClick={handleCloseCamera}
                aria-label="Close camera"
                className="p-1.5 rounded-lg text-[#587062] hover:bg-[#F3F6F4] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-[#111915]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-xl aspect-[4/3] object-cover"
              />
            </div>
            <div className="px-5 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseCamera}
                className="px-4 py-2 rounded-xl border border-[#D4DFD8] text-sm font-medium text-[#4B5E53] hover:bg-[#F3F6F4] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCaptureCameraFrame}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#18432B] hover:bg-[#123320] text-white text-sm font-semibold cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Upload & Sample Column */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-[#DCE5DF] p-5 sm:p-6 space-y-5">
          <div>
            <input
              ref={fileInputRef}
              id="waste-photo-input"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void handleFilePicked(file);
                }
                e.currentTarget.value = '';
              }}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  void handleFilePicked(file);
                }
              }}
              className={`rounded-xl border-2 border-dashed transition-colors p-4 text-center ${
                isDragging
                  ? 'border-[#18432B] bg-[#EAF3ED]/50'
                  : 'border-[#CFDAD3] bg-[#F8FAF8]'
              }`}
            >
              {selectedImage ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden bg-white border border-[#E3EAE5] aspect-[4/3] flex items-center justify-center">
                    <img
                      src={selectedImage.dataUrl}
                      alt={`Uploaded waste item: ${selectedImage.fileName}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs text-[#587062] px-1">
                    <span className="truncate font-medium">
                      {selectedImage.fileName}
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[#18432B] font-semibold hover:underline shrink-0 cursor-pointer"
                    >
                      Change image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-10 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[#EAF3ED] text-[#18432B] mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#14231A]">
                      Drop a real photo of your waste item here
                    </p>
                    <p className="text-xs text-[#587062]">
                      Supports JPG, PNG, and WebP photos from phone or desktop
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-[#CEDAD2] text-xs font-semibold text-[#14231A] hover:bg-[#F3F6F4] cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenCamera}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-[#CEDAD2] text-xs font-semibold text-[#14231A] hover:bg-[#F3F6F4] cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Use Camera</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {selectedImage && (
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleOpenCamera}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D4DFD8] text-xs font-medium text-[#4B5E53] hover:bg-[#F3F6F4] cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Retake with Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setResult(null);
                    setErrorMessage(null);
                    setLoggedSuccess(false);
                  }}
                  className="text-xs font-medium text-[#587062] hover:text-[#14231A] cursor-pointer"
                >
                  Clear photo
                </button>
              </div>
            )}

            {cameraError && (
              <p className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {cameraError}
              </p>
            )}
          </div>

          {/* Sample Demo Photos (Matches PDF Page 6) */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold tracking-wider text-[#587062] uppercase">
              Try Sample Demo Photos
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_DEMO_PHOTOS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  disabled={isClassifying}
                  onClick={() => void handleSelectSample(sample)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F8FAF8] hover:bg-[#EAF3ED] border border-[#DCE5DF] text-xs font-semibold text-[#14231A] transition-colors text-left disabled:opacity-60 cursor-pointer"
                >
                  <CategoryIcon category={sample.categoryHint} size="sm" />
                  <span className="truncate">{sample.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Classify CTA */}
          <button
            type="button"
            disabled={!selectedImage || isClassifying}
            onClick={() => {
              if (selectedImage) {
                void classifyPreparedImage(selectedImage);
              }
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#18432B] hover:bg-[#123320] disabled:bg-[#9FB1A6] text-white text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {isClassifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Identifying Item in Photo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Classify Waste Image</span>
              </>
            )}
          </button>
        </section>

        {/* Right Detection Result Column */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-[#DCE5DF] p-5 sm:p-6 min-h-[460px] flex flex-col">
          {errorMessage && (
            <div
              role="alert"
              className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-900"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1 text-sm">
                <p className="font-semibold">Classification could not complete</p>
                <p className="mt-0.5 text-red-800">{errorMessage}</p>
                {selectedImage && (
                  <button
                    type="button"
                    onClick={() => void classifyPreparedImage(selectedImage)}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-300 text-xs font-semibold text-red-800 hover:bg-red-100 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Classification</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {isClassifying && (
            <div className="flex-1 flex flex-col items-center justify-center py-14 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF3ED] text-[#18432B] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h2 className="text-base font-bold text-[#14231A]">
                  Inspecting Real Photo Contents...
                </h2>
                <p className="text-xs text-[#587062]">
                  Analyzing material composition, packaging layers, electronic
                  components, and contamination clues.
                </p>
              </div>
            </div>
          )}

          {!isClassifying && !result && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#F2F6F3] text-[#18432B] flex items-center justify-center">
                <Camera className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h2 className="text-lg font-bold text-[#14231A]">
                  Ready to Identify Your Waste Photo
                </h2>
                <p className="text-sm text-[#4B5E53]">
                  Upload any photo on the left—or click a sample photo—then press{' '}
                  <span className="font-semibold text-[#14231A]">
                    Classify Waste Image
                  </span>{' '}
                  to see exact object identification, bin routing, and disposal
                  prep steps.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 w-full max-w-lg">
                {ORDERED_CATEGORIES.map((catId) => (
                  <div
                    key={catId}
                    className="p-2.5 rounded-xl bg-[#F8FAF8] border border-[#E6EDE8] text-center"
                  >
                    <CategoryIcon category={catId} size="sm" />
                    <p className="text-[11px] font-semibold text-[#14231A] mt-1.5">
                      {CATEGORY_META[catId].binShort}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isClassifying && result && (
            <div className="space-y-5">
              {/* Top Prediction Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E9EFEA]">
                <div className="space-y-1.5 min-w-0">
                  <p className="text-[11px] font-semibold tracking-wider text-[#587062] uppercase">
                    Detected Waste Prediction
                  </p>
                  <h2
                    data-testid="scan-detected-item"
                    className="text-2xl font-bold text-[#14231A]"
                  >
                    {activeItemName}
                  </h2>
                  <div className="flex items-center gap-2 pt-0.5">
                    <CategoryIcon category={overrideCategory} size="sm" />
                    <span className="text-xs font-semibold text-[#283B30]">
                      {activeCategoryMeta.name}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 rounded-xl bg-[#F5F8F6] border border-[#DCE5DF] px-4 py-2.5 text-right">
                  <p className="text-[11px] font-medium text-[#587062]">
                    AI Confidence
                  </p>
                  <p
                    data-testid="scan-confidence"
                    className="text-2xl font-bold font-mono tabular-nums text-[#14231A]"
                  >
                    {result.confidence}%
                  </p>
                </div>
              </div>

              {/* Visual Evidence */}
              <div className="rounded-xl bg-[#F8FAF8] border border-[#E6EDE8] px-4 py-3 text-xs text-[#3C4E43]">
                <span className="font-semibold text-[#14231A]">
                  Visual observation:{' '}
                </span>
                {result.detectedSummary}
              </div>

              {!result.isWasteItem && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-900">
                  This photo does not clearly show a household waste item. Try
                  capturing a closer, well-lit photo of the item on a plain
                  surface, or use the manual override selector below.
                </div>
              )}

              {/* Recommended Action Banner */}
              <div
                className={`rounded-xl p-4 border ${activeCategoryMeta.bgTintClass} ${activeCategoryMeta.borderColorClass}`}
              >
                <p className="text-[11px] font-semibold tracking-wider uppercase text-[#4B5E53]">
                  Recommended Action
                </p>
                <p className="text-sm font-bold text-[#14231A] mt-1">
                  {overrideCategory === result.category
                    ? result.recommendedAction
                    : activeCategoryMeta.binTitle}
                </p>
              </div>

              {/* Disposal Instructions */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#14231A]">
                  Disposal Instructions ({activeItemName})
                </h3>
                <ul className="space-y-1.5 text-sm text-[#3C4E43]">
                  {result.disposalSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#EAF3ED] text-[#18432B] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Category Probability Breakdown (Matches PDF Page 6) */}
              <div className="space-y-2.5 pt-1">
                <p className="text-[11px] font-semibold tracking-wider text-[#587062] uppercase">
                  Category Probability Breakdown
                </p>
                <div className="space-y-2.5">
                  {sortedProbabilities.map((catId) => {
                    const pct = result.probabilityBreakdown[catId];
                    const meta = CATEGORY_META[catId];
                    return (
                      <div key={catId} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#283B30]">
                            {meta.name}
                          </span>
                          <span className="font-mono font-semibold text-[#14231A] tabular-nums">
                            {pct}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#EDF2EE] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${meta.barColorClass}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Manual Confirmation / Category Override */}
              <div className="rounded-xl bg-[#F8FAF8] border border-[#E6EDE8] p-4 space-y-3">
                <p className="text-[11px] font-semibold tracking-wider text-[#587062] uppercase">
                  Manual Confirmation / Category Override
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="override-category"
                      className="block text-xs font-medium text-[#4B5E53] mb-1"
                    >
                      Category
                    </label>
                    <select
                      id="override-category"
                      value={overrideCategory}
                      onChange={(e) =>
                        handleOverrideCategoryChange(
                          e.target.value as WasteCategoryId
                        )
                      }
                      className="w-full rounded-lg border border-[#CFDAD3] bg-white px-3 py-2 text-sm text-[#14231A] focus:outline-none focus:ring-2 focus:ring-[#18432B]"
                    >
                      {ORDERED_CATEGORIES.map((catId) => (
                        <option key={catId} value={catId}>
                          {CATEGORY_META[catId].name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="override-item-name"
                      className="block text-xs font-medium text-[#4B5E53] mb-1"
                    >
                      Specific Waste Item
                    </label>
                    <input
                      id="override-item-name"
                      type="text"
                      value={overrideItemName}
                      onChange={(e) => setOverrideItemName(e.target.value)}
                      placeholder="Enter or refine item name"
                      className="w-full rounded-lg border border-[#CFDAD3] bg-white px-3 py-2 text-sm text-[#14231A] focus:outline-none focus:ring-2 focus:ring-[#18432B]"
                    />
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E9EFEA]">
                <button
                  type="button"
                  disabled={loggedSuccess}
                  onClick={handleLogConfirmedResult}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    loggedSuccess
                      ? 'bg-[#EAF3ED] text-[#18432B] border border-[#B8D4C2] cursor-default'
                      : 'bg-[#18432B] hover:bg-[#123320] text-white'
                  }`}
                >
                  {loggedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Logged to My Activity (+{pointsPreview} pts)</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>Log to My Activity (+{pointsPreview} pts)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onFindCentreForMaterial(matchedCentreStream)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#D4DFD8] bg-white hover:bg-[#F3F6F4] text-sm font-semibold text-[#14231A] transition-colors cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-[#18432B]" />
                  <span>Find Nearest Centre</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
