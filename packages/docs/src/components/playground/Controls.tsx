import { useEffect, useId, useState, type InputHTMLAttributes } from "react";
import { num } from "./code";
import type { Control, OptionValue, Options, Point, Rect } from "./types";

interface ControlsProps {
  controls: Control[];
  values: Options;
  /** `live` changes (slider drags) are debounced by the playground. */
  onChange(key: string, value: OptionValue, live?: boolean): void;
  /** Start picking a point or region on the image. */
  onPick(key: string): void;
  picking: string | null;
}

export function Controls({ controls, values, onChange, onPick, picking }: ControlsProps) {
  const visible = controls.filter((control) => !control.when || control.when(values));

  if (!visible.length) {
    return <p className="pg-none">This method has no options.</p>;
  }

  return (
    <div className="pg-ctls">
      {visible.map((control) => (
        <ControlRow
          key={control.key}
          control={control}
          value={values[control.key]}
          onChange={(value, live) => onChange(control.key, value, live)}
          onPick={() => onPick(control.key)}
          picking={picking === control.key}
        />
      ))}
    </div>
  );
}

interface RowProps {
  control: Control;
  value: OptionValue | undefined;
  onChange(value: OptionValue, live?: boolean): void;
  onPick(): void;
  picking: boolean;
}

function ControlRow({ control, value, onChange, onPick, picking }: RowProps) {
  const id = useId();
  const label = control.label ?? control.key;

  switch (control.type) {
    case "slider": {
      const n = Number(value);
      return (
        <div className="pg-ctl">
          <label htmlFor={id}>{label}</label>
          <input
            id={id}
            type="range"
            min={control.min}
            max={control.max}
            step={control.step ?? 1}
            value={n}
            onChange={(e) => onChange(Number(e.target.value), true)}
          />
          <output htmlFor={id}>
            {num(n)}
            {control.unit}
          </output>
        </div>
      );
    }

    case "number":
      return (
        <div className="pg-ctl">
          <label htmlFor={id}>{label}</label>
          <NumberInput
            id={id}
            min={control.min}
            max={control.max}
            step={control.step ?? 1}
            value={Number(value)}
            onValue={(n) => onChange(n, true)}
          />
        </div>
      );

    case "toggle":
      return (
        <div className="pg-ctl">
          <span className="pg-k" id={id}>
            {label}
          </span>
          <button
            type="button"
            className="pg-tg"
            aria-pressed={Boolean(value)}
            aria-labelledby={id}
            onClick={() => onChange(!value)}
          >
            {String(Boolean(value))}
          </button>
        </div>
      );

    case "select":
      return (
        <div className="pg-ctl">
          <label htmlFor={id}>{label}</label>
          <select id={id} value={String(value)} onChange={(e) => onChange(e.target.value)}>
            {control.options.map((option) => {
              const { value: v, label: l } =
                typeof option === "string" ? { value: option, label: option } : option;
              return (
                <option key={v} value={v}>
                  {l}
                </option>
              );
            })}
          </select>
        </div>
      );

    case "color":
      return (
        <div className="pg-ctl">
          <label htmlFor={id}>{label}</label>
          <input
            id={id}
            type="color"
            value={String(value)}
            onChange={(e) => onChange(e.target.value, true)}
          />
          <output htmlFor={id}>{String(value)}</output>
        </div>
      );

    case "xy": {
      const point = value as Point;
      const set = (patch: Partial<Point>) => onChange({ ...point, ...patch }, true);
      return (
        <div className="pg-ctl pg-ctl-wide">
          <span className="pg-k">{label}</span>
          <button type="button" className="pg-pick" aria-pressed={picking} onClick={onPick}>
            {picking ? "Click the image…" : "Pick on image"}
          </button>
          <span className="pg-nums">
            <NumberField label="x" value={point.x} onChange={(x) => set({ x })} />
            <NumberField label="y" value={point.y} onChange={(y) => set({ y })} />
          </span>
        </div>
      );
    }

    case "rect": {
      const rect = value as Rect;
      const set = (patch: Partial<Rect>) => onChange({ ...rect, ...patch }, true);
      return (
        <div className="pg-ctl pg-ctl-wide">
          <span className="pg-k">{label}</span>
          <button type="button" className="pg-pick" aria-pressed={picking} onClick={onPick}>
            {picking ? "Drag on the image…" : "Drag on image"}
          </button>
          <span className="pg-nums">
            <NumberField label="x" value={rect.x} onChange={(x) => set({ x })} />
            <NumberField label="y" value={rect.y} onChange={(y) => set({ y })} />
            <NumberField label="w" value={rect.w} onChange={(w) => set({ w })} />
            <NumberField label="h" value={rect.h} onChange={(h) => set({ h })} />
          </span>
        </div>
      );
    }
  }
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange(value: number): void;
}) {
  return (
    <label className="pg-num">
      <span>{label}</span>
      <NumberInput value={value} onValue={onChange} />
    </label>
  );
}

type NumberInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "type"> & {
  value: number;
  onValue(value: number): void;
};

/** A number input that lets you type freely ("-", "") without losing the last valid value. */
function NumberInput({ value, onValue, ...props }: NumberInputProps) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText((current) => (Number(current) === value ? current : String(value)));
  }, [value]);

  return (
    <input
      {...props}
      type="number"
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        if (!Number.isNaN(e.target.valueAsNumber)) onValue(e.target.valueAsNumber);
      }}
    />
  );
}
