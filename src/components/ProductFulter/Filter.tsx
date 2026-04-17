import React, {useState} from 'react';
import styles from './Filter.module.css';
import {SlidersHorizontal} from "lucide-react";
import axios from "axios";


export interface FilterState {
  categories: string[];
  priceRange: number[];
  colors: string[];
  volume: number[];
  inStock: boolean;
}


interface FiltersProps {
  onFilterChange: (filters: FilterState) => void;
  priceFilterEnabled: boolean;
  onPriceFilterToggle: (enabled: boolean) => void;
}

export default function ProductFilters({onFilterChange, priceFilterEnabled, onPriceFilterToggle}: FiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 12000],
    colors: [],
    volume: [],
    inStock: true,
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const handleTogglePrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPriceFilterToggle(e.target.checked);
    console.log(`диапазон: ${filters.priceRange[0]}`)
    console.log(`диапазон: ${filters.priceRange[1]}`)
  }
  const categories = ['Тарелки', 'Кружки', 'Пиалы', 'Сервизы', 'Вазы'];
  const colors = ['Терракотовый', 'Коричневый', 'Бежевый', 'Белый', 'Чёрный'];
  const volumeMap: Record<string, [number, number]> = {
    "250-350": [250, 350],
    "350-450": [350, 450],
    "450-550": [450, 550],
    "550+": [550, 1000],
  };

  const volumes = Object.keys(volumeMap);

  const handleCategoryChange = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    const newFilters = {...filters, categories: newCategories};
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleColorChange = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];
    const newFilters = {...filters, colors: newColors};
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleVolumeChange = (volumeLabel: string) => {
    const selectedRange = volumeMap[volumeLabel];
    const isSelected = filters.volume.length === 2 &&
      filters.volume[0] === selectedRange[0] &&
      filters.volume[1] === selectedRange[1];
    const newVolume = isSelected ? [] : selectedRange;

    const newFilters = {...filters, volume: newVolume};
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    let value = e.target.value;
    let n = value.replace(',', '.');      // заменяем запятую на точку
    let numValue = parseFloat(n)

    const newRange = [...filters.priceRange];
    newRange[index] = numValue;

    const newFilters = {...filters, priceRange: newRange};
    setFilters(newFilters);
    onFilterChange(newFilters);

    console.log(`newrange: [${newRange[0]}, ${newRange[1]}]`);
    console.log('newfilters:', newFilters);
  };

  const resetFilters = () => {
    const resetState = {
      categories: [],
      priceRange: [0, 12000],
      colors: [],
      volume: [],
      inStock: false,
    };
    setFilters(resetState);
    onFilterChange(resetState);
  };

  return (
    <>
      {/* Мобильная кнопка */}
      <button
        className={styles.mobileFilterButton}
        onClick={() => setIsMobileOpen(true)}
      >
        🔍
      </button>

      {/* Оверлей */}
      <div
        className={`${styles.filterOverlay} ${isMobileOpen ? styles.visible : ''}`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Панель фильтров */}
      <aside className={`${styles.filtersPanel} ${isMobileOpen ? styles.open : ''}`}>
        <div className={styles.header} onClick={() => setIsMobileOpen(!isMobileOpen)}>
          <h3 className={styles.title}>
            <SlidersHorizontal size={20} strokeWidth={1.5}/>
            Фильтры
          </h3>
        </div>

        <div className={styles.content}>
          {/* Категории */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Категория</h4>
            <div className={styles.checkboxGroup}>
              {categories.map(cat => (
                <label key={cat} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(cat)}
                    onChange={() => handleCategoryChange(cat)}
                  />
                  <span className={styles.checkboxCustom}/>
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* Цена */}
          <div className={styles.section}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h4 className={styles.sectionTitle}>Цена</h4>
              <label className={styles.switchLabel}>
                <input
                  type="checkbox"
                  checked={priceFilterEnabled}
                  onChange={handleTogglePrice}
                />
                <span className={styles.switchSlider}/>
                <span className={styles.switchText}>
                  {priceFilterEnabled ? 'Вкл' : 'Выкл'}
                </span>
              </label>
            </div>

            <div className={`${styles.priceRange} ${!priceFilterEnabled ? styles.disabled : ''}`}>
              <div className={styles.priceInputs}>
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange(e, 0)}
                  min={0}
                  max={12000}
                  className={styles.priceInput}
                  disabled={!priceFilterEnabled}
                />
                <span>—</span>
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange(e, 1)}
                  min={0}
                  max={12000}
                  className={styles.priceInput}
                  disabled={!priceFilterEnabled}
                />
              </div>
              <input
                type="range"
                min={0}
                max={12000}
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceChange(e, 1)}
                className={styles.rangeSlider}
                disabled={!priceFilterEnabled}
              />
            </div>
          </div>

          {/* Цвета */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Цвет</h4>
            <div className={styles.colorGroup}>
              {colors.map(color => (
                <button
                  key={color}
                  className={`${styles.colorChip} ${filters.colors.includes(color) ? styles.active : ''}`}
                  onClick={() => handleColorChange(color)}
                  style={{'--chip-color': getColorValue(color)} as React.CSSProperties}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Объём */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Объём</h4>
            <div className={styles.checkboxGroup}>
              {volumes.map(volLabel => {
                const range = volumeMap[volLabel];
                const isSelected = filters.volume.length === 2 &&
                  filters.volume[0] === range[0] &&
                  filters.volume[1] === range[1];

                return (
                  <label key={volLabel} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleVolumeChange(volLabel)}
                    />
                    <span className={styles.checkboxCustom}/>
                    {volLabel} мл
                  </label>
                );
              })}
            </div>
          </div>

          {/* В наличии */}
          <div className={styles.section}>
            <label className={styles.switchLabel}>
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => {
                  const newFilters = {...filters, inStock: e.target.checked};
                  setFilters(newFilters);
                  onFilterChange(newFilters);
                }}
              />
              <span className={styles.switchSlider}/>
              <span className={styles.switchText}>Только в наличии</span>
            </label>
          </div>

          <button className={styles.resetBtn} onClick={resetFilters}>
            Сбросить фильтры
          </button>
        </div>
      </aside>
    </>
  );
}

function getColorValue(color: string): string {
  const colors: Record<string, string> = {
    'Терракотовый': '#C67C4E',
    'Коричневый': '#8B5A2B',
    'Бежевый': '#F5E6D3',
    'Белый': '#FFF7F0',
    'Чёрный': '#2A241E',
  };
  return colors[color] || '#C67C4E';
}