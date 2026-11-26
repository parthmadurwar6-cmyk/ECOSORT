import { useMemo, useState } from 'react';
import {
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  Minus,
  Navigation,
  Phone,
  Plus,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { PUNE_RECYCLING_CENTRES } from '../data/wasteData';
import { RecyclingCentre } from '../types/ecosort';
import { filterRecyclingCentres } from '../utils/ecoRules';

interface RecyclingCentresViewProps {
  initialMaterialFilter: string;
  onMaterialFilterChange: (material: string) => void;
}

const STREAM_FILTERS = [
  'All Centres',
  'E-waste',
  'Plastic',
  'Paper',
  'Glass',
  'Metal',
  'General recycling',
  'Hazardous',
];

export function RecyclingCentresView({
  initialMaterialFilter,
  onMaterialFilterChange,
}: RecyclingCentresViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCentreId, setSelectedCentreId] = useState<string>(
    PUNE_RECYCLING_CENTRES[0].id
  );
  const [zoom, setZoom] = useState(1);
  const [directionsCentre, setDirectionsCentre] =
    useState<RecyclingCentre | null>(null);

  const filteredCentres = useMemo(
    () =>
      filterRecyclingCentres(
        PUNE_RECYCLING_CENTRES,
        searchQuery,
        initialMaterialFilter
      ),
    [searchQuery, initialMaterialFilter]
  );

  const activeCentre = useMemo(() => {
    return (
      filteredCentres.find((c) => c.id === selectedCentreId) ||
      filteredCentres[0] ||
      null
    );
  }, [filteredCentres, selectedCentreId]);

  const handleZoomIn = () => setZoom((z) => Math.min(1.6, Number((z + 0.2).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.8, Number((z - 0.2).toFixed(2))));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-5">
      <div>
        <p className="text-xs font-semibold text-[#18432B] tracking-wide">
          Module 02 · Authorized Pune Drop-Off Network
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#14231A] mt-1">
          Authorized Recycling Centres
        </h1>
        <p className="text-sm text-[#4B5E53] mt-1">
          Geo-located recovery units and MPCB-authorized drop-off points across
          Pune localities.
        </p>
      </div>

      {/* Search & Stream Filter Row (Matches PDF Page 7) */}
      <div className="bg-white rounded-2xl border border-[#DCE5DF] p-4 space-y-3">
        <div className="relative">
          <label htmlFor="centre-search" className="sr-only">
            Search recycling centres
          </label>
          <Search
            className="w-4 h-4 text-[#587062] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="centre-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by centre name, locality, or city..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D4DFD8] bg-[#F8FAF8] text-sm text-[#14231A] placeholder:text-[#73887B] focus:outline-none focus:ring-2 focus:ring-[#18432B] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {STREAM_FILTERS.map((filter) => {
            const active = initialMaterialFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => onMaterialFilterChange(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#18432B] text-white'
                    : 'bg-[#F3F6F4] text-[#4B5E53] hover:text-[#14231A] hover:bg-[#E7EEE9]'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Split Directory & Interactive Pune Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Centre Cards */}
        <div className="lg:col-span-5 space-y-3 max-h-[580px] overflow-y-auto pr-1">
          {filteredCentres.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#DCE5DF] p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-[#14231A]">
                No centres match that filter
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  onMaterialFilterChange('All Centres');
                }}
                className="text-xs font-semibold text-[#18432B] hover:underline cursor-pointer"
              >
                Show all Pune centres
              </button>
            </div>
          ) : (
            filteredCentres.map((centre) => {
              const isSelected = activeCentre?.id === centre.id;
              return (
                <article
                  key={centre.id}
                  className={`bg-white rounded-2xl border p-4 sm:p-5 space-y-3 transition-colors ${
                    isSelected
                      ? 'border-[#18432B] shadow-sm'
                      : 'border-[#DCE5DF] hover:border-[#18432B]/40'
                  }`}
                >
                  <div>
                    <h2 className="text-base font-bold text-[#14231A]">
                      {centre.name}
                    </h2>
                    <p className="text-xs text-[#4B5E53] mt-0.5 flex items-start gap-1.5">
                      <MapPin
                        className="w-3.5 h-3.5 text-[#587062] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{centre.address}</span>
                    </p>
                  </div>

                  <p className="text-xs text-[#3C4E43] font-medium">
                    {centre.materials.join(' · ')}
                  </p>

                  <div className="space-y-1 text-xs text-[#587062]">
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{centre.hours}</span>
                    </p>
                    <p className="flex items-center gap-1.5 font-mono tabular-nums">
                      <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{centre.phone}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{centre.email}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedCentreId(centre.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#18432B] text-white'
                          : 'bg-[#18432B] hover:bg-[#123320] text-white'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>View on Map</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDirectionsCentre(centre)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#D4DFD8] bg-white hover:bg-[#F3F6F4] text-xs font-semibold text-[#14231A] transition-colors cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#18432B]" aria-hidden="true" />
                      <span>Get Directions</span>
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Right Interactive Pune Map */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DCE5DF] p-3 space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-[#DCE5DF] bg-[#EFECE3] h-[470px] sm:h-[520px]">
            {/* Zoom Controls */}
            <div className="absolute top-3 left-3 z-20 flex flex-col bg-white rounded-lg border border-[#CFDAD3] shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={handleZoomIn}
                aria-label="Zoom in map"
                className="w-8 h-8 flex items-center justify-center text-[#14231A] hover:bg-[#F3F6F4] border-b border-[#E6EDE8] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                aria-label="Zoom out map"
                className="w-8 h-8 flex items-center justify-center text-[#14231A] hover:bg-[#F3F6F4] border-b border-[#E6EDE8] cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                aria-label="Reset map zoom"
                className="w-8 h-8 flex items-center justify-center text-[#14231A] hover:bg-[#F3F6F4] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Map Legend */}
            <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg border border-[#CFDAD3] text-[11px] font-semibold text-[#14231A]">
              Pune District · {filteredCentres.length} Verified Hubs
            </div>

            {/* Scalable Vector Map Canvas */}
            <div
              className="w-full h-full relative transition-transform duration-200 origin-center"
              style={{ transform: `scale(${zoom})` }}
            >
              <svg
                viewBox="0 0 800 560"
                className="w-full h-full object-cover"
                aria-label="Map of Pune recycling centres"
              >
                {/* Land & Green Park Zones */}
                <rect width="800" height="560" fill="#F2EFE7" />
                <path
                  d="M40 80 L230 60 L260 220 L90 250 Z"
                  fill="#DDE8D7"
                  opacity="0.7"
                />
                <path
                  d="M270 150 L410 130 L430 240 L290 270 Z"
                  fill="#E1EBDC"
                  opacity="0.8"
                />
                <path
                  d="M540 210 L740 190 L760 340 L570 350 Z"
                  fill="#E4E9DF"
                  opacity="0.7"
                />
                <path
                  d="M120 350 L310 330 L340 480 L100 500 Z"
                  fill="#E2EAD9"
                  opacity="0.7"
                />

                {/* Mula-Mutha River */}
                <path
                  d="M-20 290 C120 265, 220 305, 340 285 C460 265, 570 210, 820 240"
                  fill="none"
                  stroke="#B8D8E6"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                <path
                  d="M190 30 C235 130, 290 210, 340 285"
                  fill="none"
                  stroke="#B8D8E6"
                  strokeWidth="11"
                  strokeLinecap="round"
                />

                {/* Arterial Roads */}
                <path
                  d="M60 110 L740 430"
                  stroke="#F7D794"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M110 470 L680 120"
                  stroke="#F7D794"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M360 30 L420 530"
                  stroke="#FFFFFF"
                  strokeWidth="5"
                />
                <path
                  d="M40 230 L760 230"
                  stroke="#FFFFFF"
                  strokeWidth="4"
                />
                <path
                  d="M80 390 L720 390"
                  stroke="#FFFFFF"
                  strokeWidth="4"
                />
                <path
                  d="M210 60 L210 510"
                  stroke="#E5E1D6"
                  strokeWidth="3"
                />
                <path
                  d="M570 50 L570 510"
                  stroke="#E5E1D6"
                  strokeWidth="3"
                />

                {/* Locality Labels */}
                <g
                  fill="#4B5850"
                  stroke="#F2EFE7"
                  strokeWidth="4"
                  paintOrder="stroke"
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="DM Sans, sans-serif"
                >
                  <text x="135" y="135">Baner</text>
                  <text x="95" y="212">Pashan</text>
                  <text x="245" y="165">University / Ganeshkhind</text>
                  <text x="455" y="218">Shivajinagar</text>
                  <text x="325" y="328">Deccan Gymkhana</text>
                  <text x="155" y="385">Kothrud</text>
                  <text x="255" y="455">Karve Nagar</text>
                  <text x="530" y="290">Koregaon Park</text>
                  <text x="610" y="138">Viman Nagar</text>
                  <text x="510" y="365">Pune Camp</text>
                </g>
              </svg>

              {/* Interactive Pins */}
              {filteredCentres.map((centre) => {
                const isSelected = activeCentre?.id === centre.id;
                return (
                  <button
                    key={centre.id}
                    type="button"
                    onClick={() => setSelectedCentreId(centre.id)}
                    aria-label={`Select ${centre.name}`}
                    style={{
                      left: `${centre.mapX}%`,
                      top: `${centre.mapY}%`,
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-full transition-transform cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18432B] rounded-full ${
                      isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-md ${
                        isSelected
                          ? 'bg-[#D97706] text-white'
                          : 'bg-[#18432B] text-white'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Centre Floating Info Strip */}
            {activeCentre && (
              <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/95 backdrop-blur rounded-xl border border-[#DCE5DF] p-3.5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#14231A] truncate">
                    {activeCentre.name}
                  </p>
                  <p className="text-[11px] text-[#587062] truncate">
                    {activeCentre.address} · {activeCentre.hours}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDirectionsCentre(activeCentre)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#18432B] hover:bg-[#123320] text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Directions & Drop-Off Checklist Modal */}
      {directionsCentre && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Directions to ${directionsCentre.name}`}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl border border-[#DCE5DF] max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#18432B]">
                  Drop-Off Route Details
                </p>
                <h2 className="text-lg font-bold text-[#14231A] mt-0.5">
                  {directionsCentre.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDirectionsCentre(null)}
                aria-label="Close directions dialog"
                className="p-1.5 rounded-lg text-[#587062] hover:bg-[#F3F6F4] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl bg-[#F8FAF8] border border-[#E6EDE8] p-4 space-y-2 text-xs text-[#3C4E43]">
              <p>
                <span className="font-semibold text-[#14231A]">Address: </span>
                {directionsCentre.address}
              </p>
              <p>
                <span className="font-semibold text-[#14231A]">Hours: </span>
                {directionsCentre.hours}
              </p>
              <p>
                <span className="font-semibold text-[#14231A]">Accepted: </span>
                {directionsCentre.materials.join(', ')}
              </p>
              <p>
                <span className="font-semibold text-[#14231A]">Note: </span>
                {directionsCentre.verifiedNote}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setDirectionsCentre(null)}
                className="px-4 py-2 rounded-xl border border-[#D4DFD8] text-xs font-semibold text-[#4B5E53] hover:bg-[#F3F6F4] cursor-pointer"
              >
                Close
              </button>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${directionsCentre.lat},${directionsCentre.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#18432B] hover:bg-[#123320] text-white text-xs font-semibold"
              >
                <span>Open in Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
