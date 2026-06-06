"use client"

import * as React from "react"
import { Calendar } from "./calendar"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "./input-group"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { parseDate } from "chrono-node"
import { CalendarIcon, ClockIcon } from "lucide-react"
import { useTranslation } from "react-i18next";
import "../i18n";

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function DatePicker() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const [date, setDate] = React.useState<Date | undefined>(
    parseDate(value) || undefined
  )

  return (
    <InputGroup>
    <InputGroupInput
        id="date-optional"
        value={value}
        placeholder={t("datePicker.selectDate")}
        onChange={(e) => {
        setValue(e.target.value)
        const date = parseDate(e.target.value)
        if (date) {
            setDate(date)
        }
        }}
        onKeyDown={(e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setOpen(true)
        }
        }}
    />
    <InputGroupAddon align="inline-end">
        <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <InputGroupButton
            id="date-picker"
            variant="ghost"
            size="icon-xs"
            aria-label="Select date"
            className="text-primary"
            >
            <CalendarIcon />
            <span className="sr-only">{t("datePicker.selectDate")}</span>
            </InputGroupButton>
        </PopoverTrigger>
        <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            sideOffset={8}
        >
            <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            defaultMonth={date}
            onSelect={(date: Date | undefined) => {
                setDate(date)
                setValue(formatDate(date))
                setOpen(false)
            }}
            />
        </PopoverContent>
        </Popover>
    </InputGroupAddon>
    </InputGroup>
  )
}

function DatePickerTime() {
  const { t } = useTranslation();
  return (
    <InputGroup>
      <InputGroupInput
        type="time"
        id="time-picker-optional"
        step="1"
        defaultValue="10:30:00"
        className="appearance-none bg-white [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
      />

      <InputGroupAddon align="inline-end">
        <InputGroupButton
          variant="ghost"
          size="icon-xs"
          aria-label={t("datePicker.selectTime")}
          className="text-primary cursor-default hover:text-primary"
        >
          <ClockIcon />
          <span className="sr-only">{t("datePicker.selectTime")}</span>
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export {
    DatePicker,
    DatePickerTime
} 
