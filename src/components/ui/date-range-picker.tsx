"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DateRangeValue = {
  from?: string | null;
  to?: string | null;
};

interface DateRangePickerProps {
  value?: DateRangeValue;
  onChange?: (value: DateRangeValue) => void;
  className?: string;
}

function toDate(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatLabel(from?: string | null, to?: string | null) {
  if (!from && !to) return "Select date range";
  if (from && !to) return `From ${new Date(from).toLocaleDateString()}`;
  if (!from && to) return `Until ${new Date(to).toLocaleDateString()}`;
  return `${new Date(from as string).toLocaleDateString()} - ${new Date(to as string).toLocaleDateString()}`;
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selected = React.useMemo(
    () => ({
      from: toDate(value?.from),
      to: toDate(value?.to),
    }),
    [value?.from, value?.to],
  );

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) {
      onChange?.({ from: null, to: null });
      return;
    }

    onChange?.({
      from: range.from ? range.from.toISOString().slice(0, 10) : null,
      to: range.to ? range.to.toISOString().slice(0, 10) : null,
    });

    if (range.from && range.to) setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-10 min-w-[280px] justify-start gap-2 border-luxury-border bg-luxury-dark text-left text-white hover:bg-luxury-gray hover:text-white",
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4 text-gold" />
          <span className="truncate text-sm text-white/80">
            {formatLabel(value?.from, value?.to)}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={selected.from || selected.to ? selected : undefined}
          onSelect={handleSelect as any}
          numberOfMonths={2}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export default DateRangePicker;
