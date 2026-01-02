"use client";

import { DayPicker, type DayPickerProps } from "react-day-picker";
import { cn } from "../../lib/utils";
import { buttonVariants } from "../ui/button";

export type CalendarProps = DayPickerProps;

function Calendar({
  className,
  classNames,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={false} 
      className={cn(
        "p-4 rounded-lg shadow bg-background",
        className
      )}
      classNames={{
        months: "mx-auto w-max",
        month: "bg-muted/30 p-2 rounded-lg",
        caption: "flex items-center justify-between py-2 relative",
        caption_label: "text-lg font-semibold mx-auto",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 rounded p-0 bg-transparent opacity-80 hover:opacity-100 transition"
        ),
        nav_button_previous: "", // use Flex layout to position
        nav_button_next: "",
        table: "w-full border-collapse",
        head_row: "",
        head_cell:
          "w-10 h-8 text-center text-muted-foreground text-xs font-bold uppercase",
        row: "",
        cell: "p-0 text-center",
        day: "h-8 w-8 rounded-full transition text-center hover:bg-accent hover:text-accent-foreground",
        day_selected: "bg-primary text-white font-bold",
        day_today: "border-2 border-primary font-semibold",
        day_outside: "hidden", // ✅ hides all outside days
        ...classNames,
      }}
      formatters={{
        formatWeekdayName: (date) =>
          ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][date.getDay()],
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";
export { Calendar };
