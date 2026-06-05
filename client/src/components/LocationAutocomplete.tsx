import { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface Suggestion {
  place_id: number;
  display_name: string;
  display_short: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

function toShort(displayName: string): string {
  // "Portland, Multnomah County, Oregon, United States" → "Portland, Oregon, United States"
  const parts = displayName.split(', ');
  if (parts.length <= 3) return displayName;
  // Drop county-level parts (index 1 if 4+ parts)
  return [parts[0], ...parts.slice(2)].join(', ');
}

export default function LocationAutocomplete({ value, onChange, required }: Props) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced Nominatim search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setSuggestions([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      try {
        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('q', query);
        url.searchParams.set('format', 'json');
        url.searchParams.set('limit', '6');
        url.searchParams.set('featuretype', 'city');
        url.searchParams.set('addressdetails', '0');

        const res = await fetch(url.toString(), {
          headers: { 'Accept-Language': 'en' },
        });
        const data = await res.json();
        const items: Suggestion[] = (data as { place_id: number; display_name: string }[]).map(
          (d) => ({ place_id: d.place_id, display_name: d.display_name, display_short: toShort(d.display_name) })
        );
        setSuggestions(items);
        setOpen(items.length > 0);
        setActiveIndex(-1);
      } catch {
        // silently fail — user can still type manually
      }
    }, 300);
  }, [query]);

  const select = (s: Suggestion) => {
    setQuery(s.display_short);
    onChange(s.display_short);
    setSuggestions([]);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, suggestions.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); select(suggestions[activeIndex]); }
    if (e.key === 'Escape') { setOpen(false); }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div className="input-with-icon">
        <MapPin size={16} />
        <input
          type="text"
          placeholder="City, state"
          value={query}
          required={required}
          autoComplete="off"
          onChange={e => {
            setQuery(e.target.value);
            onChange(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          aria-autocomplete="list"
          aria-expanded={open}
        />
      </div>

      {open && (
        <ul className="location-suggestions" role="listbox">
          {suggestions.map((s, i) => (
            <li
              key={s.place_id}
              role="option"
              aria-selected={i === activeIndex}
              className={`location-suggestion-item${i === activeIndex ? ' location-suggestion-item--active' : ''}`}
              onMouseDown={() => select(s)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <MapPin size={13} style={{ flexShrink: 0, color: 'var(--text-3)' }} />
              <span>{s.display_short}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
